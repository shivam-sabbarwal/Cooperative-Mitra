from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import os
from pathlib import Path

# Locate root directory
ROOT_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ROOT_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Application
    APP_NAME: str = "Cooperative Mitra"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    API_V1_PREFIX: str = "/api/v1"

    # Security & Authentication
    # Supplied by the local environment. Production startup rejects missing or
    # placeholder values; no signing key is embedded in source control.
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    DATABASE_URL: str = "sqlite:///./cooperative_mitra.db"

    # Primary LLM: Google Gemini
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.8-flash"

    # Fallback LLM: Local Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:3b"

    # Embedding & Vector Database
    EMBEDDING_MODEL: str = "paraphrase-multilingual-MiniLM-L12-v2"
    CHROMA_PERSIST_DIRECTORY: str = str(ROOT_DIR / "nlp-rag" / "knowledge_base" / "chroma_db")
    CHROMA_COLLECTION_NAME: str = "cooperative_knowledge"

    # Voice / Audio
    WHISPER_MODEL: str = "base"
    ENABLE_EDGE_TTS: bool = True
    AUDIO_STORAGE_DIR: str = str(ROOT_DIR / "backend" / "temp_audio")

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

settings = Settings()

# Ensure directories exist
os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
os.makedirs(settings.AUDIO_STORAGE_DIR, exist_ok=True)
