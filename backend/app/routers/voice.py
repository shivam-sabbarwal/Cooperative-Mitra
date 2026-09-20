from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, status
from fastapi.responses import FileResponse
import os
from typing import Optional
from backend.app.config import settings
from backend.app.schemas.voice import STTResponse, TTSRequest, TTSResponse
from backend.app.services.voice_service import voice_service

router = APIRouter(prefix="/voice", tags=["Voice & Speech"])

MAX_AUDIO_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_AUDIO_TYPES = {
    "audio/webm", "audio/wav", "audio/x-wav", "audio/mpeg",
    "audio/mp4", "audio/ogg",
}

@router.post("/tts", response_model=TTSResponse)
async def generate_speech(req: TTSRequest):
    filename = await voice_service.generate_tts(req.text, req.language)
    if not filename:
        return TTSResponse(
            audio_url=None,
            language=req.language,
            format="mp3",
            status="fallback_to_text_only"
        )
    
    audio_url = f"{settings.API_V1_PREFIX}/voice/audio/{filename}"
    return TTSResponse(
        audio_url=audio_url,
        language=req.language,
        format="mp3",
        status="success"
    )

@router.post("/stt", response_model=STTResponse)
async def transcribe_speech(
    file: UploadFile = File(...),
    language: Optional[str] = Form(None)
):
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file provided")
    if len(contents) > MAX_AUDIO_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Audio file exceeds the 10 MB limit")
    if file.content_type and file.content_type.lower() not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported audio file type")

    result = voice_service.transcribe_audio(contents, file.filename or "audio.wav", language)
    if not result["text"]:
        raise HTTPException(
            status_code=503,
            detail="Speech transcription is unavailable. Please type your question.",
        )
    return STTResponse(
        text=result["text"],
        detected_language=result["detected_language"],
        confidence=result["confidence"]
    )

@router.get("/audio/{filename}")
def stream_audio(filename: str):
    # Prevent path traversal
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(settings.AUDIO_STORAGE_DIR, safe_filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
        
    return FileResponse(file_path, media_type="audio/mpeg", filename=safe_filename)
