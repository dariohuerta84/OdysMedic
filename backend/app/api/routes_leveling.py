from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_active_student
from app.db.models import User
from app.db.diagnostic_bank import (
    DIAGNOSTIC_SPECIALTIES,
    get_diagnostic_questions_for_student,
)
from app.models.enums import MedicalSpecialty, CognitiveGap
from app.models.student import LevelingPrescription
from app.engine.leveling_engine import generate_leveling_prescription
from app.services.student_service import student_service

router = APIRouter(prefix="/leveling", tags=["Nivelacion Adaptativa y OCRI"])


class DiagnosticAnswerItem(BaseModel):
    question_id: int
    selected_option_id: str


class DiagnosticSubmitRequest(BaseModel):
    answers: List[DiagnosticAnswerItem]
    mode: Optional[str] = "general"
    specialty: Optional[str] = None


class SimulateDaysRequest(BaseModel):
    days: int = 7
    mode: Optional[str] = "active_streak"


@router.get("/diagnostic/specialties")
def get_diagnostic_specialties() -> List[Dict[str, str]]:
    """
    Retorna las especialidades disponibles para el modo de evaluacion inicial focalizada.
    """
    return DIAGNOSTIC_SPECIALTIES


@router.get("/diagnostic/questions")
def get_diagnostic_questions(
    mode: str = Query("general", description="Modo de evaluacion: 'general' o 'specialty'"),
    specialty: Optional[str] = Query(None, description="Especialidad cuando mode='specialty'"),
) -> List[Dict[str, Any]]:
    """
    Retorna el cuestionario estandarizado de 5 preguntas clinicas basales
    (modo general multi-especialidad o modo de una sola especialidad).
    """
    return get_diagnostic_questions_for_student(mode=mode, specialty=specialty)


@router.post("/diagnostic/submit")
def submit_diagnostic(
    payload: DiagnosticSubmitRequest,
    student: User = Depends(get_active_student),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Evalua el examen de autoevaluacion inicial del estudiante, calcula su porcentaje
    de rendimiento real, calibra su radar OCRI basal, determina el estado de aptitud
    (apto, en_nivelacion, no_apto) y desbloquea el acceso al panel interactivo.
    """
    answers_dicts = [a.model_dump() for a in payload.answers]
    return student_service.submit_diagnostic_exam(
        db=db,
        user_id=student.id,
        answers=answers_dicts,
        mode=payload.mode or "general",
        specialty=payload.specialty,
    )


@router.get("/dashboard")
def get_dashboard(
    student: User = Depends(get_active_student),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Retorna el panel analitico del estudiante con radar OCRI de las 5 especialidades cardinales,
    puntajes basales, nivel de competencia, racha, XP y tareas de repeticion espaciada.
    """
    return student_service.get_student_dashboard(db, student.id)


@router.post("/simulate-days")
def simulate_days(
    payload: SimulateDaysRequest,
    student: User = Depends(get_active_student),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Simulador longitudinal de paso del tiempo para exposiciones en vivo:
    permite avanzar +1, +7 o +21 dias con practica constante, simular inactividad
    (curva del olvido de Ebbinghaus) o restablecer la linea temporal al Dia 0.
    """
    return student_service.simulate_elapsed_days(
        db=db,
        user_id=student.id,
        days=payload.days,
        mode=payload.mode or "active_streak",
    )


@router.get("/prescription/{specialty}", response_model=LevelingPrescription)
def get_prescription_by_specialty(
    specialty: str,
    student: User = Depends(get_active_student),
    db: Session = Depends(get_db),
):
    """
    Genera y retorna la prescripcion de nivelacion adaptativa para una especialidad especifica
    en base al nivel de maestria y brechas cognitivas detectadas en el estudiante.
    """
    try:
        spec_enum = MedicalSpecialty(specialty.lower())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Especialidad '{specialty}' no valida en el catalogo OdyssMedic.",
        )

    profile = student_service.get_specialty_mastery(db, student.id, spec_enum)
    detected_gap = profile.detected_gaps[0] if profile.detected_gaps else CognitiveGap.GAP_DIAGNOSTIC_REASONING

    prescription = generate_leveling_prescription(
        specialty=spec_enum,
        mastery_score=profile.score,
        detected_gap=detected_gap,
        student_level=profile.level,
        student_id=str(student.id),
    )
    return prescription
