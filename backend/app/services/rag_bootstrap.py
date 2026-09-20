"""Populate the ignored Chroma store from the repository's real source records."""
import subprocess
import sys

from backend.app.config import ROOT_DIR
from backend.app.core.logging_config import logger
from backend.app.services.rag_service import rag_service


def ensure_knowledge_base() -> None:
    """Run the existing ingestion pipeline only when Chroma has no records."""
    if rag_service.collection is None:
        logger.warning("RAG collection is unavailable; keeping safe chat fallback active.")
        return

    try:
        if rag_service.collection.count() > 0:
            return
    except Exception as exc:
        logger.warning("Could not inspect RAG collection: %s", exc)
        return

    script = ROOT_DIR / "nlp-rag" / "ingestion.py"
    if not script.is_file():
        logger.warning("RAG ingestion script is missing; keeping safe chat fallback active.")
        return

    logger.info("RAG collection is empty; ingesting versioned knowledge sources.")
    try:
        result = subprocess.run(
            [sys.executable, str(script)],
            cwd=str(ROOT_DIR),
            check=True,
            capture_output=True,
            text=True,
            timeout=600,
        )
        logger.info("RAG ingestion completed: %s", result.stdout[-1000:])
        rag_service._initialize_collection()
    except Exception as exc:
        logger.warning("RAG ingestion failed; keeping safe chat fallback active: %s", exc)