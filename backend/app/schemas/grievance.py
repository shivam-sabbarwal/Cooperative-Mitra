from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime

class GrievanceCreate(BaseModel):
    category: Literal["LOAN_DISBURSEMENT", "FERTILIZER_SUPPLY", "MEMBERSHIP_ISSUES", "CORRUPTION_MISMANAGEMENT", "SUBSIDY_DELAY", "OTHER"] = "OTHER"
    priority: Literal["LOW", "MEDIUM", "HIGH", "URGENT"] = "MEDIUM"
    pacs_name: str
    district: str
    state: str = "Karnataka"
    subject: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    attachment_url: Optional[str] = None

class GrievanceStatusUpdate(BaseModel):
    status: Literal["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"]
    resolution_notes: Optional[str] = None
    assigned_to: Optional[str] = None

class GrievanceResponse(BaseModel):
    id: int
    ticket_number: str
    user_id: int
    category: str
    priority: str
    status: str
    pacs_name: str
    district: str
    state: str
    subject: str
    description: str
    attachment_url: Optional[str] = None
    resolution_notes: Optional[str] = None
    assigned_to: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class GrievancePublicTrackResponse(BaseModel):
    ticket_number: str
    category: str
    priority: str
    status: str
    pacs_name: str
    district: str
    state: str
    subject: str
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
