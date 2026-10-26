from typing import Any, Optional
from pydantic import BaseModel, Field

class SourceCitation(BaseModel):
    file: Optional[str] = None
    page: Optional[int] = None
    evidence: Optional[str] = None

class SourcedValue(BaseModel):
    value: Any = None
    status: Optional[str] = "reported"
    sources: list[SourceCitation] = Field(default_factory=list)

class PatientInfo(BaseModel):
    age: Optional[SourcedValue] = None
    sex: Optional[SourcedValue] = None
    relevant_history: list[SourcedValue] = Field(default_factory=list)

class PresentationInfo(BaseModel):
    chief_complaint: list[SourcedValue] = Field(default_factory=list)
    symptoms: list[SourcedValue] = Field(default_factory=list)
    signs: list[SourcedValue] = Field(default_factory=list)
    vitals: dict[str, Any] = Field(default_factory=dict)
    physical_exam: list[SourcedValue] = Field(default_factory=list)

class DiagnosticWorkup(BaseModel):
    laboratory: list[Any] = Field(default_factory=list)
    imaging: list[Any] = Field(default_factory=list)
    other_tests: list[Any] = Field(default_factory=list)

class DoseReference(BaseModel):
    drug: Optional[str] = None
    drug_aliases: list[str] = Field(default_factory=list)
    value: Optional[float] = None
    unit: Optional[str] = None
    route: Optional[str] = None
    interval: Optional[str] = None

class Criterion(BaseModel):
    criterion_id: str
    dimension: str
    concept: str
    requirement_type: str = "required"
    alternative_group: Optional[str] = None
    weight: float = 1.0
    criticality: str = "normal"
    accepted_answers: list[str] = Field(default_factory=list)
    category: Optional[str] = None
    phase: Optional[str] = "initial_treatment"
    source_reference: Optional[SourceCitation] = None
    review_status: Optional[str] = "needs_clinical_review"
    dose_reference: Optional[DoseReference] = None

class EvaluationBlueprint(BaseModel):
    review_status: Optional[str] = None
    dimensions: dict[str, Any] = Field(default_factory=dict)
    criteria: list[Criterion] = Field(default_factory=list)

class CaseSummary(BaseModel):
    case_id: str
    specialty: str
    normalized_specialty: str
    display_title: str
    learning_phase: Optional[str] = "initial_treatment"
    age_display: Optional[str] = None
    sex_display: Optional[str] = None
    chief_complaint_display: Optional[str] = None

class ClinicalCaseSimulation(BaseModel):
    """
    Sanitized clinical vignette presented to the student.
    Does NOT leak diagnosis.primary, observed_interventions, or criteria.
    """
    case_id: str
    display_title: str
    specialty: str
    normalized_specialty: str
    learning_phase: Optional[str] = None
    patient: PatientInfo
    presentation: PresentationInfo
    diagnostic_workup: DiagnosticWorkup

class FullClinicalCase(BaseModel):
    """
    Full clinical case with ground truth, criteria, and outcomes.
    Used internally by the retrospective evaluation engine.
    """
    case_id: str
    specialty: str
    normalized_specialty: str
    display_title: str
    learning_phase: Optional[str] = None
    is_synthetic: bool = False
    source: dict[str, Any] = Field(default_factory=dict)
    patient: PatientInfo
    presentation: PresentationInfo
    diagnostic_workup: DiagnosticWorkup
    diagnosis: dict[str, Any] = Field(default_factory=dict)
    timeline: list[Any] = Field(default_factory=list)
    observed_interventions: list[Any] = Field(default_factory=list)
    outcomes: dict[str, Any] = Field(default_factory=dict)
    source_facts: dict[str, Any] = Field(default_factory=dict)
    evaluation_blueprint: EvaluationBlueprint
