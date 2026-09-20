from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
import enum
from backend.app.database import Base

class UserRole(str, enum.Enum):
    MEMBER = "MEMBER"
    SECRETARY = "SECRETARY"
    ADMIN = "ADMIN"

class LanguagePreference(str, enum.Enum):
    EN = "en"
    HI = "hi"
    KN = "kn"
    MR = "mr"
    TE = "te"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.MEMBER.value, nullable=False)
    language = Column(String(10), default=LanguagePreference.EN.value, nullable=False)
    
    # Cooperative Society / PACS Details
    pacs_name = Column(String(255), nullable=True)
    pacs_registration_number = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), default="Karnataka", nullable=True)
    
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
