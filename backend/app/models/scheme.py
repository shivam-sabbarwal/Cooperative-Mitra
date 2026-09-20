from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from backend.app.database import Base

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    
    # Multilingual Titles & Summaries
    title_en = Column(String(255), nullable=False)
    title_hi = Column(String(255), nullable=False)
    title_kn = Column(String(255), nullable=False)
    
    category = Column(String(100), nullable=False, index=True) # e.g. "CREDIT", "INFRASTRUCTURE", "YOUTH", "WOMEN", "COMPUTERIZATION"
    ministry_or_agency = Column(String(255), default="Ministry of Cooperation / NCDC", nullable=False)
    
    # Target beneficiaries JSON list
    target_beneficiaries = Column(JSON, default=list, nullable=False)
    
    # Multilingual Descriptions
    description_en = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=False)
    description_kn = Column(Text, nullable=False)
    
    # Eligibility & Benefits
    eligibility_criteria = Column(JSON, default=dict, nullable=False)
    benefits_summary = Column(Text, nullable=False)
    application_process = Column(Text, nullable=False)
    
    # Source Verification & Grounding
    source_type = Column(String(50), default="OFFICIAL", nullable=False) # OFFICIAL or PLACEHOLDER
    source_citation = Column(String(255), nullable=False)
    official_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
