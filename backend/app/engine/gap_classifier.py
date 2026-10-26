from app.models.enums import CognitiveGap

GAP_METADATA: dict[CognitiveGap, dict[str, str]] = {
    CognitiveGap.GAP_TRIAGE_SEVERITY: {
        "name": "Falla en Triaje y Reconocimiento de Severidad",
        "description": "Incapacidad para identificar signos de alarma vital, inestabilidad hemodinamica o situaciones de emergencia medica inminente.",
    },
    CognitiveGap.GAP_DIAGNOSTIC_REASONING: {
        "name": "Falla en Razonamiento Diagnostico",
        "description": "Falla en articular sintomas cardinales, signos fisicos y factores de riesgo en una entidad nosologica certera o diagnosticos diferenciales.",
    },
    CognitiveGap.GAP_LAB_INTERPRETATION: {
        "name": "Falla en Interpretacion de Pruebas Auxiliares",
        "description": "Omision o lectura inadecuada de examenes de laboratorio, frotis sanguineo, imagenes o biomarcadores criticos.",
    },
    CognitiveGap.GAP_INITIAL_MANAGEMENT: {
        "name": "Falla en Manejo Inicial y Terapeutica",
        "description": "Eleccion inadecuada del tratamiento de primera linea, error de dosificacion, via incorrecta o retraso en medidas de sosten farmacologico.",
    },
}

def classify_criterion_gap(dimension: str, concept: str, criticality: str = "normal") -> CognitiveGap:
    """
    Clasifica un fallo en un criterio especifico dentro de una de las 4 brechas cognitivas OCRI.
    """
    dim_lower = dimension.lower()
    concept_lower = concept.lower()

    # Dimension Diagnostico -> GAP_DIAGNOSTIC_REASONING
    if dim_lower in ("diagnostico", "diagnosis"):
        return CognitiveGap.GAP_DIAGNOSTIC_REASONING

    # Criterios asociados a triaje, signos vitales o emergencias criticas
    if criticality in ("critical", "high") or any(
        term in concept_lower for term in ("triaje", "severidad", "urgencia", "emergencia", "estabilizacion")
    ):
        return CognitiveGap.GAP_TRIAGE_SEVERITY

    # Dimension Pruebas Auxiliares / Laboratorio
    if dim_lower in ("laboratorio", "imaging", "pruebas", "examenes") or any(
        term in concept_lower for term in ("frotis", "tac", "rmn", "biopsia", "analitica", "ecografia", "ldh", "anticuerpos")
    ):
        return CognitiveGap.GAP_LAB_INTERPRETATION

    # Dimension Tratamiento, Dosis, Efectos Secundarios, Informacion al Paciente -> GAP_INITIAL_MANAGEMENT
    return CognitiveGap.GAP_INITIAL_MANAGEMENT
