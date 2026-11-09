from sqlite3 import Connection as SQLite3Connection
from typing import Generator, Optional
from sqlalchemy import create_engine, event, inspect, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from app.config import settings

connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    echo=False,
)


@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, SQLite3Connection):
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute("PRAGMA foreign_keys=ON")
        except Exception:
            pass
        finally:
            cursor.close()


class Base(DeclarativeBase):
    pass


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _ensure_user_columns(target: Engine) -> None:
    """Idempotently adds new onboarding and diagnostic columns to existing SQLite databases."""
    try:
        inspector = inspect(target)
        if "users" not in inspector.get_table_names():
            return
        existing_cols = {col["name"] for col in inspector.get_columns("users")}
        column_migrations = [
            ("career", "VARCHAR(100) DEFAULT 'Medicina Humana'"),
            ("academic_year", "VARCHAR(100) DEFAULT 'Internado Medico'"),
            ("primary_goal", "VARCHAR(50) DEFAULT 'preparar_enam'"),
            ("initial_world", "VARCHAR(50) DEFAULT 'medicina_interna'"),
            ("interest_areas", "TEXT DEFAULT '[]'"),
            ("onboarding_track", "VARCHAR(30) DEFAULT 'ruta'"),
            ("privacy_accepted", "BOOLEAN DEFAULT 1"),
            ("diagnostic_completed", "BOOLEAN DEFAULT 0"),
            ("diagnostic_score", "FLOAT"),
            ("aptitude_status", "VARCHAR(50)"),
            ("diagnostic_mode", "VARCHAR(30)"),
            ("diagnostic_specialty", "VARCHAR(50)"),
            ("diagnostic_completed_at", "DATETIME"),
        ]
        with target.begin() as conn:
            for col_name, col_ddl in column_migrations:
                if col_name not in existing_cols:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_ddl}"))
    except Exception:
        pass


def init_db(bind_engine: Optional[Engine] = None) -> None:
    import app.db.models  # noqa: F401
    target = bind_engine if bind_engine is not None else engine
    Base.metadata.create_all(bind=target)
    _ensure_user_columns(target)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
