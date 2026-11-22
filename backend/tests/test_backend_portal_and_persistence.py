import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db, get_storage_status
from app.db.models import UserMemoryTrace
from app.db.seeder import seed_initial_data


@pytest.fixture
def client(tmp_path):
    test_db_path = tmp_path / "test_persist.db"
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


def test_email_normalization_prevents_duplicates_and_allows_case_insensitive_login(client: TestClient):
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": "  Doctor.Test@UPCH.pe ",
            "password": "Password123!",
            "full_name": "Dra. Prueba Persistencia",
        },
    )
    assert reg.status_code == 200
    assert reg.json()["user"]["email"] == "doctor.test@upch.pe"

    dup = client.post(
        "/api/v1/auth/register",
        json={
            "email": "doctor.test@upch.pe",
            "password": "Password123!",
            "full_name": "Duplicada",
        },
    )
    assert dup.status_code == 400

    login = client.post(
        "/api/v1/auth/login",
        json={
            "email": "DOCTOR.TEST@upch.pe ",
            "password": "Password123!",
        },
    )
    assert login.status_code == 200
    assert login.json()["user"]["email"] == "doctor.test@upch.pe"


def test_health_reports_storage_mode_and_persistent_flag(client: TestClient):
    status_info = get_storage_status()
    assert status_info["storage_mode"] in ("sqlite_local", "sqlite_ephemeral", "postgresql")
    assert isinstance(status_info["persistent"], bool)

    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["storage_mode"] in ("sqlite_local", "sqlite_ephemeral", "postgresql")
    assert isinstance(data["persistent"], bool)
    assert UserMemoryTrace.__tablename__ == "user_memory_traces"
