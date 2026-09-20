from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import time
import os
from pathlib import Path

from backend.app.config import settings
from backend.app.core.logging_config import logger
from backend.app.database import engine, Base
from backend.app.seed import seed_database
from backend.app.routers.health import router as health_router
from backend.app.routers.auth import router as auth_router
from backend.app.routers.schemes import router as schemes_router
from backend.app.routers.legal import router as legal_router
from backend.app.routers.grievances import router as grievances_router
from backend.app.routers.voice import router as voice_router
from backend.app.routers.chat import router as chat_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed data
    logger.info(f"Starting {settings.APP_NAME} in {settings.ENVIRONMENT} mode...")
    if settings.ENVIRONMENT.lower() == "production" and (
        len(settings.SECRET_KEY) < 32
        or settings.SECRET_KEY == "replace_with_a_secure_random_secret"
    ):
        raise RuntimeError("A strong SECRET_KEY must be configured for production")
    try:
        Base.metadata.create_all(bind=engine)
        if settings.ENVIRONMENT.lower() != "production":
            seed_database()
        logger.info("Database initialized and verified.")
    except Exception as e:
        logger.error(f"Database initialization warning: {e}")

    yield

    # Shutdown
    logger.info(f"Shutting down {settings.APP_NAME}...")

app = FastAPI(
    title="Cooperative Mitra (सहकारी मित्र) API",
    description="Multilingual Conversational Assistant, Scheme Discovery, and Grievance Management for Indian Cooperatives (PACS)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing & Logging Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

# Mount static audio files directory
os.makedirs(settings.AUDIO_STORAGE_DIR, exist_ok=True)
app.mount("/static/audio", StaticFiles(directory=settings.AUDIO_STORAGE_DIR), name="audio")

# Mount Routers under /api/v1
api_v1 = settings.API_V1_PREFIX
app.include_router(health_router, prefix=api_v1)
app.include_router(health_router) # Also expose /health at root
app.include_router(auth_router, prefix=api_v1)
app.include_router(schemes_router, prefix=api_v1)
app.include_router(legal_router, prefix=api_v1)
app.include_router(grievances_router, prefix=api_v1)
app.include_router(voice_router, prefix=api_v1)
app.include_router(chat_router, prefix=api_v1)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "name_hindi": "सहकारी मित्र",
        "version": "1.0.0",
        "documentation": "/docs",
        "health_check": f"{api_v1}/health"
    }
