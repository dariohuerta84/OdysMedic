import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db
from app.db.seeder import seed_initial_data
from app.services.reference_service import ReferenceRepository


@pytest.fixture
def client(tmp_path):
    test_db_path = tmp_path / "test_onboarding_modes.db"
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


def test_progressive_registration_fields_persisted(client: TestClient):
    payload = {
        "email": "camila.ruta@medicina.pe",
        "password": "RutaSegura2026",
        "full_name": "Camila Paredes",
        "university": "Universidad Nacional Mayor de San Marcos",
        "career": "Medicina Humana",
        "academic_year": "6to Ano - Pre-Internado",
        "primary_goal": "preparar_enam",
        "initial_world": "pediatria",
        "interest_areas": ["cardiologia", "infectologia", "urgencias"],
        "onboarding_track": "ruta",
        "privacy_accepted": True,
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 200
    body = res.json()
    token = body["access_token"]
    user = body["user"]

    assert user["career"] == "Medicina Humana"
    assert user["academic_year"] == "6to Ano - Pre-Internado"
    assert user["primary_goal"] == "preparar_enam"
    assert user["initial_world"] == "pediatria"
    assert user["interest_areas"] == ["cardiologia", "infectologia", "urgencias"]
    assert user["onboarding_track"] == "ruta"
    assert user["privacy_accepted"] is True
    assert user["diagnostic_completed"] is False

    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["initial_world"] == "pediatria"
    assert me_data["interest_areas"] == ["cardiologia", "infectologia", "urgencias"]


def test_single_specialty_diagnostic_exam_mode(client: TestClient):
    spec_res = client.get("/api/v1/leveling/diagnostic/specialties")
    assert spec_res.status_code == 200
    spec_ids = {item["id"] for item in spec_res.json()}
    assert {"medicina_interna", "pediatria", "ginecologia_obstetricia", "cirugia_general", "medicina_familiar", "nefrologia"}.issubset(spec_ids)

    q_res = client.get("/api/v1/leveling/diagnostic/questions?mode=specialty&specialty=pediatria")
    assert q_res.status_code == 200
    questions = q_res.json()
    assert len(questions) == 5
    assert all(q["specialty"] == "pediatria" for q in questions)
    assert [q["id"] for q in questions] == [4, 13, 14, 15, 16]

    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "pediatra.eval@medicina.pe",
            "password": "Pediatria2026",
            "full_name": "Mateo Rios",
            "initial_world": "pediatria",
        },
    )
    token = reg_res.json()["access_token"]

    # In diagnostic_bank, option 'a' is correct across questions 4, 13, 14, 15, 16
    answers = [{"question_id": q["id"], "selected_option_id": "a"} for q in questions]
    sub_res = client.post(
        "/api/v1/leveling/diagnostic/submit",
        json={"answers": answers, "mode": "specialty", "specialty": "pediatria"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["diagnostic_score"] == 100.0
    assert sub_data["diagnostic_mode"] == "specialty"
    assert sub_data["diagnostic_specialty"] == "pediatria"
    assert sub_data["aptitude_status"] == "apto"

    dash_res = client.get("/api/v1/leveling/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert dash_res.status_code == 200
    dash = dash_res.json()
    assert dash["diagnostic_mode"] == "specialty"
    assert dash["diagnostic_specialty"] == "pediatria"
    assert dash["specialties"]["pediatria"]["score"] == 100.0


def test_every_specialty_has_multiple_sources_and_clinical_data_collection():
    repo = ReferenceRepository()
    expected_specialties = [
        "nefrologia",
        "endocrinologia",
        "neurologia",
        "reumatologia",
        "ginecologia_obstetricia",
        "oftalmologia",
        "medicina_interna",
        "pediatria",
        "cirugia_general",
    ]
    for spec in expected_specialties:
        excerpts = repo.get_excerpts_by_specialty(spec)
        assert len(excerpts) >= 3, f"Specialty {spec} must have at least 3 distinct sources"
        distinct_titles = {e.source_title for e in excerpts}
        assert len(distinct_titles) >= 3, f"Specialty {spec} must have at least 3 distinct source titles"
        for ex in excerpts:
            assert len(ex.anamnesis_checklist) >= 3
            assert len(ex.physical_exam_signs) >= 3
            assert len(ex.diagnostic_cutoffs) >= 3
            assert len(ex.red_flags) >= 3


def test_low_diagnostic_score_calibrates_low_radar_masteries_and_adaptive_reviews(
    client: TestClient,
):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "baja.nota@medicina.pe",
            "password": "Ruta2026Password",
            "full_name": "Lucia Mendoza",
            "initial_world": "nefrologia",
        },
    )
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]

    # 1 correct (Q1='b') and 4 incorrect -> 20.0% (no_apto)
    low_answers = [
        {"question_id": 1, "selected_option_id": "b"},
        {"question_id": 2, "selected_option_id": "b"},
        {"question_id": 3, "selected_option_id": "a"},
        {"question_id": 4, "selected_option_id": "b"},
        {"question_id": 5, "selected_option_id": "b"},
    ]
    sub_res = client.post(
        "/api/v1/leveling/diagnostic/submit",
        json={"answers": low_answers, "mode": "general"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert sub_res.status_code == 200
    sub = sub_res.json()
    assert sub["diagnostic_score"] == 20.0
    assert sub["aptitude_status"] == "no_apto"

    dash_res = client.get(
        "/api/v1/leveling/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert dash_res.status_code == 200
    dash = dash_res.json()

    # 1. Cognitive gap radar must reflect low grades (< 35% on every axis, never 78-85%)
    gap_radar = dash["cognitive_gap_radar"]
    assert set(gap_radar.keys()) == {
        "GAP_TRIAGE_SEVERITY",
        "GAP_DIAGNOSTIC_REASONING",
        "GAP_LAB_INTERPRETATION",
        "GAP_INITIAL_MANAGEMENT",
    }
    assert all(val <= 35 for val in gap_radar.values()), f"Expected low radar scores, got {gap_radar}"
    assert min(gap_radar.values()) <= 15

    # 2. Cardinal specialty scores and global OCRI must reflect low baseline (<= 25%)
    assert dash["ocri_score"] <= 25.0
    assert dash["specialties"]["nefrologia"]["score"] <= 20.0
    assert dash["specialties"]["endocrinologia"]["score"] <= 20.0

    # 3. Spaced repetition tasks must adaptively schedule urgent reviews with clinical titles
    tasks = dash["pending_repetition_tasks"]
    assert len(tasks) >= 3
    for t in tasks:
        assert t["case_title"] and not t["case_title"].startswith("Revision:")
        assert t["specialty_name"]
        assert t["priority"] == "urgent"
        assert t["is_overdue"] is True


def test_zero_score_specialty_diagnostic_sets_red_baseline_everywhere(
    client: TestClient,
):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "cero.especialidad@medicina.pe",
            "password": "Ruta2026Password",
            "full_name": "Diego Quispe",
            "initial_world": "medicina_interna",
        },
    )
    token = reg_res.json()["access_token"]

    q_res = client.get(
        "/api/v1/leveling/diagnostic/questions?mode=specialty&specialty=medicina_interna"
    )
    questions = q_res.json()
    # Select wrong option 'd' for all 5 questions (0.0%)
    wrong_answers = [{"question_id": q["id"], "selected_option_id": "d"} for q in questions]

    sub_res = client.post(
        "/api/v1/leveling/diagnostic/submit",
        json={
            "answers": wrong_answers,
            "mode": "specialty",
            "specialty": "medicina_interna",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert sub_res.status_code == 200
    assert sub_res.json()["diagnostic_score"] == 0.0

    dash_res = client.get(
        "/api/v1/leveling/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    dash = dash_res.json()
    assert dash["ocri_score"] == 0.0
    assert all(v <= 15 for v in dash["cognitive_gap_radar"].values())
    assert len(dash["pending_repetition_tasks"]) == 5
