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
import re
from openai import OpenAI
import asyncio
import uuid
from db.crud_scan import ScanCRUD
from ws.connection_manager import manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/worker", tags=["worker"])

# Initialize Google Cloud Storage client
storage_client = storage.Client()
bucket = storage_client.bucket("ast-storage-auditflow-ai")

# Initialize Pinecone client for semantic code search
try:
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    index = pc.Index(settings.PINECONE_INDEX_NAME)  # Use 'auditflow-embeddings' from config
    logger.info(f"Pinecone initialized with index: {settings.PINECONE_INDEX_NAME}")
except Exception as e:
    logger.error(f"Failed to initialize Pinecone: {str(e)}")
    pc = None
    index = None

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

CODE_FILE_EXTENSIONS = {
    '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.c', '.cpp', '.h', '.hpp',
    '.go', '.rb', '.php', '.rs', '.swift', '.kt', '.scala', '.clj', '.hs', '.ml', '.fs', '.vb', '.cs'
}

PACKAGE_CONFIG_FILES = {
    'package.json', 'requirements.txt', 'Pipfile', 'pyproject.toml', 'setup.py',
    'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'tsconfig.json', 'tailwind.config.ts',
    'postcss.config.mjs', 'next.config.mjs', 'Dockerfile', 'Makefile', 'README.md', 'LICENSE',
    'composer.json', 'Gemfile', 'Cargo.toml', 'go.mod', 'build.gradle', 'pom.xml', 'CMakeLists.txt'
}

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

def store_code_chunk_in_pinecone(chunk_id: str, code_chunk: str, metadata: Dict[str, Any]) -> None:
    """Store code chunk in Pinecone for semantic search."""
    if not index:
        logger.warning("Pinecone not available, skipping code chunk storage")
        return
    try:
        # Create record for Pinecone with integrated embedding
        record = {
            "_id": chunk_id,
            "text": code_chunk,  # Field must be 'text' to match the index's default field_map
            "repo_id": metadata['repo_id'],
            "file_path": metadata['file_path'],
            "chunk_index": metadata['chunk_index'],
            "language": metadata.get('language', 'unknown'),
            "ast_path": metadata.get('ast_path'),
            "timestamp": datetime.utcnow().isoformat(),
            "file_hash": metadata.get('file_hash'),
            "chunk_type": metadata.get('chunk_type', 'code')
        }
        # Upsert to Pinecone with integrated embedding, using '__default__' namespace
        index.upsert_records("__default__", [record])
        logger.info(f"Stored code chunk in Pinecone: {chunk_id}")
    except Exception as e:
        logger.error(f"Failed to store code chunk in Pinecone: {str(e)}")
        # Fallback to MongoDB for critical data
        try:
            import asyncio
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(store_chunk_in_mongodb(chunk_id, code_chunk, metadata))
            else:
                loop.run_until_complete(store_chunk_in_mongodb(chunk_id, code_chunk, metadata))
            logger.info(f"Stored code chunk in MongoDB fallback: {chunk_id}")
        except Exception as mongo_error:
            logger.error(f"Failed to store code chunk in MongoDB fallback: {str(mongo_error)}")

async def store_chunk_in_mongodb(chunk_id: str, code_chunk: str, metadata: Dict[str, Any]) -> None:
    """Fallback storage for code chunks in MongoDB."""
    try:
        chunks_collection = db.get_collection("text_chunks")
        await chunks_collection.insert_one({
            "chunk_id": chunk_id,
            "text": code_chunk,
            "metadata": metadata,
            "created_at": datetime.utcnow()
        })
    except Exception as e:
        logger.error(f"Failed to store chunk in MongoDB: {str(e)}")

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

def is_text_file(file_path: str) -> bool:
    """Check if a file is a text file that should be processed."""
    # Skip .git directory entirely
    if '.git' in file_path:
        return False
    
    # Skip common binary file extensions
    binary_extensions = {
        '.exe', '.dll', '.so', '.dylib', '.bin', '.obj', '.o', '.a', '.lib',
        '.pyc', '.pyo', '.pyd', '.class', '.jar', '.war', '.ear',
        '.zip', '.tar', '.gz', '.bz2', '.xz', '.7z', '.rar',
        '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg',
        '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv',
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        '.db', '.sqlite', '.sqlite3', '.mdb', '.accdb',
        '.pack', '.idx', '.lock', '.tmp', '.cache'
    }
    
    ext = os.path.splitext(file_path)[1].lower()
    if ext in binary_extensions:
        return False
    
    # Try to guess MIME type
    mime, _ = mimetypes.guess_type(file_path)
    if mime and not mime.startswith('text'):
        return False
    
    # Allow specific text file extensions
    text_extensions = {
        '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.c', '.cpp', '.h', '.hpp',
        '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf',
        '.md', '.txt', '.rst', '.tex', '.css', '.scss', '.sass', '.less',
        '.html', '.htm', '.xhtml', '.svg', '.sh', '.bash', '.zsh', '.fish',
        '.sql', '.r', '.m', '.pl', '.rb', '.php', '.go', '.rs', '.swift',
        '.kt', '.scala', '.clj', '.hs', '.ml', '.fs', '.vb', '.cs',
        '.dockerfile', '.gitignore', '.gitattributes', '.editorconfig',
        '.eslintrc', '.prettierrc', '.babelrc', '.webpack.config.js',
        '.package.json', '.requirements.txt', '.setup.py', '.pom.xml',
        '.build.gradle', '.sbt', '.cargo.toml', '.go.mod', '.composer.json'
    }
    
    if ext in text_extensions:
        return True
    
    return False

def can_read_as_text(file_path: str) -> bool:
    """Check if a file can be read as text without encoding errors."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            f.read(1024)  # Read first 1KB to test
        return True
    except (UnicodeDecodeError, IOError):
        return False

def is_code_file(file_path: str) -> bool:
    """Determines if a file is a code file that should be analyzed."""
    ext = os.path.splitext(file_path)[1].lower()
    base = os.path.basename(file_path)
    # Exclude package manager lock files and other non-source files
    if base in PACKAGE_CONFIG_FILES:
        return False
    return ext in CODE_FILE_EXTENSIONS

def should_send_to_llm(file_path: str, content: str, static_findings: list) -> bool:
    # Send to LLM if static rules found something, or if file is 'interesting' (e.g., contains class/function definitions)
    if static_findings:
        return True
    if re.search(r'(def |class |function |public |private |protected )', content):
        return True
    return False

def batch_files_for_llm(files: List[tuple], batch_size_bytes: int = 100000) -> List[List[tuple]]:
    """
    Batches files for LLM analysis based on total size to avoid exceeding context window limits.
    Aims for batches under a certain byte size as a proxy for token count.
    """
    batches = []
    current_batch = []
    current_batch_size = 0
    for file_path, content in files:
        file_size = len(content)
        if file_size > batch_size_bytes:
            # Handle files that are too large on their own
            logger.warning(f"Skipping file {file_path} as it exceeds the single-file size limit of {batch_size_bytes} bytes.")
            continue
        
        if current_batch and current_batch_size + file_size > batch_size_bytes:
            batches.append(current_batch)
            current_batch = []
            current_batch_size = 0
        
        current_batch.append((file_path, content))
        current_batch_size += file_size
    
    if current_batch:
        batches.append(current_batch)
        
    return batches

def make_llm_analysis_prompt(file_batch: List[tuple]) -> str:
    """
    Creates a detailed, structured prompt for the LLM to perform code analysis.
    """
    prompt = """
You are an expert security and code compliance auditor. Your task is to analyze the following code files and identify any potential issues.

For each file, provide a JSON array of findings. If a file has no findings, return an empty array for it.

Each finding object in the JSON array must have the following structure:
{
  "type": "<A short, machine-readable type for the violation, e.g., 'sql_injection_risk'>",
  "category": "<'security', 'compliance', 'quality', or 'best_practice'>",
  "severity": "<'critical', 'high', 'medium', 'low', or 'info'>",
  "description": "<A detailed, human-readable description of the issue and the risky code snippet.>",
  "recommendation": "<A clear, actionable recommendation on how to fix the issue.>",
  "location": {
    "line": <The specific line number where the issue was found, if applicable>
  }
}

Respond with a single JSON object where keys are the file paths and values are the JSON array of findings for that file. Example:
{
  "src/user/routes.py": [
    {
      "type": "hardcoded_secret",
      "category": "security",
      "severity": "critical",
      "description": "A hardcoded API key 'xyz-secret-key' was found.",
      "recommendation": "Store secrets in environment variables or a secret management service.",
      "location": { "line": 42 }
    }
  ],
  "src/utils/helpers.py": []
}

---
Files to analyze:
"""
    for file_path, content in file_batch:
        prompt += f"\n--- FILE: {file_path} ---\n```\n{content}\n```\n"

    return prompt

async def call_llm_for_analysis(file_batch: List[tuple]) -> List[Dict]:
    """
    Calls the OpenAI API with a batch of files and parses the structured JSON response.
    """
    all_findings = []
    if not settings.OPENAI_API_KEY:
        logger.warning("OpenAI API key not configured. Skipping LLM analysis.")
        return all_findings

    prompt = make_llm_analysis_prompt(file_batch)
    
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = await asyncio.to_thread(
            client.chat.completions.create,
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        response_text = response.choices[0].message.content
        analysis_results = json.loads(response_text)

        for file_path, findings_list in analysis_results.items():
            if isinstance(findings_list, list):
                for finding in findings_list:
                    # Validate the structure of the finding from the LLM
                    if all(k in finding for k in ["type", "category", "severity", "description", "recommendation", "location"]):
                        # Flatten the structure to match what the rest of the system expects
                        flat_finding = {
                            "type": finding["type"],
                            "category": finding["category"],
                            "severity": finding["severity"],
                            "description": finding["description"],
                            "recommendation": finding.get("recommendation"),
                            "location": file_path, # Top-level location is the file path
                            "line": finding["location"].get("line")
                        }
                        all_findings.append(flat_finding)
                    else:
                        logger.warning(f"Malformed finding from LLM for file {file_path}: {finding}")

    except json.JSONDecodeError:
        logger.error(f"LLM returned malformed JSON. Raw response: {response.choices[0].message.content if response else 'No response'}")
    except Exception as e:
        logger.error(f"LLM analysis failed for batch: {str(e)}")
        all_findings.append({
            "type": "llm_error",
            "category": "quality",
                "severity": "high",
            "description": f"The AI code analysis failed for a batch of files. Error: {str(e)}",
            "location": "LLM Analysis Step"
        })
    
    return all_findings

def calculate_overall_scores(findings: List[Dict]) -> Dict[str, Any]:
    """
    Calculate overall scores based on findings using a direct penalty system.
    This function now guarantees a consistent return structure.
    """
    # Severity penalties - more impactful
    severity_penalties = {
        "critical": 50,
        "high": 25,
        "medium": 10,
        "low": 2
    }

    # Initialize scores at 100
    scores = {
        "security_score": 100.0,
        "compliance_score": 100.0,
        "quality_score": 100.0,
    }
    
    # Apply penalties
    for finding in findings:
        severity = finding.get("severity", "low").lower()
        category = finding.get("category", "quality").lower()
        penalty = severity_penalties.get(severity, 0)

        if category == "security":
            scores["security_score"] -= penalty
        elif category == "compliance":
            scores["compliance_score"] -= penalty
        else:  # "quality" and "best_practice" fall under quality
            scores["quality_score"] -= penalty

    # Ensure scores don't go below 0
    scores["security_score"] = max(0, scores["security_score"])
    scores["compliance_score"] = max(0, scores["compliance_score"])
    scores["quality_score"] = max(0, scores["quality_score"])

    # Calculate weighted overall score
    # Weights: Security 40%, Compliance 35%, Code Quality 25%
    scores["overall_score"] = (
        scores["security_score"] * 0.4 +
        scores["compliance_score"] * 0.35 +
        scores["quality_score"] * 0.25
    )

    # Add violation counts for the summary
    scores["total_violations"] = len(findings)
    scores["critical_violations"] = len([f for f in findings if f.get("severity") == "critical"])
    scores["high_violations"] = len([f for f in findings if f.get("severity") == "high"])
    scores["medium_violations"] = len([f for f in findings if f.get("severity") == "medium"])
    scores["low_violations"] = len([f for f in findings if f.get("severity") == "low"])

    # Round all scores for clean output
    for key in ["security_score", "compliance_score", "quality_score", "overall_score"]:
        scores[key] = round(scores[key], 1)

    return scores

def add_violation_metadata(findings: List[Dict]) -> List[Dict]:
    """Add metadata to findings including dates and IDs."""
    enhanced_findings = []
    for finding in findings:
        enhanced_finding = finding.copy()
        
        # Map violation types to categories and priorities
        violation_type = finding.get("type", "").lower()
        severity = finding.get("severity", "medium").lower()
        
        # Determine category based on violation type
        if any(sec_type in violation_type for sec_type in ["secret", "eval", "injection", "xss", "csrf", "auth"]):
            category = "security"
        elif any(comp_type in violation_type for comp_type in ["gdpr", "hipaa", "pci", "sox", "compliance"]):
            category = "compliance"
        elif any(qual_type in violation_type for qual_type in ["long_function", "todo", "quality"]):
            category = "quality"
        else:
            category = "best_practice"
        
        # Determine priority based on severity
        if severity == "critical":
            priority = "P1"
        elif severity == "high":
            priority = "P2"
        elif severity == "medium":
            priority = "P3"
        else:
            priority = "P4"
        
        enhanced_finding.update({
            "violation_id": str(uuid.uuid4()),
            "discovered_date": datetime.utcnow().isoformat(),
            "status": "open",
            "assigned_priority": priority,
            "category": category,
            "estimated_fix_time": get_estimated_fix_time(severity),
            "compliance_impact": get_compliance_impact(violation_type),
            "risk_level": get_risk_level(severity)
        })
        enhanced_findings.append(enhanced_finding)
    
    return enhanced_findings

def get_estimated_fix_time(severity: str) -> str:
    """Estimate fix time based on severity."""
    estimates = {
        "critical": "1-2 days",
        "high": "3-5 days", 
        "medium": "1-2 weeks",
        "low": "2-4 weeks",
        "info": "1-2 months"
    }
    return estimates.get(severity, "1-2 weeks")

def get_compliance_impact(violation_type: str) -> List[str]:
    """Get compliance standards impacted by violation."""
    impact_map = {
        "sql_injection": ["SOC2", "ISO27001", "PCI-DSS"],
        "xss": ["SOC2", "OWASP Top 10"],
        "authentication": ["SOC2", "ISO27001", "NIST"],
        "encryption": ["SOC2", "ISO27001", "PCI-DSS", "GDPR"],
        "logging": ["SOC2", "ISO27001", "SOX"],
        "access_control": ["SOC2", "ISO27001", "NIST"],
        "data_protection": ["GDPR", "CCPA", "SOC2"],
        "code_quality": ["ISO25010", "Maintainability"]
    }
    return impact_map.get(violation_type.lower(), ["General Compliance"])

def get_risk_level(severity: str) -> str:
    """Convert severity to risk level."""
    risk_map = {
        "critical": "Extreme",
        "high": "High", 
        "medium": "Medium",
        "low": "Low",
        "info": "Minimal"
    }
    return risk_map.get(severity, "Medium")

async def run_ai_compliance_scan(path: str, repo_id: int) -> Dict[str, Any]:
    """
    Performs the main analysis of the repository using a powerful LLM for all code files.
    """
    # --- Initialization ---
    all_findings = []
    processed_files_count = 0
    skipped_files_count = 0
    error_files_count = 0
    file_metadata_collection = db.get_collection("file_metadata")
    files_for_llm = []

    # --- File Traversal and Collection ---
    for root, dirs, files in os.walk(path):
        # Skip directories like .git
        if '.git' in dirs:
            dirs.remove('.git')

        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, path)
            
            # We only want to analyze text-based code files
            if not is_code_file(relative_path) or not can_read_as_text(file_path):
                skipped_files_count += 1
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Skip empty or trivial files
                if len(content.strip()) < 20:
                    skipped_files_count += 1
                    continue

                # --- Hashing and Cache Check (Optional, can be disabled for full re-scans) ---
                file_hash = compute_file_hash(content)
                metadata = await file_metadata_collection.find_one({"repo_id": repo_id, "path": relative_path})
                if metadata and metadata.get("hash") == file_hash:
                    logger.info(f"Skipping unchanged file: {relative_path}")
                    skipped_files_count += 1
                    continue

                files_for_llm.append((relative_path, content))
                
                # Update metadata to mark file as processed with the new hash
                await file_metadata_collection.update_one(
                    {"repo_id": repo_id, "path": relative_path},
                    {"$set": {"hash": file_hash, "last_scanned": datetime.utcnow()}},
                    upsert=True
                )
                processed_files_count += 1
            except Exception as e:
                logger.error(f"Error processing file {relative_path}: {str(e)}")
                error_files_count += 1
    
    # --- Batch and Parallel LLM Analysis ---
    if files_for_llm:
        logger.info(f"Submitting {len(files_for_llm)} files for LLM analysis...")
        llm_batches = batch_files_for_llm(files_for_llm)
        llm_tasks = [call_llm_for_analysis(batch) for batch in llm_batches]
        list_of_findings_lists = await asyncio.gather(*llm_tasks)
        for findings_list in list_of_findings_lists:
            all_findings.extend(findings_list)
    
    # --- Final Result Aggregation ---
    logger.info(f"Total raw findings from LLM: {len(all_findings)}")
    enhanced_findings = add_violation_metadata(all_findings)
    scores = calculate_overall_scores(enhanced_findings)

    logger.info(f"Scan complete: {processed_files_count} files processed, {skipped_files_count} skipped, {error_files_count} errors")
    
    # Construct the final, clean results object
    scan_results = {
        "scan_summary": {
            "processed_files_count": processed_files_count,
            "skipped_files_count": skipped_files_count,
            "error_files_count": error_files_count,
            "total_violations_found": len(enhanced_findings),
            "scan_timestamp": datetime.utcnow().isoformat()
        },
        "scores": scores,
        "findings": enhanced_findings,
    }
    return scan_results

def get_grade_from_score(score: float) -> str:
    """Convert numerical score to letter grade."""
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"

async def save_scan_results(scan_id: str, repo_id: int, user_id: str, results: Dict[str, Any]) -> None:
    """Save scan results to MongoDB using the structured ScanCRUD methods."""
    try:
        logger.info(f"Saving scan results for repo {repo_id}, user {user_id}, scan {scan_id}")
        
        # Step 1: Update the primary scan document with the results
        await ScanCRUD.update_scan_status(
            scan_id, 
            status="completed", 
            progress=100, 
            summary="Scan complete. Results saved.",
            results=results
        )
            
        # Step 2: Save the individual violations for historical analysis
        violations = results.get("findings", [])
        if violations:
            await ScanCRUD.save_violations(repo_id, user_id, scan_id, violations)
            
        # Step 3: Save the calculated compliance scores for historical tracking
        scores = results.get("scores", {})
        if scores:
            await ScanCRUD.save_compliance_score(repo_id, user_id, scan_id, scores)
            
        logger.info(f"Successfully saved all scan data for repo {repo_id} with scan_id {scan_id}")
            
    except Exception as e:
        logger.error(f"Failed to save scan results: {str(e)}")
        # If saving fails, update the primary scan document to reflect the error
        await ScanCRUD.update_scan_status(scan_id, "failed", 100, f"Failed to save results: {e}")

@router.post("/scan")
async def run_scan_worker(request: Request):
    """
    The main worker endpoint that receives a scan request from the task queue.
    """
    data = await request.json()
    repo_id = data.get("repo_id")
    user_id = data.get("user_id")
    scan_id = data.get("scan_id")

    if not all([repo_id, user_id, scan_id]):
        raise HTTPException(status_code=400, detail="Missing repo_id, user_id, or scan_id")

    logger.info(f"Received scan request for repo_id: {repo_id}, user_id: {user_id}, scan_id: {scan_id}")
    
    async def update_status(status: str, progress: int, summary: str, results: Optional[Dict] = None):
        """Helper to update scan status in DB and notify client via WebSocket."""
        try:
            await ScanCRUD.update_scan_status(scan_id, status, summary, progress, results)
            # Use the manager to broadcast the update
            await manager.broadcast_to_user(
                user_id,
                {
                    "type": "scan_progress" if status not in ["completed", "failed"] else f"scan_{status}",
                    "scan_id": scan_id,
                    "status": status,
                    "progress": progress,
                    "summary": summary,
                    "results": results, # Send final results on completion
                }
            )
            logger.info(f"Broadcasted status update for scan {scan_id}: {status} ({progress}%)")
        except Exception as e:
            logger.error(f"Failed to update status for scan {scan_id}: {e}")

    try:
        await update_status("cloning", 5, "Cloning repository...")
        clone_url = await get_gitlab_repo_clone_url(repo_id, user_id)
        
        local_path = f"/tmp/repo-{repo_id}-{scan_id}"
        await update_status("cloning", 15, f"Cloning repository to {local_path}...")
        clone_repo(clone_url, local_path)
        
        await update_status("scanning", 30, "Starting compliance and security scan...")
        scan_results = await run_ai_compliance_scan(local_path, repo_id)
        
        await update_status("saving", 95, "Finalizing and saving results...")
        await save_scan_results(scan_id, repo_id, user_id, scan_results)
        
        await update_status("completed", 100, "Scan complete.", results=scan_results)
        logger.info(f"Successfully completed scan for repo: {repo_id}")

    except Exception as e:
        logger.error(f"Scan failed for repo_id {repo_id}, scan_id {scan_id}: {str(e)}")
        # Use the helper to notify client of failure
        await update_status("failed", 100, f"Scan failed: {str(e)}")
        
    finally:
        # Clean up the cloned repository
        if os.path.exists(local_path):
            shutil.rmtree(local_path)
        logger.info(f"Cleaned up temporary directory: {local_path}")
        
    return {"status": "completed", "scan_id": scan_id}