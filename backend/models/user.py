# models/user.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    gitlab_id: int
    username: str
    email: EmailStr
    avatar_url: Optional[str]
    access_token: str

class UserInDB(BaseModel):
    id: str                      # MongoDB _id as string
    gitlab_id: int
    username: str
    email: EmailStr
    avatar_url: Optional[str]
    access_token: str
    created_at: datetime
    updated_at: datetime