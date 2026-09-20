import logging
import sys
from backend.app.config import settings

def setup_logging():
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

    # Silence overly verbose libraries
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("chromadb").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    
    logger = logging.getLogger("cooperative_mitra")
    logger.info(f"Logging initialized. Level: {logging.getLevelName(log_level)}")
    return logger

logger = setup_logging()
