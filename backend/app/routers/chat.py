from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from datetime import datetime, timezone
from backend.app.database import get_db
from backend.app.models.chat import ChatSession, ChatMessage
from backend.app.models.user import User
from backend.app.schemas.chat import (
    ChatRequest, ChatResponse, ChatMessageResponse, ChatSessionHistoryResponse, CitationSource
)
from backend.app.core.deps import get_optional_user, get_current_user
from backend.app.services.rag_service import rag_service
from backend.app.services.llm_service import llm_service
from backend.app.services.voice_service import voice_service
from backend.app.config import settings

router = APIRouter(prefix="/chat", tags=["Multilingual Chat & RAG"])

@router.post("", response_model=ChatResponse)
async def chat_message(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    # 1. Resolve or create chat session
    session = None
    if req.session_id:
        session = db.query(ChatSession).filter(ChatSession.session_uuid == req.session_id).first()
        if session and session.user_id is not None:
            if not current_user or session.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to use this consultation record",
                )
        elif session and current_user:
            # Claim an anonymous consultation when its owner signs in.
            session.user_id = current_user.id
    
    if not session:
        session_uuid = req.session_id or f"sess_{uuid.uuid4().hex[:16]}"
        session = ChatSession(
            session_uuid=session_uuid,
            user_id=current_user.id if current_user else None,
            title=req.message[:40] + ("..." if len(req.message) > 40 else ""),
            language=req.language
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # 2. Persist user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=req.message,
        language=req.language,
        citations=[]
    )
    db.add(user_msg)
    db.commit()

    # 3. Classify intent & Retrieve grounded RAG context
    intent = rag_service.classify_intent(req.message)
    # PRD default: retrieve the top five reranked, source-grounded chunks.
    chunks, citations = rag_service.retrieve(req.message, n_results=5, language=req.language)

    # 4. Generate grounded LLM response (Gemini -> Ollama -> Grounded Context Engine)
    reply_text, provider_used, verification_status = await llm_service.generate_response(
        prompt=req.message,
        retrieved_chunks=chunks,
        citations=citations,
        language=req.language
    )

    # 5. Handle optional Voice response (Graceful degradation: failure never breaks text)
    audio_url = None
    if req.enable_voice_response:
        try:
            audio_filename = await voice_service.generate_tts(reply_text, language=req.language)
            if audio_filename:
                audio_url = f"{settings.API_V1_PREFIX}/voice/audio/{audio_filename}"
        except Exception:
            audio_url = None

    # 6. Persist assistant message
    citations_data = [c.model_dump() for c in citations]
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=reply_text,
        language=req.language,
        audio_url=audio_url,
        citations=citations_data,
        intent=intent,
        provider_used=provider_used
    )
    db.add(assistant_msg)
    session.updated_at = datetime.now(timezone.utc)
    db.commit()

    return ChatResponse(
        session_id=session.session_uuid,
        reply=reply_text,
        language=req.language,
        audio_url=audio_url,
        citations=citations,
        intent=intent,
        provider_used=provider_used,
        grounded=len(chunks) > 0,
        verification_status=verification_status
    )

@router.get("/sessions", response_model=list[dict])
def get_user_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.updated_at.desc()).all()
    return [
        {
            "session_id": s.session_uuid,
            "title": s.title,
            "language": s.language,
            "created_at": s.created_at,
            "message_count": len(s.messages)
        }
        for s in sessions
    ]

@router.get("/sessions/{session_uuid}", response_model=ChatSessionHistoryResponse)
def get_session_history(
    session_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ChatSession).filter(ChatSession.session_uuid == session_uuid).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this consultation record")
    
    messages_out = []
    for m in session.messages:
        citations = [CitationSource(**c) if isinstance(c, dict) else c for c in (m.citations or [])]
        messages_out.append(ChatMessageResponse(
            id=m.id,
            role=m.role,
            content=m.content,
            language=m.language,
            audio_url=m.audio_url,
            citations=citations,
            intent=m.intent,
            provider_used=m.provider_used,
            created_at=m.created_at
        ))

    return ChatSessionHistoryResponse(
        session_uuid=session.session_uuid,
        title=session.title,
        language=session.language,
        created_at=session.created_at,
        messages=messages_out
    )
