from fastapi.testclient import TestClient

from app.config import resolve_cors_origins, resolve_database_url
from main import app as root_entrypoint_app


def test_resolve_database_url_normalizes_postgres_and_vercel_tmp(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("POSTGRES_URL", raising=False)
    monkeypatch.delenv("POSTGRES_PRISMA_URL", raising=False)
    monkeypatch.delenv("VERCEL", raising=False)
    monkeypatch.delenv("VERCEL_ENV", raising=False)

    assert resolve_database_url() == "sqlite:///./odyssmedic.db"

    monkeypatch.setenv("VERCEL", "1")
    assert resolve_database_url() == "sqlite:////tmp/odyssmedic.db"

    monkeypatch.setenv("DATABASE_URL", "postgres://user:pass@db.example.com:5432/odyss")
    assert resolve_database_url() == "postgresql://user:pass@db.example.com:5432/odyss"


def test_resolve_cors_origins_includes_vercel_hosts(monkeypatch):
    monkeypatch.setenv("VERCEL_URL", "odyssmedic-preview.vercel.app")
    monkeypatch.setenv("VERCEL_PROJECT_PRODUCTION_URL", "odyssmedic.vercel.app")
    monkeypatch.setenv("CORS_ORIGINS", "https://custom.odyssmedic.pe")

    origins = resolve_cors_origins()
    assert "https://odyssmedic-preview.vercel.app" in origins
    assert "https://odyssmedic.vercel.app" in origins
    assert "https://custom.odyssmedic.pe" in origins


def test_root_entrypoint_and_health_endpoints():
    client = TestClient(root_entrypoint_app)
    for path in ("/health", "/api/health", "/api/v1/health"):
        resp = client.get(path)
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"


def test_vercel_config_routes_backend_portal_and_docs():
    import json
    from pathlib import Path

    vercel_cfg = json.loads((Path(__file__).resolve().parents[2] / "vercel.json").read_text(encoding="utf-8"))
    backend_sources = {
        r["source"]
        for r in vercel_cfg.get("rewrites", [])
        if isinstance(r.get("destination"), dict) and r["destination"].get("service") == "backend"
    }
    assert "/portal" in backend_sources
    assert "/docs" in backend_sources
    assert "/health" in backend_sources
