FROM python:3.11-bullseye

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    GIT_PYTHON_REFRESH=quiet

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libffi-dev \
        git \
        ca-certificates \
        openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY backend/requirements.txt .

# Create and activate virtual environment, then install dependencies
RUN python -m venv /opt/venv \
    && . /opt/venv/bin/activate \
    && pip install --no-cache-dir -r requirements.txt

ENV PATH="/opt/venv/bin:$PATH"

# 🔧 Copy the service account JSON into container
COPY audit-flow-ai-c126d41ec3a1.json ./audit-flow-ai-c126d41ec3a1.json

# 🔧 Copy the backend code into container
COPY backend/ .

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application using the PORT environment variable
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}


