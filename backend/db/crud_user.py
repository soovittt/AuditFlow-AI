# db/crud_user.py
from datetime import datetime
from bson import ObjectId
from db.init import db
from models.user import UserCreate, UserInDB

async def upsert_user(user_data: UserCreate) -> dict:
    """
    Insert or update a user record in MongoDB based on gitlab_id.
    Returns the full user document (including MongoDB _id).
    """
    users_coll = db.get_collection("users")

    now = datetime.utcnow()
    doc = {
        "gitlab_id": user_data.gitlab_id,
        "username": user_data.username,
        "email": user_data.email,
        "avatar_url": user_data.avatar_url,
        "access_token": user_data.access_token,
        "updated_at": now,
    }

    # If new, set created_at
    update = {"$set": doc, "$setOnInsert": {"created_at": now}}

    result = await users_coll.update_one(
        {"gitlab_id": user_data.gitlab_id},
        update,
        upsert=True
    )

    # Whether upserted or existing, fetch back the record
    user_doc = await users_coll.find_one({"gitlab_id": user_data.gitlab_id})
    # Convert ObjectId to string
    user_doc["id"] = str(user_doc["_id"])
    return user_doc
