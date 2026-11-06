import pytest
from app.models.enums import StudentCompetencyLevel, DeficiencyType, ExerciseDifficultyTier, MedicalSpecialty, CognitiveGap
from app.models.student import SpecialtyMasteryProfile, LevelingPrescription
from app.engine.leveling_engine import calculate_specialty_competency, generate_leveling_prescription

def test_competency_tier_assignment():
    # Mastery < 60% is Deficient / Needs Leveling
    profile_low = calculate_specialty_competency(specialty=MedicalSpecialty.NEFROLOGIA, score=52.0, attempts=3)
    assert profile_low.level == StudentCompetencyLevel.DEFICIENTE
    assert profile_low.needs_leveling is True

    # Mastery 60-74% is En Desarrollo
    profile_mid = calculate_specialty_competency(specialty=MedicalSpecialty.NEUROLOGIA, score=68.0, attempts=4)
    assert profile_mid.level == StudentCompetencyLevel.EN_DESARROLLO
    assert profile_mid.needs_leveling is True

    # Mastery 75-89% is Competente
    profile_comp = calculate_specialty_competency(specialty=MedicalSpecialty.ENDOCRINOLOGIA, score=82.0, attempts=5)
    assert profile_comp.level == StudentCompetencyLevel.COMPETENTE
    assert profile_comp.needs_leveling is False

    # Mastery >= 90% is Avanzado
    profile_adv = calculate_specialty_competency(specialty=MedicalSpecialty.REUMATOLOGIA, score=94.0, attempts=6)
    assert profile_adv.level == StudentCompetencyLevel.AVANZADO
    assert profile_adv.needs_leveling is False

def test_exact_boundary_thresholds_and_normalization():
    # Exactly 60.0 should be EN_DESARROLLO
    p60 = calculate_specialty_competency(specialty="NEFROLOGIA", score=60.0, attempts=1)
    assert p60.level == StudentCompetencyLevel.EN_DESARROLLO

    # Exactly 75.0 should be COMPETENTE
    p75 = calculate_specialty_competency(specialty="NEUROLOGIA", score=75.0, attempts=1)
    assert p75.level == StudentCompetencyLevel.COMPETENTE
    assert p75.needs_leveling is False

    # Exactly 90.0 should be AVANZADO
    p90 = calculate_specialty_competency(specialty="ENDOCRINOLOGIA", score=90.0, attempts=1)
    assert p90.level == StudentCompetencyLevel.AVANZADO
    assert p90.needs_leveling is False

def test_generate_leveling_prescription_for_critical_gap():
    prescription = generate_leveling_prescription(
        specialty=MedicalSpecialty.NEFROLOGIA,
        mastery_score=52.0,
        detected_gap="GAP_TRIAGE_SEVERITY",
        student_level=StudentCompetencyLevel.DEFICIENTE
    )
    assert prescription.recommended_exercise_difficulty == "Nivel 1 (Fundacional)"
    assert len(prescription.target_exercise_ids) >= 1
    assert prescription.assigned_deficiency == DeficiencyType.CRITICA_SEGURIDAD
    assert "revisión prioritaria" in prescription.rationale.lower() or "emergencia" in prescription.rationale.lower()

def test_generate_leveling_prescription_for_intermediate_gap():
    prescription = generate_leveling_prescription(
        specialty=MedicalSpecialty.NEUROLOGIA,
        mastery_score=70.0,
        detected_gap="GAP_DIAGNOSTIC_REASONING",
        student_level=StudentCompetencyLevel.EN_DESARROLLO
    )
    assert prescription.recommended_exercise_difficulty == "Nivel 2 (Intermedio)"
    assert prescription.assigned_deficiency == DeficiencyType.RAZONAMIENTO_DIFERENCIAL

def test_generate_leveling_prescription_for_advanced_management_gap():
    prescription = generate_leveling_prescription(
        specialty=MedicalSpecialty.REUMATOLOGIA,
        mastery_score=85.0,
        detected_gap="GAP_INITIAL_MANAGEMENT",
        student_level=StudentCompetencyLevel.COMPETENTE
    )
    assert prescription.recommended_exercise_difficulty == "Nivel 3 (Avanzado)"
    assert prescription.assigned_deficiency == DeficiencyType.MANEJO_TERAPEUTICO

def test_generate_leveling_prescription_for_lab_gap():
    prescription = generate_leveling_prescription(
        specialty=MedicalSpecialty.ENDOCRINOLOGIA,
        mastery_score=62.0,
        detected_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
        student_level=StudentCompetencyLevel.EN_DESARROLLO
    )
    assert prescription.assigned_deficiency == DeficiencyType.INTERPRETACION_DATOS
    assert prescription.recommended_exercise_difficulty == "Nivel 2 (Intermedio)"

def test_critical_security_deficiency_forces_leveling():
    # High score but with critical safety deficiency should still flag needs_leveling
    profile = calculate_specialty_competency(
        specialty=MedicalSpecialty.NEUROLOGIA,
        score=88.0,
        attempts=5,
        active_deficiencies=[DeficiencyType.CRITICA_SEGURIDAD]
    )
    assert profile.level == StudentCompetencyLevel.COMPETENTE
    assert profile.needs_leveling is True

def test_student_global_profile_integration():
    from app.models.student import StudentGlobalProfile
    from app.engine.leveling_engine import map_gap_to_deficiency, determine_recommended_difficulty

    profile_nefro = calculate_specialty_competency(specialty=MedicalSpecialty.NEFROLOGIA, score=52.0, attempts=3)
    presc = generate_leveling_prescription(
        specialty=MedicalSpecialty.NEFROLOGIA,
        mastery_score=52.0,
        detected_gap="GAP_TRIAGE_SEVERITY",
        student_level=profile_nefro.level
    )

    global_prof = StudentGlobalProfile(
        student_id="estudiante_odysmedic_01",
        overall_competency_level=StudentCompetencyLevel.EN_DESARROLLO,
        specialty_profiles={MedicalSpecialty.NEFROLOGIA.value: profile_nefro},
        active_prescriptions=[presc],
        global_score=52.0,
        total_cases_resolved=1,
        total_attempts=3
    )

    assert global_prof.student_id == "estudiante_odysmedic_01"
    assert global_prof.specialty_profiles[MedicalSpecialty.NEFROLOGIA.value].needs_leveling is True
    assert len(global_prof.active_prescriptions) == 1
    assert map_gap_to_deficiency("GAP_TRIAGE_SEVERITY") == DeficiencyType.CRITICA_SEGURIDAD
    assert determine_recommended_difficulty(StudentCompetencyLevel.DEFICIENTE) == "Nivel 1 (Fundacional)"
    assert determine_recommended_difficulty(StudentCompetencyLevel.DEFICIENTE) == ExerciseDifficultyTier.NIVEL_1_FUNDACIONAL

