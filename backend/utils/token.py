# utils/token.py
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings
from db.init import db
from bson import ObjectId

security = HTTPBearer()  # for "Authorization: Bearer <token>"

def create_jwt_token(user_id: str) -> str:
    """
    Issue a JWT that encodes the user_id, expires in settings.JWT_EXPIRATION_SECONDS.
    """
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(seconds=settings.JWT_EXPIRATION_SECONDS),
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Dependency to extract user from JWT. Raises 401 if invalid.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Fetch user from DB
    try:
        user_obj_id = ObjectId(user_id)
        user_doc = await db.get_collection("users").find_one({"_id": user_obj_id})
    except Exception:
        user_doc = await db.get_collection("users").find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    # Return user document ("id" as string)
    user_doc["id"] = str(user_doc["_id"])
    return user_doc
