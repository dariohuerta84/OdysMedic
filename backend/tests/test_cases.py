from app.services.case_service import case_repository

def test_cases_loaded_successfully():
    """Verifica que los 7 casos clínicos del dataset RAG se carguen correctamente."""
    summaries = case_repository.get_all_summaries()
    assert len(summaries) == 7, f"Se esperaban 7 casos, se obtuvieron {len(summaries)}"

def test_case_sanitization_for_simulation():
    """Verifica que la viñeta clínica para el estudiante oculte el diagnóstico y los criterios."""
    vignette = case_repository.get_simulation_vignette("s13256-019-2334-y")
    assert vignette is not None
    assert vignette.case_id == "s13256-019-2334-y"
    assert vignette.display_title != ""

    # Comprobar que no contenga atributos de respuesta
    assert not hasattr(vignette, "diagnosis")
    assert not hasattr(vignette, "observed_interventions")
    assert not hasattr(vignette, "evaluation_blueprint")

def test_specialties_catalog_counts():
    """Verifica que el catálogo de especialidades agrupe adecuadamente los casos."""
    catalog = case_repository.get_specialties_catalog()
    assert len(catalog) >= 5
    total_cases = sum(s["cases_count"] for s in catalog)
    assert total_cases == 7
