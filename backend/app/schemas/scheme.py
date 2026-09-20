from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Any
from datetime import datetime

class SchemeBase(BaseModel):
    code: str
    title_en: str
    title_hi: str
    title_kn: str
    category: str
    ministry_or_agency: str = "Ministry of Cooperation / NCDC"
    target_beneficiaries: list[str]
    description_en: str
    description_hi: str
    description_kn: str
    eligibility_criteria: dict[str, Any]
    benefits_summary: str
    application_process: str
    source_type: str = "OFFICIAL"
    source_citation: str
    official_url: Optional[str] = None
    is_active: bool = True

class SchemeCreate(SchemeBase):
    pass

class SchemeResponse(SchemeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EligibilityCheckRequest(BaseModel):
    scheme_code: str
    applicant_type: str = Field(..., description="INDIVIDUAL_FARMER, PACS, FPO, WOMEN_SHG, ARTISAN")
    land_holding_acres: Optional[float] = None
    is_pacs_member: bool = True
    annual_turnover: Optional[float] = None
    category: Optional[str] = None # GENERAL, OBC, SC, ST, WOMEN
    state: str = "Karnataka"

class EligibilityCheckResponse(BaseModel):
    eligible: bool
    confidence_score: float
    scheme_name: str
    matched_criteria: list[str]
    missing_criteria: list[str]
    recommendations: str
    required_documents: list[str]
    official_disclaimer: str
