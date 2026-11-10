from typing import Optional, List
import json
from fastapi import APIRouter, Depends, HTTPException, Body, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, get_active_student
from app.db.models import User
from app.services.auth_service import auth_service
from app.services.student_service import student_service

router = APIRouter(prefix="/auth", tags=["Autenticacion y Perfil"])


class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    university: Optional[str] = "Universidad Peruana Cayetano Heredia"
    stage: Optional[str] = None
    target_exam: Optional[str] = None
    career: Optional[str] = "Medicina Humana"
    academic_year: Optional[str] = None
    primary_goal: Optional[str] = "preparar_enam"
    initial_world: Optional[str] = "medicina_interna"
    interest_areas: Optional[List[str]] = None
    onboarding_track: Optional[str] = "ruta"
    privacy_accepted: Optional[bool] = True


class UserLoginRequest(BaseModel):
    email: str
    password: str


class TogglePlanRequest(BaseModel):
    plan_tier: Optional[str] = None


def _parse_interests(raw_value: Optional[str]) -> List[str]:
    if not raw_value:
        return []
    try:
        parsed = json.loads(raw_value)
        return [str(x) for x in parsed] if isinstance(parsed, list) else []
    except Exception:
        return []


def format_user_profile(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "university": user.university,
        "stage": user.stage,
        "target_exam": user.target_exam,
        "career": getattr(user, "career", "Medicina Humana") or "Medicina Humana",
        "academic_year": getattr(user, "academic_year", None) or user.stage,
        "primary_goal": getattr(user, "primary_goal", "preparar_enam") or "preparar_enam",
        "initial_world": getattr(user, "initial_world", "medicina_interna") or "medicina_interna",
        "interest_areas": _parse_interests(getattr(user, "interest_areas", None)),
        "onboarding_track": getattr(user, "onboarding_track", "ruta") or "ruta",
        "privacy_accepted": bool(getattr(user, "privacy_accepted", True)),
        "plan_tier": user.plan_tier,
        "xp": user.xp,
        "streak_days": user.streak_days,
        "simulated_days_elapsed": int(getattr(user, "simulated_days_elapsed", 0) or 0),
        "diagnostic_completed": bool(user.diagnostic_completed),
        "diagnostic_score": user.diagnostic_score,
        "aptitude_status": user.aptitude_status,
        "diagnostic_mode": getattr(user, "diagnostic_mode", None),
        "diagnostic_specialty": getattr(user, "diagnostic_specialty", None),
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.post("/register")
def register(
    payload: UserRegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Registra un nuevo estudiante medico en la plataforma OdyssMedic.
    Genera credenciales de acceso inicial y perfil de maestria basal en las 5 especialidades cardinales.
    """
    try:
        user = student_service.register_user(
            db=db,
            email=payload.email,
            password=payload.password,
            full_name=payload.full_name,
            university=payload.university or "Universidad Peruana Cayetano Heredia",
            stage=payload.stage,
            target_exam=payload.target_exam,
            career=payload.career or "Medicina Humana",
            academic_year=payload.academic_year,
            primary_goal=payload.primary_goal or "preparar_enam",
            initial_world=payload.initial_world or "medicina_interna",
            interest_areas=payload.interest_areas,
            onboarding_track=payload.onboarding_track or "ruta",
            privacy_accepted=True if payload.privacy_accepted is None else bool(payload.privacy_accepted),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    token = auth_service.create_access_token(
        data={"sub": str(user.id), "user_id": user.id, "email": user.email}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": format_user_profile(user),
    }


@router.post("/login")
def login(
    payload: UserLoginRequest,
    db: Session = Depends(get_db),
):
    """
    Autentica al estudiante con su correo electronico y contrasena.
    Retorna un token de acceso JWT Bearer valido para sesiones protegidas.
    """
    user = student_service.authenticate_user(
        db=db,
        email=payload.email,
        password=payload.password,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de acceso invalidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_service.create_access_token(
        data={"sub": str(user.id), "user_id": user.id, "email": user.email}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": format_user_profile(user),
    }


@router.get("/me")
def get_current_user_profile(
    user: User = Depends(get_current_user),
):
    """
    Retorna el perfil del estudiante autenticado actualmente con su nivel de plan, XP y racha.
    """
    return format_user_profile(user)


@router.patch("/toggle-plan")
def toggle_user_plan(
    payload: Optional[TogglePlanRequest] = Body(None),
    user: User = Depends(get_active_student),
    db: Session = Depends(get_db),
):
    """
    Alterna o actualiza el nivel de suscripcion (plan_tier) del estudiante (free <-> premium).
    """
    new_tier = payload.plan_tier if payload else None
    updated_user = student_service.toggle_user_plan(db=db, user_id=user.id, new_tier=new_tier)
    return format_user_profile(updated_user)
