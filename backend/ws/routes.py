# backend/ws/routes.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .connection_manager import manager
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ws", tags=["websockets"])

@router.websocket("/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
        logger.info(f"WebSocket connection closed for user {user_id}") 