import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db
from app.db.seeder import seed_initial_data


@pytest.fixture(autouse=True)
def cleanup_default_db():
    yield
    for db_name in ["odyssmedic.db", "./odyssmedic.db"]:
        if os.path.exists(db_name):
            try:
                os.remove(db_name)
            except OSError:
                pass


@pytest.fixture
def client(tmp_path):
    test_db_path = tmp_path / "test_api_integration.db"
    test_db_url = f"sqlite:///{test_db_path}"
    test_engine = create_engine(
        test_db_url,
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    # Seed initial canonical references and UPCH demo user
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


def test_health_and_root_endpoints(client: TestClient):
    """Verifica los endpoints de disponibilidad /health y /."""
    health_resp = client.get("/health")
    assert health_resp.status_code == 200
    health_data = health_resp.json()
    assert health_data["status"] == "healthy"
    assert "OdyssMedic" in health_data["service"]

    root_resp = client.get("/")
    assert root_resp.status_code == 200
    root_data = root_resp.json()
    assert "Bienvenido" in root_data["message"]
    assert root_data["health"] == "/health"


def test_auth_registration_and_login_flow(client: TestClient):
    """Verifica el flujo completo de registro, login y obtencion de token JWT."""
    # 1. Registro exitoso
    register_payload = {
        "email": "medico.interno@upch.pe",
        "password": "PasswordCayetano2026",
        "full_name": "Dr. Matias Rivera",
        "university": "Universidad Peruana Cayetano Heredia",
        "stage": "Internado Rotatorio 2026",
        "target_exam": "ENIM-EsSalud",
    }
    reg_resp = client.post("/api/v1/auth/register", json=register_payload)
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["token_type"] == "bearer"
    assert reg_data["user"]["email"] == "medico.interno@upch.pe"
    assert reg_data["user"]["plan_tier"] == "free"

    # 2. Intento de registro duplicado (debe retornar 400)
    dup_resp = client.post("/api/v1/auth/register", json=register_payload)
    assert dup_resp.status_code == 400

    # 3. Login exitoso con credenciales correctas
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "email": "medico.interno@upch.pe",
            "password": "PasswordCayetano2026",
        },
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    assert login_data["user"]["full_name"] == "Dr. Matias Rivera"

    # 4. Login fallido con contrasena incorrecta (debe retornar 401)
    bad_login = client.post(
        "/api/v1/auth/login",
        json={
            "email": "medico.interno@upch.pe",
            "password": "ContrasenaIncorrecta",
        },
    )
    assert bad_login.status_code == 401


def test_auth_me_endpoint_with_bearer_token(client: TestClient):
    """Verifica el endpoint protegido /auth/me con y sin token Bearer."""
    # 1. Sin cabecera Authorization (debe retornar 401)
    unauth_resp = client.get("/api/v1/auth/me")
    assert unauth_resp.status_code == 401

    # 2. Con token Bearer malformado (debe retornar 401)
    bad_token_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer token_invalido_xyz"},
    )
    assert bad_token_resp.status_code == 401

    # 3. Registro y consulta autenticada
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "doctora.peruana@upch.pe",
            "password": "SeguraPassword2026",
            "full_name": "Dra. Sofia Quispe",
        },
    )
    token = reg_resp.json()["access_token"]

    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == "doctora.peruana@upch.pe"
    assert me_data["full_name"] == "Dra. Sofia Quispe"
    assert me_data["plan_tier"] == "free"


def test_auth_toggle_plan_endpoint(client: TestClient):
    """Verifica la actualizacion y alternancia de plan suscripcion con /auth/toggle-plan."""
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "residente.plan@upch.pe",
            "password": "ClaveSegura2026",
            "full_name": "Dr. Plan Tier",
        },
    )
    token = reg_resp.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    # 1. Toggle sin body (cambia de free a premium)
    t1_resp = client.patch("/api/v1/auth/toggle-plan", headers=auth_headers)
    assert t1_resp.status_code == 200
    assert t1_resp.json()["plan_tier"] == "premium"

    # 2. Toggle sin body nuevamente (cambia de premium a free)
    t2_resp = client.patch("/api/v1/auth/toggle-plan", headers=auth_headers)
    assert t2_resp.status_code == 200
    assert t2_resp.json()["plan_tier"] == "free"

    # 3. Toggle con body explicito
    t3_resp = client.patch(
        "/api/v1/auth/toggle-plan",
        json={"plan_tier": "premium"},
        headers=auth_headers,
    )
    assert t3_resp.status_code == 200
    assert t3_resp.json()["plan_tier"] == "premium"


def test_specialties_catalog(client: TestClient):
    """Verifica el catalogo de especialidades medicas."""
    resp = client.get("/api/v1/specialties")
    assert resp.status_code == 200
    catalog = resp.json()
    assert len(catalog) >= 5
    specialty_ids = [item["specialty_id"] for item in catalog]
    assert "nefrologia" in specialty_ids

    # Casos por especialidad valida
    cases_resp = client.get("/api/v1/specialties/nefrologia/cases")
    assert cases_resp.status_code == 200
    assert len(cases_resp.json()) >= 1

    # Casos por especialidad inexistente (debe retornar 404)
    cases_404 = client.get("/api/v1/specialties/especialidad_inexistente/cases")
    assert cases_404.status_code == 404


def test_cases_and_stations_endpoints(client: TestClient):
    """Verifica la recuperacion de casos clinicos y estaciones MCQ para el estudiante."""
    # 1. Listado de casos
    cases_resp = client.get("/api/v1/cases")
    assert cases_resp.status_code == 200
    cases_list = cases_resp.json()
    assert len(cases_list) == 7

    case_id = "s13256-019-2334-y"

    # 2. Vineta clinica sanitizada
    vignette_resp = client.get(f"/api/v1/cases/{case_id}")
    assert vignette_resp.status_code == 200
    vignette = vignette_resp.json()
    assert vignette["case_id"] == case_id
    assert "patient" in vignette
    # Comprobar que no revela diagnostico ni ground truth
    assert "diagnosis" not in vignette
    assert "observed_interventions" not in vignette

    # 3. Estaciones MCQ del caso
    stations_resp = client.get(f"/api/v1/cases/{case_id}/stations")
    assert stations_resp.status_code == 200
    stations = stations_resp.json()
    assert len(stations) == 3

    # Comprobar sanitizacion de estaciones para estudiantes
    first_st = stations[0]
    assert first_st["station_number"] == 1
    assert len(first_st["options"]) == 4
    for opt in first_st["options"]:
        assert "option_id" in opt
        assert "text" in opt
        assert "is_correct" not in opt
        assert "rationale" not in opt

    # 4. Estacion individual por numero
    st1_resp = client.get(f"/api/v1/cases/{case_id}/stations/1")
    assert st1_resp.status_code == 200
    assert st1_resp.json()["station_number"] == 1

    # 5. Error 404 en caso inexistente o estacion invalida
    assert client.get("/api/v1/cases/caso_falso_99/stations").status_code == 404
    assert client.get(f"/api/v1/cases/{case_id}/stations/999").status_code == 404


def test_evaluation_submit_mcq_correct_option(client: TestClient):
    """Verifica el envio de una respuesta MCQ correcta en una estacion clinica."""
    # Registrar usuario
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "estudiante.acierto@upch.pe",
            "password": "PasswordAcierto2026",
            "full_name": "Dr. Respuesta Correcta",
        },
    )
    token = reg_resp.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    case_id = "s13256-019-2334-y"
    submission_payload = {
        "case_id": case_id,
        "station_number": 1,
        "chosen_option_id": "A",
        "response_time_ms": 4200,
    }

    resp = client.post(
        "/api/v1/evaluation/submit-mcq",
        json=submission_payload,
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_correct"] is True
    assert data["points_earned"] == 100.0
    assert data["correct_option_id"] == "A"
    assert data["chosen_option_id"] == "A"
    assert data["associated_gap"] is None
    assert data["citation_evidence"] is not None
    assert "Guía" in data["citation_evidence"]

    # Validar presencia de prescripcion de nivelacion
    assert "leveling_prescription" in data
    presc = data["leveling_prescription"]
    assert "prescription_id" in presc
    assert presc["specialty"] == "nefrologia"
    assert presc["difficulty_tier"] is not None

    # Verificar aumento de XP en perfil del estudiante (+25 XP por acierto)
    me_resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert me_resp.json()["xp"] == 25


def test_evaluation_submit_mcq_distractor_gap_diagnosis(client: TestClient):
    """Verifica el envio de una opcion distractora y la deteccion precisa de brecha cognitiva."""
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "estudiante.error@upch.pe",
            "password": "PasswordError2026",
            "full_name": "Dr. Error Formativo",
        },
    )
    token = reg_resp.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    case_id = "s13256-019-2334-y"
    # Opcion B en estacion 1 corresponde a distractor con brecha gap_triage_severity
    submission_payload = {
        "case_id": case_id,
        "station_number": 1,
        "chosen_option_id": "B",
        "response_time_ms": 6800,
    }

    resp = client.post(
        "/api/v1/evaluation/submit-mcq",
        json=submission_payload,
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_correct"] is False
    assert data["points_earned"] == 0.0
    # Validar prescripcion de nivelacion con la brecha detectada
    presc = data["leveling_prescription"]
    assert data["associated_gap"] == "GAP_TRIAGE_SEVERITY"
    assert presc["detected_gap"] == "GAP_TRIAGE_SEVERITY"
    assert presc["assigned_deficiency"] == "critica_seguridad"
    assert presc["next_repetition_date"] is not None


def test_evaluation_submit_mcq_unauthenticated_demo_fallback(client: TestClient):
    """Verifica que envios sin token utilicen el usuario demo UPCH de forma transparente."""
    submission_payload = {
        "case_id": "s13256-019-2334-y",
        "station_number": 1,
        "chosen_option_id": "A",
        "response_time_ms": 5000,
    }
    resp = client.post("/api/v1/evaluation/submit-mcq", json=submission_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_correct"] is True
    assert "leveling_prescription" in data


def test_evaluation_submit_mcq_station_not_found(client: TestClient):
    """Verifica respuesta 404 al enviar intento para estacion inexistente."""
    submission_payload = {
        "case_id": "s13256-019-2334-y",
        "station_number": 99,
        "chosen_option_id": "A",
    }
    resp = client.post("/api/v1/evaluation/submit-mcq", json=submission_payload)
    assert resp.status_code == 404


def test_leveling_dashboard_and_prescription_endpoints(client: TestClient):
    """Verifica los endpoints de nivelacion adaptativa y dashboard analitico."""
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "estudiante.dashboard@upch.pe",
            "password": "PasswordDash2026",
            "full_name": "Dr. Analitica Medico",
        },
    )
    token = reg_resp.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    # 1. Dashboard autenticado
    dash_resp = client.get("/api/v1/leveling/dashboard", headers=auth_headers)
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert dash_data["email"] == "estudiante.dashboard@upch.pe"
    assert len(dash_data["radar"]) == 5
    assert "ocri_score" in dash_data
    assert "pending_repetition_tasks" in dash_data

    # 2. Dashboard no autenticado (fallback a demo)
    demo_dash = client.get("/api/v1/leveling/dashboard")
    assert demo_dash.status_code == 200
    assert "demo" in demo_dash.json()["email"]

    # 3. Prescripcion de especialidad valida
    presc_resp = client.get("/api/v1/leveling/prescription/nefrologia", headers=auth_headers)
    assert presc_resp.status_code == 200
    presc_data = presc_resp.json()
    assert presc_data["specialty"] == "nefrologia"
    assert "target_exercise_ids" in presc_data
    assert "rationale" in presc_data

    # 4. Prescripcion de especialidad invalida (debe retornar 404)
    presc_404 = client.get("/api/v1/leveling/prescription/dermatologia_no_cardinal", headers=auth_headers)
    assert presc_404.status_code == 404


def test_references_books_and_case_citations(client: TestClient):
    """Verifica la recuperacion de referencias bibliograficas y extractos de guias."""
    # 1. Libros y compendios canonicos
    books_resp = client.get("/api/v1/references/books")
    assert books_resp.status_code == 200
    books = books_resp.json()
    assert len(books) >= 7
    book_titles = [b["title"] for b in books]
    assert any("Nefrología" in title or "Kidney" in title or "Brenner" in title for title in book_titles)

    # 2. Citas por caso clinico
    case_cits_resp = client.get("/api/v1/references/by-case/s13256-019-2334-y")
    assert case_cits_resp.status_code == 200
    cits = case_cits_resp.json()
    assert len(cits) >= 1
    assert "key_recommendation" in cits[0]

    # 3. Extractos por especialidad
    spec_excerpts_resp = client.get("/api/v1/references/by-specialty/nefrologia")
    assert spec_excerpts_resp.status_code == 200
    excerpts = spec_excerpts_resp.json()
    assert len(excerpts) >= 1


def test_cognitive_gaps_taxonomy_endpoint(client: TestClient):
    """Verifica el endpoint de taxonomia de brechas cognitivas OCRI."""
    resp = client.get("/api/v1/evaluation/taxonomy")
    assert resp.status_code == 200
    taxonomy = resp.json()
    assert len(taxonomy) == 4
    gap_ids = [item["gap_id"] for item in taxonomy]
    assert "GAP_TRIAGE_SEVERITY" in gap_ids
    assert "GAP_DIAGNOSTIC_REASONING" in gap_ids
    assert "GAP_LAB_INTERPRETATION" in gap_ids
    assert "GAP_INITIAL_MANAGEMENT" in gap_ids
