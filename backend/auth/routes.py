# auth/routes.py
import requests
from fastapi import APIRouter, Request, HTTPException, Response, Cookie
from fastapi.responses import RedirectResponse
from config import settings
from models.user import UserCreate
from db.crud_user import upsert_user
from db.init import db
from utils.token import create_jwt_token
import secrets

router = APIRouter(tags=["auth"])

REFRESH_TOKEN_COOKIE_NAME = "refresh_token"
REFRESH_TOKEN_EXPIRE_DAYS = 7

@router.get("/auth/gitlab/login")
async def gitlab_login():
    """
    Returns a JSON payload containing the GitLab OAuth URL.
    Frontend should redirect the user to this URL.
    """
    oauth_url = (
        "https://gitlab.com/oauth/authorize"
        f"?client_id={settings.GITLAB_CLIENT_ID}"
        f"&redirect_uri={settings.GITLAB_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=read_user%20read_api%20read_repository"
    )
    return {"url": oauth_url}


@router.get("/auth/gitlab/callback")
async def gitlab_callback(request: Request, response: Response):
    """
    GitLab will redirect here with ?code=... 
    We exchange that code for an access_token, fetch user info,
    upsert into MongoDB, issue our own JWT, and send the user back to the frontend.
    """
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code in callback")

    # 1. Exchange code for access_token
    token_url = "https://gitlab.com/oauth/token"
    data = {
        "client_id": settings.GITLAB_CLIENT_ID,
        "client_secret": settings.GITLAB_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.GITLAB_REDIRECT_URI
    }
    token_resp = requests.post(token_url, data=data)
    if token_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to exchange code for token")
    access_token = token_resp.json().get("access_token")

    # 2. Fetch GitLab user info
    user_resp = requests.get(
        "https://gitlab.com/api/v4/user",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    if user_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch user info")
    user_json = user_resp.json()

    # 3. Upsert user into our DB
    user_create = UserCreate(
        gitlab_id=user_json["id"],
        username=user_json["username"],
        email=user_json.get("email", ""),
        avatar_url=user_json.get("avatar_url", None),
        access_token=access_token
    )
    user_doc = await upsert_user(user_create)

    # 4. Create our own JWT
    jwt_token = create_jwt_token(user_doc["id"])

    # 4.5. Create a refresh token and store it in the user doc
    refresh_token = secrets.token_urlsafe(32)
    await db.get_collection("users").update_one(
        {"_id": user_doc["_id"]},
        {"$set": {"refresh_token": refresh_token}}
    )
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="lax"
    )
    # 5. Redirect back to frontend with JWT as query param
    redirect_url = f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}"
    response.status_code = 307
    response.headers["Location"] = redirect_url
    return response

@router.post("/auth/refresh")
async def refresh_token_endpoint(response: Response, refresh_token: str = Cookie(None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")
    user_doc = await db.get_collection("users").find_one({"refresh_token": refresh_token})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    # Optionally: rotate refresh token here for extra security
    new_jwt = create_jwt_token(str(user_doc["_id"]))
    return {"token": new_jwt}
