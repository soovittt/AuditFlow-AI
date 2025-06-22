# repos/routes.py
import requests
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from utils.token import get_current_user
from utils.pdf_generator import ComplianceReportGenerator
from db.crud_scan import ScanCRUD
from models.scan import RepoComplianceSummary, ScanSummary
from typing import List
from datetime import datetime
from db.init import db
from google.cloud import tasks_v2
from google.protobuf import timestamp_pb2
import os
from dotenv import load_dotenv
from google.oauth2 import service_account
import google.auth
import io
from bson import ObjectId
from config import settings
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/repos", tags=["repos"])

# Initialize Cloud Tasks client
try:
    # Log environment variables (without sensitive values)
    logger.info(f"GCP_PROJECT_ID: {os.getenv('GCP_PROJECT_ID')}")
    logger.info(f"GCP_LOCATION: {os.getenv('GCP_LOCATION')}")
    logger.info(f"GCP_QUEUE_NAME: {os.getenv('GCP_QUEUE_NAME')}")
    logger.info(f"GCP_SERVICE_ACCOUNT_EMAIL: {os.getenv('GCP_SERVICE_ACCOUNT_EMAIL')}")
    
    # Verify service account credentials
    credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    if not credentials_path:
        raise Exception("GOOGLE_APPLICATION_CREDENTIALS environment variable is not set")
    
    if not os.path.exists(credentials_path):
        raise Exception(f"Service account credentials file not found at: {credentials_path}")
    
    # Define required scopes
    scopes = [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/cloud-tasks',
        'https://www.googleapis.com/auth/iam'
    ]
    
    credentials = service_account.Credentials.from_service_account_file(
        credentials_path,
        scopes=scopes
    )
    
    client = tasks_v2.CloudTasksClient(credentials=credentials)
    QUEUE_PATH = client.queue_path(
        os.getenv("GCP_PROJECT_ID"),
        os.getenv("GCP_LOCATION"),
        os.getenv("GCP_QUEUE_NAME")
    )
    logger.info(f"Queue path: {QUEUE_PATH}")
except Exception as e:
    logger.error(f"Failed to initialize Cloud Tasks client: {str(e)}")
    raise

@router.get("/")
async def list_repos(current_user: dict = Depends(get_current_user)) -> List[dict]:
    """
    Fetch the authenticated GitLab user's projects and return as a JSON list.
    """
    access_token = current_user.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="GitLab access token missing")

    # GitLab API to list owned projects; you can adjust pagination & visibility
    gitlab_url = "https://gitlab.com/api/v4/projects"
    params = {
        "membership": True,     # projects the user is a member of
        "per_page": 100,
        "order_by": "last_activity_at"
    }
    headers = {"Authorization": f"Bearer {access_token}"}
    resp = requests.get(gitlab_url, headers=headers, params=params)

    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch GitLab repos")

    projects = resp.json()
    
    summaries = []
    for p in projects:
        summary = await ScanCRUD.get_repo_summary(p["id"], current_user["id"])
        if summary:
            summaries.append({**p, **summary})
        else:
            summaries.append({
                **p,
                "overall_score": 0,
                "grade": "N/A",
                "status": "not-scanned",
                "trend": "stable",
                "open_violations": 0,
                "last_scan_date": None
            })

    return summaries

@router.get("/{repo_id}/summary", response_model=RepoComplianceSummary)
async def get_repo_summary(repo_id: int, current_user: dict = Depends(get_current_user)):
    """
    Get a comprehensive compliance summary for a specific repository.
    """
    try:
        summary = await ScanCRUD.get_repo_summary(repo_id, current_user["id"])
        if not summary:
            raise HTTPException(status_code=404, detail="No scan data found for this repository.")
        
        # Add full repository info to the summary
        access_token = current_user.get("access_token")
        gitlab_url = f"https://gitlab.com/api/v4/projects/{repo_id}"
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = requests.get(gitlab_url, headers=headers)
        if resp.status_code == 200:
            repo_info = resp.json()
            summary["repo_name"] = repo_info.get("name", "Unknown")

        # Add scan history and trends
        summary["compliance_history"] = await ScanCRUD.get_compliance_trends(repo_id, current_user["id"], days=30)
        summary["violation_history"] = [] # Placeholder for violation trend logic
        
        return summary
    except Exception as e:
        logger.error(f"Failed to get repo summary for {repo_id}: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while fetching the repository summary: {e}")

@router.get("/{repo_id}/scans", response_model=List[ScanSummary])
async def get_scan_history(repo_id: int, current_user: dict = Depends(get_current_user)):
    """
    Get scan history for a specific repository.
    """
    try:
        scans_collection = db.get_collection("scans")
        
        # Get completed scans for this repo and user, sorted by completion date
        cursor = scans_collection.find({
            "repo_id": repo_id,
            "user_id": current_user["id"],
            "status": "completed"
        }).sort("updated_at", -1).limit(10)
        
        scans = []
        async for scan in cursor:
            # Ensure the scan has results before processing
            if "results" not in scan or not scan["results"]:
                continue

            scores = scan.get("results", {}).get("scores", {})
            scans.append(ScanSummary(
                scan_id=str(scan["_id"]),
                repo_id=scan["repo_id"],
                scan_date=scan["updated_at"], # Use updated_at for completion time
                status=scan.get("status", "completed"),
                # Get score details directly from the scores object
                overall_score=scores.get("overall_score", 0),
                total_violations=scores.get("total_violations", 0),
                critical_violations=scores.get("critical_violations", 0),
                high_violations=scores.get("high_violations", 0),
                medium_violations=scores.get("medium_violations", 0),
                low_violations=scores.get("low_violations", 0),
                grade=ScanCRUD._get_grade_from_score(scores.get("overall_score", 0))
            ))
        
        return scans
    except Exception as e:
        logger.error(f"Failed to get scan history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get scan history: {str(e)}"
        )

@router.get("/{repo_id}/scans/latest")
async def get_latest_scan(repo_id: int, current_user: dict = Depends(get_current_user)):
    """
    Get the latest scan result for a specific repository.
    """
    try:
        scans_collection = db.get_collection("scans")
        
        # Get the most recent completed scan for this repo and user
        latest_scan = await scans_collection.find_one({
            "repo_id": repo_id,
            "user_id": current_user["id"],
            "status": "completed"
        }, sort=[("updated_at", -1)])
        
        if not latest_scan:
            return {
                "repo_id": repo_id,
                "scan": None,
                "message": "No scans found for this repository"
            }
        
        return {
            "repo_id": repo_id,
            "scan": {
                "id": str(latest_scan["_id"]),
                "created_at": latest_scan["created_at"].isoformat(),
                "updated_at": latest_scan["updated_at"].isoformat(),
                "results": latest_scan["results"]
            }
        }
    except Exception as e:
        logger.error(f"Failed to get latest scan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get latest scan: {str(e)}"
        )

@router.post("/{repo_id}/scan", status_code=status.HTTP_202_ACCEPTED)
async def request_scan(repo_id: int, current_user: dict = Depends(get_current_user)):
    """
    Enqueue a scan request for the given repo using Google Cloud Tasks.
    """
    scan_id = None
    try:
        # Step 1: Get repo details from GitLab to fetch the name
        access_token = current_user.get("access_token")
        gitlab_url = f"https://gitlab.com/api/v4/projects/{repo_id}"
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = requests.get(gitlab_url, headers=headers)
        resp.raise_for_status()
        repo_info = resp.json()
        repo_name = repo_info.get("name", f"Repo ID {repo_id}")

        # Step 2: Create a scan record in the database with the repo name
        scan_id = await ScanCRUD.create_scan(repo_id, current_user["id"], repo_name)
        logger.info(f"Created scan record {scan_id} for repo {repo_id} ('{repo_name}')")

        # Validate environment variables
        required_env_vars = [
            "GCP_PROJECT_ID",
            "GCP_LOCATION",
            "GCP_QUEUE_NAME",
            "CLOUD_RUN_WORKER_URL",
            "GCP_SERVICE_ACCOUNT_EMAIL"
        ]
        credentials, project = google.auth.default()
        print("🔐 Effective service account:", credentials.service_account_email)
        
        missing_vars = [var for var in required_env_vars if not os.getenv(var)]
        if missing_vars:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Missing required environment variables: {', '.join(missing_vars)}"
            )

        # Step 2: Enqueue the scan task with the new scan_id
        payload = {"repo_id": repo_id, "user_id": current_user["id"], "scan_id": scan_id}
        
        task = {
            "http_request": {
                "http_method": tasks_v2.HttpMethod.POST,
                "url": settings.CLOUD_RUN_WORKER_URL,
                "headers": {"Content-type": "application/json"},
                "body": json.dumps(payload).encode(),
                "oidc_token": {
                    "service_account_email": os.getenv("GCP_SERVICE_ACCOUNT_EMAIL"),
                },
            }
        }
        
        # Create the task
        logger.info(f"Creating task for repo {repo_id} with scan_id {scan_id}")
        response = client.create_task(request={"parent": QUEUE_PATH, "task": task})
        logger.info(f"Task created successfully: {response.name}")
        
        return {
            "message": "Scan enqueued",
            "task_name": response.name,
            "scan_id": scan_id,
            "scan": {
                "repo_id": str(repo_id),
                "user_id": str(current_user["id"]),
                "requested_at": datetime.utcnow().isoformat(),
                "status": "queued"
            }
        }
    except Exception as e:
        logger.error(f"Failed to enqueue scan: {str(e)}")
        if scan_id:
            await ScanCRUD.update_scan_status(
                scan_id, "failed", 0, 
                "Failed to schedule the scan in the processing queue."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to schedule scan: {e}"
        )

@router.get("/{repo_id}/search")
async def semantic_code_search(
    repo_id: int, 
    query: str, 
    top_k: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """
    Search for similar code patterns using semantic search.
    """
    try:
        from pinecone import Pinecone
        from config import settings
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX_NAME)  # Use 'auditflow-embeddings'
        # Search for similar code patterns
        results = index.search(
            namespace="__default__",
            query={
                "inputs": {"text": query},
                "top_k": top_k,
                "filter": {"repo_id": repo_id}
            },
            fields=["text", "file_path", "language", "chunk_type"]
        )
        # Format results
        search_results = []
        for hit in results['result']['hits']:
            search_results.append({
                "id": hit['_id'],
                "score": hit['_score'],
                "text": hit['fields']['text'],
                "file_path": hit['fields']['file_path'],
                "language": hit['fields']['language'],
                "chunk_type": hit['fields']['chunk_type']
            })
        return {
            "repo_id": repo_id,
            "query": query,
            "results": search_results,
            "total_results": len(search_results)
        }
    except Exception as e:
        logger.error(f"Failed to perform semantic search: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform semantic search: {str(e)}"
        )

@router.get("/{repo_id}/report")
async def generate_compliance_report(
    repo_id: int, 
    scan_id: str = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate and download a comprehensive PDF compliance report for a repository.
    If scan_id is not provided, uses the latest scan.
    """
    try:
        scans_collection = db.get_collection("scans")
        
        # Get scan data
        if scan_id:
            # Get specific scan
            scan_data = await scans_collection.find_one({
                "_id": ObjectId(scan_id),
                "repo_id": repo_id,
                "user_id": current_user["id"]
            })
        else:
            # Get latest completed scan
            scan_data = await scans_collection.find_one({
                "repo_id": repo_id,
                "user_id": current_user["id"],
                "status": "completed"
            }, sort=[("updated_at", -1)])
        
        if not scan_data or "results" not in scan_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No completed scan data found for this repository to generate a report."
            )
        
        # Get repository info from GitLab
        access_token = current_user.get("access_token")
        gitlab_url = f"https://gitlab.com/api/v4/projects/{repo_id}"
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = requests.get(gitlab_url, headers=headers)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch repository details from GitLab")
        repo_info = resp.json()
        
        # Generate PDF
        generator = ComplianceReportGenerator(scan_data=scan_data, repo_info=repo_info)
        pdf_bytes = generator.generate_report()
        
        # Return as a streaming response
        return StreamingResponse(io.BytesIO(pdf_bytes), media_type='application/pdf', 
                                 headers={'Content-Disposition': f'attachment; filename="compliance_report_{repo_id}.pdf"'})
        
    except HTTPException as http_exc:
        raise http_exc # Re-raise HTTPException
    except Exception as e:
        logger.error(f"Failed to generate compliance report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while generating the report: {e}"
        )

@router.get("/{repo_id}/violations")
async def get_violations_summary(
    repo_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a summary of violations for a repository.
    """
    try:
        logger.info(f"Getting violations for repo {repo_id}, user {current_user['id']}")
        scans_collection = db.get_collection("scans")
        
        # Get latest completed scan
        latest_scan = await scans_collection.find_one({
            "repo_id": repo_id,
            "user_id": current_user["id"],
            "status": "completed"
        }, sort=[("updated_at", -1)])
        
        if not latest_scan or "results" not in latest_scan:
            logger.info(f"No completed scan with results found for repo {repo_id}")
            return {
                "repo_id": repo_id,
                "violations": [],
                "summary": {
                    "total_violations": 0,
                    "critical_count": 0,
                    "high_count": 0,
                    "medium_count": 0,
                    "low_count": 0
                },
                "scores": {
                    "overall_score": 100,
                    "security_score": 100,
                    "compliance_score": 100,
                    "quality_score": 100
                }
            }
        
        results = latest_scan["results"]
        scores = results.get("scores", {})
        
        response_data = {
            "repo_id": repo_id,
            "scan_id": str(latest_scan["_id"]),
            "scan_date": latest_scan["updated_at"].isoformat(),
            "violations": results.get("findings", []),
            "summary": {
                "total_violations": scores.get("total_violations", 0),
                "critical_violations_count": scores.get("critical_violations", 0),
                "high_violations_count": scores.get("high_violations", 0),
                "medium_violations_count": scores.get("medium_violations", 0),
                "low_violations_count": scores.get("low_violations", 0),
            },
            "scores": scores,
        }
        
        logger.info(f"Returning violations data: {len(response_data['violations'])} violations, scores: {response_data['scores']}")
        return response_data
        
    except Exception as e:
        logger.error(f"Failed to get violations summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get violations summary: {str(e)}"
        )

# gcloud projects add-iam-policy-binding audit-flow-ai --member="serviceAccount:scan-worker@audit-flow-ai.iam.gserviceaccount.com" --role="roles/cloudtasks.admin"