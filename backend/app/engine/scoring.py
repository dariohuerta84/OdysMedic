from app.models.evaluation import CriterionEvaluationResult, DimensionScore

def calculate_dimension_scores(criteria_results: list[CriterionEvaluationResult]) -> dict[str, DimensionScore]:
    """
    Agrupa los resultados de criterios por dimension y calcula los puntajes porcentuales.
    """
    dim_totals: dict[str, dict[str, float]] = {}

    for cr in criteria_results:
        dim = cr.dimension
        if dim not in dim_totals:
            dim_totals[dim] = {"earned": 0.0, "possible": 0.0}
        dim_totals[dim]["earned"] += cr.points_earned
        dim_totals[dim]["possible"] += cr.points_possible

    scores: dict[str, DimensionScore] = {}
    for dim, totals in dim_totals.items():
        possible = totals["possible"]
        earned = totals["earned"]
        pct = (earned / possible * 100.0) if possible > 0 else 0.0
        scores[dim] = DimensionScore(
            dimension=dim,
            points_earned=round(earned, 2),
            points_possible=round(possible, 2),
            percentage=round(pct, 2)
        )
    return scores

def calculate_global_score(criteria_results: list[CriterionEvaluationResult]) -> float:
    """Calcula la calificacion porcentual global (0.0 a 100.0)."""
    total_possible = sum(c.points_possible for c in criteria_results)
    if total_possible <= 0:
        return 0.0
    total_earned = sum(c.points_earned for c in criteria_results)
    return round((total_earned / total_possible) * 100.0, 2)
