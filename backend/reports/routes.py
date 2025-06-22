# backend/reports/routes.py
from fastapi import APIRouter, Depends
from db.crud_scan import ScanCRUD
from utils.token import get_current_user
from typing import List, Dict, Any

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/history")
async def get_all_reports_history(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Endpoint to get a history of all completed scans (reports) across all repositories for the user.
    """
    user_id = current_user["id"]
    reports_history = await ScanCRUD.get_all_scan_history(user_id)
    return reports_history
