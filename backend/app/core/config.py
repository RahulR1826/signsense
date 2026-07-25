import os
from pathlib import Path

class Settings:
    PROJECT_NAME: str = "SignSense Backend"
    API_V1_STR: str = "/api"
    
    # Database configuration (SQLite by default, override with PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./signsense.db")
    
    # AI Orchestrator keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Model configuration paths
    BASE_DIR = Path(__file__).resolve().parent.parent
    MODEL_PATH: str = str(BASE_DIR / "ai" / "model" / "hand_sign_model.h5")
    LABELS_PATH: str = str(BASE_DIR / "ai" / "model" / "labels.json")

settings = Settings()
