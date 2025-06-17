# worker/routes.py
import logging
from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any, List, Optional
import os
import shutil
from git import Repo
import requests
from db.init import db
from datetime import datetime
from bson.objectid import ObjectId, InvalidId
from urllib.parse import urlparse, urlunparse
import hashlib
import json
import gzip
from google.cloud import storage
import tree_sitter
from tree_sitter import Language, Parser
from pinecone import Pinecone
from config import settings
import mimetypes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["worker"])

# Initialize Google Cloud Storage client
storage_client = storage.Client()
bucket = storage_client.bucket("ast-storage-auditflow-ai")

# Initialize Pinecone client
pc = Pinecone(api_key=settings.PINECONE_API_KEY)
index = pc.Index(settings.PINECONE_INDEX_NAME)

# Initialize Tree-sitter
Language.build_library(
    'build/my-languages.so',
    [
        'vendor/tree-sitter-python',
        'vendor/tree-sitter-javascript',
        'vendor/tree-sitter-java'
    ]
)

PY_LANGUAGE = Language('build/my-languages.so', 'python')
JS_LANGUAGE = Language('build/my-languages.so', 'javascript')
JAVA_LANGUAGE = Language('build/my-languages.so', 'java')

def get_language_parser(file_path: str) -> Optional[Language]:
    """Get the appropriate Tree-sitter language parser based on file extension."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.py':
        return PY_LANGUAGE
    elif ext in ['.js', '.jsx', '.ts', '.tsx']:
        return JS_LANGUAGE
    elif ext in ['.java']:
        return JAVA_LANGUAGE
    return None

def compute_file_hash(content: str) -> str:
    """Compute SHA256 hash of file content."""
    return hashlib.sha256(content.encode()).hexdigest()

def chunk_file(content: str, max_lines: int = 500) -> List[str]:
    """Split file content into chunks based on functions/classes or line count."""
    chunks = []
    current_chunk = []
    current_lines = 0
    
    for line in content.split('\n'):
        current_chunk.append(line)
        current_lines += 1
        
        # Check if we've hit a function/class boundary or max lines
        if (line.strip().startswith(('def ', 'class ')) or current_lines >= max_lines) and current_chunk:
            chunks.append('\n'.join(current_chunk))
            current_chunk = []
            current_lines = 0
    
    # Add any remaining lines
    if current_chunk:
        chunks.append('\n'.join(current_chunk))
    
    return chunks

def generate_ast(file_path: str, content: str) -> Dict[str, Any]:
    """Generate AST for a file using Tree-sitter."""
    language = get_language_parser(file_path)
    if not language:
        return None
    
    parser = Parser()
    parser.set_language(language)
    tree = parser.parse(bytes(content, 'utf8'))
    
    return {
        'type': 'ast',
        'language': language.name,
        'tree': tree.root_node.sexp(),
        'file_path': file_path
    }

def store_ast(ast: Dict[str, Any], repo_id: int) -> str:
    """Store AST in GCS bucket."""
    file_path = f"asts/{repo_id}/{ast['file_path']}.json.gz"
    blob = bucket.blob(file_path)
    
    # Compress and store
    compressed = gzip.compress(json.dumps(ast).encode())
    blob.upload_from_string(compressed, content_type='application/json')
    
    return file_path

def store_embeddings(chunk_id: str, chunk_text: str, metadata: Dict[str, Any]) -> None:
    """Store text chunk in Pinecone using integrated model."""
    try:
        # Add timestamp to metadata
        metadata['timestamp'] = datetime.utcnow().isoformat()
        record = {
            "_id": chunk_id,
            "chunk_text": chunk_text,
            **metadata
        }
        # Upsert text record to Pinecone (integrated model)
        index.upsert_records(str(metadata['repo_id']), [record])
        logger.info(f"Stored text chunk for {chunk_id}")
    except Exception as e:
        logger.error(f"Failed to store text chunk: {str(e)}")
        raise

async def get_gitlab_repo_clone_url(repo_id: int, user_id: str) -> str:
    """Get the clone URL for a GitLab repository."""
    try:
        # Always require user_id to be a valid ObjectId string
        try:
            user_obj_id = ObjectId(user_id)
        except (InvalidId, TypeError):
            raise Exception("Invalid user_id format: must be a valid ObjectId string")
        user = await db.get_collection("users").find_one({"_id": user_obj_id})
        if not user or not user.get("access_token"):
            raise Exception("User not found or no access token available")

        gitlab_token = user["access_token"]

        # Call GitLab API to get repository details
        headers = {"Authorization": f"Bearer {gitlab_token}"}
        response = requests.get(
            f"https://gitlab.com/api/v4/projects/{repo_id}",
            headers=headers
        )
        response.raise_for_status()
        
        repo_data = response.json()
        repo_url = repo_data["http_url_to_repo"]

        # Embed the access token in the clone URL
        parsed = urlparse(repo_url)
        netloc = f"oauth2:{gitlab_token}@{parsed.hostname}"
        if parsed.port:
            netloc += f":{parsed.port}"
        clone_url_with_token = urlunparse(parsed._replace(netloc=netloc))
        return clone_url_with_token
    except Exception as e:
        logger.error(f"Failed to get GitLab repo URL: {str(e)}")
        raise

def clone_repo(clone_url: str, path: str) -> None:
    """Clone a Git repository to the specified path."""
    try:
        # Remove directory if it exists
        if os.path.exists(path):
            shutil.rmtree(path)
        
        # Clone the repository
        Repo.clone_from(clone_url, path)
        logger.info(f"Successfully cloned repository to {path}")
    except Exception as e:
        logger.error(f"Failed to clone repository: {str(e)}")
        raise

def is_text_file(file_path):
    mime, _ = mimetypes.guess_type(file_path)
    return (mime and mime.startswith('text')) or file_path.endswith(('.js', '.ts', '.tsx', '.py', '.java', '.json', '.md', '.txt', '.css', '.html', '.ts', '.tsx'))

async def run_ai_compliance_scan(path: str, repo_id: int) -> Dict[str, Any]:
    """Run AI compliance scan on the repository."""
    findings = []
    processed_files = 0
    skip_dirs = ["/.git/", "/node_modules/", "/public/", "/.next/"]
    
    for root, _, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, path)

            # Skip unwanted directories and non-text files
            if any(part in file_path for part in skip_dirs):
                continue
            if not is_text_file(file_path):
                continue
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception as e:
                logger.warning(f"Skipping file {file_path}: {e}")
                continue

            try:
                # Compute file hash
                file_hash = compute_file_hash(content)

                # Check if file needs processing
                metadata = await db.file_metadata.find_one({
                    "repo_id": repo_id,
                    "path": relative_path
                })

                if metadata and metadata.get("hash") == file_hash:
                    logger.info(f"Skipping unchanged file: {relative_path}")
                    continue

                # Generate AST
                ast = generate_ast(relative_path, content)
                if ast:
                    ast_path = store_ast(ast, repo_id)

                    # Process file in chunks
                    chunks = chunk_file(content)
                    for i, chunk in enumerate(chunks):
                        chunk_id = f"{file_hash}_{i}"
                        # Store text chunk in Pinecone
                        chunk_metadata = {
                            "repo_id": repo_id,
                            "file_path": relative_path,
                            "chunk_index": i,
                            "ast_path": ast_path
                        }
                        store_embeddings(chunk_id, chunk, chunk_metadata)

                # Update file metadata
                await db.file_metadata.update_one(
                    {
                        "repo_id": repo_id,
                        "path": relative_path
                    },
                    {
                        "$set": {
                            "hash": file_hash,
                            "last_scanned": datetime.utcnow(),
                            "ast_path": ast_path if ast else None
                        }
                    },
                    upsert=True
                )

                processed_files += 1

            except Exception as e:
                logger.error(f"Error processing file {relative_path}: {str(e)}")
                findings.append({
                    "type": "error",
                    "severity": "high",
                    "description": f"Failed to process file: {str(e)}",
                    "location": relative_path
                })

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "processed_files": processed_files,
        "findings": findings
    }

async def save_scan_results_to_mongo(repo_id: int, user_id: str, results: Dict[str, Any]) -> None:
    """Save scan results to MongoDB."""
    try:
        scan_doc = {
            "repo_id": repo_id,
            "user_id": user_id,
            "results": results,
            "created_at": datetime.utcnow()
        }
        
        await db.get_collection("scan_results").insert_one(scan_doc)
        logger.info(f"Saved scan results for repo {repo_id}")
    except Exception as e:
        logger.error(f"Failed to save scan results: {str(e)}")
        raise

@router.post("/worker/scan")
async def run_scan_worker(request: Request):
    """Worker endpoint that performs the actual scan."""
    try:
        data = await request.json()
        repo_id = data.get("repo_id")
        user_id = data.get("user_id")

        if not repo_id or not user_id:
            raise HTTPException(status_code=400, detail="Missing repo_id or user_id")

        logger.info(f"Starting scan for repo {repo_id} by user {user_id}")

        # Step 1: Get clone URL from GitLab using user's access token
        clone_url = await get_gitlab_repo_clone_url(repo_id, user_id)

        # Step 2: Clone the repo
        local_path = f"/tmp/repo-{repo_id}"
        clone_repo(clone_url, local_path)

        try:
            # Step 3: Run AI scan
            results = await run_ai_compliance_scan(local_path, repo_id)

            # Step 4: Save results in MongoDB
            await save_scan_results_to_mongo(repo_id, user_id, results)

            return {"message": "Scan complete", "findings": results}
        finally:
            # Cleanup: Remove cloned repository
            if os.path.exists(local_path):
                shutil.rmtree(local_path)

    except Exception as e:
        logger.error(f"Worker scan failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Worker scan failed: {str(e)}") 