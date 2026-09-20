from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class LegalAct(Base):
    __tablename__ = "legal_acts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    act_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "MSCS_ACT_2002", "MODEL_PACS_BYELAWS"
    title_en = Column(String(255), nullable=False)
    title_hi = Column(String(255), nullable=False)
    title_kn = Column(String(255), nullable=False)
    jurisdiction = Column(String(100), default="National", nullable=False)
    enacted_year = Column(Integer, nullable=True)
    description = Column(Text, nullable=False)
    source_type = Column(String(50), default="OFFICIAL", nullable=False) # OFFICIAL or PLACEHOLDER
    official_source_url = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    sections = relationship("LegalSection", back_populates="act", cascade="all, delete-orphan")


class LegalSection(Base):
    __tablename__ = "legal_sections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    act_id = Column(Integer, ForeignKey("legal_acts.id"), nullable=False, index=True)
    section_number = Column(String(50), nullable=False, index=True)
    chapter = Column(String(100), nullable=True)
    
    title_en = Column(String(255), nullable=False)
    title_hi = Column(String(255), nullable=False)
    title_kn = Column(String(255), nullable=False)
    
    # Simplified explanations for rural members
    simplified_en = Column(Text, nullable=False)
    simplified_hi = Column(Text, nullable=False)
    simplified_kn = Column(Text, nullable=False)
    
    # Official verbatim text for legal accuracy
    official_text = Column(Text, nullable=False)
    keywords = Column(String(255), nullable=True)
    source_citation = Column(String(255), nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    act = relationship("LegalAct", back_populates="sections")
