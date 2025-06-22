# db/init.py
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import certifi
import asyncio

client = AsyncIOMotorClient(
    settings.MONGODB_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000,
    socketTimeoutMS=20000
)
db = client[settings.MONGODB_DB_NAME]

async def init_collections():
    """Initialize required collections with indexes."""
    try:
        # Initialize file_metadata collection
        file_metadata_collection = db.get_collection("file_metadata")
        await file_metadata_collection.create_index([("repo_id", 1), ("path", 1)], unique=True)
        await file_metadata_collection.create_index([("repo_id", 1)])
        await file_metadata_collection.create_index([("last_scanned", -1)])
        
        # Initialize scan_results collection
        scan_results_collection = db.get_collection("scan_results")
        await scan_results_collection.create_index([("repo_id", 1), ("created_at", -1)])
        await scan_results_collection.create_index([("user_id", 1), ("created_at", -1)])
        await scan_results_collection.create_index([("repo_id", 1), ("user_id", 1)])
        
        # Initialize text_chunks collection (fallback for Pinecone)
        text_chunks_collection = db.get_collection("text_chunks")
        await text_chunks_collection.create_index([("chunk_id", 1)], unique=True)
        await text_chunks_collection.create_index([("metadata.repo_id", 1)])
        await text_chunks_collection.create_index([("created_at", -1)])
        
        # Initialize violations collection for enhanced tracking
        violations_collection = db.get_collection("violations")
        await violations_collection.create_index([("violation_id", 1)], unique=True)
        await violations_collection.create_index([("repo_id", 1), ("status", 1)])
        await violations_collection.create_index([("repo_id", 1), ("severity", 1)])
        await violations_collection.create_index([("repo_id", 1), ("assigned_priority", 1)])
        await violations_collection.create_index([("discovered_date", -1)])
        await violations_collection.create_index([("category", 1)])
        
        # Initialize compliance_scores collection for historical scoring
        compliance_scores_collection = db.get_collection("compliance_scores")
        await compliance_scores_collection.create_index([("repo_id", 1), ("scan_date", -1)])
        await compliance_scores_collection.create_index([("repo_id", 1), ("user_id", 1)])
        await compliance_scores_collection.create_index([("overall_score", -1)])
        
        # Initialize users collection (if not exists)
        users_collection = db.get_collection("users")
        await users_collection.create_index([("gitlab_id", 1)], unique=True)
        await users_collection.create_index([("email", 1)])
        
        print("✅ Database collections initialized successfully")
        print("📊 Collections: file_metadata, scan_results, text_chunks, violations, compliance_scores, users")
    except Exception as e:
        print(f"⚠️ Warning: Could not initialize collections: {e}")

# Initialize collections on startup
try:
    loop = asyncio.get_event_loop()
    if loop.is_running():
        # If loop is already running, schedule the initialization
        loop.create_task(init_collections())
    else:
        # If loop is not running, run the initialization
        loop.run_until_complete(init_collections())
except Exception as e:
    print(f"⚠️ Warning: Could not initialize collections: {e}")
