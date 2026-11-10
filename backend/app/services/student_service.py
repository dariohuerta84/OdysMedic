from datetime import datetime, timezone, timedelta
import json
from typing import Optional, Union, List, Dict, Any
from sqlalchemy.orm import Session

from app.db.models import (
    User,
    StudentMastery,
    StudentGapMetric,
    CaseAttempt,
    SpacedRepetitionTask,
)
from app.db.seeder import seed_initial_data, CARDINAL_SPECIALTIES, DEMO_USER_EMAIL
from app.db.diagnostic_bank import (
    DIAGNOSTIC_QUESTIONS,
    SPECIALTY_ALIASES,
    resolve_diagnostic_question_set,
)
from app.models.enums import (
    MedicalSpecialty,
    CognitiveGap,
    StudentCompetencyLevel,
)
from app.models.student import SpecialtyMasteryProfile, LevelingPrescription
from app.engine.leveling_engine import (
    calculate_specialty_competency,
    generate_leveling_prescription,
    map_gap_to_deficiency,
)
from app.services.auth_service import hash_password, verify_password
from app.services.case_service import case_repository


SPECIALTY_DISPLAY_NAMES: Dict[str, str] = {
    "nefrologia": "Nefrologia y Medio Interno",
    "endocrinologia": "Endocrinologia y Metabolismo",
    "neurologia": "Neurologia Clinica",
    "reumatologia": "Reumatologia e Inmunologia",
    "ginecologia_obstetricia": "Ginecologia y Obstetricia",
    "oftalmologia": "Oftalmologia Clinica",
    "medicina_interna": "Medicina Interna",
    "pediatria": "Pediatria",
    "cirugia_general": "Cirugia General",
    "medicina_familiar": "Medicina Familiar",
}

SPECIALTY_TO_CASE_CANDIDATES: Dict[str, List[str]] = {
    "nefrologia": [
        "s13256-019-2334-y",
        "s13256-022-03392-w",
        "s13256-026-05974-4",
        "s13256-023-04294-1",
        "s13256-025-05650-z",
    ],
    "endocrinologia": [
        "s13256-022-03392-w",
        "s13256-025-05650-z",
        "s13256-019-2334-y",
        "s13256-023-04294-1",
        "s13256-026-05974-4",
    ],
    "neurologia": [
        "s13256-023-04294-1",
        "s13256-025-05577-5",
        "s13256-026-05974-4",
        "s13256-019-2334-y",
        "s13256-022-03392-w",
    ],
    "reumatologia": [
        "s13256-026-05974-4",
        "s13256-019-2334-y",
        "s13256-025-05650-z",
        "s13256-023-04294-1",
        "s13256-022-03392-w",
    ],
    "ginecologia_obstetricia": [
        "s13256-025-05650-z",
        "s13256-019-2334-y",
        "s13256-026-05974-4",
        "s13256-022-03392-w",
        "s13256-023-04294-1",
    ],
    "medicina_interna": [
        "s13256-023-04294-1",
        "s13256-022-03392-w",
        "s13256-019-2334-y",
        "s13256-026-05974-4",
        "s13256-025-05577-5",
    ],
    "pediatria": [
        "s13256-019-2334-y",
        "s13256-022-03392-w",
        "s13256-026-05974-4",
        "s13256-023-04294-1",
        "s13256-025-05650-z",
    ],
    "cirugia_general": [
        "s13256-025-05577-5",
        "s13256-024-04496-1",
        "s13256-019-2334-y",
        "s13256-023-04294-1",
        "s13256-022-03392-w",
    ],
    "medicina_familiar": [
        "s13256-022-03392-w",
        "s13256-023-04294-1",
        "s13256-025-05650-z",
        "s13256-019-2334-y",
        "s13256-026-05974-4",
    ],
}

FALLBACK_CASE_TITLES: Dict[str, Dict[str, str]] = {
    "s13256-019-2334-y": {
        "title": "Microangiopatia Trombotica (SHUa) e Injuria Renal Aguda KDIGO 3",
        "specialty": "nefrologia",
    },
    "s13256-022-03392-w": {
        "title": "Complicacion Glucemica Severa y Desequilibrio Hidroelectrolitico",
        "specialty": "endocrinologia",
    },
    "s13256-023-04294-1": {
        "title": "Ictus Isquemico Agudo y Manejo Neurovascular en Ventana",
        "specialty": "neurologia",
    },
    "s13256-024-04496-1": {
        "title": "Urgencia Neuro-Oftalmologica e Hipertension Ocular Secundaria",
        "specialty": "oftalmologia",
    },
    "s13256-025-05577-5": {
        "title": "Evento Cerebrovascular Hemorragico y Estabilizacion Neurocritica",
        "specialty": "neurologia",
    },
    "s13256-025-05650-z": {
        "title": "Trastorno Endocrino-Metabolico Gestacional de Alto Riesgo",
        "specialty": "ginecologia_obstetricia",
    },
    "s13256-026-05974-4": {
        "title": "Lupus Eritematoso Sistemico con Compromiso de Organo Mayor",
        "specialty": "reumatologia",
    },
}

ALL_COGNITIVE_GAPS: List[str] = [
    "GAP_TRIAGE_SEVERITY",
    "GAP_DIAGNOSTIC_REASONING",
    "GAP_LAB_INTERPRETATION",
    "GAP_INITIAL_MANAGEMENT",
]


def _resolve_case_presentation_meta(case_id: str) -> Dict[str, str]:
    full_case = case_repository.get_full_case(case_id)
    fallback = FALLBACK_CASE_TITLES.get(case_id, {})
    if full_case:
        spec_slug = full_case.normalized_specialty or fallback.get("specialty", "medicina_interna")
        title = full_case.display_title or fallback.get("title") or f"Estacion Clinica ({case_id})"
    else:
        spec_slug = fallback.get("specialty", "medicina_interna")
        title = fallback.get("title") or f"Estacion Clinica ({case_id})"

    return {
        "case_title": title,
        "specialty": spec_slug,
        "specialty_name": SPECIALTY_DISPLAY_NAMES.get(
            spec_slug, spec_slug.replace("_", " ").title()
        ),
    }


class StudentService:
    def get_or_create_demo_user(self, db: Session) -> User:
        user = db.query(User).filter_by(email=DEMO_USER_EMAIL).first()
        if not user:
            try:
                seed_initial_data(db)
            except Exception:
                db.rollback()
                raise
            user = db.query(User).filter_by(email=DEMO_USER_EMAIL).first()

        if not user:
            try:
                user = User(
                    email=DEMO_USER_EMAIL,
                    password_hash=hash_password("demo1234"),
                    full_name="Médico Demo UPCH",
                    university="Universidad Peruana Cayetano Heredia",
                    stage="Internado Rotatorio 2026",
                    target_exam="ENIM-EsSalud",
                    plan_tier="free",
                    xp=0,
                    streak_days=1,
                )
                db.add(user)
                db.flush()
                for spec in CARDINAL_SPECIALTIES:
                    db.add(
                        StudentMastery(
                            user_id=user.id,
                            specialty=spec,
                            mastery_score=50.0,
                            competency_level="deficiente",
                            cases_completed=0,
                        )
                    )
                db.commit()
                db.refresh(user)
            except Exception:
                db.rollback()
                raise

        return user

    def register_user(
        self,
        db: Session,
        email: str,
        password: str,
        full_name: str,
        university: str = "Universidad Peruana Cayetano Heredia",
        stage: Optional[str] = None,
        target_exam: Optional[str] = None,
        career: str = "Medicina Humana",
        academic_year: Optional[str] = None,
        primary_goal: str = "preparar_enam",
        initial_world: str = "medicina_interna",
        interest_areas: Optional[List[str]] = None,
        onboarding_track: str = "ruta",
        privacy_accepted: bool = True,
    ) -> User:
        existing_user = db.query(User).filter_by(email=email).first()
        if existing_user:
            raise ValueError(f"User with email '{email}' is already registered")

        goal_to_exam = {
            "preparar_enam": "ENAM",
            "rendir_rotaciones": "Rotaciones Clinicas",
            "reforzar_medicina_interna": "Medicina Interna",
        }
        effective_stage = stage or academic_year or "Internado Rotatorio 2026"
        effective_academic_year = academic_year or effective_stage
        effective_target_exam = target_exam or (
            goal_to_exam.get(primary_goal, "ENIM-EsSalud") if academic_year else "ENIM-EsSalud"
        )
        serialized_interests = json.dumps(interest_areas or [], ensure_ascii=False)
        normalized_world = SPECIALTY_ALIASES.get(
            (initial_world or "medicina_interna").strip().lower().replace("-", "_"),
            "medicina_interna",
        )

        password_hashed = hash_password(password)
        try:
            user = User(
                email=email,
                password_hash=password_hashed,
                full_name=full_name,
                university=university,
                stage=effective_stage,
                target_exam=effective_target_exam,
                career=career or "Medicina Humana",
                academic_year=effective_academic_year,
                primary_goal=primary_goal or "preparar_enam",
                initial_world=normalized_world,
                interest_areas=serialized_interests,
                onboarding_track=onboarding_track or "ruta",
                privacy_accepted=bool(privacy_accepted),
                plan_tier="free",
                xp=0,
                streak_days=1,
            )
            db.add(user)
            db.flush()

            for spec in CARDINAL_SPECIALTIES:
                mastery = StudentMastery(
                    user_id=user.id,
                    specialty=spec,
                    mastery_score=50.0,
                    competency_level="deficiente",
                    cases_completed=0,
                )
                db.add(mastery)

            db.commit()
            db.refresh(user)
            return user
        except Exception:
            db.rollback()
            raise

    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        user = db.query(User).filter_by(email=email).first()
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def get_specialty_mastery(
        self,
        db: Session,
        user_id: int,
        specialty: Union[MedicalSpecialty, str],
    ) -> SpecialtyMasteryProfile:
        user = db.query(User).filter_by(id=user_id).first()
        if not user:
            raise ValueError(f"User with id {user_id} not found")

        spec_str = specialty.value if isinstance(specialty, MedicalSpecialty) else str(specialty).lower()
        spec_enum = MedicalSpecialty(spec_str)

        mastery = (
            db.query(StudentMastery)
            .filter_by(user_id=user_id, specialty=spec_str)
            .first()
        )
        if not mastery:
            try:
                mastery = StudentMastery(
                    user_id=user_id,
                    specialty=spec_str,
                    mastery_score=50.0,
                    competency_level="deficiente",
                    cases_completed=0,
                )
                db.add(mastery)
                db.commit()
                db.refresh(mastery)
            except Exception:
                db.rollback()
                raise

        gap_metrics = (
            db.query(StudentGapMetric)
            .filter_by(user_id=user_id)
            .filter(StudentGapMetric.fail_count > 0)
            .all()
        )
        active_defs = []
        detected_gaps = []
        for gm in gap_metrics:
            detected_gaps.append(gm.gap_type)
            active_defs.append(map_gap_to_deficiency(gm.gap_type))

        unique_active_defs = list(dict.fromkeys(active_defs)) if active_defs else None

        profile = calculate_specialty_competency(
            specialty=spec_enum,
            score=mastery.mastery_score,
            attempts=mastery.cases_completed,
            active_deficiencies=unique_active_defs,
        )
        profile.detected_gaps = detected_gaps
        if mastery.updated_at:
            profile.last_evaluated = mastery.updated_at
        return profile

    def get_student_dashboard(self, db: Session, user_id: int) -> Dict[str, Any]:
        user = db.query(User).filter_by(id=user_id).first()
        if not user:
            raise ValueError(f"User with id {user_id} not found")

        specialty_profiles: Dict[str, Any] = {}
        radar_data: List[Dict[str, Any]] = []
        total_score = 0.0

        for spec_name in CARDINAL_SPECIALTIES:
            profile = self.get_specialty_mastery(db, user_id, spec_name)
            profile_dict = profile.model_dump(mode="json")
            specialty_profiles[spec_name] = profile_dict
            radar_data.append({
                "specialty": spec_name,
                "score": profile.score,
                "level": profile.level.value,
                "needs_leveling": profile.needs_leveling,
            })
            total_score += profile.score

        # Also include auxiliary specialties if the student has records
        all_masteries = db.query(StudentMastery).filter_by(user_id=user_id).all()
        for m in all_masteries:
            if m.specialty not in specialty_profiles:
                aux_profile = self.get_specialty_mastery(db, user_id, m.specialty)
                specialty_profiles[m.specialty] = aux_profile.model_dump(mode="json")

        ocri_score = round(total_score / len(CARDINAL_SPECIALTIES), 2) if CARDINAL_SPECIALTIES else 0.0

        now_utc = datetime.now(timezone.utc)

        # Compute dynamic cognitive_gap_radar reflecting real diagnostic & simulator performance
        gap_metrics_rows = db.query(StudentGapMetric).filter_by(user_id=user_id).all()
        gap_fail_map: Dict[str, int] = {
            gm.gap_type: int(gm.fail_count or 0) for gm in gap_metrics_rows
        }
        user_attempts = db.query(CaseAttempt).filter_by(user_id=user_id).all()
        total_attempts = len(user_attempts)
        passed_attempts = sum(1 for a in user_attempts if a.passed)

        if user.diagnostic_completed and user.diagnostic_score is not None:
            diag_val = float(user.diagnostic_score)
            base_anchor = (
                diag_val
                if total_attempts == 0
                else (0.55 * diag_val + 0.45 * float(ocri_score))
            )
        else:
            base_anchor = float(ocri_score)

        cognitive_gap_radar: Dict[str, int] = {}
        for gap_key in ALL_COGNITIVE_GAPS:
            fails = gap_fail_map.get(gap_key, 0)
            if base_anchor <= 0.0 and passed_attempts == 0:
                raw_axis = max(6.0, 12.0 - fails * 3.0)
            elif fails > 0:
                raw_axis = base_anchor - (fails * 12.0) + (passed_attempts * 4.0)
                if base_anchor <= 40.0:
                    raw_axis = min(raw_axis, max(12.0, base_anchor))
            else:
                if base_anchor >= 95.0:
                    raw_axis = min(100.0, base_anchor)
                elif base_anchor < 50.0:
                    raw_axis = base_anchor + 8.0 + (passed_attempts * 5.0)
                else:
                    raw_axis = min(96.0, base_anchor + 8.0 + (passed_attempts * 4.0))

            clamped_axis = int(round(min(100.0, max(6.0, raw_axis))))
            cognitive_gap_radar[gap_key] = clamped_axis

        pending_tasks = (
            db.query(SpacedRepetitionTask)
            .filter_by(user_id=user_id, status="pending")
            .order_by(SpacedRepetitionTask.scheduled_for.asc())
            .all()
        )
        formatted_tasks = []
        for t in pending_tasks:
            meta = _resolve_case_presentation_meta(t.case_id)
            is_overdue = False
            if t.scheduled_for:
                sched_utc = (
                    t.scheduled_for
                    if t.scheduled_for.tzinfo is not None
                    else t.scheduled_for.replace(tzinfo=timezone.utc)
                )
                is_overdue = sched_utc <= now_utc

            if is_overdue or (
                user.diagnostic_completed
                and user.diagnostic_score is not None
                and user.diagnostic_score < 50.0
            ):
                priority = "urgent"
            elif (
                user.diagnostic_completed
                and user.diagnostic_score is not None
                and user.diagnostic_score < 75.0
            ):
                priority = "high"
            else:
                priority = "normal"

            formatted_tasks.append({
                "id": t.id,
                "case_id": t.case_id,
                "case_title": meta["case_title"],
                "specialty": meta["specialty"],
                "specialty_name": meta["specialty_name"],
                "gap_type": t.gap_type,
                "scheduled_for": t.scheduled_for.isoformat() if t.scheduled_for else None,
                "repetition_cycle": t.repetition_cycle,
                "status": t.status,
                "is_overdue": is_overdue,
                "priority": priority,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            })

        aptitude_label = (
            "Apto para Internado / Examen"
            if user.aptitude_status == "apto"
            else (
                "En Nivelación"
                if user.aptitude_status == "en_nivelacion"
                else (
                    "No Apto"
                    if user.aptitude_status == "no_apto"
                    else "Pendiente de Autoevaluación"
                )
            )
        )

        try:
            parsed_interests = json.loads(user.interest_areas or "[]")
            if not isinstance(parsed_interests, list):
                parsed_interests = []
        except Exception:
            parsed_interests = []

        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "university": user.university,
            "stage": user.stage,
            "target_exam": user.target_exam,
            "career": getattr(user, "career", "Medicina Humana") or "Medicina Humana",
            "academic_year": getattr(user, "academic_year", None) or user.stage,
            "primary_goal": getattr(user, "primary_goal", "preparar_enam") or "preparar_enam",
            "initial_world": getattr(user, "initial_world", "medicina_interna") or "medicina_interna",
            "interest_areas": parsed_interests,
            "onboarding_track": getattr(user, "onboarding_track", "ruta") or "ruta",
            "plan_tier": user.plan_tier,
            "xp": user.xp,
            "streak_days": user.streak_days,
            "diagnostic_completed": bool(user.diagnostic_completed),
            "diagnostic_score": user.diagnostic_score,
            "aptitude_status": user.aptitude_status,
            "aptitude_label": aptitude_label,
            "diagnostic_mode": getattr(user, "diagnostic_mode", None),
            "diagnostic_specialty": getattr(user, "diagnostic_specialty", None),
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "university": user.university,
                "stage": user.stage,
                "target_exam": user.target_exam,
                "career": getattr(user, "career", "Medicina Humana") or "Medicina Humana",
                "academic_year": getattr(user, "academic_year", None) or user.stage,
                "primary_goal": getattr(user, "primary_goal", "preparar_enam") or "preparar_enam",
                "initial_world": getattr(user, "initial_world", "medicina_interna") or "medicina_interna",
                "interest_areas": parsed_interests,
                "onboarding_track": getattr(user, "onboarding_track", "ruta") or "ruta",
                "plan_tier": user.plan_tier,
                "xp": user.xp,
                "streak_days": user.streak_days,
                "diagnostic_completed": bool(user.diagnostic_completed),
                "diagnostic_score": user.diagnostic_score,
                "aptitude_status": user.aptitude_status,
                "aptitude_label": aptitude_label,
                "diagnostic_mode": getattr(user, "diagnostic_mode", None),
                "diagnostic_specialty": getattr(user, "diagnostic_specialty", None),
            },
            "specialties": specialty_profiles,
            "specialty_profiles": specialty_profiles,
            "radar": radar_data,
            "cognitive_gap_radar": cognitive_gap_radar,
            "ocri_score": ocri_score,
            "global_ocri_score": ocri_score,
            "pending_repetition_tasks": formatted_tasks,
            "spaced_repetition_tasks": formatted_tasks,
        }

    def submit_diagnostic_exam(
        self,
        db: Session,
        user_id: int,
        answers: List[Dict[str, Any]],
        mode: str = "general",
        specialty: Optional[str] = None,
    ) -> Dict[str, Any]:
        user = db.query(User).filter_by(id=user_id).first()
        if not user:
            raise ValueError(f"User with id {user_id} not found")

        norm_mode = (mode or "general").strip().lower()
        if norm_mode not in ("general", "specialty"):
            norm_mode = "general"

        norm_spec: Optional[str] = None
        if norm_mode == "specialty" and specialty:
            norm_spec = SPECIALTY_ALIASES.get(
                specialty.strip().lower().replace("-", "_"),
                "medicina_interna",
            )

        # Clean up previous diagnostic-origin gap metrics if retaking calibration
        prior_diag_gaps = (
            db.query(StudentGapMetric)
            .filter_by(user_id=user.id)
            .all()
        )
        for pgm in prior_diag_gaps:
            if pgm.last_concept and pgm.last_concept.startswith("diagnostic_q"):
                db.delete(pgm)
        db.flush()

        selected_questions = resolve_diagnostic_question_set(mode=norm_mode, specialty=norm_spec)
        question_map = {q["id"]: q for q in selected_questions}
        correct_count = 0
        total_questions = len(selected_questions)
        results_detail = []
        detected_gaps_list = []

        ans_dict = {a.get("question_id"): a.get("selected_option_id") for a in answers}

        for q_id, q_data in question_map.items():
            selected_opt_id = ans_dict.get(q_id)
            selected_opt = next(
                (opt for opt in q_data["options"] if str(opt["id"]).lower() == str(selected_opt_id or "").lower()),
                None
            )

            is_correct = bool(selected_opt and selected_opt.get("is_correct"))
            if is_correct:
                correct_count += 1
                results_detail.append({
                    "question_id": q_id,
                    "specialty": q_data["specialty"],
                    "is_correct": True,
                    "selected_option_id": selected_opt_id,
                    "detected_gap": None,
                    "explanation": selected_opt.get("explanation") if selected_opt else "",
                })
            else:
                gap = selected_opt.get("detected_gap") if selected_opt else q_data.get("target_gap")
                if gap:
                    detected_gaps_list.append(gap)
                    gap_metric = (
                        db.query(StudentGapMetric)
                        .filter_by(user_id=user.id, gap_type=gap)
                        .first()
                    )
                    if gap_metric:
                        gap_metric.fail_count += 1
                        gap_metric.last_concept = f"diagnostic_q{q_id}"
                        gap_metric.updated_at = datetime.now(timezone.utc)
                    else:
                        gap_metric = StudentGapMetric(
                            user_id=user.id,
                            gap_type=gap,
                            fail_count=1,
                            last_concept=f"diagnostic_q{q_id}",
                        )
                        db.add(gap_metric)
                    db.flush()

                results_detail.append({
                    "question_id": q_id,
                    "specialty": q_data["specialty"],
                    "is_correct": False,
                    "selected_option_id": selected_opt_id,
                    "detected_gap": gap,
                    "explanation": selected_opt.get("explanation") if selected_opt else "Respuesta no seleccionada o incorrecta.",
                })

        score_pct = round((correct_count / total_questions) * 100.0, 1) if total_questions else 0.0

        if score_pct >= 75.0:
            aptitude_status = "apto"
            aptitude_label = "Apto para Internado / Examen"
        elif score_pct >= 50.0:
            aptitude_status = "en_nivelacion"
            aptitude_label = "En Nivelación - Apto Condicional"
        else:
            aptitude_status = "no_apto"
            aptitude_label = "No Apto - Nivelación Prioritaria Requerida"

        now_utc = datetime.now(timezone.utc)
        user.diagnostic_completed = True
        user.diagnostic_score = score_pct
        user.aptitude_status = aptitude_status
        user.diagnostic_mode = norm_mode
        user.diagnostic_specialty = norm_spec if norm_mode == "specialty" else None
        user.diagnostic_completed_at = now_utc
        user.xp += 100

        target_mastery_specs = list(CARDINAL_SPECIALTIES)
        if norm_mode == "specialty" and norm_spec and norm_spec not in target_mastery_specs:
            target_mastery_specs.append(norm_spec)

        for spec_name in target_mastery_specs:
            mastery = db.query(StudentMastery).filter_by(user_id=user.id, specialty=spec_name).first()
            spec_questions = [r for r in results_detail if r["specialty"] == spec_name]

            if norm_mode == "general":
                if score_pct in (0.0, 100.0):
                    calibrated_score = score_pct
                elif spec_questions:
                    spec_correct = sum(1 for r in spec_questions if r["is_correct"])
                    raw_spec_pct = (spec_correct / len(spec_questions)) * 100.0
                    if len(spec_questions) == 1:
                        calibrated_score = round(0.55 * raw_spec_pct + 0.45 * score_pct, 1)
                    else:
                        calibrated_score = round(raw_spec_pct, 1)
                else:
                    calibrated_score = score_pct
            else:
                # Single-specialty diagnostic mode
                if spec_name == norm_spec:
                    calibrated_score = score_pct
                elif spec_questions:
                    spec_correct = sum(1 for r in spec_questions if r["is_correct"])
                    calibrated_score = round((spec_correct / len(spec_questions)) * 100.0, 1)
                elif mastery and mastery.cases_completed > 0:
                    calibrated_score = mastery.mastery_score
                else:
                    calibrated_score = score_pct

            if not mastery:
                mastery = StudentMastery(
                    user_id=user.id,
                    specialty=spec_name,
                    mastery_score=calibrated_score,
                    competency_level="deficiente" if calibrated_score < 70 else "competente",
                    cases_completed=0,
                )
                db.add(mastery)
            else:
                mastery.mastery_score = calibrated_score
                mastery.competency_level = "deficiente" if calibrated_score < 70 else "competente"
                mastery.updated_at = now_utc

        # Adaptively populate SpacedRepetitionTask queue from failed diagnostic stations
        existing_pending = (
            db.query(SpacedRepetitionTask)
            .filter_by(user_id=user.id, status="pending")
            .all()
        )
        existing_by_case = {t.case_id: t for t in existing_pending}
        assigned_cases_in_batch = set()

        failed_details = [r for r in results_detail if not r["is_correct"]]
        for fail_idx, fail_item in enumerate(failed_details):
            fail_spec = fail_item.get("specialty") or norm_spec or "medicina_interna"
            fail_gap = fail_item.get("detected_gap") or "GAP_DIAGNOSTIC_REASONING"
            candidates = SPECIALTY_TO_CASE_CANDIDATES.get(
                fail_spec,
                SPECIALTY_TO_CASE_CANDIDATES["medicina_interna"],
            )
            chosen_case_id = next(
                (cid for cid in candidates if cid not in assigned_cases_in_batch),
                candidates[0],
            )
            assigned_cases_in_batch.add(chosen_case_id)

            if score_pct < 50.0:
                # Urgent reinforcement: due immediately today (marked overdue/prioritario)
                sched_time = now_utc - timedelta(minutes=max(5, 30 - fail_idx * 5))
            elif fail_idx == 0:
                # First gap in leveling mode scheduled immediately today
                sched_time = now_utc - timedelta(minutes=10)
            else:
                # Subsequent gaps scheduled on D7 interval
                sched_time = now_utc + timedelta(days=7)

            if chosen_case_id in existing_by_case:
                task_row = existing_by_case[chosen_case_id]
                task_row.gap_type = fail_gap
                task_row.scheduled_for = sched_time
                task_row.repetition_cycle = "D7"
            else:
                task_row = SpacedRepetitionTask(
                    user_id=user.id,
                    case_id=chosen_case_id,
                    gap_type=fail_gap,
                    scheduled_for=sched_time,
                    repetition_cycle="D7",
                    status="pending",
                )
                db.add(task_row)
                existing_by_case[chosen_case_id] = task_row

        db.commit()
        db.refresh(user)

        return {
            "success": True,
            "diagnostic_score": score_pct,
            "aptitude_status": aptitude_status,
            "aptitude_label": aptitude_label,
            "diagnostic_mode": norm_mode,
            "diagnostic_specialty": norm_spec if norm_mode == "specialty" else None,
            "correct_count": correct_count,
            "total_questions": total_questions,
            "xp_earned": 100,
            "detected_gaps": list(set(detected_gaps_list)),
            "details": results_detail,
        }

    def record_mcq_attempt(
        self,
        db: Session,
        user_id: int,
        case_id: str,
        station_number: int,
        is_correct: bool,
        gap: Optional[Union[CognitiveGap, str]] = None,
        specialty: Union[MedicalSpecialty, str] = MedicalSpecialty.NEFROLOGIA,
        response_time_ms: int = 0,
    ) -> LevelingPrescription:
        user = db.query(User).filter_by(id=user_id).first()
        if not user:
            raise ValueError(f"User with id {user_id} not found")

        score = 100.0 if is_correct else 0.0
        spec_str = specialty.value if isinstance(specialty, MedicalSpecialty) else str(specialty).lower()
        spec_enum = MedicalSpecialty(spec_str)
        gap_str = gap.value if isinstance(gap, CognitiveGap) else (str(gap) if gap is not None else None)

        try:
            # 1. Insert CaseAttempt
            attempt = CaseAttempt(
                user_id=user.id,
                case_id=case_id,
                station_id=station_number,
                score=score,
                passed=is_correct,
                response_time_ms=response_time_ms,
                detected_gap=gap_str,
            )
            db.add(attempt)

            # 2. Update XP: +25 XP for correct, +5 XP for attempt
            user.xp += 25 if is_correct else 5

            # 3. Spaced repetition & Gap metrics
            next_rep_iso: Optional[str] = None
            if is_correct:
                pending_case_tasks = (
                    db.query(SpacedRepetitionTask)
                    .filter_by(user_id=user.id, case_id=case_id, status="pending")
                    .all()
                )
                for t in pending_case_tasks:
                    t.status = "completed"
            elif gap_str:
                gap_metric = (
                    db.query(StudentGapMetric)
                    .filter_by(user_id=user.id, gap_type=gap_str)
                    .first()
                )
                if gap_metric:
                    gap_metric.fail_count += 1
                    gap_metric.last_concept = case_id
                    gap_metric.updated_at = datetime.now(timezone.utc)
                else:
                    gap_metric = StudentGapMetric(
                        user_id=user.id,
                        gap_type=gap_str,
                        fail_count=1,
                        last_concept=case_id,
                    )
                    db.add(gap_metric)

                existing_pending_task = (
                    db.query(SpacedRepetitionTask)
                    .filter_by(user_id=user.id, case_id=case_id, status="pending")
                    .first()
                )
                # D7 -> D21 progression on recurring error or existing pending task
                if existing_pending_task or gap_metric.fail_count > 1:
                    cycle = "D21"
                    days_ahead = 21
                else:
                    cycle = "D7"
                    days_ahead = 7

                scheduled_time = datetime.now(timezone.utc) + timedelta(days=days_ahead)
                next_rep_iso = scheduled_time.isoformat()

                if existing_pending_task:
                    existing_pending_task.gap_type = gap_str
                    existing_pending_task.repetition_cycle = cycle
                    existing_pending_task.scheduled_for = scheduled_time
                else:
                    rep_task = SpacedRepetitionTask(
                        user_id=user.id,
                        case_id=case_id,
                        gap_type=gap_str,
                        scheduled_for=scheduled_time,
                        repetition_cycle=cycle,
                        status="pending",
                    )
                    db.add(rep_task)

            # 4. Update StudentMastery with EMA alpha = 0.25
            mastery = (
                db.query(StudentMastery)
                .filter_by(user_id=user.id, specialty=spec_str)
                .first()
            )
            if not mastery:
                mastery = StudentMastery(
                    user_id=user.id,
                    specialty=spec_str,
                    mastery_score=50.0,
                    competency_level="deficiente",
                    cases_completed=0,
                )
                db.add(mastery)
                db.flush()

            current_score = mastery.mastery_score
            new_score = round(0.25 * score + 0.75 * current_score, 2)
            mastery.mastery_score = new_score
            mastery.cases_completed += 1
            mastery.updated_at = datetime.now(timezone.utc)

            # Active deficiencies from persistent StudentGapMetric
            active_gap_metrics = (
                db.query(StudentGapMetric)
                .filter_by(user_id=user.id)
                .filter(StudentGapMetric.fail_count > 0)
                .all()
            )
            all_defs = [map_gap_to_deficiency(gm.gap_type) for gm in active_gap_metrics]
            if not is_correct and gap_str:
                all_defs.append(map_gap_to_deficiency(gap_str))
            unique_active_defs = list(dict.fromkeys(all_defs)) if all_defs else None

            profile = calculate_specialty_competency(
                specialty=spec_enum,
                score=new_score,
                attempts=mastery.cases_completed,
                active_deficiencies=unique_active_defs,
            )
            mastery.competency_level = profile.level.value

            # 5. Generate LevelingPrescription
            effective_gap = gap if gap is not None else CognitiveGap.GAP_DIAGNOSTIC_REASONING
            prescription = generate_leveling_prescription(
                specialty=spec_enum,
                mastery_score=new_score,
                detected_gap=effective_gap,
                student_level=profile.level,
                student_id=str(user.id),
            )
            if next_rep_iso:
                prescription.next_repetition_date = next_rep_iso

            # 6. Commit and return
            db.commit()
            return prescription
        except Exception:
            db.rollback()
            raise

    def toggle_user_plan(
        self,
        db: Session,
        user_id: int,
        new_tier: Optional[str] = None,
    ) -> User:
        user = db.query(User).filter_by(id=user_id).first()
        if not user:
            raise ValueError(f"User with id {user_id} not found")

        try:
            if new_tier is not None:
                user.plan_tier = new_tier
            else:
                user.plan_tier = "premium" if user.plan_tier == "free" else "free"

            db.commit()
            db.refresh(user)
            return user
        except Exception:
            db.rollback()
            raise


student_service = StudentService()
