# repos/routes.py
import requests
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from utils.token import get_current_user
from typing import List
from datetime import datetime
from db.init import db
from google.cloud import tasks_v2
from google.protobuf import timestamp_pb2
import os
from dotenv import load_dotenv
from google.oauth2 import service_account
import google.auth
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["repos"])

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

@router.get("/repos")
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
    # Return a trimmed set of fields
    trimmed = [
        {
            "id": p["id"],
            "name": p["name"],
            "path_with_namespace": p["path_with_namespace"],
            "web_url": p["web_url"],
            "last_activity_at": p["last_activity_at"],
        }
        for p in projects
    ]
    return trimmed

@router.post("/repos/{repo_id}/scan", status_code=status.HTTP_202_ACCEPTED)
async def request_scan(repo_id: int, current_user: dict = Depends(get_current_user)):
    """
    Enqueue a scan request for the given repo using Google Cloud Tasks.
    """
    try:
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

        payload = {"repo_id": repo_id, "user_id": current_user["id"]}
        task = {
            "http_request": {
                "http_method": tasks_v2.HttpMethod.POST,
                "url": os.getenv("CLOUD_RUN_WORKER_URL"),
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps(payload).encode(),
                "oidc_token": {
                    "service_account_email": os.getenv("GCP_SERVICE_ACCOUNT_EMAIL"),
                    "audience": os.getenv("CLOUD_RUN_WORKER_URL"),
                },
            },
            "schedule_time": timestamp_pb2.Timestamp().FromDatetime(
                datetime.utcnow()
            ),
        }
        
        logger.info(f"Creating task for repo {repo_id}")
        response = client.create_task(request={"parent": QUEUE_PATH, "task": task})
        logger.info(f"Task created successfully: {response.name}")
        
        return {
            "message": "Scan enqueued",
            "task_name": response.name,
            "scan": {
                "repo_id": str(repo_id),
                "user_id": str(current_user["id"]),
                "requested_at": datetime.utcnow().isoformat(),
                "status": "pending"
            }
        }
    except Exception as e:
        logger.error(f"Failed to enqueue scan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enqueue scan: {str(e)}"
        )



# gcloud projects add-iam-policy-binding audit-flow-ai --member="serviceAccount:scan-worker@audit-flow-ai.iam.gserviceaccount.com" --role="roles/cloudtasks.admin"