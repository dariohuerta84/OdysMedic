import re
import unicodedata
import uuid
from typing import Any
from app.models.enums import CognitiveGap
from app.models.clinical_case import FullClinicalCase, Criterion
from app.models.evaluation import (
    EvaluationSubmission,
    CriterionEvaluationResult,
    DetectedGap,
    RetrospectiveEvaluationReport,
)
from app.engine.gap_classifier import classify_criterion_gap, GAP_METADATA
from app.engine.scoring import calculate_dimension_scores, calculate_global_score
from app.engine.pearls_catalog import get_clinical_pearl

def normalize_text(text: str) -> str:
    """Normaliza texto eliminando acentos, puntuacion y convirtiendo a minusculas."""
    if not text:
        return ""
    # Descomponer caracteres con tildes
    nfkd = unicodedata.normalize("NFKD", text)
    cleaned = "".join([c for c in nfkd if not unicodedata.combining(c)])
    cleaned = cleaned.lower()
    # Reemplazar caracteres no alfanumericos por espacios
    cleaned = re.sub(r"[^a-z0-9\s]", " ", cleaned)
    # Colapsar espacios multiples
    return re.sub(r"\s+", " ", cleaned).strip()

def match_strings(user_input: str, targets: list[str]) -> bool:
    """Verifica si el input del usuario coincide sustancialmente con alguno de los objetivos."""
    user_norm = normalize_text(user_input)
    if not user_norm:
        return False
    user_tokens = set(user_norm.split())

    for target in targets:
        target_norm = normalize_text(target)
        if not target_norm:
            continue
        # Coincidencia exacta o de subcadena
        if user_norm in target_norm or target_norm in user_norm:
            return True
        # Coincidencia por solapamiento de tokens significativos
        target_tokens = set(target_norm.split())
        if not target_tokens:
            continue
        common = user_tokens.intersection(target_tokens)
        if len(common) >= 1 and (len(common) / len(target_tokens) >= 0.5 or len(common) >= 2):
            return True
    return False

def evaluate_case_retrospectively(
    submission: EvaluationSubmission,
    case: FullClinicalCase,
) -> RetrospectiveEvaluationReport:
    """
    Ejecuta la evaluacion retrospectiva completa del desempeno de un estudiante frente a un caso.
    """
    results: list[CriterionEvaluationResult] = []
    
    # 1. Evaluar diagnostico primario
    diag_data = case.diagnosis
    primary_diag_val = diag_data.get("primary", {}).get("value", "")
    aliases = diag_data.get("accepted_aliases", [])
    accepted_diag_targets = [primary_diag_val] + aliases
    
    diagnostic_matched = match_strings(submission.proposed_diagnosis, accepted_diag_targets)
    
    # Si no coincidio en el diagnostico principal, revisar si esta en sus diferenciales
    if not diagnostic_matched and submission.differential_diagnoses:
        for diff in submission.differential_diagnoses:
            if match_strings(diff, accepted_diag_targets):
                diagnostic_matched = True
                break

    # 2. Evaluar cada criterio del blueprint
    criteria: list[Criterion] = case.evaluation_blueprint.criteria
    for crit in criteria:
        dim = crit.dimension
        weight = crit.weight if crit.weight > 0 else 1.0
        points_possible = weight
        points_earned = 0.0
        matched = False
        student_input_display = ""
        expected_ref = crit.concept
        feedback = ""
        gap: CognitiveGap | None = None

        if dim == "diagnostico":
            matched = diagnostic_matched
            student_input_display = submission.proposed_diagnosis
            expected_ref = f"{primary_diag_val} (o sinónimos: {', '.join(aliases[:3])})"
            if matched:
                points_earned = points_possible
                feedback = "Diagnóstico correcto y alineado con la evidencia clínica del caso."
            else:
                points_earned = 0.0
                feedback = f"Diagnóstico no certero. El diagnóstico confirmado es: {primary_diag_val}."
                gap = CognitiveGap.GAP_DIAGNOSTIC_REASONING

        elif dim == "dosis":
            dose_ref = crit.dose_reference
            drug_name = (dose_ref.drug if dose_ref and dose_ref.drug else crit.concept).lower()
            drug_aliases = (dose_ref.drug_aliases if dose_ref else []) + [drug_name, crit.concept]

            # Buscar intervencion propuesta por el usuario
            matched_intervention = None
            for p_int in submission.proposed_interventions:
                if match_strings(p_int.drug_name, drug_aliases):
                    matched_intervention = p_int
                    break

            if matched_intervention:
                student_input_display = f"{matched_intervention.drug_name} {matched_intervention.dose_value or ''} {matched_intervention.dose_unit or ''}".strip()
                # Verificar dosis si existe valor de referencia
                if dose_ref and dose_ref.value is not None:
                    expected_val = dose_ref.value
                    user_val = matched_intervention.dose_value
                    expected_ref = f"{dose_ref.drug} {expected_val} {dose_ref.unit or ''} {dose_ref.route or ''}".strip()

                    if user_val is not None:
                        # Tolerancia de +/- 15%
                        tolerance = expected_val * 0.15
                        if abs(user_val - expected_val) <= tolerance:
                            matched = True
                            points_earned = points_possible
                            feedback = f"Dosificación correcta para {dose_ref.drug} ({user_val} {dose_ref.unit or ''})."
                        else:
                            matched = False
                            # Credito parcial por acertar el farmaco aunque falle la dosis exacta
                            points_earned = round(points_possible * 0.3, 2)
                            feedback = f"Fármaco correcto pero dosis errónea. Esperado: {expected_val} {dose_ref.unit or ''}, reportado: {user_val}."
                            gap = CognitiveGap.GAP_INITIAL_MANAGEMENT
                    else:
                        # Especifico el farmaco pero no indico dosis
                        matched = False
                        points_earned = round(points_possible * 0.4, 2)
                        feedback = f"Fármaco indicado sin dosificación precisa. Referencia: {expected_val} {dose_ref.unit or ''}."
                        gap = CognitiveGap.GAP_INITIAL_MANAGEMENT
                else:
                    matched = True
                    points_earned = points_possible
                    feedback = f"Fármaco correctamente administrado: {drug_name}."
            else:
                matched = False
                points_earned = 0.0
                student_input_display = "No indicado"
                feedback = f"Criterio de dosificación omitido: se requería prescribir {drug_name}."
                gap = CognitiveGap.GAP_INITIAL_MANAGEMENT

        elif dim == "tratamiento":
            concept_targets = crit.accepted_answers if crit.accepted_answers else [crit.concept]
            found = False
            for p_int in submission.proposed_interventions:
                interv_str = f"{p_int.drug_name} {p_int.action_type}".strip()
                if match_strings(interv_str, concept_targets):
                    found = True
                    student_input_display = interv_str
                    break

            if found:
                matched = True
                points_earned = points_possible
                feedback = f"Intervención terapéutica adecuada: {crit.concept}."
            else:
                matched = False
                points_earned = 0.0
                student_input_display = "No indicado"
                feedback = f"Intervención terapéutica omitida: {crit.concept}."
                gap = classify_criterion_gap(dim, crit.concept, crit.criticality)

        else:
            # Dimensiones secundarias: efectos_secundarios, informacion_paciente
            concept_targets = crit.accepted_answers if crit.accepted_answers else [crit.concept]
            found = False
            for p_int in submission.proposed_interventions:
                if match_strings(p_int.drug_name, concept_targets):
                    found = True
                    student_input_display = p_int.drug_name
                    break

            if found:
                matched = True
                points_earned = points_possible
                feedback = f"Criterio cubierto: {crit.concept}."
            else:
                matched = False
                points_earned = 0.0
                student_input_display = "No mencionado"
                feedback = f"Conducta o consideración omitida: {crit.concept}."
                gap = classify_criterion_gap(dim, crit.concept, crit.criticality)

        results.append(
            CriterionEvaluationResult(
                criterion_id=crit.criterion_id,
                dimension=dim,
                concept=crit.concept,
                requirement_type=crit.requirement_type,
                criticality=crit.criticality,
                matched=matched,
                points_possible=points_possible,
                points_earned=points_earned,
                student_response=student_input_display,
                expected_reference=expected_ref,
                feedback=feedback,
                associated_gap=gap if not matched else None,
            )
        )

    # 3. Puntuacion global y por dimensiones
    global_score = calculate_global_score(results)
    dimension_scores = calculate_dimension_scores(results)

    # 4. Agregacion de Brechas Cognitivas detectadas
    gap_counts: dict[CognitiveGap, list[str]] = {}
    for r in results:
        if not r.matched and r.associated_gap:
            g = r.associated_gap
            if g not in gap_counts:
                gap_counts[g] = []
            gap_counts[g].append(r.concept)

    detected_gaps: list[DetectedGap] = []
    for g_type, concepts in gap_counts.items():
        meta = GAP_METADATA.get(g_type, {"name": g_type.value, "description": ""})
        detected_gaps.append(
            DetectedGap(
                gap_type=g_type,
                gap_name=meta["name"],
                description=meta["description"],
                occurrences=len(concepts),
                failed_criteria_concepts=concepts,
            )
        )

    # 5. Desenlace y Perla Clinica
    pearl = get_clinical_pearl(case.case_id)
    outcomes_dict = case.outcomes
    outcome_str = ""
    if "discharge_status" in outcomes_dict and isinstance(outcomes_dict["discharge_status"], dict):
        outcome_str = outcomes_dict["discharge_status"].get("value", "")
    elif "recovery" in outcomes_dict and isinstance(outcomes_dict["recovery"], list) and outcomes_dict["recovery"]:
        outcome_str = outcomes_dict["recovery"][0].get("value", "")
    if not outcome_str:
        outcome_str = "Recuperacion y seguimiento clinico ambulatorio documentado en literatura."

    return RetrospectiveEvaluationReport(
        evaluation_id=f"eval_{uuid.uuid4().hex[:10]}",
        case_id=case.case_id,
        student_id=submission.student_id,
        global_score=global_score,
        passed=global_score >= 70.0,
        diagnostic_accuracy=diagnostic_matched,
        dimension_scores=dimension_scores,
        criteria_results=results,
        detected_gaps=detected_gaps,
        clinical_pearl=pearl,
        ground_truth_diagnosis=primary_diag_val,
        ground_truth_aliases=aliases,
        actual_patient_outcome=outcome_str,
    )
