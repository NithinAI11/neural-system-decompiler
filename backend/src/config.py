# C:\Nithin\AI-Projects\Neural-System-Decompiler\backend\src\config.py
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from qdrant_client import QdrantClient

# Load environment variables from the .env file located at the project root
# This walks up from backend/src/config.py -> backend/src -> backend -> project root
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
load_dotenv(dotenv_path)

# API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("CRITICAL: GROQ_API_KEY is missing from your .env file!")

# Safety Configuration
IGNORED_DIRS = {".git", "node_modules", "venv", "env", "__pycache__", ".idea", "dist", "build"}
IGNORED_FILES = {".env", ".env.local", "secrets.json", "config.py"} # Protects context bleed

# Database Singletons
class DBManager:
    _mongo_client = None
    _qdrant_client = None

    @classmethod
    def get_mongo(cls):
        if not cls._mongo_client:
            cls._mongo_client = MongoClient("mongodb://localhost:27017/")
        return cls._mongo_client["nsd_memory_db"]

    @classmethod
    def get_qdrant(cls):
        if not cls._qdrant_client:
            # Using local docker Qdrant
            cls._qdrant_client = QdrantClient(url="http://localhost:6333")
        return cls._qdrant_client