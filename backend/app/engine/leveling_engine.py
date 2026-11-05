from datetime import datetime, timezone
from typing import Optional, Union
from app.models.enums import (
    StudentCompetencyLevel,
    DeficiencyType,
    ExerciseDifficultyTier,
    MedicalSpecialty,
    CognitiveGap,
)
from app.models.student import SpecialtyMasteryProfile, LevelingPrescription

class DifficultyTierResult(str):
    tier: ExerciseDifficultyTier
    label: str

    def __new__(cls, tier: ExerciseDifficultyTier, label: str):
        obj = super().__new__(cls, label)
        obj.tier = tier
        obj.label = label
        return obj

    def __eq__(self, other):
        if isinstance(other, ExerciseDifficultyTier):
            return self.tier == other
        if isinstance(other, str):
            return self.label == other or self.tier.value == other
        return super().__eq__(other)

    def __hash__(self):
        return hash(self.label)

DIFFICULTY_LABELS: dict[ExerciseDifficultyTier, str] = {
    ExerciseDifficultyTier.NIVEL_1_FUNDACIONAL: "Nivel 1 (Fundacional)",
    ExerciseDifficultyTier.NIVEL_2_INTERMEDIO: "Nivel 2 (Intermedio)",
    ExerciseDifficultyTier.NIVEL_3_AVANZADO: "Nivel 3 (Avanzado)",
}

SPECIALTY_DEFAULT_CASES: dict[str, list[str]] = {
    MedicalSpecialty.NEFROLOGIA.value: ["s13256-019-2334-y"],
    MedicalSpecialty.ENDOCRINOLOGIA.value: ["s13256-022-03392-w"],
    MedicalSpecialty.NEUROLOGIA.value: ["s13256-023-04294-1", "s13256-025-05577-5"],
    MedicalSpecialty.OFTALMOLOGIA.value: ["s13256-024-04496-1"],
    MedicalSpecialty.GINECOLOGIA_OBSTETRICIA.value: ["s13256-025-05650-z"],
    MedicalSpecialty.REUMATOLOGIA.value: ["s13256-026-05974-4"],
}

def get_target_cases_for_specialty(specialty: Union[MedicalSpecialty, str]) -> list[str]:
    spec_val = specialty.value if isinstance(specialty, MedicalSpecialty) else str(specialty).lower()
    try:
        from app.services.case_service import CASE_SPECIALTY_MAP
        cases = [cid for cid, s in CASE_SPECIALTY_MAP.items() if s == spec_val]
        if cases:
            return cases
    except Exception:
        pass
    return SPECIALTY_DEFAULT_CASES.get(spec_val, [f"adaptive_{spec_val}_01"])

def map_gap_to_deficiency(gap: Union[CognitiveGap, str]) -> DeficiencyType:
    gap_val = gap.value if isinstance(gap, CognitiveGap) else str(gap)
    gap_upper = gap_val.upper()

    if "TRIAGE" in gap_upper or "SEVERITY" in gap_upper or gap_upper == CognitiveGap.GAP_TRIAGE_SEVERITY.value:
        return DeficiencyType.CRITICA_SEGURIDAD
    if "DIAGNOSTIC" in gap_upper or "REASONING" in gap_upper or gap_upper == CognitiveGap.GAP_DIAGNOSTIC_REASONING.value:
        return DeficiencyType.RAZONAMIENTO_DIFERENCIAL
    if "LAB" in gap_upper or "INTERPRETATION" in gap_upper or gap_upper == CognitiveGap.GAP_LAB_INTERPRETATION.value:
        return DeficiencyType.INTERPRETACION_DATOS
    if (
        "MANAGEMENT" in gap_upper
        or "INITIAL" in gap_upper
        or "MANEJO" in gap_upper
        or gap_upper == CognitiveGap.GAP_INITIAL_MANAGEMENT.value
    ):
        return DeficiencyType.MANEJO_TERAPEUTICO

    return DeficiencyType.RAZONAMIENTO_DIFERENCIAL

def determine_recommended_difficulty(
    student_level: Optional[StudentCompetencyLevel],
    gap: Optional[Union[CognitiveGap, str]] = None,
) -> DifficultyTierResult:
    if student_level == StudentCompetencyLevel.DEFICIENTE:
        tier = ExerciseDifficultyTier.NIVEL_1_FUNDACIONAL
    elif student_level == StudentCompetencyLevel.EN_DESARROLLO:
        gap_str = gap.value if isinstance(gap, CognitiveGap) else str(gap or "")
        if gap_str == CognitiveGap.GAP_TRIAGE_SEVERITY.value or gap_str == "GAP_TRIAGE_SEVERITY":
            tier = ExerciseDifficultyTier.NIVEL_1_FUNDACIONAL
        else:
            tier = ExerciseDifficultyTier.NIVEL_2_INTERMEDIO
    elif student_level in (StudentCompetencyLevel.COMPETENTE, StudentCompetencyLevel.AVANZADO):
        tier = ExerciseDifficultyTier.NIVEL_3_AVANZADO
    else:
        tier = ExerciseDifficultyTier.NIVEL_2_INTERMEDIO

    return DifficultyTierResult(tier, DIFFICULTY_LABELS[tier])

def generate_rationale(
    specialty: Union[MedicalSpecialty, str],
    deficiency: DeficiencyType,
    mastery_score: float,
    gap: Union[CognitiveGap, str],
) -> str:
    spec_val = specialty.value if isinstance(specialty, MedicalSpecialty) else str(specialty)
    if deficiency == DeficiencyType.CRITICA_SEGURIDAD:
        return (
            f"Revisión prioritaria requerida: se detectó una brecha crítica de seguridad y triaje "
            f"con puntaje de {mastery_score:.1f}% en {spec_val}. Es indispensable reforzar protocolos "
            f"de emergencia, reconocimiento de inestabilidad hemodinámica y estabilización inmediata."
        )
    elif deficiency == DeficiencyType.RAZONAMIENTO_DIFERENCIAL:
        return (
            f"Nivelación recomendada: razonamiento diagnóstico insuficiente con puntaje de {mastery_score:.1f}% "
            f"en {spec_val}. Se requiere afianzar la integración de signos cardinales y jerarquización de diagnósticos diferenciales."
        )
    elif deficiency == DeficiencyType.INTERPRETACION_DATOS:
        return (
            f"Nivelación recomendada: brecha en interpretación de pruebas auxiliares y biomarcadores "
            f"con puntaje de {mastery_score:.1f}% en {spec_val}. Se sugiere revisión sistemática de estudios diagnósticos."
        )
    else:
        return (
            f"Alineación terapéutica recomendada: puntaje de {mastery_score:.1f}% en {spec_val}. "
            f"Se prescribe entrenamiento en selección de esquemas farmacológicos de primera línea, dosificación y monitoreo de toxicidad."
        )

def calculate_specialty_competency(
    specialty: Union[MedicalSpecialty, str],
    score: float,
    attempts: int,
    active_deficiencies: Optional[list[DeficiencyType]] = None,
) -> SpecialtyMasteryProfile:
    spec_enum = (
        specialty
        if isinstance(specialty, MedicalSpecialty)
        else MedicalSpecialty(specialty)
    )

    if score < 60.0:
        level = StudentCompetencyLevel.DEFICIENTE
        needs_leveling = True
    elif score < 75.0:
        level = StudentCompetencyLevel.EN_DESARROLLO
        needs_leveling = True
    elif score < 90.0:
        level = StudentCompetencyLevel.COMPETENTE
        needs_leveling = False
    else:
        level = StudentCompetencyLevel.AVANZADO
        needs_leveling = False

    if active_deficiencies and DeficiencyType.CRITICA_SEGURIDAD in active_deficiencies:
        needs_leveling = True

    return SpecialtyMasteryProfile(
        specialty=spec_enum,
        score=score,
        attempts=attempts,
        level=level,
        needs_leveling=needs_leveling,
        active_deficiencies=active_deficiencies or [],
        last_evaluated=datetime.now(timezone.utc),
        history_scores=[score],
    )

def generate_leveling_prescription(
    specialty: Union[MedicalSpecialty, str],
    mastery_score: float,
    detected_gap: Union[CognitiveGap, str],
    student_level: Optional[StudentCompetencyLevel] = None,
    student_id: str = "estudiante_demo",
) -> LevelingPrescription:
    spec_enum = (
        specialty
        if isinstance(specialty, MedicalSpecialty)
        else MedicalSpecialty(specialty)
    )

    if student_level is None:
        student_level = calculate_specialty_competency(spec_enum, mastery_score, attempts=1).level

    assigned_deficiency = map_gap_to_deficiency(detected_gap)
    difficulty_result = determine_recommended_difficulty(student_level, detected_gap)
    target_exercise_ids = get_target_cases_for_specialty(spec_enum)
    rationale = generate_rationale(spec_enum, assigned_deficiency, mastery_score, detected_gap)

    return LevelingPrescription(
        student_id=student_id,
        specialty=spec_enum,
        mastery_score=mastery_score,
        detected_gap=detected_gap,
        assigned_deficiency=assigned_deficiency,
        student_level=student_level,
        difficulty_tier=difficulty_result.tier,
        recommended_exercise_difficulty=str(difficulty_result),
        target_exercise_ids=target_exercise_ids,
        rationale=rationale,
    )
