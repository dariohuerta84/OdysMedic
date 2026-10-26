from app.services.case_service import case_repository
from app.engine.evaluator import evaluate_case_retrospectively
from app.models.evaluation import EvaluationSubmission, ProposedIntervention
from app.models.enums import CognitiveGap

def test_retrospective_evaluation_accurate_submission():
    """Valida la evaluacion retrospectiva ante una respuesta clinica correcta."""
    case = case_repository.get_full_case("s13256-019-2334-y")
    assert case is not None

    submission = EvaluationSubmission(
        student_id="med_intern_01",
        case_id="s13256-019-2334-y",
        proposed_diagnosis="Síndrome urémico hemolítico atípico",
        differential_diagnoses=["Púrpura trombocitopénica trombótica", "Glomerulonefritis aguda"],
        proposed_interventions=[
            ProposedIntervention(drug_name="cefuroxime", dose_value=750.0, dose_unit="mg", route="intravenous"),
            ProposedIntervention(drug_name="metronidazole", dose_value=500.0, dose_unit="mg", route="intravenous"),
            ProposedIntervention(drug_name="Recambio plasmático terapéutico", action_type="procedure"),
        ],
    )

    report = evaluate_case_retrospectively(submission, case)
    assert report.diagnostic_accuracy is True
    assert report.global_score >= 50.0
    assert report.clinical_pearl != ""
    assert "aHUS" in report.clinical_pearl or "hemolitica" in report.clinical_pearl

def test_retrospective_evaluation_detects_diagnostic_gap():
    """Valida que un diagnostico equivocado active GAP_DIAGNOSTIC_REASONING."""
    case = case_repository.get_full_case("s13256-019-2334-y")
    assert case is not None

    submission = EvaluationSubmission(
        student_id="med_intern_02",
        case_id="s13256-019-2334-y",
        proposed_diagnosis="Apendicitis aguda supurada",
        differential_diagnoses=[],
        proposed_interventions=[],
    )

    report = evaluate_case_retrospectively(submission, case)
    assert report.diagnostic_accuracy is False
    assert report.passed is False

    gap_types = [g.gap_type for g in report.detected_gaps]
    assert CognitiveGap.GAP_DIAGNOSTIC_REASONING in gap_types

def test_retrospective_evaluation_detects_management_gap():
    """Valida que omitir tratamientos o dosificar erroneamente active GAP_INITIAL_MANAGEMENT."""
    case = case_repository.get_full_case("s13256-022-03392-w")
    assert case is not None

    submission = EvaluationSubmission(
        student_id="med_intern_03",
        case_id="s13256-022-03392-w",
        proposed_diagnosis="Diabetes e hipopotasemia asociadas a capecitabina",
        proposed_interventions=[],  # Omitio suspender capecitabina e insulina/potasio
    )

    report = evaluate_case_retrospectively(submission, case)
    assert report.diagnostic_accuracy is True
    gap_types = [g.gap_type for g in report.detected_gaps]
    assert CognitiveGap.GAP_INITIAL_MANAGEMENT in gap_types
