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


@pytest.fixture
def path_env(tmp_path):
    from fastapi.testclient import TestClient
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from app.main import app
    from app.db.session import Base, get_db
    from app.db.seeder import seed_initial_data

    test_db_path = tmp_path / "test_hlr_path.db"
    test_engine = create_engine(
        f"sqlite:///{test_db_path}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    seed_session = TestingSessionLocal()
    seed_initial_data(seed_session)
    seed_session.close()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c, TestingSessionLocal
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


def _register_user(client, email: str):
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "Password123!",
            "full_name": "Estudiante HLR",
        },
    )
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, reg.json()["user"]["id"]


def _complete_diagnostic(client, headers, mode="general", specialty=None, all_correct=True):
    from app.db.diagnostic_bank import resolve_diagnostic_question_set

    qset = resolve_diagnostic_question_set(mode=mode, specialty=specialty)
    answers = []
    for q in qset:
        corr = next(opt["id"] for opt in q["options"] if opt.get("is_correct"))
        if all_correct:
            chosen = corr
        else:
            wrong = [opt["id"] for opt in q["options"] if opt["id"] != corr]
            chosen = wrong[0]
        answers.append({"question_id": q["id"], "selected_option_id": chosen})

    res = client.post(
        "/api/v1/leveling/diagnostic/submit",
        json={"answers": answers, "mode": mode, "specialty": specialty},
        headers=headers,
    )
    assert res.status_code == 200
    return res.json()


def test_learning_path_pre_diagnostic_all_locked(path_env):
    client, _ = path_env
    headers, _ = _register_user(client, "pre_diag@upch.pe")

    resp = client.get("/api/v1/leveling/learning-path", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["units"]) == 5
    assert data["total_nodes"] == 20
    assert data["completed_nodes"] == 0
    for unit in data["units"]:
        assert len(unit["nodes"]) == 4
        assert all(node["status"] == "locked" for node in unit["nodes"])


def test_learning_path_high_diagnostic_does_not_autocomplete_checkpoint_and_unlocks_sequentially(path_env):
    client, SessionLocal = path_env
    headers, user_id = _register_user(client, "seq_unlock@upch.pe")
    _complete_diagnostic(client, headers, mode="general", all_correct=True)

    path_after_diag = client.get("/api/v1/leveling/learning-path", headers=headers).json()
    for unit in path_after_diag["units"]:
        statuses = [n["status"] for n in unit["nodes"]]
        assert statuses[0] == "active"
        assert statuses[1] == "locked"
        assert statuses[2] == "locked"
        assert statuses[3] == "locked"  # Review Focus #2: Node 4 never auto-completes on diagnostic score alone

    # Pass Stations 1, 2, 3 on Unit 1's primary case via student_service.record_mcq_attempt
    from app.services.student_service import student_service
    unit1 = path_after_diag["units"][0]
    spec = unit1["specialty"]
    case_id = unit1["primary_case_id"]
    initial_h = unit1["half_life_days"]

    db = SessionLocal()
    try:
        for st_num in (1, 2, 3):
            student_service.record_mcq_attempt(
                db=db,
                user_id=user_id,
                case_id=case_id,
                station_number=st_num,
                is_correct=True,
                specialty=spec,
                response_time_ms=15000,
            )
    finally:
        db.close()

    path_after_3 = client.get("/api/v1/leveling/learning-path", headers=headers).json()
    updated_u1 = next(u for u in path_after_3["units"] if u["specialty"] == spec)
    assert [n["status"] for n in updated_u1["nodes"]] == [
        "completed",
        "completed",
        "completed",
        "completed",
    ]
    assert updated_u1["half_life_days"] > initial_h


def test_learning_path_non_cardinal_diagnostic_specialty_maps_to_unit_1(path_env):
    client, _ = path_env
    headers, _ = _register_user(client, "pediatria_user@upch.pe")
    _complete_diagnostic(client, headers, mode="specialty", specialty="pediatria", all_correct=True)

    resp = client.get("/api/v1/leveling/learning-path", headers=headers)
    assert resp.status_code == 200
    units = resp.json()["units"]
    assert len(units) == 5
    # pediatria primary candidate in SPECIALTY_TO_CASE_CANDIDATES is s13256-019-2334-y (nefrologia)
    assert units[0]["specialty"] == "nefrologia"
    assert units[0]["is_priority"] is True


def test_simulate_days_hlr_active_streak_inactivity_and_reset_coherence(path_env):
    client, SessionLocal = path_env
    headers, user_id = _register_user(client, "sim_hlr@upch.pe")
    _complete_diagnostic(client, headers, mode="general", all_correct=False)

    # Record a failure on reumatologia so it has an active gap while priority unit practices
    from app.services.student_service import student_service
    db = SessionLocal()
    try:
        student_service.record_mcq_attempt(
            db=db,
            user_id=user_id,
            case_id="s13256-026-05974-4",
            station_number=1,
            is_correct=False,
            gap="GAP_DIAGNOSTIC_REASONING",
            specialty="reumatologia",
        )
    finally:
        db.close()

    # 1. active_streak +21d: practiced unit stays healthy (p >= 0.80) while unpracticed gap unit decays
    res_streak = client.post(
        "/api/v1/leveling/simulate-days",
        json={"days": 21, "mode": "active_streak"},
        headers=headers,
    )
    assert res_streak.status_code == 200
    dash_streak = res_streak.json()["dashboard"]
    assert "hlr_summary" in dash_streak
    assert "learning_path" in dash_streak
    units_streak = dash_streak["learning_path"]["units"]
    assert any(u["recall_probability"] >= 0.80 for u in units_streak)
    assert any(u["recall_probability"] < 0.72 for u in units_streak)

    # 2. inactivity_decay 14d: all units decay and trigger needs_review
    res_decay = client.post(
        "/api/v1/leveling/simulate-days",
        json={"days": 14, "mode": "inactivity_decay"},
        headers=headers,
    )
    assert res_decay.status_code == 200
    units_decay = res_decay.json()["dashboard"]["learning_path"]["units"]
    assert all(u["recall_probability"] < 0.72 for u in units_decay)
    assert any(
        node["status"] == "needs_review"
        for u in units_decay
        for node in u["nodes"]
    )

    # 3. reset: restores p ~= 1.0 and simulated_days_elapsed == 0
    res_reset = client.post(
        "/api/v1/leveling/simulate-days",
        json={"days": 0, "mode": "reset"},
        headers=headers,
    )
    assert res_reset.status_code == 200
    dash_reset = res_reset.json()["dashboard"]
    assert dash_reset["simulated_days_elapsed"] == 0
    for u in dash_reset["learning_path"]["units"]:
        assert u["recall_probability"] == pytest.approx(1.0, abs=0.05)


def test_dashboard_lazily_backfills_missing_memory_traces(path_env):
    client, SessionLocal = path_env
    headers, user_id = _register_user(client, "backfill@upch.pe")

    from app.db.models import UserMemoryTrace
    db = SessionLocal()
    try:
        db.query(UserMemoryTrace).filter_by(user_id=user_id).delete()
        db.commit()
    finally:
        db.close()

    resp = client.get("/api/v1/leveling/dashboard", headers=headers)
    assert resp.status_code == 200
    dash = resp.json()
    assert "hlr_summary" in dash
    assert "learning_path" in dash
    assert len(dash["learning_path"]["units"]) == 5

    db = SessionLocal()
    try:
        count = db.query(UserMemoryTrace).filter_by(user_id=user_id).count()
        assert count == 5
    finally:
        db.close()


def test_auxiliary_specialty_attempt_does_not_corrupt_nefrologia_trace(path_env):
    client, SessionLocal = path_env
    headers, user_id = _register_user(client, "oftalmo_iso@upch.pe")
    _complete_diagnostic(client, headers, mode="general", all_correct=True)

    from app.db.models import UserMemoryTrace
    from app.services.student_service import student_service

    db = SessionLocal()
    try:
        nefro_before = (
            db.query(UserMemoryTrace)
            .filter_by(user_id=user_id, concept_key="nefrologia")
            .first()
        )
        assert nefro_before is not None
        h_before = nefro_before.half_life_days
        lapses_before = nefro_before.lapses_count

        student_service.record_mcq_attempt(
            db=db,
            user_id=user_id,
            case_id="s13256-024-04496-1",
            station_number=1,
            is_correct=False,
            gap="GAP_TRIAGE_SEVERITY",
            specialty="oftalmologia",
        )

        db.refresh(nefro_before)
        assert nefro_before.half_life_days == h_before
        assert nefro_before.lapses_count == lapses_before
    finally:
        db.close()


def test_secondary_case_overdue_task_does_not_trap_neurologia_unit_after_primary_rescue(path_env):
    from datetime import datetime, timezone, timedelta
    from app.db.models import SpacedRepetitionTask
    from app.services.student_service import student_service

    client, SessionLocal = path_env
    headers, user_id = _register_user(client, "neuro_rescue@upch.pe")
    _complete_diagnostic(client, headers, mode="general", all_correct=True)

    db = SessionLocal()
    try:
        # Pass primary neurologia case station 1
        student_service.record_mcq_attempt(
            db=db,
            user_id=user_id,
            case_id="s13256-023-04294-1",
            station_number=1,
            is_correct=True,
            specialty="neurologia",
        )
        # Insert an overdue task specifically on neurologia's SECONDARY case
        db.add(
            SpacedRepetitionTask(
                user_id=user_id,
                case_id="s13256-025-05577-5",
                gap_type="GAP_DIAGNOSTIC_REASONING",
                scheduled_for=datetime.now(timezone.utc) - timedelta(days=2),
                repetition_cycle="D7",
                status="pending",
            )
        )
        db.commit()
    finally:
        db.close()

    resp = client.get("/api/v1/leveling/learning-path", headers=headers)
    assert resp.status_code == 200
    neuro_unit = next(u for u in resp.json()["units"] if u["specialty"] == "neurologia")
    assert neuro_unit["nodes"][0]["status"] == "completed"
    assert neuro_unit["nodes"][1]["status"] == "active"

