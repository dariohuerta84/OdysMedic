# Backend Adaptive Leveling Engine & Medical Reference RAG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a comprehensive clinical backend for OdyssMedic that grounds cases in canonical medical literature/guidelines (KDIGO, ADA, AHA, EULAR, MINSA), evaluates student decisions across 3 clinical competency tiers (Foundational, Intermediate, Advanced), detects 4 OCRI cognitive gaps, and automatically prescribes adaptive leveling exercises tailored to each specialty's mastery score.

**Architecture:** A modular FastAPI monolith backed by SQLAlchemy ORM (SQLite for zero-config local development, seamlessly upgradable to PostgreSQL/Supabase via `DATABASE_URL`). A deterministic clinical evaluation core maps student choices to the 4 OCRI gaps with evidence citations from medical reference books. An `AdaptiveLevelingEngine` calculates mastery per specialty ($0-100\%$), assigns competency badges, and dynamically reorders the student's study queue and spaced repetition schedule ($D7 / D21$).

**Tech Stack:** Python 3.10+, FastAPI, SQLAlchemy 2.0+, Pydantic v2, Pytest, PyJWT, passlib/bcrypt, SQLite/PostgreSQL.

---

### File Structure & Decomposition

```
backend/
├── app/
│   ├── config.py                               # Settings & environment variables
│   ├── main.py                                 # FastAPI application & lifespan seeder
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py                          # SQLAlchemy engine, SessionLocal, Base
│   │   ├── models.py                           # ORM models (User, Profile, Attempt, Reference, Station)
│   │   └── seeder.py                           # Seed RAG cases, stations & reference books
│   ├── models/
│   │   ├── enums.py                            # MedicalSpecialty, CognitiveGap, StudentCompetencyLevel
│   │   ├── clinical_case.py                    # Case & vignette Pydantic schemas
│   │   ├── evaluation.py                       # Evaluation request, report & OCRI radar
│   │   ├── student.py                          # Student profile, competency & leveling schemas
│   │   └── reference.py                        # Medical reference book / guideline schemas
│   ├── engine/
│   │   ├── evaluator.py                        # Core retrospective & MCQ evaluator
│   │   ├── gap_classifier.py                   # OCRI gap diagnosis logic
│   │   ├── scoring.py                          # Dimensional & weighted scoring
│   │   ├── pearls_catalog.py                   # Curated 60s clinical pearls
│   │   └── leveling_engine.py                  # Multi-level capacity detection & exercise prescription
│   ├── services/
│   │   ├── case_service.py                     # Case loader, query & vignette sanitizer
│   │   ├── reference_service.py                # Medical library & guidelines RAG service
│   │   ├── student_service.py                  # Student profile & competency state tracker
│   │   └── auth_service.py                     # Password hashing, JWT token creation/verification
│   └── api/
│       ├── __init__.py
│       ├── deps.py                             # DB session & get_current_user dependencies
│       ├── routes_auth.py                      # Registration, login & profile endpoints
│       ├── routes_specialties.py               # 5 Clinical worlds & status
│       ├── routes_cases.py                     # Case vignettes & graded MCQ stations
│       ├── routes_evaluation.py                # Submissions & retrospective debriefing
│       ├── routes_leveling.py                  # Student competency diagnostics & adaptive prescription
│       └── routes_references.py                # Evidence viewer & medical guidelines lookup
├── data/
│   ├── clinical_cases.json                     # Ground-truth 7 cases (Springer/BMC RAG)
│   └── medical_references.json                 # Canonical textbooks & clinical practice guidelines
└── tests/
    ├── test_cases.py                           # Case loading & vignette sanitization tests
    ├── test_evaluator.py                       # Evaluator & OCRI gap detection tests
    ├── test_leveling_engine.py                 # Multi-level competency & leveling prescription tests
    ├── test_reference_service.py               # RAG literature & book citation tests
    └── test_api_integration.py                 # End-to-end API route verification
```

---

### Task 1: Canonical Medical References RAG Dataset & Schemas

**Files:**
- Create: `backend/data/medical_references.json`
- Create: `backend/app/models/reference.py`
- Modify: `backend/app/models/enums.py`
- Test: `backend/tests/test_reference_service.py`

- [ ] **Step 1: Write the failing test for medical reference loading and citation lookup**

```python
# backend/tests/test_reference_service.py
import pytest
from app.models.reference import MedicalReferenceBook, ClinicalGuidelineExcerpt
from app.services.reference_service import reference_repository

def test_load_medical_references():
    books = reference_repository.get_all_books()
    assert len(books) >= 5, "Expected at least 5 canonical clinical books/guidelines"

def test_get_citation_for_case():
    citations = reference_repository.get_citations_for_case("s13256-019-2334-y")
    assert len(citations) >= 1
    assert any("KDIGO" in c.source_title or "Atypical Hemolytic" in c.source_title for c in citations)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/matias/Github/OdysMedic/backend && python3 -m pytest tests/test_reference_service.py -v`  
Expected: FAIL with `ModuleNotFoundError: No module named 'app.models.reference'`

- [ ] **Step 3: Define reference schemas and canonical medical references dataset**

Add `backend/app/models/reference.py`:
```python
from pydantic import BaseModel, Field
from typing import Optional

class ClinicalGuidelineExcerpt(BaseModel):
    reference_id: str
    source_title: str
    organization_or_publisher: str
    year: int
    edition_or_version: Optional[str] = None
    section_title: str
    page_or_doi: Optional[str] = None
    key_recommendation: str
    evidence_level: str
    associated_specialty: str
    associated_cases: list[str] = Field(default_factory=list)

class MedicalReferenceBook(BaseModel):
    book_id: str
    title: str
    authors_or_organization: str
    edition: str
    specialty: str
    isbn_or_doi: Optional[str] = None
    excerpts_count: int
```

Create `backend/data/medical_references.json` containing the canonical textbooks and clinical practice guidelines grounding the cases (KDIGO 2024 for aHUS/AKI, ADA Standards of Care 2024 for Capecitabine-induced diabetes/hypokalemia, AHA/ASA 2023 for Stroke/Pseudobulbar affect, EULAR/ACR 2023 for Neuropsychiatric SLE, Endocrine Society 2024 / ACOG for Gestational Hypoparathyroidism, and American Academy of Ophthalmology for Uveal Effusion).

Implement `backend/app/services/reference_service.py` to index and serve these canonical books and evidence excerpts.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/matias/Github/OdysMedic/backend && python3 -m pytest tests/test_reference_service.py -v`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
cd /home/matias/Github/OdysMedic
git add backend/data/medical_references.json backend/app/models/reference.py backend/app/services/reference_service.py backend/tests/test_reference_service.py
git commit -m "feat(rag): add canonical medical reference books and guideline citations service"
```

---

### Task 2: Multi-Tier Competency Taxonomy & Deficiency Models

**Files:**
- Modify: `backend/app/models/enums.py`
- Create: `backend/app/models/student.py`
- Test: `backend/tests/test_leveling_engine.py`

- [ ] **Step 1: Write the failing test for student competency levels and gap severity**

```python
# backend/tests/test_leveling_engine.py
import pytest
from app.models.enums import StudentCompetencyLevel, DeficiencyType, MedicalSpecialty
from app.models.student import SpecialtyMasteryProfile, LevelingPrescription
from app.engine.leveling_engine import calculate_specialty_competency, generate_leveling_prescription

def test_competency_tier_assignment():
    # Mastery < 60% is Deficient / Needs Leveling
    profile_low = calculate_specialty_competency(specialty=MedicalSpecialty.NEFROLOGIA, score=52.0, attempts=3)
    assert profile_low.level == StudentCompetencyLevel.DEFICIENTE
    assert profile_low.needs_leveling is True

    # Mastery >= 75% is Competent
    profile_high = calculate_specialty_competency(specialty=MedicalSpecialty.NEFROLOGIA, score=82.0, attempts=5)
    assert profile_high.level == StudentCompetencyLevel.COMPETENTE
    assert profile_high.needs_leveling is False

def test_generate_leveling_prescription_for_critical_gap():
    prescription = generate_leveling_prescription(
        specialty=MedicalSpecialty.NEFROLOGIA,
        mastery_score=52.0,
        detected_gap="GAP_INITIAL_MANAGEMENT",
        student_level=StudentCompetencyLevel.DEFICIENTE
    )
    assert prescription.recommended_exercise_difficulty == "Nivel 1 (Fundacional)"
    assert len(prescription.target_exercise_ids) >= 1
    assert "revisión prioritaria" in prescription.rationale.lower()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/matias/Github/OdysMedic/backend && python3 -m pytest tests/test_leveling_engine.py -v`  
Expected: FAIL with `ImportError` or `AttributeError`

- [ ] **Step 3: Implement Competency Taxonomy and Schemas**

Update `backend/app/models/enums.py`:
- Add `StudentCompetencyLevel`:
  - `DEFICIENTE = "deficiente"` (Mastery < 60%)
  - `EN_DESARROLLO = "en_desarrollo"` (Mastery 60% - 74%)
  - `COMPETENTE = "competente"` (Mastery 75% - 89%)
  - `AVANZADO = "avanzado"` (Mastery >= 90%)
- Add `DeficiencyType`:
  - `CRITICA_SEGURIDAD = "critica_seguridad"` (Failed life-threat/triage or toxic overdose)
  - `INTERPRETACION_DATOS = "interpretacion_datos"` (Failed labs/electrolytes/ECG)
  - `RAZONAMIENTO_DIFERENCIAL = "razonamiento_diferencial"` (Diagnostic confusion)
  - `MANEJO_TERAPEUTICO = "manejo_terapeutico"` (Drug choice/dosing error)
- Add `ExerciseDifficultyTier`:
  - `NIVEL_1_FUNDACIONAL = "nivel_1_fundacional"` (Signs, triage, basic definition)
  - `NIVEL_2_INTERMEDIO = "nivel_2_intermedio"` (Labs, imaging, differential reasoning)
  - `NIVEL_3_AVANZADO = "nivel_3_avanzado"` (Dosing titration, contraindications)

Create `backend/app/models/student.py`:
- `SpecialtyMasteryProfile`: `specialty`, `score`, `level`, `needs_leveling`, `total_cases_solved`, `active_deficiencies`.
- `StudentGlobalProfile`: `student_id`, `full_name`, `global_ocri_score`, `specialty_profiles`, `overall_level`.
- `LevelingPrescription`: `specialty`, `current_mastery`, `assigned_deficiency`, `recommended_exercise_difficulty`, `target_exercise_ids`, `rationale`, `next_repetition_date`.

Create `backend/app/engine/leveling_engine.py` with pure logic functions `calculate_specialty_competency()` and `generate_leveling_prescription()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/matias/Github/OdysMedic/backend && python3 -m pytest tests/test_leveling_engine.py -v`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
cd /home/matias/Github/OdysMedic
git add backend/app/models/enums.py backend/app/models/student.py backend/app/engine/leveling_engine.py backend/tests/test_leveling_engine.py
git commit -m "feat(engine): add student competency taxonomy and adaptive leveling engine"
```

---

### Task 3: Database Persistence Layer (SQLAlchemy 2.0 ORM & SQLite/PostgreSQL Engine)

**Files:**
- Create: `backend/app/db/__init__.py`
- Create: `backend/app/db/session.py`
- Create: `backend/app/db/models.py`
- Create: `backend/app/db/seeder.py`
- Modify: `backend/app/config.py`
- Test: `backend/tests/test_db_persistence.py`

- [ ] **Step 1: Write the failing test for database persistence and seeder**

```python
# backend/tests/test_db_persistence.py
import pytest
from app.db.session import SessionLocal, init_db
from app.db.models import User, StudentMastery, CaseAttempt, MedicalReferenceDB
from app.db.seeder import seed_initial_data

def test_database_initialization_and_seeding():
    init_db()
    with SessionLocal() as db:
        seed_initial_data(db)
        
        # Check references seeded
        refs = db.query(MedicalReferenceDB).all()
        assert len(refs) >= 5
        
        # Check default demo user exists
        demo_user = db.query(User).filter_by(email="demo.medico@upch.pe").first()
        assert demo_user is not None
        assert demo_user.university == "Universidad Peruana Cayetano Heredia"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/matias/Github/OdysMedic/backend && python3 -m pytest tests/test_db_persistence.py -v`  
Expected: FAIL with `ModuleNotFoundError: No module named 'app.db.session'`

- [ ] **Step 3: Implement database configuration, models and seeder**

Update `backend/app/config.py` with `database_url: str = "sqlite:///./odyssmedic.db"`.

Create `backend/app/db/session.py`:
- `create_engine()` with SQLite foreign keys support and connection pooling.
- `Base = declarative_base()`, `SessionLocal`.
- `init_db()` to create all tables.
- `get_db()` FastAPI dependency.

Create `backend/app/db/models.py`:
- `User`: `id`, `email`, `password_hash`, `full_name`, `university`, `stage`, `target_exam`, `plan_tier`, `xp`, `streak`, `created_at`.
- `StudentMastery`: `id`, `user_id`, `specialty`, `mastery_score`, `competency_level`, `cases_completed`, `updated_at`.
- `StudentGapMetric`: `id`, `user_id`, `gap_type`, `fail_count`, `last_concept`.
- `CaseAttempt`: `id`, `user_id`, `case_id`, `station_id`, `score`, `passed`, `selected_option`, `response_time_ms`, `detected_gap`, `created_at`.
- `MedicalReferenceDB`: `id`, `ref_id`, `title`, `publisher`, `year`, `specialty`, `key_recommendation`, `evidence_level`.
- `SpacedRepetitionTask`: `id`, `user_id`, `case_id`, `scheduled_for`, `repetition_cycle`, `status`.

Create `backend/app/db/seeder.py`:
- Seeds canonical books into `MedicalReferenceDB`.
- Seeds student mastery profiles for the 5 specialties.
- Seeds demo user and mock historical attempts to demonstrate leveling.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/matias/Github/OdysMedic/backend && python3 -m pytest tests/test_db_persistence.py -v`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
cd /home/matias/Github/OdysMedic
git add backend/app/config.py backend/app/db/ backend/tests/test_db_persistence.py
git commit -m "feat(db): implement SQLAlchemy 2.0 models, SQLite/PG engine and database seeder"
```

---

### Task 4: Multi-Station Graded MCQ Generator with Distractor-Gap Mapping

**Files:**
- Create: `backend/app/models/mcq.py`
- Create: `backend/app/services/mcq_service.py`
- Modify: `backend/app/engine/evaluator.py`
- Test: `backend/tests/test_mcq_evaluation.py`

- [ ] **Step 1: Write the failing test for graded MCQ stations**

```python
# backend/tests/test_mcq_evaluation.py
import pytest
from app.services.mcq_service import mcq_repository
from app.engine.evaluator import evaluate_mcq_station_attempt
from app.models.enums import CognitiveGap

def test_mcq_stations_available_for_case():
    stations = mcq_repository.get_stations_for_case("s13256-019-2334-y")
    # Must have 3 stations: Level 1 (Triage/Labs), Level 2 (Differential), Level 3 (Management/Dosing)
    assert len(stations) == 3
    for s in stations:
        assert len(s.options) == 4
        # Options must hide the correct flag and gap type in student-facing schema
        assert all(opt.option_id in ["A", "B", "C", "D"] for opt in s.options)

def test_evaluate_mcq_distractor_triggers_accurate_gap():
    station = mcq_repository.get_station("s13256-019-2334-y", station_number=2)
    # Option A in station 2 is PTT (misdiagnosing aHUS) -> GAP_DIAGNOSTIC_REASONING
    result = evaluate_mcq_station_attempt(station, chosen_option_id="A", response_time_ms=45000)
    assert result.is_correct is False
    assert result.associated_gap == CognitiveGap.GAP_DIAGNOSTIC_REASONING
    assert "aHUS" in result.clinical_feedback
    assert result.citation_evidence is not None
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/matias/Github/OdysMedic/backend && python3 -m pytest tests/test_mcq_evaluation.py -v`  
Expected: FAIL with `ModuleNotFoundError: No module named 'app.services.mcq_service'`

- [ ] **Step 3: Implement MCQ models, generator and evaluator**

Create `backend/app/models/mcq.py`:
- `MCQOptionStudent`: `option_id`, `text`.
- `MCQOptionInternal`: `option_id`, `text`, `is_correct`, `associated_gap`, `rationale`.
- `MCQStationStudent`: `station_id`, `case_id`, `station_number`, `difficulty_tier`, `clinical_stem`, `options`.
- `MCQSubmission`: `case_id`, `station_number`, `chosen_option_id`, `response_time_ms`.
- `MCQResult`: `is_correct`, `points_earned`, `correct_option_id`, `chosen_option_id`, `associated_gap`, `clinical_feedback`, `citation_evidence`, `clinical_pearl`, `updated_specialty_mastery`.

Create `backend/app/services/mcq_service.py` to curate the 3 difficulty-tiered stations for each of the 7 RAG clinical cases:
- Station 1: Difficulty Tier 1 (Triage & Vital Alert)
- Station 2: Difficulty Tier 2 (Auxiliary Interpretation & Differential Diagnosis)
- Station 3: Difficulty Tier 3 (Initial Management, Dosing & Pharmacology)

Update `backend/app/engine/evaluator.py` to add `evaluate_mcq_station_attempt()` that connects chosen distractors to exact OCRI gaps and references the guideline citations.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/matias/Github/OdysMedic/backend && python3 -m pytest tests/test_mcq_evaluation.py -v`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
cd /home/matias/Github/OdysMedic
git add backend/app/models/mcq.py backend/app/services/mcq_service.py backend/app/engine/evaluator.py backend/tests/test_mcq_evaluation.py
git commit -m "feat(mcq): add difficulty-tiered stations with distractor-to-gap mapping and guideline citations"
```

---

### Task 5: Student State, Authentication & Leveling Services

**Files:**
- Create: `backend/app/services/auth_service.py`
- Create: `backend/app/services/student_service.py`
- Modify: `backend/app/engine/leveling_engine.py`
- Test: `backend/tests/test_student_service.py`

- [ ] **Step 1: Write the failing test for student state and adaptive leveling updates**

```python
# backend/tests/test_student_service.py
import pytest
from app.db.session import SessionLocal, init_db
from app.services.student_service import student_service
from app.models.enums import MedicalSpecialty, CognitiveGap, StudentCompetencyLevel

def test_record_attempt_and_relevel_student():
    init_db()
    with SessionLocal() as db:
        user = student_service.get_or_create_demo_user(db)
        
        # Student fails a Nivel 1 triage question in Nephrology
        prescription = student_service.record_mcq_attempt(
            db=db,
            user_id=user.id,
            case_id="s13256-019-2334-y",
            station_number=1,
            is_correct=False,
            gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
            specialty=MedicalSpecialty.NEFROLOGIA,
            response_time_ms=12000
        )
        
        profile = student_service.get_specialty_mastery(db, user.id, MedicalSpecialty.NEFROLOGIA)
        assert profile.needs_leveling is True
        assert prescription.recommended_exercise_difficulty == "Nivel 1 (Fundacional)"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/matias/Github/OdysMedic/backend && python3 -m pytest tests/test_student_service.py -v`  
Expected: FAIL with `ModuleNotFoundError: No module named 'app.services.auth_service'`

- [ ] **Step 3: Implement Auth and Student Leveling Services**

Create `backend/app/services/auth_service.py`:
- `hash_password()`, `verify_password()`.
- `create_access_token()`, `decode_access_token()`.

Create `backend/app/services/student_service.py`:
- `get_or_create_demo_user(db)`
- `register_user(db, email, password, full_name, university, stage, target_exam)`
- `authenticate_user(db, email, password)`
- `get_student_dashboard(db, user_id)`: returns XP, streak, global OCRI, 5 specialty masteries, radar chart data, and spaced repetition queue.
- `record_mcq_attempt(db, user_id, case_id, station_number, is_correct, gap, specialty, response_time_ms)`: updates the student's mastery score using Exponential Moving Average, diagnoses the student's new competency tier, logs the attempt, schedules spaced repetition (D7/D21), and returns an adaptive `LevelingPrescription`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/matias/Github/OdysMedic/backend && python3 -m pytest tests/test_student_service.py -v`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
cd /home/matias/Github/OdysMedic
git add backend/app/services/auth_service.py backend/app/services/student_service.py backend/tests/test_student_service.py
git commit -m "feat(services): implement student competency tracking, auth and adaptive leveling service"
```

---

### Task 6: Comprehensive REST API Routing & Endpoints

**Files:**
- Create: `backend/app/api/deps.py`
- Create: `backend/app/api/routes_auth.py`
- Create: `backend/app/api/routes_leveling.py`
- Create: `backend/app/api/routes_references.py`
- Modify: `backend/app/api/routes_cases.py`
- Modify: `backend/app/api/routes_specialties.py`
- Modify: `backend/app/api/routes_evaluation.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_api_integration.py`

- [ ] **Step 1: Write the failing integration test for the new API routes**

```python
# backend/tests/test_api_integration.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_and_version():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

def test_get_specialties_with_mastery_levels():
    resp = client.get("/api/v1/specialties")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 5

def test_get_case_mcq_station():
    resp = client.get("/api/v1/cases/s13256-019-2334-y/stations/1")
    assert resp.status_code == 200
    station = resp.json()
    assert "clinical_stem" in station
    assert len(station["options"]) == 4

def test_submit_mcq_and_receive_leveling_prescription():
    payload = {
        "case_id": "s13256-019-2334-y",
        "station_number": 2,
        "chosen_option_id": "A",
        "response_time_ms": 32000
    }
    resp = client.post("/api/v1/evaluation/submit-mcq", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body["is_correct"] is False
    assert body["associated_gap"] == "GAP_DIAGNOSTIC_REASONING"
    assert "leveling_prescription" in body

def test_get_medical_references():
    resp = client.get("/api/v1/references/by-case/s13256-019-2334-y")
    assert resp.status_code == 200
    refs = resp.json()
    assert len(refs) >= 1
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/matias/Github/OdysMedic/backend && python3 -m pytest tests/test_api_integration.py -v`  
Expected: FAIL with 404 Not Found on new endpoints

- [ ] **Step 3: Implement new API routers and wire into FastAPI main app**

Create `backend/app/api/deps.py`:
- Database session provider (`get_db`).
- Token extractor and user getter (`get_current_user_optional`, `get_current_user`).

Create `backend/app/api/routes_auth.py`:
- `POST /api/v1/auth/register` (Quick signup < 30s)
- `POST /api/v1/auth/login` (JWT token grant)
- `GET /api/v1/auth/me` (Profile details)
- `PATCH /api/v1/auth/toggle-plan` (Demo switch Free <-> Premium)

Create `backend/app/api/routes_leveling.py`:
- `GET /api/v1/leveling/dashboard` (Radar chart, competency matrix for 5 specialties)
- `GET /api/v1/leveling/prescription/{specialty}` (Recommended micro-exercises for leveling up)

Create `backend/app/api/routes_references.py`:
- `GET /api/v1/references/books` (Canonical books catalog)
- `GET /api/v1/references/by-case/{case_id}` (Excerpts & guideline recommendations for specific case)

Update `backend/app/api/routes_cases.py`:
- Add `GET /api/v1/cases/{case_id}/stations`
- Add `GET /api/v1/cases/{case_id}/stations/{station_number}`

Update `backend/app/api/routes_evaluation.py`:
- Add `POST /api/v1/evaluation/submit-mcq` that integrates station scoring, OCRI gap diagnosis, guideline citation retrieval, student mastery update, and adaptive leveling prescription.

Update `backend/app/main.py`:
- Mount all routers with `/api/v1`.
- Add lifespan handler to automatically initialize and seed database on startup.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/matias/Github/OdysMedic/backend && python3 -m pytest tests/test_api_integration.py -v`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
cd /home/matias/Github/OdysMedic
git add backend/app/api/ backend/app/main.py backend/tests/test_api_integration.py
git commit -m "feat(api): connect all routers for auth, cases, stations, evaluation, leveling and references"
```

---

### Task 7: Full System Verification, Regression Testing & Documentation

**Files:**
- Modify: `backend/README.md`
- Test: `backend/tests/` (full test suite)

- [ ] **Step 1: Run the full test suite**

Run: `cd /home/matias/Github/OdysMedic/backend && python3 -m pytest -v tests/`  
Expected: All tests PASS with zero regressions across `test_cases.py`, `test_evaluator.py`, `test_leveling_engine.py`, `test_reference_service.py`, `test_db_persistence.py`, `test_mcq_evaluation.py`, and `test_api_integration.py`.

- [ ] **Step 2: Update backend README with complete architectural documentation**

Update `backend/README.md` to document:
- The 3-tier Competency Architecture (Foundational, Intermediate, Advanced).
- The 4 OCRI Cognitive Gaps taxonomy.
- The Adaptive Leveling Algorithm.
- The Medical Reference RAG dataset and citations.
- Complete API endpoint catalog with example request/response payloads.
- Local startup commands (`uvicorn app.main:app --reload`).

- [ ] **Step 3: Commit and push changes**

```bash
cd /home/matias/Github/OdysMedic
git add backend/README.md
git commit -m "docs(backend): update README with adaptive leveling engine, competency tiers and RAG reference catalog"
git push origin main
```
