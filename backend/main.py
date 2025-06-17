# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from auth.routes import router as auth_router
from repos.routes import router as repos_router
from worker.routes import router as worker_router
from config import settings

app = FastAPI(title="Audit Flow Backend")

# Allow CORS from your frontend domain(s)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    settings.FRONTEND_URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(repos_router, prefix="/api")
app.include_router(worker_router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
