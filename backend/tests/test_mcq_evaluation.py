import pytest
from app.models.enums import CognitiveGap
from app.models.mcq import (
    MCQOptionStudent,
    MCQOptionInternal,
    MCQStationStudent,
    MCQStationInternal,
    MCQSubmission,
    MCQResult,
)
from app.services.mcq_service import mcq_repository
from app.engine.evaluator import evaluate_mcq_station_attempt


SEVEN_PROMPT_CASES = [
    "s13256-019-2334-y",  # Nefrologia, aHUS y falla renal aguda
    "s13256-017-1522-8",  # Endocrinologia, hipokalemia y acidosis por capecitabina
    "s13256-018-1897-4",  # Neurologia, afecto pseudobulbar post-ACV
    "s13256-020-02558-8",  # Reumatologia, LES neuropsiquiatrico con psicosis
    "s13256-021-02891-2",  # Ginecologia/Obstetricia, hipoparatiroidismo en gestante
    "s13256-024-04664-5",  # Oftalmologia, sindrome de efusion uveal
    "s13256-024-04987-9",  # Ginecologia/Oncologia, coriocarcinoma pulmonar
]

DATASET_CASES = [
    "s13256-019-2334-y",
    "s13256-022-03392-w",
    "s13256-023-04294-1",
    "s13256-024-04496-1",
    "s13256-025-05577-5",
    "s13256-025-05650-z",
    "s13256-026-05974-4",
]


def test_mcq_repository_returns_three_stations_for_all_seven_cases():
    for case_id in SEVEN_PROMPT_CASES:
        stations = mcq_repository.get_stations_for_case(case_id)
        assert len(stations) == 3, f"Caso {case_id} no tiene 3 estaciones"
        assert [s.station_number for s in stations] == [1, 2, 3]
        assert stations[0].difficulty_tier == "Nivel 1 (Fundacional)"
        assert stations[1].difficulty_tier == "Nivel 2 (Intermedio)"
        assert stations[2].difficulty_tier == "Nivel 3 (Avanzado)"
        for s in stations:
            assert s.case_id == case_id


def test_mcq_repository_supports_dataset_case_ids():
    for case_id in DATASET_CASES:
        stations = mcq_repository.get_stations_for_case(case_id)
        assert len(stations) == 3, f"Caso del dataset {case_id} no tiene 3 estaciones"
        for s in stations:
            assert s.case_id == case_id


def test_student_schema_hides_internal_fields():
    stations = mcq_repository.get_stations_for_case("s13256-019-2334-y")
    assert len(stations) >= 1
    st = stations[0]

    assert isinstance(st, MCQStationStudent)
    assert not hasattr(st, "target_competency")
    assert not hasattr(st, "clinical_pearl_id")
    assert not hasattr(st, "citation_ref_id")

    for opt in st.options:
        assert isinstance(opt, MCQOptionStudent)
        assert hasattr(opt, "option_id")
        assert hasattr(opt, "text")
        assert not hasattr(opt, "is_correct")
        assert not hasattr(opt, "associated_gap")
        assert not hasattr(opt, "rationale")


def test_station_internal_structure_and_distractor_gap_mapping():
    for case_id in SEVEN_PROMPT_CASES:
        internal_stations = mcq_repository.get_internal_stations_for_case(case_id)
        assert len(internal_stations) == 3
        for st in internal_stations:
            assert isinstance(st, MCQStationInternal)
            assert len(st.options) == 4
            option_ids = [opt.option_id for opt in st.options]
            assert option_ids == ["A", "B", "C", "D"]

            correct_opts = [opt for opt in st.options if opt.is_correct]
            assert len(correct_opts) == 1, f"Estacion {st.station_id} debe tener exactamente 1 opcion correcta"
            assert correct_opts[0].associated_gap is None

            incorrect_opts = [opt for opt in st.options if not opt.is_correct]
            assert len(incorrect_opts) == 3
            for inc in incorrect_opts:
                assert inc.associated_gap is not None, f"Distractor {inc.option_id} en {st.station_id} debe tener associated_gap"
                assert isinstance(inc.associated_gap, CognitiveGap)
                assert len(inc.rationale.strip()) > 10


def test_evaluate_correct_option():
    station = mcq_repository.get_station("s13256-019-2334-y", 1)
    assert station is not None

    correct_opt = next(opt for opt in station.options if opt.is_correct)
    result = evaluate_mcq_station_attempt(station, correct_opt.option_id, response_time_ms=4500)

    assert isinstance(result, MCQResult)
    assert result.is_correct is True
    assert result.points_earned == 100.0
    assert result.correct_option_id == correct_opt.option_id
    assert result.chosen_option_id == correct_opt.option_id
    assert result.associated_gap is None
    assert "Respuesta correcta" in result.clinical_feedback
    assert result.citation_evidence is not None
    assert "KDIGO" in result.citation_evidence or "Guideline" in result.citation_evidence
    assert result.clinical_pearl is not None
    assert len(result.clinical_pearl) > 20
    assert result.recommended_difficulty == "Nivel 2 (Intermedio)"


def test_evaluate_distractor_maps_to_exact_cognitive_gap():
    station = mcq_repository.get_station("s13256-019-2334-y", 1)
    assert station is not None

    triage_gap_opt = next(opt for opt in station.options if opt.associated_gap == CognitiveGap.GAP_TRIAGE_SEVERITY)
    result = evaluate_mcq_station_attempt(station, triage_gap_opt.option_id, response_time_ms=6200)

    assert result.is_correct is False
    assert result.points_earned == 0.0
    assert result.chosen_option_id == triage_gap_opt.option_id
    assert result.associated_gap == CognitiveGap.GAP_TRIAGE_SEVERITY
    assert "Opción incorrecta" in result.clinical_feedback
    assert "Trampa clínica" in result.clinical_feedback
    assert result.citation_evidence is not None
    assert result.clinical_pearl is not None
    assert result.recommended_difficulty == "Nivel 1 (Fundacional)"


def test_evaluate_distractor_lab_interpretation():
    station = mcq_repository.get_station("s13256-019-2334-y", 2)
    assert station is not None

    lab_gap_opt = next(opt for opt in station.options if opt.associated_gap == CognitiveGap.GAP_LAB_INTERPRETATION)
    result = evaluate_mcq_station_attempt(station, lab_gap_opt.option_id)

    assert result.is_correct is False
    assert result.points_earned == 0.0
    assert result.associated_gap == CognitiveGap.GAP_LAB_INTERPRETATION
    assert result.citation_evidence is not None


def test_evaluate_invalid_option_id():
    station = mcq_repository.get_station("s13256-019-2334-y", 1)
    assert station is not None

    result = evaluate_mcq_station_attempt(station, "Z", response_time_ms=1000)

    assert result.is_correct is False
    assert result.points_earned == 0.0
    assert result.chosen_option_id == "Z"
    assert result.associated_gap is None
    assert "Opción inválida seleccionada ('Z')" in result.clinical_feedback


def test_get_individual_station_and_student_station():
    case_id = "s13256-017-1522-8"

    # Internal station
    internal_st = mcq_repository.get_station(case_id, 2)
    assert internal_st is not None
    assert internal_st.station_number == 2
    assert internal_st.case_id == case_id
    assert internal_st.difficulty_tier == "Nivel 2 (Intermedio)"
    assert internal_st.citation_ref_id is not None

    # Student station
    student_st = mcq_repository.get_student_station(case_id, 2)
    assert student_st is not None
    assert student_st.station_number == 2
    assert student_st.case_id == case_id
    assert isinstance(student_st, MCQStationStudent)
    assert not hasattr(student_st, "citation_ref_id")

    # Non-existent station number
    assert mcq_repository.get_station(case_id, 99) is None
    assert mcq_repository.get_student_station(case_id, 99) is None

    # Non-existent case
    assert mcq_repository.get_station("case-unknown", 1) is None
    assert mcq_repository.get_student_station("case-unknown", 1) is None


def test_mcq_submission_model():
    sub = MCQSubmission(
        case_id="s13256-019-2334-y",
        station_number=1,
        chosen_option_id="A",
        response_time_ms=3200,
    )
    assert sub.case_id == "s13256-019-2334-y"
    assert sub.station_number == 1
    assert sub.chosen_option_id == "A"
    assert sub.response_time_ms == 3200


def test_all_seven_cases_evaluation_pipeline():
    for case_id in SEVEN_PROMPT_CASES:
        for st_num in [1, 2, 3]:
            internal_st = mcq_repository.get_station(case_id, st_num)
            assert internal_st is not None

            # Test correct answer
            correct_opt = next(opt for opt in internal_st.options if opt.is_correct)
            res_correct = evaluate_mcq_station_attempt(internal_st, correct_opt.option_id)
            assert res_correct.is_correct is True
            assert res_correct.points_earned == 100.0
            assert res_correct.citation_evidence is not None, f"Caso {case_id} st {st_num} falta citation_evidence"
            assert res_correct.clinical_pearl is not None, f"Caso {case_id} st {st_num} falta clinical_pearl"

            # Test incorrect answer
            incorrect_opt = next(opt for opt in internal_st.options if not opt.is_correct)
            res_incorrect = evaluate_mcq_station_attempt(internal_st, incorrect_opt.option_id)
            assert res_incorrect.is_correct is False
            assert res_incorrect.points_earned == 0.0
            assert res_incorrect.associated_gap == incorrect_opt.associated_gap
            assert res_incorrect.citation_evidence is not None
            assert res_incorrect.clinical_pearl is not None
