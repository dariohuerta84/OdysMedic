from fastapi import APIRouter, HTTPException
from app.services.case_service import case_repository
from app.models.clinical_case import CaseSummary

router = APIRouter(prefix="/specialties", tags=["Especialidades"])

@router.get("", response_model=list[dict])
def list_specialties():
    """Retorna el catálogo de especialidades médicas con su descripción y recuento de casos."""
    return case_repository.get_specialties_catalog()

@router.get("/{specialty_id}/cases", response_model=list[CaseSummary])
def get_cases_by_specialty(specialty_id: str):
    """Retorna los resúmenes de casos clínicos disponibles para una especialidad específica."""
    summaries = case_repository.get_all_summaries(specialty=specialty_id)
    if not summaries:
        raise HTTPException(status_code=404, detail=f"No se encontraron casos para la especialidad '{specialty_id}'.")
    return summaries
