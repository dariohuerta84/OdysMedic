from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field
from app.models.enums import CognitiveGap

class ProposedIntervention(BaseModel):
    drug_name: str
    dose_value: Optional[float] = None
    dose_unit: Optional[str] = None
    route: Optional[str] = None
    frequency: Optional[str] = None
    action_type: str = "medication"

class EvaluationSubmission(BaseModel):
    student_id: str = "estudiante_demo"
    case_id: str
    proposed_diagnosis: str
    differential_diagnoses: list[str] = Field(default_factory=list)
    proposed_interventions: list[ProposedIntervention] = Field(default_factory=list)
    requested_labs: list[str] = Field(default_factory=list)
    triage_severity_level: Optional[str] = None

class CriterionEvaluationResult(BaseModel):
    criterion_id: str
    dimension: str
    concept: str
    requirement_type: str
    criticality: str
    matched: bool
    points_possible: float
    points_earned: float
    student_response: Optional[str] = None
    expected_reference: Optional[str] = None
    feedback: str
    associated_gap: Optional[CognitiveGap] = None

class DimensionScore(BaseModel):
    dimension: str
    points_earned: float
    points_possible: float
    percentage: float

class DetectedGap(BaseModel):
    gap_type: CognitiveGap
    gap_name: str
    description: str
    occurrences: int
    failed_criteria_concepts: list[str] = Field(default_factory=list)

class RetrospectiveEvaluationReport(BaseModel):
    evaluation_id: str
    case_id: str
    student_id: str
    global_score: float
    passed: bool
    diagnostic_accuracy: bool
    dimension_scores: dict[str, DimensionScore]
    criteria_results: list[CriterionEvaluationResult]
    detected_gaps: list[DetectedGap]
    clinical_pearl: str
    ground_truth_diagnosis: str
    ground_truth_aliases: list[str] = Field(default_factory=list)
    actual_patient_outcome: str
    evaluation_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
