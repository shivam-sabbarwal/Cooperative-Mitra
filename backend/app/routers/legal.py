from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from backend.app.database import get_db
from backend.app.models.legal import LegalAct, LegalSection
from backend.app.schemas.legal import LegalActResponse, LegalSectionResponse, LegalSearchResult

router = APIRouter(prefix="/legal", tags=["Legal & Bye-laws"])

@router.get("/acts", response_model=list[LegalActResponse])
def get_legal_acts(db: Session = Depends(get_db)):
    acts = db.query(LegalAct).all()
    return [LegalActResponse.model_validate(act) for act in acts]

@router.get("/acts/{act_id_or_code}", response_model=LegalActResponse)
def get_legal_act(act_id_or_code: str, db: Session = Depends(get_db)):
    if act_id_or_code.isdigit():
        act = db.query(LegalAct).filter(LegalAct.id == int(act_id_or_code)).first()
    else:
        act = db.query(LegalAct).filter(LegalAct.act_code == act_id_or_code).first()

    if not act:
        raise HTTPException(status_code=404, detail="Legal Act or Bye-Law not found")
    return LegalActResponse.model_validate(act)

@router.get("/sections/search", response_model=list[LegalSearchResult])
def search_legal_sections(
    q: str = Query(..., min_length=2, description="Search keyword in legal sections"),
    language: str = "en",
    db: Session = Depends(get_db)
):
    search_term = f"%{q}%"
    sections = db.query(LegalSection).join(LegalAct).filter(
        or_(
            LegalSection.section_number.ilike(search_term),
            LegalSection.title_en.ilike(search_term),
            LegalSection.title_hi.ilike(search_term),
            LegalSection.title_kn.ilike(search_term),
            LegalSection.simplified_en.ilike(search_term),
            LegalSection.simplified_hi.ilike(search_term),
            LegalSection.simplified_kn.ilike(search_term),
            LegalSection.official_text.ilike(search_term),
            LegalSection.keywords.ilike(search_term)
        )
    ).limit(20).all()

    results = []
    for s in sections:
        # Select appropriate language
        if language == "hi":
            title = s.title_hi
            simplified = s.simplified_hi
        elif language == "kn":
            title = s.title_kn
            simplified = s.simplified_kn
        else:
            title = s.title_en
            simplified = s.simplified_en

        results.append(LegalSearchResult(
            act_code=s.act.act_code,
            act_title=s.act.title_en,
            section_number=s.section_number,
            section_title=title,
            simplified_text=simplified,
            official_text=s.official_text,
            citation=f"{s.act.title_en}, Section {s.section_number} ({s.source_citation})"
        ))

    return results
