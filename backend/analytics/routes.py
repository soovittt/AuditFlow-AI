# backend/analytics/routes.py
from fastapi import APIRouter, Depends
from db.crud_scan import ScanCRUD
from utils.token import get_current_user
from typing import Dict, Any

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
async def get_analytics_summary(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Endpoint to get aggregated analytics data across all repositories for the user.
    """
    user_id = current_user["id"]
    summary_data = await ScanCRUD.get_analytics_summary(user_id)
    return summary_data 