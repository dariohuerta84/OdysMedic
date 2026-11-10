import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db
from app.db.seeder import seed_initial_data


@pytest.fixture
def client(tmp_path):
    test_db_path = tmp_path / "test_time_sim.db"
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
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


def _register_and_calibrate(client: TestClient, email: str, correct_all: bool = False):
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "Password123!",
            "full_name": "Interno Longitudinal",
            "university": "UPCH",
            "career": "Medicina Humana",
            "academic_year": "Internado Medico",
            "primary_goal": "preparar_enam",
            "initial_world": "medicina_interna",
            "interest_areas": ["nefrologia"],
            "privacy_accepted": True,
        },
    )
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    qs = client.get("/api/v1/leveling/diagnostic/questions?mode=general", headers=headers).json()
    answers = []
    for idx, q in enumerate(qs):
        if correct_all:
            # Find correct option from bank by testing or known answers
            from app.db.diagnostic_bank import resolve_diagnostic_question_set
            bank_qs = {bq["id"]: bq for bq in resolve_diagnostic_question_set(mode="general")}
            corr = next(o["id"] for o in bank_qs[q["id"]]["options"] if o.get("is_correct"))
            answers.append({"question_id": q["id"], "selected_option_id": corr})
        else:
            from app.db.diagnostic_bank import resolve_diagnostic_question_set
            bank_qs = {bq["id"]: bq for bq in resolve_diagnostic_question_set(mode="general")}
            corr = next(o["id"] for o in bank_qs[q["id"]]["options"] if o.get("is_correct"))
            wrong = next(o["id"] for o in bank_qs[q["id"]]["options"] if o["id"] != corr)
            # 3/5 = 60% (en_nivelacion, mixes immediate + D7 future tasks)
            chosen = corr if idx < 3 else wrong
            answers.append({"question_id": q["id"], "selected_option_id": chosen})

    sub = client.post(
        "/api/v1/leveling/diagnostic/submit",
        json={"mode": "general", "answers": answers},
        headers=headers,
    )
    assert sub.status_code == 200
    return headers


def test_simulate_days_active_streak_activates_d7_and_d21_tasks(client: TestClient):
    headers = _register_and_calibrate(client, "sim_active_d7@odyssmedic.pe", correct_all=False)

    dash0 = client.get("/api/v1/leveling/dashboard", headers=headers).json()
    assert dash0["simulated_days_elapsed"] == 0
    tasks0 = dash0["pending_repetition_tasks"]
    assert len(tasks0) == 2
    # In 60% score, 1st task is overdue today, 2nd task is scheduled for D+7
    future_tasks = [t for t in tasks0 if not t["is_overdue"]]
    assert len(future_tasks) == 1
    assert future_tasks[0]["days_until_due"] >= 6

    # Advance +7 days with active_streak
    sim7 = client.post(
        "/api/v1/leveling/simulate-days",
        json={"days": 7, "mode": "active_streak"},
        headers=headers,
    )
    assert sim7.status_code == 200
    res7 = sim7.json()
    assert res7["simulated_days_elapsed"] == 7
    assert res7["current_streak_days"] == 8
    assert res7["ocri_delta"] > 0

    tasks7 = res7["dashboard"]["pending_repetition_tasks"]
    assert all(t["is_overdue"] is True for t in tasks7)

    # Reset back to Day 0
    sim_reset = client.post(
        "/api/v1/leveling/simulate-days",
        json={"days": 0, "mode": "reset"},
        headers=headers,
    )
    assert sim_reset.status_code == 200
    res_reset = sim_reset.json()
    assert res_reset["simulated_days_elapsed"] == 0
    assert res_reset["current_streak_days"] == 1


def test_simulate_days_inactivity_decay_applies_ebbinghaus_curve(client: TestClient):
    headers = _register_and_calibrate(client, "sim_ebbinghaus@odyssmedic.pe", correct_all=True)

    dash0 = client.get("/api/v1/leveling/dashboard", headers=headers).json()
    assert dash0["ocri_score"] == 100.0
    assert dash0["aptitude_status"] == "apto"

    # Simulate 14 days without studying (forgetting curve)
    sim_decay = client.post(
        "/api/v1/leveling/simulate-days",
        json={"days": 14, "mode": "inactivity_decay"},
        headers=headers,
    )
    assert sim_decay.status_code == 200
    data = sim_decay.json()
    assert data["simulated_days_elapsed"] == 14
    assert data["current_streak_days"] == 0
    assert data["ocri_delta"] <= -20.0
    assert data["total_overdue_reviews"] >= 2

    # Simulate another 14 days of inactivity -> drops into critical (< 60%)
    sim_decay_2 = client.post(
        "/api/v1/leveling/simulate-days",
        json={"days": 14, "mode": "inactivity_decay"},
        headers=headers,
    )
    assert sim_decay_2.status_code == 200
    data2 = sim_decay_2.json()
    assert data2["current_ocri_score"] <= 60.0
    radar_vals = list(data2["dashboard"]["cognitive_gap_radar"].values())
    assert all(v <= 70 for v in radar_vals)
