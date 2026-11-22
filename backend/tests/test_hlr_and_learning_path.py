import pytest

from app.engine.hlr_scheduler import (
    initial_half_life_from_score,
    compute_recall_probability,
    update_memory_trace,
    select_goldilocks_tier,
)


def test_initial_half_life_from_score_calibration():
    assert initial_half_life_from_score(None) == 4.0
    assert initial_half_life_from_score(35.0) == 2.0
    assert initial_half_life_from_score(60.0) == 5.0
    assert initial_half_life_from_score(85.0) == 10.0


def test_compute_recall_probability_hlr_formula_and_clamping():
    assert compute_recall_probability(0.0, 5.0) == 1.0
    assert compute_recall_probability(5.0, 5.0) == pytest.approx(0.5, abs=1e-3)
    assert compute_recall_probability(10.0, 5.0) == pytest.approx(0.25, abs=1e-3)
    assert compute_recall_probability(500.0, 2.0) == 0.05
    assert compute_recall_probability(-3.0, 5.0) == 1.0


def test_update_memory_trace_pass_with_fluency_and_fail_penalties():
    passed_slow = update_memory_trace(
        half_life_days=4.0,
        difficulty_index=0.5,
        passed=True,
        response_time_ms=45000,
    )
    passed_fast = update_memory_trace(
        half_life_days=4.0,
        difficulty_index=0.5,
        passed=True,
        response_time_ms=12000,
    )
    assert passed_slow["half_life_days"] > 4.0
    assert passed_fast["half_life_days"] > passed_slow["half_life_days"]
    assert passed_slow["difficulty_index"] < 0.5
    assert 1 <= passed_slow["hlr_next_review_days"] <= 30

    failed_normal = update_memory_trace(
        half_life_days=6.0,
        difficulty_index=0.5,
        passed=False,
        gap_type="GAP_DIAGNOSTIC_REASONING",
    )
    failed_triage = update_memory_trace(
        half_life_days=6.0,
        difficulty_index=0.5,
        passed=False,
        gap_type="GAP_TRIAGE_SEVERITY",
    )
    assert failed_normal["half_life_days"] == pytest.approx(6.0 * 0.48, abs=0.05)
    assert failed_triage["difficulty_index"] > failed_normal["difficulty_index"]
    assert 1 <= failed_normal["hlr_next_review_days"] <= 30


def test_select_goldilocks_tier_respects_safety_and_progression():
    forced_safe = select_goldilocks_tier(
        mastery_score=92.0,
        recall_probability=0.95,
        critical_safety_flag=True,
    )
    assert forced_safe["label"] == "Nivel 1 (Fundacional)"

    low = select_goldilocks_tier(mastery_score=30.0, recall_probability=0.55)
    mid = select_goldilocks_tier(mastery_score=65.0, recall_probability=0.80)
    high = select_goldilocks_tier(mastery_score=90.0, recall_probability=0.95)
    assert low["label"] == "Nivel 1 (Fundacional)"
    assert mid["label"] in ("Nivel 2 (Intermedio)", "Nivel 1 (Fundacional)")
    assert high["label"] == "Nivel 3 (Avanzado)"
    assert 0.0 < high["predicted_success_probability"] <= 1.0
