from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class LegalSectionResponse(BaseModel):
    id: int
    section_number: str
    chapter: Optional[str] = None
    title_en: str
    title_hi: str
    title_kn: str
    simplified_en: str
    simplified_hi: str
    simplified_kn: str
    official_text: str
    source_citation: str
    model_config = ConfigDict(from_attributes=True)

class LegalActResponse(BaseModel):
    id: int
    act_code: str
    title_en: str
    title_hi: str
    title_kn: str
    jurisdiction: str
    enacted_year: Optional[int] = None
    description: str
    source_type: str
    official_source_url: Optional[str] = None
    sections: list[LegalSectionResponse] = []
    model_config = ConfigDict(from_attributes=True)

class LegalSearchResult(BaseModel):
    act_code: str
    act_title: str
    section_number: str
    section_title: str
    simplified_text: str
    official_text: str
    citation: str
    similarity_score: Optional[float] = None
