import os
from datetime import datetime, timedelta
import pytest
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import IntegrityError

from app.config import settings
from app.db.session import Base, engine, SessionLocal, init_db, get_db
from app.db.models import (
    User,
    StudentMastery,
    StudentGapMetric,
    CaseAttempt,
    MedicalReferenceDB,
    SpacedRepetitionTask,
)
from app.db.seeder import seed_initial_data, CARDINAL_SPECIALTIES


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
def isolated_db(tmp_path):
    db_file = tmp_path / "test_isolated.db"
    test_engine = create_engine(
        f"sqlite:///{db_file}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)
        test_engine.dispose()


def test_config_database_url():
    assert hasattr(settings, "database_url")
    assert settings.database_url is not None
    assert "sqlite" in settings.database_url or "postgresql" in settings.database_url


def test_init_db():
    init_db()
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    expected_tables = {
        "users",
        "student_mastery",
        "student_gap_metrics",
        "case_attempts",
        "medical_references",
        "spaced_repetition_tasks",
    }
    for table in expected_tables:
        assert table in table_names, f"Expected table {table} to be created"


def test_seed_initial_data(isolated_db: Session):
    summary = seed_initial_data(isolated_db)
    assert summary["references_seeded"] >= 6
    assert summary["demo_user_created"] is True
    assert summary["mastery_profiles_seeded"] == len(CARDINAL_SPECIALTIES)

    # Verify demo user
    user = isolated_db.query(User).filter_by(email="demo.medico@upch.pe").first()
    assert user is not None
    assert user.university == "Universidad Peruana Cayetano Heredia"
    assert user.stage == "Internado Rotatorio 2026"
    assert user.target_exam == "ENIM-EsSalud"
    assert user.plan_tier == "free"
    assert user.xp == 0
    assert user.streak_days == 1

    # Verify 5 cardinal specialties
    masteries = isolated_db.query(StudentMastery).filter_by(user_id=user.id).all()
    assert len(masteries) == 5
    specialties_seeded = {m.specialty for m in masteries}
    assert specialties_seeded == set(CARDINAL_SPECIALTIES)
    for m in masteries:
        assert m.mastery_score == 50.0
        assert m.competency_level == "deficiente"
        assert m.cases_completed == 0

    # Verify canonical references
    refs = isolated_db.query(MedicalReferenceDB).all()
    assert len(refs) >= 6
    kdigo_ref = isolated_db.query(MedicalReferenceDB).filter_by(ref_id="ref-kdigo-ahus-001").first()
    assert kdigo_ref is not None
    assert "KDIGO" in kdigo_ref.title
    assert kdigo_ref.specialty == "nefrologia"
    assert kdigo_ref.evidence_level == "Grade 1A"


def test_seed_initial_data_idempotency(isolated_db: Session):
    # First seed
    summary1 = seed_initial_data(isolated_db)
    assert summary1["demo_user_created"] is True

    # Second seed must not fail or duplicate
    summary2 = seed_initial_data(isolated_db)
    assert summary2["demo_user_created"] is False
    assert summary2["references_seeded"] == 0
    assert summary2["mastery_profiles_seeded"] == 0

    # Counts must remain identical
    users_count = isolated_db.query(User).filter_by(email="demo.medico@upch.pe").count()
    assert users_count == 1

    mastery_count = isolated_db.query(StudentMastery).count()
    assert mastery_count == len(CARDINAL_SPECIALTIES)

    refs_count = isolated_db.query(MedicalReferenceDB).count()
    assert refs_count >= 6


def test_case_attempt_persistence(isolated_db: Session):
    seed_initial_data(isolated_db)
    user = isolated_db.query(User).filter_by(email="demo.medico@upch.pe").first()

    attempt = CaseAttempt(
        user_id=user.id,
        case_id="s13256-019-2334-y",
        station_id=1,
        score=85.5,
        passed=True,
        selected_option="opt_plasma_exchange",
        response_time_ms=1240,
        detected_gap="GAP_INITIAL_MANAGEMENT",
    )
    isolated_db.add(attempt)
    isolated_db.commit()
    isolated_db.refresh(attempt)

    assert attempt.id is not None
    assert attempt.user_id == user.id
    assert attempt.case_id == "s13256-019-2334-y"
    assert attempt.score == 85.5
    assert attempt.passed is True
    assert attempt.selected_option == "opt_plasma_exchange"
    assert attempt.response_time_ms == 1240
    assert attempt.detected_gap == "GAP_INITIAL_MANAGEMENT"
    assert isinstance(attempt.created_at, datetime)

    # Check relationship navigation
    assert attempt in user.attempts


def test_spaced_repetition_task_persistence(isolated_db: Session):
    seed_initial_data(isolated_db)
    user = isolated_db.query(User).filter_by(email="demo.medico@upch.pe").first()

    sched_date = datetime.utcnow() + timedelta(days=7)
    task = SpacedRepetitionTask(
        user_id=user.id,
        case_id="s13256-022-03392-w",
        gap_type="GAP_LAB_INTERPRETATION",
        scheduled_for=sched_date,
        repetition_cycle="D7",
        status="pending",
    )
    isolated_db.add(task)
    isolated_db.commit()
    isolated_db.refresh(task)

    assert task.id is not None
    assert task.user_id == user.id
    assert task.gap_type == "GAP_LAB_INTERPRETATION"
    assert task.repetition_cycle == "D7"
    assert task.status == "pending"
    assert task in user.repetition_tasks


def test_student_gap_metric_persistence(isolated_db: Session):
    seed_initial_data(isolated_db)
    user = isolated_db.query(User).filter_by(email="demo.medico@upch.pe").first()

    metric = StudentGapMetric(
        user_id=user.id,
        gap_type="GAP_DIAGNOSTIC_REASONING",
        fail_count=3,
        last_concept="ADAMTS13 Activity and Microangiopathy",
    )
    isolated_db.add(metric)
    isolated_db.commit()
    isolated_db.refresh(metric)

    assert metric.id is not None
    assert metric.user_id == user.id
    assert metric.fail_count == 3
    assert metric.last_concept == "ADAMTS13 Activity and Microangiopathy"
    assert metric in user.gap_metrics


def test_sqlite_foreign_key_enforcement(isolated_db: Session):
    orphan_attempt = CaseAttempt(
        user_id=999999,
        case_id="s13256-019-2334-y",
        station_id=1,
        score=0.0,
        passed=False,
    )
    isolated_db.add(orphan_attempt)
    with pytest.raises(IntegrityError):
        isolated_db.commit()
    isolated_db.rollback()


def test_cascade_deletion(isolated_db: Session):
    seed_initial_data(isolated_db)
    user = isolated_db.query(User).filter_by(email="demo.medico@upch.pe").first()
    user_id = user.id

    # Add an attempt and repetition task
    attempt = CaseAttempt(
        user_id=user_id,
        case_id="s13256-019-2334-y",
        score=70.0,
        passed=True,
    )
    task = SpacedRepetitionTask(
        user_id=user_id,
        case_id="s13256-019-2334-y",
        gap_type="GAP_TRIAGE_SEVERITY",
        scheduled_for=datetime.utcnow() + timedelta(days=21),
    )
    isolated_db.add_all([attempt, task])
    isolated_db.commit()

    # Delete user
    isolated_db.delete(user)
    isolated_db.commit()

    # Verify cascaded removal
    assert isolated_db.query(StudentMastery).filter_by(user_id=user_id).count() == 0
    assert isolated_db.query(CaseAttempt).filter_by(user_id=user_id).count() == 0
    assert isolated_db.query(SpacedRepetitionTask).filter_by(user_id=user_id).count() == 0


def test_get_db_generator():
    db_gen = get_db()
    db = next(db_gen)
    try:
        assert isinstance(db, Session)
        assert db.is_active
    finally:
        with pytest.raises(StopIteration):
            next(db_gen)
