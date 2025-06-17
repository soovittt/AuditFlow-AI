import requests
from config import GITLAB_CLIENT_ID, GITLAB_CLIENT_SECRET, GITLAB_REDIRECT_URI

def exchange_code_for_token(code: str) -> str:
    token_url = "https://gitlab.com/oauth/token"
    payload = {
        "client_id": GITLAB_CLIENT_ID,
        "client_secret": GITLAB_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": GITLAB_REDIRECT_URI
    }
    response = requests.post(token_url, data=payload)
    response.raise_for_status()
    return response.json()["access_token"]