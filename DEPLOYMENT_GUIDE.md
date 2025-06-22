# AuditFlow AI - Deployment Guide

## 🚀 Production URLs

### Backend (Cloud Run)
- **URL**: `https://audit-flow-1061681908568.us-west2.run.app`
- **Region**: us-west2
- **Service**: audit-flow

### Frontend (Vercel/Cloud Run)
- **URL**: `https://auditflow-ai.vercel.app` (or your actual frontend URL)
- **Platform**: Vercel/Cloud Run

## 📋 Environment Variables

### Frontend (.env.local)
```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_BASE_URL=https://audit-flow-1061681908568.us-west2.run.app

# GitLab OAuth (if needed)
NEXT_PUBLIC_GITLAB_CLIENT_ID=your_gitlab_client_id

# App Configuration
NEXT_PUBLIC_APP_NAME=AuditFlow AI
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Backend (.env)
```bash
# GitLab OAuth Configuration
GITLAB_CLIENT_ID=your_gitlab_client_id
GITLAB_CLIENT_SECRET=your_gitlab_client_secret
GITLAB_REDIRECT_URI=https://audit-flow-1061681908568.us-west2.run.app/api/auth/gitlab/callback

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=auditflow

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_SECONDS=3600

# Frontend URL (for OAuth redirects)
FRONTEND_URL=https://auditflow-ai.vercel.app

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=aws-us-west-2
PINECONE_INDEX_NAME=auditflow-embeddings
PINECONE_DIMENSION=768
PINECONE_METRIC=cosine

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your_google_cloud_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_service_account_key.json

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002
```

## 🔧 GitLab OAuth Setup

1. **Create GitLab OAuth Application**:
   - Go to GitLab > Settings > Applications
   - Add new application
   - **Redirect URI**: `https://audit-flow-1061681908568.us-west2.run.app/api/auth/gitlab/callback`
   - **Scopes**: `read_user`, `read_api`, `read_repository`

2. **Update Environment Variables**:
   - Copy the Client ID and Client Secret to your backend environment

## 🗄️ Database Collections

The system will automatically create these collections on first run:

- `file_metadata` - File tracking and AST storage
- `scan_results` - Main scan results
- `text_chunks` - Code chunks for analysis
- `violations` - Enhanced violation tracking
- `compliance_scores` - Historical scoring
- `users` - User management

## 🔒 CORS Configuration

Backend is configured to allow requests from:
- `http://localhost:3000` (development)
- `https://auditflow-frontend-ai-xxxxx-uc.a.run.app` (Cloud Run frontend)
- `https://auditflow-ai.vercel.app` (Vercel frontend)
- Custom frontend URL from `FRONTEND_URL` environment variable

## 📊 API Endpoints

All API calls now use the full production URL:
- Base URL: `https://audit-flow-1061681908568.us-west2.run.app`
- Auth: `/api/auth/*`
- Repos: `/api/repos/*`
- Worker: `/api/worker/*`

## ✅ Verification Checklist

- [ ] Backend deployed to Cloud Run
- [ ] Frontend deployed to Vercel/Cloud Run
- [ ] Environment variables configured
- [ ] GitLab OAuth application created
- [ ] MongoDB connection established
- [ ] Pinecone index created
- [ ] OpenAI API key configured
- [ ] CORS settings updated
- [ ] Database collections initialized

## 🐛 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check if frontend URL is in CORS origins
2. **OAuth Redirect**: Verify redirect URI matches exactly
3. **Database Connection**: Check MongoDB URI and network access
4. **API Calls**: Ensure all frontend calls use full URLs

### Health Check:
```bash
curl https://audit-flow-1061681908568.us-west2.run.app/docs
```

This should return the FastAPI documentation page. 