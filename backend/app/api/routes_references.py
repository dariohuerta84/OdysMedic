from typing import Optional
from fastapi import APIRouter, Query
from app.models.reference import MedicalReferenceBook, ClinicalGuidelineExcerpt
from app.services.reference_service import reference_repository
from app.services.mcq_service import CASE_ALIASES

router = APIRouter(prefix="/references", tags=["Guias Medicas y RAG"])


@router.get("", response_model=list[ClinicalGuidelineExcerpt])
def get_all_references(specialty: Optional[str] = Query(None, description="Filtrar referencias por especialidad")):
    """
    Retorna la lista de extractos de guias medicas, opcionalmente filtrada por especialidad.
    """
    if specialty:
        return reference_repository.get_excerpts_by_specialty(specialty)
    return reference_repository._all_excerpts


@router.get("/books", response_model=list[MedicalReferenceBook])
def get_books():
    """
    Retorna la coleccion completa de libros canonicos y compendios medicos de referencia.
    """
    return reference_repository.get_all_books()


@router.get("/by-case/{case_id}", response_model=list[ClinicalGuidelineExcerpt])
def get_citations_by_case(case_id: str):
    """
    Retorna las citas y extractos de guias de practica clinica indexadas para un caso especifico.
    """
    citations = reference_repository.get_citations_for_case(case_id)
    if not citations and case_id in CASE_ALIASES:
        citations = reference_repository.get_citations_for_case(CASE_ALIASES[case_id])
    return citations


@router.get("/by-specialty/{specialty}", response_model=list[ClinicalGuidelineExcerpt])
def get_excerpts_by_specialty(specialty: str):
    """
    Retorna los extractos de guias de practica clinica filtrados por especialidad medica.
    """
    return reference_repository.get_excerpts_by_specialty(specialty)
