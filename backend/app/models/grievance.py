from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from backend.app.database import Base

class GrievanceCategory(str, enum.Enum):
    LOAN_DISBURSEMENT = "LOAN_DISBURSEMENT"
    FERTILIZER_SUPPLY = "FERTILIZER_SUPPLY"
    MEMBERSHIP_ISSUES = "MEMBERSHIP_ISSUES"
    CORRUPTION_MISMANAGEMENT = "CORRUPTION_MISMANAGEMENT"
    SUBSIDY_DELAY = "SUBSIDY_DELAY"
    OTHER = "OTHER"

class GrievanceStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class GrievancePriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    category = Column(String(50), default=GrievanceCategory.OTHER.value, nullable=False)
    priority = Column(String(20), default=GrievancePriority.MEDIUM.value, nullable=False)
    status = Column(String(30), default=GrievanceStatus.SUBMITTED.value, nullable=False, index=True)
    
    # Location & PACS Details
    pacs_name = Column(String(255), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    attachment_url = Column(String(500), nullable=True)
    
    # Redressal Details
    resolution_notes = Column(Text, nullable=True)
    assigned_to = Column(String(255), nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
