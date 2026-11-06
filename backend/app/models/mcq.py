from typing import Optional
from pydantic import BaseModel
from app.models.enums import CognitiveGap


class MCQOptionStudent(BaseModel):
    option_id: str
    text: str


class MCQOptionInternal(BaseModel):
    option_id: str
    text: str
    is_correct: bool
    associated_gap: Optional[CognitiveGap] = None
    rationale: str


class MCQStationStudent(BaseModel):
    station_id: str
    case_id: str
    station_number: int
    difficulty_tier: str
    clinical_stem: str
    options: list[MCQOptionStudent]


class MCQStationInternal(BaseModel):
    station_id: str
    case_id: str
    station_number: int
    difficulty_tier: str
    clinical_stem: str
    options: list[MCQOptionInternal]
    target_competency: str
    clinical_pearl_id: Optional[str] = None
    citation_ref_id: Optional[str] = None

    def to_student(self) -> MCQStationStudent:
        return MCQStationStudent(
            station_id=self.station_id,
            case_id=self.case_id,
            station_number=self.station_number,
            difficulty_tier=self.difficulty_tier,
            clinical_stem=self.clinical_stem,
            options=[
                MCQOptionStudent(option_id=opt.option_id, text=opt.text)
                for opt in self.options
            ],
        )


class MCQSubmission(BaseModel):
    case_id: str
    station_number: int
    chosen_option_id: str
    response_time_ms: int = 0


class MCQResult(BaseModel):
    is_correct: bool
    points_earned: float
    correct_option_id: str
    chosen_option_id: str
    associated_gap: Optional[CognitiveGap] = None
    clinical_feedback: str
    citation_evidence: Optional[str] = None
    clinical_pearl: Optional[str] = None
    recommended_difficulty: Optional[str] = None
