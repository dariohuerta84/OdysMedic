import os
from datetime import datetime, timezone, timedelta
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.db.session import Base
from app.db.models import (
    User,
    StudentMastery,
    StudentGapMetric,
    CaseAttempt,
    SpacedRepetitionTask,
)
from app.db.seeder import CARDINAL_SPECIALTIES, DEMO_USER_EMAIL
from app.models.enums import MedicalSpecialty, CognitiveGap, StudentCompetencyLevel
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.services.student_service import student_service


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
    db_file = tmp_path / "test_student_service.db"
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


def test_password_hashing_and_verification():
    raw_password = "CayetanoMedicina2026!"
    hashed = hash_password(raw_password)
    assert hashed != raw_password
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword123", hashed) is False
    assert verify_password("", hashed) is False
    assert verify_password(raw_password, "corrupted_hash") is False


def test_jwt_creation_and_decoding():
    payload = {"sub": "dr.cayetano@upch.pe", "role": "intern", "user_id": 42}
    token = create_access_token(payload)
    assert isinstance(token, str)
    assert len(token) > 20

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "dr.cayetano@upch.pe"
    assert decoded["role"] == "intern"
    assert decoded["user_id"] == 42
    assert "exp" in decoded
    assert decoded["exp"] > datetime.now(timezone.utc).timestamp()


def test_jwt_expiration_and_invalid_token():
    payload = {"sub": "expired.intern@upch.pe"}
    expired_token = create_access_token(payload, expires_delta=timedelta(seconds=-10))
    decoded_expired = decode_access_token(expired_token)
    assert decoded_expired is None

    assert decode_access_token("not.a.valid.jwt.token") is None
    assert decode_access_token("") is None


def test_register_user_and_cardinal_specialties_initialization(isolated_db: Session):
    user = student_service.register_user(
        db=isolated_db,
        email="intern.upch@upch.pe",
        password="ValidPassword2026",
        full_name="Interno UPCH",
        university="Universidad Peruana Cayetano Heredia",
        stage="Internado Rotatorio 2026",
        target_exam="ENIM-EsSalud",
    )
    assert user.id is not None
    assert user.email == "intern.upch@upch.pe"
    assert user.full_name == "Interno UPCH"
    assert user.plan_tier == "free"
    assert user.xp == 0
    assert user.streak_days == 1
    assert verify_password("ValidPassword2026", user.password_hash) is True

    masteries = isolated_db.query(StudentMastery).filter_by(user_id=user.id).all()
    assert len(masteries) == 5
    specialty_names = {m.specialty for m in masteries}
    assert specialty_names == set(CARDINAL_SPECIALTIES)
    for m in masteries:
        assert m.mastery_score == 50.0
        assert m.competency_level == "deficiente"
        assert m.cases_completed == 0


def test_register_user_duplicate_prevention(isolated_db: Session):
    student_service.register_user(
        db=isolated_db,
        email="duplicate.medico@upch.pe",
        password="Pass1",
        full_name="Medico 1",
    )
    with pytest.raises(ValueError) as excinfo:
        student_service.register_user(
            db=isolated_db,
            email="duplicate.medico@upch.pe",
            password="Pass2",
            full_name="Medico 2",
        )
    assert "already registered" in str(excinfo.value).lower()


def test_authenticate_user_success_and_failure(isolated_db: Session):
    email = "auth.test@upch.pe"
    password = "CorrectSecretPassword"
    user = student_service.register_user(
        db=isolated_db,
        email=email,
        password=password,
        full_name="Dr. Test Autenticacion",
    )

    authenticated = student_service.authenticate_user(isolated_db, email, password)
    assert authenticated is not None
    assert authenticated.id == user.id

    assert student_service.authenticate_user(isolated_db, email, "WrongSecret") is None
    assert student_service.authenticate_user(isolated_db, "nonexistent@upch.pe", password) is None


def test_get_or_create_demo_user(isolated_db: Session):
    demo_user = student_service.get_or_create_demo_user(isolated_db)
    assert demo_user is not None
    assert demo_user.email == DEMO_USER_EMAIL

    same_user = student_service.get_or_create_demo_user(isolated_db)
    assert same_user.id == demo_user.id


def test_get_specialty_mastery(isolated_db: Session):
    user = student_service.register_user(
        db=isolated_db,
        email="mastery.student@upch.pe",
        password="Password123",
        full_name="Estudiante Maestria",
    )

    profile = student_service.get_specialty_mastery(isolated_db, user.id, MedicalSpecialty.NEFROLOGIA)
    assert profile.specialty == MedicalSpecialty.NEFROLOGIA
    assert profile.score == 50.0
    assert profile.level == StudentCompetencyLevel.DEFICIENTE
    assert profile.needs_leveling is True

    profile_string_spec = student_service.get_specialty_mastery(isolated_db, user.id, "endocrinologia")
    assert profile_string_spec.specialty == MedicalSpecialty.ENDOCRINOLOGIA
    assert profile_string_spec.score == 50.0


def test_record_mcq_attempt_failure(isolated_db: Session):
    user = student_service.register_user(
        db=isolated_db,
        email="fail.attempt@upch.pe",
        password="Password123",
        full_name="Estudiante Con Fallo",
    )

    initial_xp = user.xp
    prescription = student_service.record_mcq_attempt(
        db=isolated_db,
        user_id=user.id,
        case_id="s13256-019-2334-y",
        station_number=1,
        is_correct=False,
        gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
        specialty=MedicalSpecialty.NEFROLOGIA,
        response_time_ms=12000,
    )

    isolated_db.refresh(user)
    assert user.xp == initial_xp + 5

    attempt = isolated_db.query(CaseAttempt).filter_by(user_id=user.id, case_id="s13256-019-2334-y").first()
    assert attempt is not None
    assert attempt.passed is False
    assert attempt.score == 0.0
    assert attempt.detected_gap == CognitiveGap.GAP_TRIAGE_SEVERITY.value
    assert attempt.response_time_ms == 12000

    gap_metric = isolated_db.query(StudentGapMetric).filter_by(
        user_id=user.id,
        gap_type=CognitiveGap.GAP_TRIAGE_SEVERITY.value,
    ).first()
    assert gap_metric is not None
    assert gap_metric.fail_count == 1
    assert gap_metric.last_concept == "s13256-019-2334-y"

    task = isolated_db.query(SpacedRepetitionTask).filter_by(user_id=user.id, case_id="s13256-019-2334-y").first()
    assert task is not None
    assert task.repetition_cycle == "D7"
    assert task.status == "pending"
    now_utc = datetime.now(timezone.utc)
    diff_days = (task.scheduled_for.replace(tzinfo=timezone.utc) - now_utc).days
    assert diff_days in (6, 7)

    mastery = isolated_db.query(StudentMastery).filter_by(
        user_id=user.id,
        specialty="nefrologia",
    ).first()
    assert mastery is not None
    assert mastery.mastery_score == 37.5
    assert mastery.cases_completed == 1

    assert prescription is not None
    assert prescription.recommended_exercise_difficulty == "Nivel 1 (Fundacional)"
    assert len(prescription.target_exercise_ids) >= 1
    assert prescription.next_repetition_date is not None


def test_record_mcq_attempt_success(isolated_db: Session):
    user = student_service.register_user(
        db=isolated_db,
        email="success.attempt@upch.pe",
        password="Password123",
        full_name="Estudiante Exitoso",
    )

    initial_xp = user.xp
    prescription = student_service.record_mcq_attempt(
        db=isolated_db,
        user_id=user.id,
        case_id="s13256-022-03392-w",
        station_number=2,
        is_correct=True,
        gap=None,
        specialty=MedicalSpecialty.ENDOCRINOLOGIA,
        response_time_ms=8500,
    )

    isolated_db.refresh(user)
    assert user.xp == initial_xp + 25

    attempt = isolated_db.query(CaseAttempt).filter_by(user_id=user.id, case_id="s13256-022-03392-w").first()
    assert attempt is not None
    assert attempt.passed is True
    assert attempt.score == 100.0

    tasks = isolated_db.query(SpacedRepetitionTask).filter_by(user_id=user.id).all()
    assert len(tasks) == 0

    mastery = isolated_db.query(StudentMastery).filter_by(
        user_id=user.id,
        specialty="endocrinologia",
    ).first()
    assert mastery is not None
    assert mastery.mastery_score == 62.5
    assert mastery.cases_completed == 1
    assert mastery.competency_level == "en_desarrollo"

    assert prescription is not None
    assert prescription.mastery_score == 62.5


def test_get_student_dashboard(isolated_db: Session):
    user = student_service.register_user(
        db=isolated_db,
        email="dashboard.user@upch.pe",
        password="Password123",
        full_name="Estudiante Dashboard",
    )

    student_service.record_mcq_attempt(
        db=isolated_db,
        user_id=user.id,
        case_id="s13256-019-2334-y",
        station_number=1,
        is_correct=False,
        gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
        specialty="nefrologia",
    )

    dashboard = student_service.get_student_dashboard(isolated_db, user.id)

    assert dashboard["id"] == user.id
    assert dashboard["email"] == "dashboard.user@upch.pe"
    assert dashboard["full_name"] == "Estudiante Dashboard"
    assert dashboard["university"] == "Universidad Peruana Cayetano Heredia"
    assert dashboard["stage"] == "Internado Rotatorio 2026"
    assert dashboard["plan_tier"] == "free"
    assert dashboard["xp"] == 5
    assert dashboard["streak_days"] == 1

    assert "specialties" in dashboard
    assert len(dashboard["specialties"]) == 5
    for spec in CARDINAL_SPECIALTIES:
        assert spec in dashboard["specialties"]
        assert "score" in dashboard["specialties"][spec]
        assert "level" in dashboard["specialties"][spec]

    assert len(dashboard["radar"]) == 5
    expected_ocri = round((37.5 + 50.0 * 4) / 5.0, 2)
    assert dashboard["global_ocri_score"] == expected_ocri
    assert dashboard["ocri_score"] == expected_ocri

    assert len(dashboard["pending_repetition_tasks"]) == 1
    task_entry = dashboard["pending_repetition_tasks"][0]
    assert task_entry["case_id"] == "s13256-019-2334-y"
    assert task_entry["gap_type"] == CognitiveGap.GAP_TRIAGE_SEVERITY.value
    assert task_entry["repetition_cycle"] == "D7"
    assert task_entry["status"] == "pending"


def test_toggle_user_plan(isolated_db: Session):
    user = student_service.register_user(
        db=isolated_db,
        email="plan.user@upch.pe",
        password="Password123",
        full_name="Estudiante Plan",
    )
    assert user.plan_tier == "free"

    toggled_1 = student_service.toggle_user_plan(isolated_db, user.id)
    assert toggled_1.plan_tier == "premium"

    toggled_2 = student_service.toggle_user_plan(isolated_db, user.id)
    assert toggled_2.plan_tier == "free"

    custom_plan = student_service.toggle_user_plan(isolated_db, user.id, new_tier="institutional_upch")
    assert custom_plan.plan_tier == "institutional_upch"

    with pytest.raises(ValueError):
        student_service.toggle_user_plan(isolated_db, user_id=999999)


def test_get_specialty_mastery_non_existent_user_raises_value_error(isolated_db: Session):
    with pytest.raises(ValueError, match="User with id 999999 not found"):
        student_service.get_specialty_mastery(isolated_db, user_id=999999, specialty="nefrologia")


def test_spaced_repetition_d21_progression_and_completion_on_success(isolated_db: Session):
    user = student_service.register_user(
        db=isolated_db,
        email="repetition.test@upch.pe",
        password="TestPassword2026",
        full_name="Interno Repeticion",
    )

    # 1. First failure -> D7 cycle
    presc1 = student_service.record_mcq_attempt(
        db=isolated_db,
        user_id=user.id,
        case_id="s13256-019-2334-y",
        station_number=1,
        is_correct=False,
        gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
        specialty=MedicalSpecialty.NEFROLOGIA,
    )
    assert presc1.next_repetition_date is not None

    tasks = isolated_db.query(SpacedRepetitionTask).filter_by(user_id=user.id, status="pending").all()
    assert len(tasks) == 1
    assert tasks[0].repetition_cycle == "D7"

    # 2. Second failure on same case -> upgrades to D21 cycle
    presc2 = student_service.record_mcq_attempt(
        db=isolated_db,
        user_id=user.id,
        case_id="s13256-019-2334-y",
        station_number=2,
        is_correct=False,
        gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
        specialty=MedicalSpecialty.NEFROLOGIA,
    )
    assert presc2.next_repetition_date is not None

    tasks = isolated_db.query(SpacedRepetitionTask).filter_by(user_id=user.id, status="pending").all()
    assert len(tasks) == 1
    assert tasks[0].repetition_cycle == "D21"

    # 3. Success on review attempt -> resolves pending repetition task
    student_service.record_mcq_attempt(
        db=isolated_db,
        user_id=user.id,
        case_id="s13256-019-2334-y",
        station_number=3,
        is_correct=True,
        specialty=MedicalSpecialty.NEFROLOGIA,
    )
    pending_after_success = isolated_db.query(SpacedRepetitionTask).filter_by(user_id=user.id, status="pending").all()
    assert len(pending_after_success) == 0

    completed_task = isolated_db.query(SpacedRepetitionTask).filter_by(user_id=user.id, status="completed").first()
    assert completed_task is not None


def test_dashboard_includes_auxiliary_specialty_when_present(isolated_db: Session):
    user = student_service.register_user(
        db=isolated_db,
        email="aux.specialty@upch.pe",
        password="Password123",
        full_name="Interno Oftalmologia",
    )

    # Record attempt in oftalmologia (auxiliary specialty)
    student_service.record_mcq_attempt(
        db=isolated_db,
        user_id=user.id,
        case_id="s13256-024-04496-1",
        station_number=1,
        is_correct=True,
        specialty=MedicalSpecialty.OFTALMOLOGIA,
    )

    dashboard = student_service.get_student_dashboard(isolated_db, user.id)
    assert "oftalmologia" in dashboard["specialty_profiles"]
    # Radar chart remains 5 cardinal specialties
    assert len(dashboard["radar"]) == 5
