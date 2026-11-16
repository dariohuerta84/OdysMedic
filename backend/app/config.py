import os
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field


def resolve_database_url() -> str:
    """Resolve database URL across local dev, Vercel serverless /tmp fallback, and Postgres."""
    raw_url = (
        os.getenv("DATABASE_URL")
        or os.getenv("POSTGRES_URL")
        or os.getenv("POSTGRES_PRISMA_URL")
    )
    if raw_url:
        cleaned = raw_url.strip()
        if cleaned.startswith("postgres://"):
            return "postgresql://" + cleaned[len("postgres://") :]
        return cleaned

    if os.getenv("VERCEL") or os.getenv("VERCEL_ENV"):
        return "sqlite:////tmp/odyssmedic.db"

    return "sqlite:///./odyssmedic.db"


def resolve_cors_origins() -> List[str]:
    """Build allowed CORS origins for local development and Vercel deployments."""
    origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    for env_host in (
        os.getenv("VERCEL_URL"),
        os.getenv("VERCEL_BRANCH_URL"),
        os.getenv("VERCEL_PROJECT_PRODUCTION_URL"),
    ):
        if env_host:
            host = env_host.strip().removeprefix("https://").removeprefix("http://")
            origin = f"https://{host}"
            if origin not in origins:
                origins.append(origin)

    extra = os.getenv("CORS_ORIGINS", "")
    for item in extra.split(","):
        cleaned = item.strip()
        if cleaned and cleaned not in origins:
            origins.append(cleaned)
    return origins


class Settings(BaseModel):
    app_name: str = "OdyssMedic Backend API"
    app_version: str = "0.1.0"
    api_prefix: str = "/api/v1"

    # Path settings
    base_dir: Path = Path(__file__).resolve().parent.parent
    data_dir: Path = base_dir / "data"
    cases_file: Path = data_dir / "clinical_cases.json"
    medical_references_file: Path = data_dir / "medical_references.json"

    # Database settings
    database_url: str = Field(default_factory=resolve_database_url)

    # Authentication and JWT settings
    secret_key: str = Field(
        default_factory=lambda: os.getenv(
            "SECRET_KEY", "odyssmedic_super_secret_jwt_key_2026_upch"
        )
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    @property
    def jwt_secret(self) -> str:
        return self.secret_key

    # CORS settings
    cors_origins: List[str] = Field(default_factory=resolve_cors_origins)


settings = Settings()
