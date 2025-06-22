import os
from dotenv import load_dotenv

load_dotenv()  # loads variables from .env into os.environ

class Settings:
    # GitLab OAuth
    GITLAB_CLIENT_ID: str = os.getenv("GITLAB_CLIENT_ID", "")
    GITLAB_CLIENT_SECRET: str = os.getenv("GITLAB_CLIENT_SECRET", "")
    GITLAB_REDIRECT_URI: str = os.getenv("GITLAB_REDIRECT_URI", "")

    # MongoDB
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "Cluster0")

    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "cd2d2523ca650fe6ca9c7b82825e394c5fe60c2e49bddc5a074350c9f455fced")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_SECONDS: int = int(os.getenv("JWT_EXPIRATION_SECONDS", "3600"))

    # Frontend (for redirects)
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Pinecone
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    PINECONE_ENVIRONMENT: str = os.getenv("PINECONE_ENVIRONMENT", "aws-us-west-2")  # AWS environment
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "auditflow-embeddings")
    PINECONE_DIMENSION: int = int(os.getenv("PINECONE_DIMENSION", "768"))  # Gemini embedding dimension
    PINECONE_METRIC: str = os.getenv("PINECONE_METRIC", "cosine")

    # Google Cloud
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")

    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_EMBEDDING_MODEL: str = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-ada-002")

    # Cloud Run Worker URL
    CLOUD_RUN_WORKER_URL: str = os.getenv("CLOUD_RUN_WORKER_URL", "https://audit-flow-1061681908568.us-west2.run.app") # Production Cloud Run URL

settings = Settings()