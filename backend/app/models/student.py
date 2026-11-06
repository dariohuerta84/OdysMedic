import uuid
from datetime import datetime, timezone
from typing import Optional, Union
from pydantic import BaseModel, Field
from app.models.enums import (
    StudentCompetencyLevel,
    DeficiencyType,
    ExerciseDifficultyTier,
    MedicalSpecialty,
    CognitiveGap,
)

class SpecialtyMasteryProfile(BaseModel):
    specialty: MedicalSpecialty
    score: float = 0.0
    attempts: int = 0
    level: StudentCompetencyLevel = StudentCompetencyLevel.DEFICIENTE
    needs_leveling: bool = True
    active_deficiencies: list[DeficiencyType] = Field(default_factory=list)
    detected_gaps: list[Union[CognitiveGap, str]] = Field(default_factory=list)
    last_evaluated: Optional[datetime] = None
    history_scores: list[float] = Field(default_factory=list)

class LevelingPrescription(BaseModel):
    prescription_id: str = Field(default_factory=lambda: f"presc_{uuid.uuid4().hex[:8]}")
    student_id: str = "estudiante_demo"
    specialty: MedicalSpecialty
    mastery_score: float
    detected_gap: Union[CognitiveGap, str]
    assigned_deficiency: DeficiencyType
    student_level: Optional[StudentCompetencyLevel] = None
    difficulty_tier: ExerciseDifficultyTier = ExerciseDifficultyTier.NIVEL_1_FUNDACIONAL
    recommended_exercise_difficulty: str
    target_exercise_ids: list[str] = Field(default_factory=list)
    rationale: str
    next_repetition_date: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class StudentGlobalProfile(BaseModel):
    student_id: str = "estudiante_demo"
    overall_competency_level: StudentCompetencyLevel = StudentCompetencyLevel.EN_DESARROLLO
    specialty_profiles: dict[str, SpecialtyMasteryProfile] = Field(default_factory=dict)
    active_prescriptions: list[LevelingPrescription] = Field(default_factory=list)
    global_score: float = 0.0
    total_cases_resolved: int = 0
    total_attempts: int = 0
    streak_days: int = 0
    xp: int = 0
    updated_at: Optional[datetime] = None
