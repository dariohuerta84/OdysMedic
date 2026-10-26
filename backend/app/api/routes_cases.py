from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.services.case_service import case_repository
from app.models.clinical_case import CaseSummary, ClinicalCaseSimulation, FullClinicalCase

router = APIRouter(prefix="/cases", tags=["Casos Clínicos"])

@router.get("", response_model=list[CaseSummary])
def list_cases(specialty: Optional[str] = Query(None, description="Filtrar casos por especialidad normalizada")):
    """Retorna la lista de casos clínicos disponibles en formato resumen."""
    return case_repository.get_all_summaries(specialty=specialty)

@router.get("/{case_id}", response_model=ClinicalCaseSimulation)
def get_case_vignette(case_id: str):
    """
    Retorna la viñeta clínica sanitizada para el estudiante.
    No incluye diagnóstico confirmado, intervenciones observadas ni criterios de evaluación.
    """
    vignette = case_repository.get_simulation_vignette(case_id)
    if not vignette:
        raise HTTPException(status_code=404, detail=f"Caso clínico '{case_id}' no encontrado.")
    return vignette

@router.get("/{case_id}/ground-truth", response_model=FullClinicalCase)
def get_case_ground_truth(case_id: str):
    """
    Retorna el caso clínico completo con su estándar de oro, evidencia documental y criterios.
    Uso exclusivo para auditoría docente o depuración de motor.
    """
    full_case = case_repository.get_full_case(case_id)
    if not full_case:
        raise HTTPException(status_code=404, detail=f"Caso clínico '{case_id}' no encontrado.")
    return full_case
