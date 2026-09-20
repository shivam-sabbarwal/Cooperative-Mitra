from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from backend.app.database import get_db
from backend.app.models.scheme import Scheme
from backend.app.schemas.scheme import (
    SchemeResponse, SchemeCreate, EligibilityCheckRequest, EligibilityCheckResponse
)
from backend.app.core.deps import require_admin

router = APIRouter(prefix="/schemes", tags=["Schemes"])

@router.get("", response_model=list[SchemeResponse])
def get_schemes(
    category: Optional[str] = None,
    beneficiary: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Scheme).filter(Scheme.is_active == True)

    if category:
        query = query.filter(Scheme.category.ilike(f"%{category}%"))
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Scheme.title_en.ilike(search_term),
                Scheme.title_hi.ilike(search_term),
                Scheme.title_kn.ilike(search_term),
                Scheme.description_en.ilike(search_term),
                Scheme.code.ilike(search_term)
            )
        )

    results = query.all()
    if beneficiary:
        beneficiary_lower = beneficiary.lower()
        results = [
            s for s in results 
            if any(beneficiary_lower in b.lower() for b in (s.target_beneficiaries or []))
        ]

    return [SchemeResponse.model_validate(s) for s in results]

@router.get("/{scheme_id_or_code}", response_model=SchemeResponse)
def get_scheme_by_id_or_code(scheme_id_or_code: str, db: Session = Depends(get_db)):
    if scheme_id_or_code.isdigit():
        scheme = db.query(Scheme).filter(Scheme.id == int(scheme_id_or_code)).first()
    else:
        scheme = db.query(Scheme).filter(Scheme.code == scheme_id_or_code).first()

    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheme not found"
        )
    return SchemeResponse.model_validate(scheme)

@router.post("/check-eligibility", response_model=EligibilityCheckResponse)
def check_eligibility(req: EligibilityCheckRequest, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.code == req.scheme_code).first()
    if not scheme:
        # Fallback search by id
        if req.scheme_code.isdigit():
            scheme = db.query(Scheme).filter(Scheme.id == int(req.scheme_code)).first()

    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found for eligibility check")

    crit = scheme.eligibility_criteria or {}
    matched = []
    missing = []
    
    # 1. PACS Membership check
    if crit.get("requires_pacs_membership", False):
        if req.is_pacs_member:
            matched.append("Applicant is a registered Primary Agricultural Credit Society (PACS) member.")
        else:
            missing.append("Requires active PACS / Cooperative society membership.")

    # 2. Applicant Type check
    allowed_types = [t.upper() for t in crit.get("allowed_applicant_types", [])]
    if allowed_types:
        if req.applicant_type.upper() in allowed_types:
            matched.append(f"Applicant category '{req.applicant_type}' is recognized under this initiative.")
        else:
            missing.append(f"Eligible applicant types: {', '.join(allowed_types)}")

    # 3. Land holding check
    max_land = crit.get("max_land_acres")
    min_land = crit.get("min_land_acres")
    if max_land is not None and req.land_holding_acres is not None:
        if req.land_holding_acres <= max_land:
            matched.append(f"Land holding ({req.land_holding_acres} acres) is within ceiling of {max_land} acres.")
        else:
            missing.append(f"Land holding exceeds scheme threshold of {max_land} acres.")
    if min_land is not None and req.land_holding_acres is not None:
        if req.land_holding_acres >= min_land:
            matched.append(f"Land holding ({req.land_holding_acres} acres) meets minimum threshold.")
        else:
            missing.append(f"Requires minimum land holding of {min_land} acres.")

    is_eligible = len(missing) == 0
    score = round(len(matched) / (len(matched) + len(missing)), 2) if (matched or missing) else 1.0

    docs = crit.get("documents_required", [
        "Aadhaar Card",
        "PACS Member Share Certificate / Passbook",
        "Land Record / RTC Pahani (Pahani extract)",
        "Bank Account Details (Aadhaar linked)"
    ])

    recommendation = (
        f"You meet all primary criteria for {scheme.title_en}. Visit your local PACS secretary or apply online."
        if is_eligible else
        f"You are currently ineligible due to: {'; '.join(missing)}. Please consult your district cooperative officer."
    )

    disclaimer = (
        "OFFICIAL NOTE: Eligibility determination is indicative based on Ministry of Cooperation & NCDC parameters. Final sanctions depend on PACS board and lending guidelines."
        if scheme.source_type == "OFFICIAL"
        else "SOURCE STATUS: PLACEHOLDER CONTENT — NOT OFFICIAL. For demonstration and prototyping purposes only."
    )

    return EligibilityCheckResponse(
        eligible=is_eligible,
        confidence_score=score,
        scheme_name=scheme.title_en,
        matched_criteria=matched,
        missing_criteria=missing,
        recommendations=recommendation,
        required_documents=docs,
        official_disclaimer=disclaimer
    )

@router.post("", response_model=SchemeResponse, status_code=status.HTTP_201_CREATED)
def create_scheme(
    scheme_in: SchemeCreate,
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    existing = db.query(Scheme).filter(Scheme.code == scheme_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Scheme with this code already exists")

    new_scheme = Scheme(**scheme_in.model_dump())
    db.add(new_scheme)
    db.commit()
    db.refresh(new_scheme)
    return SchemeResponse.model_validate(new_scheme)
