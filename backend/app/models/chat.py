from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_uuid = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    title = Column(String(255), default="Cooperative Inquiry", nullable=False)
    language = Column(String(10), default="en", nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False) # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    
    audio_url = Column(String(500), nullable=True)
    citations = Column(JSON, default=list, nullable=False)
    intent = Column(String(50), nullable=True) # "SCHEME", "LEGAL", "GRIEVANCE", "GENERAL"
    provider_used = Column(String(50), nullable=True) # "gemini", "ollama", "fallback"

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    session = relationship("ChatSession", back_populates="messages")
