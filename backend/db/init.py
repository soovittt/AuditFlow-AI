# db/init.py
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import certifi

client = AsyncIOMotorClient(
    settings.MONGODB_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000,
    socketTimeoutMS=20000
)
db = client[settings.MONGODB_DB_NAME]
