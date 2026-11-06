import os
from pathlib import Path
from pydantic import BaseModel, Field

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
    database_url: str = Field(default_factory=lambda: os.getenv("DATABASE_URL", "sqlite:///./odyssmedic.db"))
    
    # Authentication and JWT settings
    secret_key: str = Field(default_factory=lambda: os.getenv("SECRET_KEY", "odyssmedic_super_secret_jwt_key_2026_upch"))
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    @property
    def jwt_secret(self) -> str:
        return self.secret_key

    # CORS settings
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

settings = Settings()
