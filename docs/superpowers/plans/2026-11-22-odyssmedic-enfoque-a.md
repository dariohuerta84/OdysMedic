# OdyssMedic Enfoque A — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Enfoque A upgrade for OdyssMedic: enrich OCRI with Half-Life Regression (HLR), FSRS-inspired stability/difficulty, Birdbrain/IRT Goldilocks difficulty, and 7 new peer-reviewed references; build a 5-unit × 4-node progressive clinical learning path synchronized with the longitudinal day simulator; harden user registration persistence across SQLite and PostgreSQL; and apply a unified formal medical editorial redesign with native CSS Scroll-Driven animations across frontend and backend.

**Architecture:** The backend adds a pure deterministic scheduler (`backend/app/engine/hlr_scheduler.py`) and a per-specialty ORM memory trace table (`UserMemoryTrace`) alongside existing `EMA` and `D7`/`D21` logic so all 85 existing tests stay green. `student_service.py` computes progressive units/nodes and HLR telemetry exposed via `GET /api/v1/leveling/learning-path` and embedded additively in `GET /api/v1/leveling/dashboard`. The frontend adopts `Source Serif 4` + `Inter` + `JetBrains Mono` with `1px` editorial hairlines, native `@supports` CSS `scroll()`/`view()` animations, `document.startViewTransition`, an AuthContext register race fix, and a `ClinicalLearningPath` component wired to direct station navigation (`initialStationNumber`).

**Tech Stack:** Python 3.10+, FastAPI, SQLAlchemy 2.0, Pydantic v2, Pytest, React 18, TypeScript, Vite 6, Tailwind CSS, native CSS Scroll-Driven Animations (`scroll()`, `view()`).

**Spec:** [docs/superpowers/specs/2026-11-22-odyssmedic-enfoque-a-design.md](file:///home/matias/Github/OdysMedic/docs/superpowers/specs/2026-11-22-odyssmedic-enfoque-a-design.md)

## Global Constraints

- Prohibited UI patterns: zero rounded eyebrow pills (`rounded-full` uppercase tags above titles), zero repetitive pastel badge chips above cards, zero identical heavy rounded SaaS card grids (`rounded-xl`/`rounded-2xl border p-6`), zero repetitive checkmark footers, zero neon/electric glow/cyberpunk palettes.
- Editorial typography and palette: `Source Serif 4` (headings), `Inter` (body), `JetBrains Mono` (clinical telemetry: `h`, `%` recall, vitals, station codes, XP); Canvas `#FAF9F6`, Paper `#F3F1EC`, Hairline `#DEDBD2` (`1px`), Ink `#0D1F26`, Body `#3D525A`, Teal `#0E6F65`, Ochre `#9A6B1F`, Crimson `#A6262E`.
- Native CSS Scroll-Driven Animations: wrap in `@supports ((animation-timeline: scroll()) and (animation-range: 0% 100%))` or `@supports (animation-timeline: view())`; always declare `animation-timeline` and `animation-range` AFTER `animation`; animate compositor-only properties (`transform`, `opacity`, `clip-path`); never install `scroll-timeline-polyfill`; respect `@media (prefers-reduced-motion: reduce)` and keep static/IO fallbacks.
- Backwards compatibility: all 85 existing `pytest` tests in `backend/tests/` must pass untouched (`EMA alpha=0.25`, `D7`/`D21` scheduling, `GET /` returning JSON for `Accept: */*`, `/health` retaining `status`, `service`, `version`), and `frontend` `npm run build` must succeed with zero TypeScript errors.
- Vercel Services compatibility: `vercel.json` (Vite SPA + FastAPI serverless `backend/main.py`) remains valid.

## Review Focus

1. **Duplicate registration with mixed-case/whitespace email (`"  Doctor@UPCH.pe "` vs `"doctor@upch.pe"`):** must reject duplicates and allow case-insensitive login rather than creating orphan duplicate accounts (pinned in Task 2).
2. **High diagnostic score (`>= 75%`) with zero MCQ attempts:** Node 4 (`Guardia Integradora`) must remain `"locked"`, never auto-completing before Stations 1–3 are passed (pinned in Task 3).
3. **Non-cardinal diagnostic specialty (`medicina_interna`, `pediatria`, `cirugia_general`, `medicina_familiar`):** must map deterministically via `SPECIALTY_TO_CASE_CANDIDATES` to reorder Unit 1 without crashing or returning empty units (pinned in Task 3).
4. **Longitudinal `active_streak` (`+21d`) vs `inactivity_decay` (`14d`) vs `reset`:** `active_streak` must keep practiced priority units healthy (`p >= 0.80`) while unpracticed gap units decay naturally; `inactivity_decay` must drop recall across all units into `needs_review`; `reset` must restore `p = 1.0` and Day 0 baseline (pinned in Task 3).
5. **Pre-existing user with zero `UserMemoryTrace` rows requesting `/dashboard` or `/learning-path`:** must lazily backfill/compute default traces without `AttributeError` or `NoneType` division errors (pinned in Task 3).

---

## File Structure

- **References (`referencias/`):**
  - Modify: `referencias/03_fundamentos_pedagogicos_y_cognitivos.md`, `referencias/README.md`, `referencias/catalogo_completo_referencias.json`, `referencias/referencias_odyssmedic.bib`
- **Backend (`backend/`):**
  - Create: `backend/app/engine/hlr_scheduler.py` (pure HLR, FSRS-style stability/difficulty, Birdbrain/IRT Goldilocks selector)
  - Modify: `backend/app/db/models.py` (add `UserMemoryTrace` ORM model)
  - Modify: `backend/app/db/session.py` (PostgreSQL + SQLite idempotent column migrations, `storage_mode` helper)
  - Modify: `backend/app/services/student_service.py` (email normalization, HLR trace initialization/updates, coherent `simulate_elapsed_days`, `build_progressive_learning_path`, enriched `get_student_dashboard`)
  - Modify: `backend/app/api/routes_leveling.py` (add `GET /api/v1/leveling/learning-path`)
  - Modify: `backend/app/main.py` (content-negotiated Editorial API Portal at `/` & `/portal`, custom editorial Swagger UI at `/docs`, `storage_mode` + `persistent` in `/health`)
  - Create: `backend/tests/test_references_integrity.py`, `backend/tests/test_hlr_and_learning_path.py`, `backend/tests/test_backend_portal_and_persistence.py`
  - Create: `backend/.env.example` (clear `DATABASE_URL` template for Neon/Supabase on Vercel)
- **Frontend (`frontend/`):**
  - Modify: `frontend/index.html`, `frontend/tailwind.config.js`, `frontend/src/index.css`
  - Create: `frontend/src/components/common/ScrollParticlesBackdrop.tsx`
  - Create: `frontend/src/components/dashboard/ClinicalLearningPath.tsx`
  - Modify: `frontend/src/context/AuthContext.tsx` (eliminate redundant immediate `getMe()` after `register()`/`login()`)
  - Modify: `frontend/src/types/api.ts`, `frontend/src/services/api.ts` (HLR summary + progressive learning path types & `levelingApi.getLearningPath`)
  - Modify: `frontend/src/App.tsx` (`document.startViewTransition` + `initialStationNumber` state/routing)
  - Modify: `frontend/src/components/common/Navbar.tsx`, `frontend/src/pages/LandingPage.tsx`, `frontend/src/pages/DashboardPage.tsx`, `frontend/src/components/dashboard/BentoStats.tsx`, `frontend/src/components/dashboard/SpacedRepetitionQueue.tsx`, `frontend/src/components/dashboard/TimePassageSimulator.tsx`, `frontend/src/components/dashboard/SpecialtyCard.tsx`
  - Modify: `frontend/src/pages/SimulatorPage.tsx` (support `initialStationNumber?: number` + editorial token alignment), `frontend/src/pages/DiagnosticExamPage.tsx`, `frontend/src/pages/LibraryPage.tsx`, `frontend/src/components/auth/AuthModal.tsx`

---

### Task 1: Enrich Scientific References Catalog (50 → 57 Sources)

**Files:**
- Modify: `referencias/03_fundamentos_pedagogicos_y_cognitivos.md`
- Modify: `referencias/README.md`
- Modify: `referencias/catalogo_completo_referencias.json`
- Modify: `referencias/referencias_odyssmedic.bib`
- Test: `backend/tests/test_references_integrity.py`

**Interfaces:**
- Consumes: existing `referencias/` files (`50` records in JSON, `9` in `03_...md`, `43` entries in `.bib`).
- Produces: synchronized 57-source bibliography containing the 7 new DOIs (`10.18653/v1/P16-1174`, `10.1145/3534678.3539081`, `10.1162/tacl_a_00310`, `10.3109/0142159X.2013.760036`, `10.1080/0142159X.2017.1327706`, `10.1097/ACM.0b013e3181ace703`, `10.1111/j.1365-2923.2009.03498.x`).

- [ ] **Step 1: Write the failing test in `backend/tests/test_references_integrity.py`**

```python
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REF_DIR = ROOT / "referencias"

REQUIRED_NEW_DOIS = [
    "10.18653/v1/P16-1174",
    "10.1145/3534678.3539081",
    "10.1162/tacl_a_00310",
    "10.3109/0142159X.2013.760036",
    "10.1080/0142159X.2017.1327706",
    "10.1097/ACM.0b013e3181ace703",
    "10.1111/j.1365-2923.2009.03498.x",
]

def test_references_catalog_contains_57_sources_and_new_ocri_models():
    raw = json.loads((REF_DIR / "catalogo_completo_referencias.json").read_text(encoding="utf-8"))
    ped_md = (REF_DIR / "03_fundamentos_pedagogicos_y_cognitivos.md").read_text(encoding="utf-8")
    bib = (REF_DIR / "referencias_odyssmedic.bib").read_text(encoding="utf-8")
    readme = (REF_DIR / "README.md").read_text(encoding="utf-8")

    # JSON catalog may be a list or dict with total/items; assert exact 57 entries
    total = raw["total_referencias"] if isinstance(raw, dict) and "total_referencias" in raw else len(raw)
    assert total == 57
    json_text = json.dumps(raw)
    for doi in REQUIRED_NEW_DOIS:
        assert doi in json_text
        assert doi in ped_md
        assert doi in bib
    assert "57" in readme
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/matias/Github/OdysMedic/backend && PYTHONPATH=. .venv/bin/pytest tests/test_references_integrity.py -v`  
Expected: FAIL (`total == 50 != 57` and missing DOIs).

- [ ] **Step 3: Update all 4 files in `referencias/`**

Inspect the exact schema of `referencias/catalogo_completo_referencias.json` and `referencias/referencias_odyssmedic.bib` first, then append the 7 verified adaptive-learning and clinical-reasoning papers (Settles & Meeder 2016 HLR, Ye et al. 2022 FSRS, Settles/LaFlair/Hagiwara 2020 Birdbrain/IRT, Lubarsky et al. 2013 AMEE 75 SCT, Gagnon et al. 2017 Evolving SCT, Croskerry 2009 Dual-Process, van Merriënboer & Sweller 2010 Cognitive Load) to `03_fundamentos_pedagogicos_y_cognitivos.md` (rows 10–16), `catalogo_completo_referencias.json` (total `57`), `referencias_odyssmedic.bib` (50 BibTeX entries), and update counts in `referencias/README.md` (`57 Fuentes Totales`, `16 fuentes` en `03_...`, `50 entradas` en `.bib`).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/matias/Github/OdysMedic/backend && PYTHONPATH=. .venv/bin/pytest tests/test_references_integrity.py -v`  
Expected: PASS (`1 passed`).

- [ ] **Step 5: Commit**

```bash
git add referencias/ backend/tests/test_references_integrity.py
git commit -m "docs(references): add 7 HLR, FSRS, IRT, SCT and cognitive load papers to OCRI bibliography"
```

---

### Task 2: OCRI-HLR Scheduler (`hlr_scheduler.py`), `UserMemoryTrace` Model, Multi-Dialect Persistence & Auth Normalization

**Files:**
- Create: `backend/app/engine/hlr_scheduler.py`
- Modify: `backend/app/db/models.py`
- Modify: `backend/app/db/session.py`
- Modify: `backend/app/services/student_service.py` (normalize email in `register_user` & `authenticate_user`)
- Modify: `backend/app/main.py` (add `storage_mode` & `persistent` to `/health`, `/api/health`, `/api/v1/health`)
- Create: `backend/.env.example`
- Test: `backend/tests/test_hlr_and_learning_path.py` (unit tests for scheduler)
- Test: `backend/tests/test_backend_portal_and_persistence.py` (email normalization, health `storage_mode`, `UserMemoryTrace` uniqueness)

**Interfaces:**
- Consumes: `backend/app/config.py::settings.database_url`, `backend/app/db/session.py::Base`.
- Produces:
  - `backend/app/engine/hlr_scheduler.py`:
    - `initial_half_life_from_score(score: float | None) -> float` (`2.0` if `<50`, `5.0` if `50–74.99`, `10.0` if `>=75`, `4.0` if `None`)
    - `compute_recall_probability(delta_days: float, half_life_days: float) -> float`
    - `update_memory_trace(half_life_days: float, difficulty_index: float, passed: bool, gap_type: str | None = None, response_time_ms: int = 0) -> dict[str, float | int]` (returns `half_life_days`, `difficulty_index`, `hlr_next_review_days`)
    - `select_goldilocks_tier(mastery_score: float, recall_probability: float, critical_safety_flag: bool = False) -> dict[str, str | float]` (returns `tier`, `label`, `predicted_success_probability`, `theta`)
  - `backend/app/db/models.py::UserMemoryTrace` (`__tablename__ = "user_memory_traces"`, unique `(user_id, concept_key)`)
  - `backend/app/db/session.py::get_storage_status() -> dict[str, str | bool]` (returns `{"storage_mode": "postgresql" | "sqlite_local" | "sqlite_ephemeral", "persistent": bool}`)

- [ ] **Step 1: Write failing tests in `backend/tests/test_hlr_and_learning_path.py` and `backend/tests/test_backend_portal_and_persistence.py`**

Include tests asserting:
1. `compute_recall_probability(0, 5.0) == 1.0`, `compute_recall_probability(5.0, 5.0) == pytest.approx(0.5, abs=1e-3)`, and clamping at `0.05` for huge `delta_days`.
2. `update_memory_trace` grows `half_life_days` and lowers `difficulty_index` on pass (with `+0.08` fluency bonus when `0 < response_time_ms <= 25000`), and shrinks `half_life_days` (`* 0.48`, floor `1.0`) while raising `difficulty_index` (`+0.18` on `GAP_TRIAGE_SEVERITY`, `+0.12` otherwise) on fail, returning `hlr_next_review_days` in `[1, 30]`.
3. `select_goldilocks_tier` returns `Nivel 1 (Fundacional)` whenever `critical_safety_flag=True` even at mastery `90.0`, and selects higher tiers as mastery/recall rises toward target success `0.78`.
4. **Review Focus #1:** registering `"  Doctor.Test@UPCH.pe "` stores `"doctor.test@upch.pe"`, rejects `"doctor.test@upch.pe"` as duplicate, and authenticates with `"DOCTOR.TEST@upch.pe"`.
5. `/api/v1/health` returns `status == "healthy"`, `storage_mode in ("sqlite_local", "sqlite_ephemeral", "postgresql")`, and boolean `persistent`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/matias/Github/OdysMedic/backend && PYTHONPATH=. .venv/bin/pytest tests/test_hlr_and_learning_path.py tests/test_backend_portal_and_persistence.py -v`  
Expected: FAIL (`ModuleNotFoundError: app.engine.hlr_scheduler` and missing keys/normalization).

- [ ] **Step 3: Implement `hlr_scheduler.py`, `UserMemoryTrace`, multi-dialect `session.py`, email normalization, health telemetry, and `backend/.env.example`**

- Create `backend/app/engine/hlr_scheduler.py` implementing the exact spec formulas in Section 5.2B.
- Add `UserMemoryTrace` to `backend/app/db/models.py` (linked to `User.memory_traces` with `cascade="all, delete-orphan"`).
- Update `backend/app/db/session.py`: extend `_ensure_user_columns(target)` so PostgreSQL executes `ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {pg_ddl}` (using `TIMESTAMP` instead of `DATETIME` on Postgres) alongside SQLite, and add `get_storage_status()`.
- Update `register_user` and `authenticate_user` in `backend/app/services/student_service.py` to normalize `email = email.strip().lower()`.
- Update `health_check()` in `backend/app/main.py` to include `storage_mode` and `persistent` from `get_storage_status()`.
- Create `backend/.env.example` documenting `DATABASE_URL` (Neon/Supabase PostgreSQL), `SECRET_KEY`, and `CORS_ORIGINS`.

- [ ] **Step 4: Run targeted tests and full pytest suite**

Run: `cd /home/matias/Github/OdysMedic/backend && PYTHONPATH=. .venv/bin/pytest -q`  
Expected: ALL existing 85 tests + new Task 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/engine/hlr_scheduler.py backend/app/db/models.py backend/app/db/session.py backend/app/services/student_service.py backend/app/main.py backend/.env.example backend/tests/test_hlr_and_learning_path.py backend/tests/test_backend_portal_and_persistence.py
git commit -m "feat(ocri,db): add HLR/IRT scheduler, UserMemoryTrace ORM, multi-dialect migrations and auth email normalization"
```

---

### Task 3: Progressive Clinical Learning Path Engine & API (`GET /api/v1/leveling/learning-path`, Enriched Dashboard & Coherent `simulate-days`)

**Files:**
- Modify: `backend/app/services/student_service.py`
- Modify: `backend/app/api/routes_leveling.py`
- Test: `backend/tests/test_hlr_and_learning_path.py`

**Interfaces:**
- Consumes: `backend/app/engine/hlr_scheduler.py` (`initial_half_life_from_score`, `compute_recall_probability`, `update_memory_trace`, `select_goldilocks_tier`), `backend/app/db/models.py::UserMemoryTrace`.
- Produces:
  - `student_service.ensure_memory_traces(db: Session, user: User) -> list[UserMemoryTrace]` (lazy idempotent initialization for all 5 `CARDINAL_SPECIALTIES`)
  - `student_service.build_progressive_learning_path(db: Session, user_id: int) -> dict[str, Any]` returning:
    ```python
    {
      "units": [
        {
          "unit_index": int,           # 1..5
          "specialty": str,            # cardinal slug
          "specialty_name": str,
          "primary_case_id": str,
          "mastery_score": float,
          "half_life_days": float,
          "recall_probability": float, # 0.05..1.0
          "difficulty_index": float,
          "hlr_next_review_days": int,
          "goldilocks_tier": str,
          "completed_nodes": int,
          "total_nodes": 4,
          "is_priority": bool,
          "nodes": [
            {
              "node_id": str,          # "{specialty}-s{1|2|3|cp}"
              "order": int,            # 1..4
              "node_type": str,        # "triage" | "labs" | "management" | "checkpoint"
              "title": str,
              "case_id": str,
              "station_id": int,       # 1, 2, 3, or 1 for checkpoint review
              "difficulty_label": str,
              "status": str,           # "locked" | "active" | "completed" | "needs_review"
              "recall_probability": float,
              "xp_reward": int,
            }
          ]
        }
      ],
      "active_node": dict | None,
      "hlr_summary": {
        "average_half_life_days": float,
        "average_recall_probability": float,
        "goldilocks_target_tier": str,
        "weakest_retention_specialty": str,
        "weakest_retention_probability": float,
        "model_references": list[str],
      },
      "total_nodes": 20,
      "completed_nodes": int,
    }
    ```
  - `GET /api/v1/leveling/learning-path` endpoint in `routes_leveling.py`.
  - Additive keys `hlr_summary` and `learning_path` on `GET /api/v1/leveling/dashboard` and `POST /api/v1/leveling/simulate-days` (`result["dashboard"]`).

- [ ] **Step 1: Write failing integration tests in `backend/tests/test_hlr_and_learning_path.py`**

Add tests pinning all spec behaviors and Review Focus items #2, #3, #4, #5:
1. **Pre-diagnostic locked state:** fresh user calling `GET /api/v1/leveling/learning-path` receives 5 units, 20 total nodes, and all 20 nodes in `"locked"` state.
2. **Review Focus #2 (High diagnostic `>= 75%` with zero MCQ attempts):** after passing diagnostic with 100%, all 5 units have Node 1 `"active"`, Nodes 2–3 `"locked"`, and **Node 4 (`checkpoint`) `"locked"`** (never auto-completed before Stations 1–3 pass).
3. **Sequential unlock & Node 4 completion:** passing Stations 1, 2, and 3 on a unit's primary case transitions Node 1 → `"completed"`, Node 2 → `"completed"`, Node 3 → `"completed"`, and Node 4 (`checkpoint`) → `"completed"`, while updating `UserMemoryTrace.half_life_days` upward.
4. **Review Focus #3 (Non-cardinal diagnostic specialty ordering):** completing diagnostic with `mode="specialty", specialty="pediatria"` or `"medicina_interna"` maps via `SPECIALTY_TO_CASE_CANDIDATES` to place the aligned cardinal specialty as Unit 1 (`is_priority=True`) without error.
5. **Review Focus #4 (Coherent `simulate_elapsed_days` HLR mutations):**
   - `active_streak` (`+21d`): practiced priority unit stays healthy (`recall_probability >= 0.80`, `half_life_days` increases) while an unpracticed gap unit decays (`recall_probability < 0.72`).
   - `inactivity_decay` (`14d`): all 5 units drop `recall_probability` significantly and previously completed/active units flag `"needs_review"`.
   - `reset`: restores all 5 units back to `recall_probability == pytest.approx(1.0, abs=0.05)` and `simulated_days_elapsed == 0`.
6. **Review Focus #5 (Lazy backfill):** deleting all rows from `user_memory_traces` for an existing user and calling `GET /api/v1/leveling/dashboard` lazily recreates the 5 cardinal traces and returns valid `hlr_summary` and `learning_path`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/matias/Github/OdysMedic/backend && PYTHONPATH=. .venv/bin/pytest tests/test_hlr_and_learning_path.py -v`  
Expected: FAIL (`404 Not Found` on `/api/v1/leveling/learning-path` and missing keys).

- [ ] **Step 3: Implement trace lifecycle, `build_progressive_learning_path`, coherent `simulate_elapsed_days` HLR updates, and `/learning-path` route**

- In `backend/app/services/student_service.py`:
  - Add `ensure_memory_traces(db, user)` and call it in `register_user`, `submit_diagnostic_exam` (calibrating `half_life_days` from score), `record_mcq_attempt` (updating the specialty trace via `update_memory_trace`), `get_student_dashboard`, and `build_progressive_learning_path`.
  - Implement `build_progressive_learning_path(db, user_id)` following Section 5.2D verbatim (5 cardinal units, non-cardinal mapping via `SPECIALTY_TO_CASE_CANDIDATES`, 4 nodes per unit, Node 4 strictly gated on Stations 1–3 passed, `needs_review` when `recall_probability < 0.72` or overdue task on that unit).
  - Update `simulate_elapsed_days()` with the 3 exact HLR rules from Section 5.2C (`active_streak`, `inactivity_decay`, `reset`) while keeping all existing EMA / D7 / D21 mutations untouched.
  - Append `hlr_summary` and `learning_path` to `get_student_dashboard()` return dict.
- In `backend/app/api/routes_leveling.py`: add `@router.get("/learning-path")`.

- [ ] **Step 4: Run full backend test suite**

Run: `cd /home/matias/Github/OdysMedic/backend && PYTHONPATH=. .venv/bin/pytest -q`  
Expected: ALL tests pass (85 existing + all new HLR/path tests, zero regressions).

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/student_service.py backend/app/api/routes_leveling.py backend/tests/test_hlr_and_learning_path.py
git commit -m "feat(ocri): implement HLR memory traces, progressive clinical learning path API and coherent time-decay simulation"
```

---

### Task 4: Backend Editorial API Portal (`GET /`, `GET /portal`) & Custom Editorial Swagger UI (`GET /docs`)

**Files:**
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_backend_portal_and_persistence.py`

**Interfaces:**
- Consumes: `backend/app/db/session.py::get_storage_status`, `backend/app/config.py::settings`.
- Produces:
  - Content-negotiated `GET /` (returns existing JSON dict when `Accept` does not prioritize `text/html`; returns editorial HTML portal when `Accept` contains `text/html` and does not prioritize `application/json`).
  - Dedicated `GET /portal` returning the editorial HTML portal unconditionally.
  - Custom editorial Swagger UI at `GET /docs` (`docs_url=None` on `FastAPI(...)`, served via `fastapi.openapi.docs.get_swagger_ui_html` with editorial CSS using `#FAF9F6`, `#0D1F26`, `#0E6F65`, `Source Serif 4`, `Inter`, `JetBrains Mono`).

- [ ] **Step 1: Write failing tests in `backend/tests/test_backend_portal_and_persistence.py`**

Add tests asserting:
1. `client.get("/")` (default `Accept: */*`) returns `200` JSON with `health == "/health"` and `docs == "/docs"`.
2. `client.get("/", headers={"Accept": "text/html,application/xhtml+xml"})` returns `200` `text/html` containing `"OdyssMedic"`, `"Source Serif 4"`, `"OCRI"`, and `"/docs"`.
3. `client.get("/portal")` returns `200` `text/html` displaying the active `storage_mode`.
4. `client.get("/docs")` returns `200` `text/html` containing Swagger UI plus custom editorial styling (`#FAF9F6` and `#0E6F65`).

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/matias/Github/OdysMedic/backend && PYTHONPATH=. .venv/bin/pytest tests/test_backend_portal_and_persistence.py -v`  
Expected: FAIL (`GET /` returns JSON for `text/html`, `/portal` returns 404, `/docs` lacks custom editorial CSS).

- [ ] **Step 3: Implement Editorial API Portal and Styled Swagger UI in `backend/app/main.py`**

- Set `docs_url=None` in `FastAPI(...)` and mount custom `@app.get("/docs", include_in_schema=False)` injecting editorial CSS into the `get_swagger_ui_html` response.
- Build a clean `render_editorial_portal_html()` helper (no neon, no rounded eyebrow pills, `1px` hairlines, `#FAF9F6` ivory canvas, `#0D1F26` ink, `#0E6F65` teal, showing live `storage_mode`, OCRI-HLR endpoints, and links to `/docs`, `/redoc`, `/api/v1/health`).
- Serve it at `GET /portal` and on `GET /` when `Request.headers.get("accept", "")` explicitly requests `text/html` ahead of `application/json`.

- [ ] **Step 4: Run full backend test suite**

Run: `cd /home/matias/Github/OdysMedic/backend && PYTHONPATH=. .venv/bin/pytest -q`  
Expected: ALL backend tests pass (`test_health_and_root_endpoints` and new portal/docs tests green).

- [ ] **Step 5: Commit**

```bash
git add backend/app/main.py backend/tests/test_backend_portal_and_persistence.py
git commit -m "feat(backend-ui): add editorial medical API portal and custom-styled Swagger docs"
```

---

### Task 5: Frontend Editorial Design System, Auth Persistence Fix, Native CSS Scroll-Driven Animations & Landing Redesign

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/index.css`
- Create: `frontend/src/components/common/ScrollParticlesBackdrop.tsx`
- Modify: `frontend/src/context/AuthContext.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/common/Navbar.tsx`
- Modify: `frontend/src/pages/LandingPage.tsx`

**Interfaces:**
- Consumes: `POST /api/v1/auth/register` returning `{ access_token, token_type, user }`.
- Produces:
  - Unified editorial typography (`Source Serif 4` + `Inter` + `JetBrains Mono`) and color tokens (`#FAF9F6`, `#F3F1EC`, `#DEDBD2`, `#0D1F26`, `#3D525A`, `#0E6F65`, `#9A6B1F`, `#A6262E`).
  - Native CSS Scroll-Driven utilities in `index.css` (`.scroll-progress-hairline`, `.navbar-scroll-refine`, `.scroll-editorial-reveal`) properly `@supports`-gated with `animation-timeline` declared AFTER `animation`, plus `@media (prefers-reduced-motion: reduce)`.
  - `AuthContext`: immediate `setUser(res.user)` on `register()`/`login()` without redundant `getMe()` race.
  - `App.tsx`: `handleSelectCase(caseId: string, stationNumber?: number)` passing `initialStationNumber` to `SimulatorPage`, plus `document.startViewTransition` wrapper on tab switches.

- [ ] **Step 1: Upgrade fonts, Tailwind tokens, and native CSS Scroll-Driven Animations**

- Update `frontend/index.html` to load `Source Serif 4`, `Inter`, and `JetBrains Mono`, setting body canvas `#FAF9F6` and ink `#0D1F26`.
- Update `frontend/tailwind.config.js`: set `fontFamily.serif` to `'Source Serif 4'` and fix `fontFamily.mono` to `'JetBrains Mono'`; add editorial palette tokens.
- Update `frontend/src/index.css`:
  - Add `.scroll-progress-hairline` (`position: fixed; top: 0; left: 0; height: 2px; background: #0E6F65; transform-origin: 0 50%`) animated with `@supports (animation-timeline: scroll())` -> `animation: grow-progress auto linear; animation-timeline: scroll(root);`.
  - Add `.navbar-scroll-refine` with `@supports ((animation-timeline: scroll()) and (animation-range: 0% 100%))` -> `animation-timeline: scroll(block root); animation-range: 0px 120px;`.
  - Add `.scroll-editorial-reveal` with `@supports (animation-timeline: view())` -> `animation: editorialReveal linear both; animation-timeline: view(); animation-range: entry 0% cover 28%;` (bidirectional as user scrolls up/down!).
  - Preserve `@media (prefers-reduced-motion: reduce)` override.

- [ ] **Step 2: Create `ScrollParticlesBackdrop.tsx` and fix `AuthContext.tsx` + `App.tsx`**

- Create `frontend/src/components/common/ScrollParticlesBackdrop.tsx`: minimalist, well-spaced geometric clinical dots/hairline crosses on `<canvas aria-hidden="true">` coupled smoothly to scroll position via `requestAnimationFrame`, automatically skipped under `prefers-reduced-motion: reduce`.
- Update `frontend/src/context/AuthContext.tsx`: in `register()` and `login()`, hydrate `user` immediately from `res.user` if present (`setUser(res.user)`) and only call `authApi.getMe()` as fallback; normalize email before sending.
- Update `frontend/src/App.tsx`: add `selectedStation: number | undefined` state, update `handleSelectCase(caseId: string, stationNumber?: number)` and pass `initialStationNumber={selectedStation}` to `SimulatorPage`, wrap tab state transitions in `document.startViewTransition` (with safe fallback), and mount `<div className="scroll-progress-hairline" aria-hidden="true" />`.

- [ ] **Step 3: Refactor `Navbar.tsx` and `LandingPage.tsx` to strict anti-AI-slop Editorial Medical Craft**

- Remove all rounded eyebrow pills, repetitive pastel chips, and boxed `rounded-2xl` symmetric comparison/world cards.
- Restructure `LandingPage.tsx` with `ScrollParticlesBackdrop` behind the open editorial hero, `1px` `#DEDBD2` hairline dividers separating asymmetric editorial columns (Shift Overload vs. 5-Minute Clinical Stations; Passive Banks vs. OCRI-HLR Memory Half-Life; 4 Clinical Worlds ledger; Progressive Path editorial preview; Testimonials), using `Source Serif 4` headlines, `Inter` copy, `JetBrains Mono` clinical telemetry (`h = 9.4d`, `p = 84%`, `PA 85/55 mmHg`), and `.scroll-editorial-reveal` on every section.
- Refine `Navbar.tsx` with `1px` bottom rule, crisp editorial links, `.navbar-scroll-refine`, and monospace XP/streak readout without rounded pill clutter.

- [ ] **Step 4: Verify TypeScript compilation and production Vite build**

Run: `cd /home/matias/Github/OdysMedic/frontend && npm run build`  
Expected: `✓ built` with zero TypeScript or bundler errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/index.html frontend/tailwind.config.js frontend/src/index.css frontend/src/components/common/ScrollParticlesBackdrop.tsx frontend/src/components/common/Navbar.tsx frontend/src/context/AuthContext.tsx frontend/src/App.tsx frontend/src/pages/LandingPage.tsx
git commit -m "feat(frontend): editorial design system, native scroll-driven animations, auth race fix and landing redesign"
```

---

### Task 6: Frontend Progressive Clinical Path (`ClinicalLearningPath.tsx`), Editorial Dashboard & Secondary Views Harmonization + End-to-End Verification

**Files:**
- Modify: `frontend/src/types/api.ts`
- Modify: `frontend/src/services/api.ts`
- Create: `frontend/src/components/dashboard/ClinicalLearningPath.tsx`
- Modify: `frontend/src/components/dashboard/index.ts`
- Modify: `frontend/src/pages/DashboardPage.tsx`
- Modify: `frontend/src/components/dashboard/BentoStats.tsx`
- Modify: `frontend/src/components/dashboard/SpacedRepetitionQueue.tsx`
- Modify: `frontend/src/components/dashboard/TimePassageSimulator.tsx`
- Modify: `frontend/src/components/dashboard/SpecialtyCard.tsx`
- Modify: `frontend/src/pages/SimulatorPage.tsx`
- Modify: `frontend/src/pages/DiagnosticExamPage.tsx`
- Modify: `frontend/src/pages/LibraryPage.tsx`
- Modify: `frontend/src/components/auth/AuthModal.tsx`

**Interfaces:**
- Consumes: `GET /api/v1/leveling/dashboard` (including `hlr_summary`, `learning_path`), `GET /api/v1/leveling/learning-path`, `POST /api/v1/leveling/simulate-days`, `App.tsx::handleSelectCase(caseId, stationNumber?)`.
- Produces:
  - `ClinicalLearningPath` component rendering the 5 progressive units × 4 sequential nodes with SVG progress rings, HLR telemetry (`h` days, recall `%`, Goldilocks tier), interactive node launch (`onSelectNode(caseId, stationId)`), and live visual reaction to `TimePassageSimulator`.
  - `SimulatorPage` honoring `initialStationNumber?: number` (`1 | 2 | 3`) when opening a case from a specific path node.

- [ ] **Step 1: Add TypeScript types and API client bindings**

- In `frontend/src/types/api.ts`: add `LearningPathNodeStatus`, `LearningPathNode`, `LearningPathUnit`, `HLRSummary`, `ProgressiveLearningPath`, and optional `hlr_summary?: HLRSummary` and `learning_path?: ProgressiveLearningPath` on `LevelingDashboard`.
- In `frontend/src/services/api.ts`: map `hlr_summary` and `learning_path` inside `levelingApi.getDashboard()` and `levelingApi.simulateDays()`, and add `levelingApi.getLearningPath()`.

- [ ] **Step 2: Build `ClinicalLearningPath.tsx` and integrate into editorial `DashboardPage.tsx`**

- Create `frontend/src/components/dashboard/ClinicalLearningPath.tsx` (export in `components/dashboard/index.ts`):
  - Editorial unit ledger separated by `1px` `#DEDBD2` rules.
  - Per-unit header: unit number (`01`–`05` in `JetBrains Mono`), specialty title in `Source Serif 4`, Goldilocks tier recommendation, HLR half-life (`h = X.Xd`) and animated recall bar (`p = XX%`).
  - Vertical `1px` clinical spine connecting the 4 sequential nodes (`Estación 1 · Triaje`, `Estación 2 · Exámenes`, `Estación 3 · Conducta`, `Guardia Integradora`) with custom SVG circular progress rings and state styling (`completed` solid `#0E6F65`, `active` double ring + CTA `"Iniciar estación"`, `needs_review` `#A6262E`/`#9A6B1F` alert ring + CTA `"Rescatar retención"`, `locked` muted outline).
  - Pre-diagnostic banner/CTA when `!isDiagnosticCompleted` prompting the calibration exam cleanly.
- Refactor `DashboardPage.tsx`, `BentoStats.tsx`, `SpacedRepetitionQueue.tsx`, `TimePassageSimulator.tsx`, and `SpecialtyCard.tsx`:
  - Replace boxed card grids with a clean editorial telemetry strip (`1px` vertical dividers: OCRI, Retención HLR media, Vida media `h`, Racha, XP), `ClinicalLearningPath` as main left/primary column (replacing the redundant 5-card `SpecialtyCard` grid), and editorial right rail (`CompetencyRadar` + `TimePassageSimulator` + `SpacedRepetitionQueue`).
  - Update `DashboardPageProps.onSelectCase` to `(caseId: string, stationNumber?: number) => void`.

- [ ] **Step 3: Wire `initialStationNumber` in `SimulatorPage.tsx` and harmonize secondary views**

- In `frontend/src/pages/SimulatorPage.tsx`: add `initialStationNumber?: number` to `SimulatorPageProps`; when stations load for `initialCaseId`, initialize `currentStationIndex` to `Math.max(0, Math.min(stations.length - 1, (initialStationNumber ?? 1) - 1))` instead of always `0`.
- Harmonize editorial palette (`#FAF9F6`, `#F3F1EC`, `#DEDBD2`, `#0D1F26`, `#0E6F65`), `1px` hairline borders, `Source Serif 4` headings, and `JetBrains Mono` clinical telemetry across `SimulatorPage.tsx`, `DiagnosticExamPage.tsx`, `LibraryPage.tsx`, and `AuthModal.tsx` (stripping rounded eyebrow pills and pastel badge clutter).

- [ ] **Step 4: Run full verification (Backend Pytest + Frontend Build + Live Smoke Check)**

Run:
1. `cd /home/matias/Github/OdysMedic/backend && PYTHONPATH=. .venv/bin/pytest -v` (confirm all 85+ tests pass with zero failures).
2. `cd /home/matias/Github/OdysMedic/frontend && npm run build` (confirm zero TS/Vite errors).
3. Start backend + frontend locally and verify live registration persistence, `/portal`, `/docs`, `/api/v1/leveling/learning-path`, progressive path rendering, and `TimePassageSimulator` HLR recall transitions.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/
git commit -m "feat(frontend): add ClinicalLearningPath, HLR telemetry dashboard and unified editorial redesign"
```
