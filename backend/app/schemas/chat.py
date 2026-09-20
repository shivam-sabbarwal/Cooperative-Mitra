from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Any
from datetime import datetime

class CitationSource(BaseModel):
    title: str
    doc_id: str
    section: Optional[str] = None
    source_type: str = "OFFICIAL" # OFFICIAL or PLACEHOLDER
    source_status: str = "OFFICIAL"
    source_url: Optional[str] = None
    act: Optional[str] = None
    page: Optional[str] = None
    excerpt: Optional[str] = None

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None
    language: str = Field("en", description="en, hi, kn, mr, te")
    enable_voice_response: bool = False

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    language: str
    audio_url: Optional[str] = None
    citations: list[CitationSource] = []
    intent: Optional[str] = None
    provider_used: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    language: str
    audio_url: Optional[str] = None
    citations: list[CitationSource] = []
    intent: str
    provider_used: str
    grounded: bool = True
    verification_status: str = "VERIFIED" # "VERIFIED", "PARTIALLY_VERIFIED", "UNABLE_TO_VERIFY"

class ChatSessionHistoryResponse(BaseModel):
    session_uuid: str
    title: str
    language: str
    created_at: datetime
    messages: list[ChatMessageResponse] = []
    model_config = ConfigDict(from_attributes=True)
