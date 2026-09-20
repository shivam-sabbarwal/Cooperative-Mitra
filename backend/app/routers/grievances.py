from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import random
import string
from backend.app.database import get_db
from backend.app.models.grievance import Grievance, GrievanceStatus, GrievancePriority, GrievanceCategory
from backend.app.models.user import User
from backend.app.schemas.grievance import (
    GrievanceCreate, GrievanceResponse, GrievanceStatusUpdate, GrievancePublicTrackResponse
)
from backend.app.core.deps import get_current_user, require_secretary_or_admin, get_optional_user

router = APIRouter(prefix="/grievances", tags=["Grievances"])

def generate_ticket_number() -> str:
    year = datetime.now(timezone.utc).strftime("%Y%m")
    random_part = "".join(random.choices(string.digits, k=5))
    return f"CM-{year}-{random_part}"

@router.post("", response_model=GrievanceResponse, status_code=status.HTTP_201_CREATED)
def submit_grievance(
    grievance_in: GrievanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket_num = generate_ticket_number()
    # Check ticket uniqueness
    while db.query(Grievance).filter(Grievance.ticket_number == ticket_num).first():
        ticket_num = generate_ticket_number()

    db_grievance = Grievance(
        ticket_number=ticket_num,
        user_id=current_user.id,
        category=grievance_in.category,
        priority=grievance_in.priority,
        status=GrievanceStatus.SUBMITTED.value,
        pacs_name=grievance_in.pacs_name,
        district=grievance_in.district,
        state=grievance_in.state,
        subject=grievance_in.subject,
        description=grievance_in.description,
        attachment_url=grievance_in.attachment_url
    )
    db.add(db_grievance)
    db.commit()
    db.refresh(db_grievance)
    return GrievanceResponse.model_validate(db_grievance)

@router.get("", response_model=list[GrievanceResponse])
def list_user_grievances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Admins and Secretaries can see all grievances in their PACS or jurisdiction
    if current_user.role in ["ADMIN", "SECRETARY"]:
        if current_user.pacs_name and current_user.role == "SECRETARY":
            grievances = db.query(Grievance).filter(Grievance.pacs_name == current_user.pacs_name).all()
        else:
            grievances = db.query(Grievance).all()
    else:
        grievances = db.query(Grievance).filter(Grievance.user_id == current_user.id).all()

    return [GrievanceResponse.model_validate(g) for g in grievances]

@router.get("/track/{ticket_number}", response_model=GrievancePublicTrackResponse)
def public_track_grievance(ticket_number: str, db: Session = Depends(get_db)):
    clean_ticket = ticket_number.strip().upper()
    grievance = db.query(Grievance).filter(Grievance.ticket_number == clean_ticket).first()
    if not grievance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grievance with ticket number {ticket_number} not found"
        )
    return GrievancePublicTrackResponse.model_validate(grievance)

@router.get("/{grievance_id}", response_model=GrievanceResponse)
def get_grievance(
    grievance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")
    
    # Ownership or admin check
    if current_user.role not in ["ADMIN", "SECRETARY"] and grievance.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this grievance")

    return GrievanceResponse.model_validate(grievance)

@router.patch("/{grievance_id}/status", response_model=GrievanceResponse)
def update_grievance_status(
    grievance_id: int,
    status_update: GrievanceStatusUpdate,
    db: Session = Depends(get_db),
    admin_or_sec: User = Depends(require_secretary_or_admin)
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    if (
        admin_or_sec.role == "SECRETARY"
        and admin_or_sec.pacs_name != grievance.pacs_name
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this grievance",
        )

    grievance.status = status_update.status
    if status_update.resolution_notes:
        grievance.resolution_notes = status_update.resolution_notes
    if status_update.assigned_to:
        grievance.assigned_to = status_update.assigned_to
    if status_update.status in [GrievanceStatus.RESOLVED.value, GrievanceStatus.REJECTED.value]:
        grievance.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(grievance)
    return GrievanceResponse.model_validate(grievance)
