"""
OCRI-HLR Adaptive Memory & Difficulty Scheduler.

Grounded in:
- Settles & Meeder (ACL 2016): Half-Life Regression (HLR), p = 2^(-delta / h)
- Ye, Su & Cao (KDD 2022): FSRS three-component memory dynamics (stability, difficulty, retrievability)
- Settles, LaFlair & Hagiwara (TACL 2020): Birdbrain / IRT adaptive difficulty ("Goldilocks zone")
- Croskerry (Academic Medicine 2009): Dual-Process Theory (System 1 fluency vs System 2 deliberation)
"""

from __future__ import annotations

import math
from typing import Dict, Optional, Union

from app.models.enums import CognitiveGap, ExerciseDifficultyTier

GOLDILOCKS_TARGET_SUCCESS = 0.78
TIER_BETAS: tuple[tuple[ExerciseDifficultyTier, str, float], ...] = (
    (ExerciseDifficultyTier.NIVEL_1_FUNDACIONAL, "Nivel 1 (Fundacional)", -1.65),
    (ExerciseDifficultyTier.NIVEL_2_INTERMEDIO, "Nivel 2 (Intermedio)", -0.45),
    (ExerciseDifficultyTier.NIVEL_3_AVANZADO, "Nivel 3 (Avanzado)", 0.55),
)

MODEL_CITATIONS = [
    "Settles & Meeder (ACL 2016) — Half-Life Regression (DOI: 10.18653/v1/P16-1174)",
    "Ye, Su & Cao (KDD 2022) — FSRS Spaced Repetition (DOI: 10.1145/3534678.3539081)",
    "Settles, LaFlair & Hagiwara (TACL 2020) — Birdbrain / IRT (DOI: 10.1162/tacl_a_00310)",
    "Croskerry (Academic Medicine 2009) — Dual-Process Reasoning (DOI: 10.1097/ACM.0b013e3181ace703)",
]


def initial_half_life_from_score(score: Optional[float]) -> float:
    """Calibrates initial memory half-life h_0 (days) from diagnostic or baseline score."""
    if score is None:
        return 4.0
    val = float(score)
    if val < 50.0:
        return 2.0
    if val < 75.0:
        return 5.0
    return 10.0


def compute_recall_probability(delta_days: float, half_life_days: float) -> float:
    """Computes HLR recall probability p = clamp(2^(-max(0, delta) / max(1, h)), 0.05, 1.0)."""
    safe_delta = max(0.0, float(delta_days or 0.0))
    safe_h = max(1.0, float(half_life_days or 1.0))
    raw_p = math.pow(2.0, -safe_delta / safe_h)
    return round(min(1.0, max(0.05, raw_p)), 4)


def compute_hlr_next_review_days(half_life_days: float, target_retention: float = 0.80) -> int:
    """Days until predicted recall falls to target_retention (default 80%), clamped to [1, 30]."""
    safe_h = max(1.0, float(half_life_days or 1.0))
    clamped_target = min(0.95, max(0.50, float(target_retention)))
    days = round(-safe_h * math.log2(clamped_target))
    return max(1, min(30, int(days)))


def update_memory_trace(
    half_life_days: float,
    difficulty_index: float,
    passed: bool,
    gap_type: Optional[Union[CognitiveGap, str]] = None,
    response_time_ms: int = 0,
) -> Dict[str, Union[float, int]]:
    """Updates HLR half-life and FSRS-inspired difficulty index after a clinical station attempt."""
    h = max(1.0, min(90.0, float(half_life_days or 4.0)))
    d = max(0.15, min(0.95, float(difficulty_index if difficulty_index is not None else 0.5)))

    if passed:
        growth_factor = 1.65 + 0.35 * (1.0 - d)
        if 0 < int(response_time_ms or 0) <= 25000:
            growth_factor += 0.08
        new_h = min(90.0, h * growth_factor)
        new_d = max(0.15, d - 0.06)
    else:
        gap_str = gap_type.value if isinstance(gap_type, CognitiveGap) else str(gap_type or "")
        is_triage_critical = "TRIAGE" in gap_str.upper() or gap_str == CognitiveGap.GAP_TRIAGE_SEVERITY.value
        new_h = max(1.0, h * 0.48)
        new_d = min(0.95, d + (0.18 if is_triage_critical else 0.12))

    new_h = round(new_h, 2)
    new_d = round(new_d, 3)
    return {
        "half_life_days": new_h,
        "difficulty_index": new_d,
        "hlr_next_review_days": compute_hlr_next_review_days(new_h),
    }


def select_goldilocks_tier(
    mastery_score: float,
    recall_probability: float,
    critical_safety_flag: bool = False,
) -> Dict[str, Union[str, float]]:
    """
    Selects the exercise difficulty tier closest to the Birdbrain/IRT Goldilocks zone (p_success ~= 0.78).
    Clinical safety invariant: critical_safety_flag always forces Nivel 1 (Fundacional).
    """
    m = max(0.0, min(100.0, float(mastery_score or 0.0)))
    p_rec = max(0.05, min(1.0, float(recall_probability or 0.5)))
    theta = ((m - 50.0) / 25.0) + (p_rec - 0.75)

    def _logistic(t: float, beta: float) -> float:
        z = max(-20.0, min(20.0, t - beta))
        return 1.0 / (1.0 + math.exp(-z))

    if critical_safety_flag:
        tier, label, beta = TIER_BETAS[0]
        return {
            "tier": tier.value,
            "label": label,
            "predicted_success_probability": round(_logistic(theta, beta), 3),
            "theta": round(theta, 3),
        }

    best_choice = TIER_BETAS[0]
    best_dist = float("inf")
    best_prob = 0.5
    for tier, label, beta in TIER_BETAS:
        prob = _logistic(theta, beta)
        dist = abs(prob - GOLDILOCKS_TARGET_SUCCESS)
        if dist < best_dist:
            best_dist = dist
            best_choice = (tier, label, beta)
            best_prob = prob

    return {
        "tier": best_choice[0].value,
        "label": best_choice[1],
        "predicted_success_probability": round(best_prob, 3),
        "theta": round(theta, 3),
    }
