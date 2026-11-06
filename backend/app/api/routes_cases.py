from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.services.case_service import case_repository
from app.services.mcq_service import mcq_repository
from app.models.clinical_case import CaseSummary, ClinicalCaseSimulation, FullClinicalCase
from app.models.mcq import MCQStationStudent

router = APIRouter(prefix="/cases", tags=["Casos Clinicos"])


@router.get("", response_model=list[CaseSummary])
def list_cases(specialty: Optional[str] = Query(None, description="Filtrar casos por especialidad normalizada")):
    """Retorna la lista de casos clinicos disponibles en formato resumen."""
    return case_repository.get_all_summaries(specialty=specialty)


@router.get("/{case_id}", response_model=ClinicalCaseSimulation)
def get_case_vignette(case_id: str):
    """
    Retorna la vineta clinica sanitizada para el estudiante.
    No incluye diagnostico confirmado, intervenciones observadas ni criterios de evaluacion.
    """
    vignette = case_repository.get_simulation_vignette(case_id)
    if not vignette:
        raise HTTPException(status_code=404, detail=f"Caso clinico '{case_id}' no encontrado.")
    return vignette


@router.get("/{case_id}/ground-truth", response_model=FullClinicalCase)
def get_case_ground_truth(case_id: str):
    """
    Retorna el caso clinico completo con su estandar de oro, evidencia documental y criterios.
    Uso exclusivo para auditoria docente o depuracion de motor.
    """
    full_case = case_repository.get_full_case(case_id)
    if not full_case:
        raise HTTPException(status_code=404, detail=f"Caso clinico '{case_id}' no encontrado.")
    return full_case


@router.get("/{case_id}/stations", response_model=list[MCQStationStudent])
def get_case_stations(case_id: str):
    """
    Retorna la lista de estaciones clinicas MCQ estructuradas para el caso.
    Sanitizadas para el estudiante (sin respuestas correctas ni justificaciones).
    """
    stations = mcq_repository.get_stations_for_case(case_id)
    if not stations:
        raise HTTPException(
            status_code=404,
            detail=f"Estaciones clinicas no encontradas para el caso '{case_id}'.",
        )
    return stations


@router.get("/{case_id}/stations/{station_number}", response_model=MCQStationStudent)
def get_case_station(case_id: str, station_number: int):
    """
    Retorna una estacion clinica MCQ especifica para el caso clinico.
    """
    station = mcq_repository.get_student_station(case_id, station_number)
    if not station:
        raise HTTPException(
            status_code=404,
            detail=f"Estacion {station_number} no encontrada para el caso '{case_id}'.",
        )
    return station
