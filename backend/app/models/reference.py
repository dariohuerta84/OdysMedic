from typing import Optional
from pydantic import BaseModel, Field


class ClinicalGuidelineExcerpt(BaseModel):
    reference_id: str
    source_title: str
    organization_or_publisher: str
    year: int
    edition_or_version: Optional[str] = None
    section_title: str
    page_or_doi: Optional[str] = None
    key_recommendation: str
    evidence_level: str
    associated_specialty: str
    associated_cases: list[str] = Field(default_factory=list)


class MedicalReferenceBook(BaseModel):
    book_id: str
    title: str
    authors_or_organization: str
    edition: str
    specialty: str
    isbn_or_doi: Optional[str] = None
    excerpts_count: int = 0
    excerpts: list[ClinicalGuidelineExcerpt] = Field(default_factory=list)
