from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import httpx
import os
from backend.app.database import get_db
from backend.app.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    # 1. Check Database
    db_status = "unhealthy"
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"

    # 2. Check Vector DB Directory
    vector_db_exists = os.path.exists(settings.CHROMA_PERSIST_DIRECTORY)
    vector_status = "available" if vector_db_exists else "initializing"

    # 3. Check Gemini configuration
    gemini_configured = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5)

    # 4. Check Ollama reachability (timeout fast 1.0s)
    ollama_reachable = False
    try:
        r = httpx.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=1.0)
        if r.status_code == 200:
            ollama_reachable = True
    except Exception:
        ollama_reachable = False

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "app_name": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "components": {
            "database": db_status,
            "vector_store": vector_status,
            "primary_llm_gemini": {
                "configured": gemini_configured,
                "model": settings.GEMINI_MODEL
            },
            "fallback_llm_ollama": {
                "reachable": ollama_reachable,
                "endpoint": settings.OLLAMA_BASE_URL,
                "model": settings.OLLAMA_MODEL
            }
        }
    }
