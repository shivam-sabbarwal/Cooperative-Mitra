from pydantic import BaseModel
from typing import Optional

class STTResponse(BaseModel):
    text: str
    detected_language: str
    confidence: float
    duration_seconds: Optional[float] = None

class TTSRequest(BaseModel):
    text: str
    language: str = "en" # en, hi, kn, mr, te
    voice_speed: float = 1.0

class TTSResponse(BaseModel):
    audio_url: Optional[str] = None
    language: str
    format: str = "mp3"
    duration_estimate: Optional[float] = None
    status: str = "success"
