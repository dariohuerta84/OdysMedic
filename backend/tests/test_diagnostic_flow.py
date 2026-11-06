import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db
from app.db.seeder import seed_initial_data
from app.services.auth_service import auth_service
from app.db.diagnostic_bank import DIAGNOSTIC_QUESTIONS


@pytest.fixture
def client(tmp_path):
    test_db_path = tmp_path / "test_diagnostic.db"
    test_db_url = f"sqlite:///{test_db_path}"
    test_engine = create_engine(
        test_db_url,
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
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


def test_diagnostic_questions_sanitized(client: TestClient):
    response = client.get("/api/v1/leveling/diagnostic/questions")
    assert response.status_code == 200
    questions = response.json()
    assert len(questions) == 5

    for q in questions:
        assert "id" in q
        assert "vignette" in q
        assert "question" in q
        assert "vital_signs" in q
        assert "options" in q
        assert len(q["options"]) == 4
        for opt in q["options"]:
            assert "id" in opt
            assert "text" in opt
            # Internal fields hidden from students
            assert "is_correct" not in opt
            assert "detected_gap" not in opt
            assert "explanation" not in opt


def test_submit_diagnostic_apto_all_correct(client: TestClient):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "doctor.apto@upch.pe",
            "password": "AptoPassword2026",
            "full_name": "Dr. Evaluado Apto",
        },
    )
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    token = reg_data["access_token"]
    assert reg_data["user"]["diagnostic_completed"] is False
    assert reg_data["user"]["diagnostic_score"] is None
    assert reg_data["user"]["aptitude_status"] is None

    # Correct answers: q1:b, q2:a, q3:b, q4:a, q5:a
    correct_answers = [
        {"question_id": 1, "selected_option_id": "b"},
        {"question_id": 2, "selected_option_id": "a"},
        {"question_id": 3, "selected_option_id": "b"},
        {"question_id": 4, "selected_option_id": "a"},
        {"question_id": 5, "selected_option_id": "a"},
    ]

    res = client.post(
        "/api/v1/leveling/diagnostic/submit",
        json={"answers": correct_answers},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["diagnostic_score"] == 100.0
    assert data["aptitude_status"] == "apto"
    assert data["correct_count"] == 5
    assert data["xp_earned"] == 100

    dash_res = client.get(
        "/api/v1/leveling/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert dash_res.status_code == 200
    dash = dash_res.json()
    assert dash["diagnostic_completed"] is True
    assert dash["diagnostic_score"] == 100.0
    assert dash["aptitude_status"] == "apto"


def test_submit_diagnostic_en_nivelacion_partial(client: TestClient):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "doctor.nivelacion@upch.pe",
            "password": "NivelacionPassword2026",
            "full_name": "Dr. En Nivelacion",
        },
    )
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]

    # 3 correct, 2 incorrect -> 60.0%
    mixed_answers = [
        {"question_id": 1, "selected_option_id": "b"},
        {"question_id": 2, "selected_option_id": "a"},
        {"question_id": 3, "selected_option_id": "b"},
        {"question_id": 4, "selected_option_id": "c"},
        {"question_id": 5, "selected_option_id": "c"},
    ]

    res = client.post(
        "/api/v1/leveling/diagnostic/submit",
        json={"answers": mixed_answers},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["diagnostic_score"] == 60.0
    assert data["aptitude_status"] == "en_nivelacion"
    assert data["correct_count"] == 3
    assert len(data["detected_gaps"]) >= 1

    dash_res = client.get(
        "/api/v1/leveling/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert dash_res.status_code == 200
    dash = dash_res.json()
    assert dash["diagnostic_completed"] is True
    assert dash["diagnostic_score"] == 60.0
    assert dash["aptitude_status"] == "en_nivelacion"


def test_submit_diagnostic_no_apto(client: TestClient):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "doctor.noapto@upch.pe",
            "password": "NoAptoPassword2026",
            "full_name": "Dr. Refuerzo Urgente",
        },
    )
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]

    # 1 correct, 4 incorrect -> 20.0%
    failing_answers = [
        {"question_id": 1, "selected_option_id": "b"},
        {"question_id": 2, "selected_option_id": "b"},
        {"question_id": 3, "selected_option_id": "a"},
        {"question_id": 4, "selected_option_id": "b"},
        {"question_id": 5, "selected_option_id": "b"},
    ]

    res = client.post(
        "/api/v1/leveling/diagnostic/submit",
        json={"answers": failing_answers},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["diagnostic_score"] == 20.0
    assert data["aptitude_status"] == "no_apto"

    dash_res = client.get(
        "/api/v1/leveling/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert dash_res.status_code == 200
    dash = dash_res.json()
    assert dash["diagnostic_completed"] is True
    assert dash["diagnostic_score"] == 20.0
    assert dash["aptitude_status"] == "no_apto"
