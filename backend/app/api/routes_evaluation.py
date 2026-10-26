from fastapi import APIRouter, HTTPException
from app.services.case_service import case_repository
from app.models.evaluation import EvaluationSubmission, RetrospectiveEvaluationReport
from app.engine.evaluator import evaluate_case_retrospectively
from app.engine.gap_classifier import GAP_METADATA

router = APIRouter(prefix="/evaluation", tags=["Evaluación Retrospectiva"])

@router.post("/submit", response_model=RetrospectiveEvaluationReport)
def submit_evaluation(submission: EvaluationSubmission):
    """
    Recibe la hipótesis diagnóstica y el plan terapéutico del estudiante para un caso clínico,
    ejecuta el cotejo retrospectivo contra el estándar de oro y retorna el reporte detallado
    con puntajes dimensionales, brechas cognitivas detectadas y perla clínica.
    """
    case = case_repository.get_full_case(submission.case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Caso clínico '{submission.case_id}' no encontrado.")

    report = evaluate_case_retrospectively(submission=submission, case=case)
    return report

@router.get("/taxonomy")
def get_cognitive_gaps_taxonomy():
    """Retorna las 4 brechas cognitivas del modelo OCRI con sus nombres y descripciones formativas."""
    return [
        {
            "gap_id": gap.value,
            "name": meta["name"],
            "description": meta["description"],
        }
        for gap, meta in GAP_METADATA.items()
    ]
