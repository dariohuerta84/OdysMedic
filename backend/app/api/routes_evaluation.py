from typing import Any, Dict
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_active_student
from app.db.models import User
from app.services.case_service import case_repository, CASE_SPECIALTY_MAP
from app.services.mcq_service import mcq_repository
from app.services.student_service import student_service
from app.models.evaluation import EvaluationSubmission, RetrospectiveEvaluationReport
from app.models.mcq import MCQSubmission
from app.engine.evaluator import evaluate_case_retrospectively, evaluate_mcq_station_attempt
from app.engine.gap_classifier import GAP_METADATA

router = APIRouter(prefix="/evaluation", tags=["Evaluacion Retrospectiva"])


@router.post("/submit", response_model=RetrospectiveEvaluationReport)
def submit_evaluation(submission: EvaluationSubmission):
    """
    Recibe la hipotesis diagnostica y el plan terapeutico del estudiante para un caso clinico,
    ejecuta el cotejo retrospectivo contra el estandar de oro y retorna el reporte detallado
    con puntajes dimensionales, brechas cognitivas detectadas y perla clinica.
    """
    case = case_repository.get_full_case(submission.case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Caso clinico '{submission.case_id}' no encontrado.")

    report = evaluate_case_retrospectively(submission=submission, case=case)
    return report


@router.post("/submit-mcq")
def submit_mcq(
    submission: MCQSubmission,
    db: Session = Depends(get_db),
    student: User = Depends(get_active_student),
) -> Dict[str, Any]:
    """
    Evalua el intento de un estudiante en una estacion clinica MCQ, registra
    el intento en la base de datos con calculo adaptativo EMA de maestria,
    actualiza XP, brechas cognitivas y devuelve la prescripcion de nivelacion.
    """
    station = mcq_repository.get_station(submission.case_id, submission.station_number)
    if not station:
        raise HTTPException(
            status_code=404,
            detail=f"Estacion {submission.station_number} no encontrada para el caso '{submission.case_id}'.",
        )

    # Obtener la especialidad normalizada del caso clinico
    specialty = CASE_SPECIALTY_MAP.get(submission.case_id)
    if not specialty:
        full_case = case_repository.get_full_case(submission.case_id)
        if full_case:
            specialty = getattr(full_case, "normalized_specialty", None) or full_case.specialty
    if not specialty:
        specialty = "nefrologia"

    # Evaluacion del intento
    result = evaluate_mcq_station_attempt(
        station=station,
        chosen_option_id=submission.chosen_option_id,
        response_time_ms=submission.response_time_ms,
    )

    # Registro y adaptacion curricular en student_service
    prescription = student_service.record_mcq_attempt(
        db=db,
        user_id=student.id,
        case_id=submission.case_id,
        station_number=submission.station_number,
        is_correct=result.is_correct,
        gap=result.associated_gap,
        specialty=specialty,
        response_time_ms=submission.response_time_ms,
    )

    res_dict = result.model_dump(mode="json")
    res_dict["leveling_prescription"] = prescription.model_dump(mode="json")
    return res_dict


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
