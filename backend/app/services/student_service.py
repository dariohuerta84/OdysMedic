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

        pending_tasks = (
            db.query(SpacedRepetitionTask)
            .filter_by(user_id=user_id, status="pending")
            .order_by(SpacedRepetitionTask.scheduled_for.asc())
            .all()
        )
        formatted_tasks = [
            {
                "id": t.id,
                "case_id": t.case_id,
                "gap_type": t.gap_type,
                "scheduled_for": t.scheduled_for.isoformat() if t.scheduled_for else None,
                "repetition_cycle": t.repetition_cycle,
                "status": t.status,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in pending_tasks
        ]


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

        user.diagnostic_completed = True
        user.diagnostic_score = score_pct
        user.aptitude_status = aptitude_status
        user.diagnostic_mode = norm_mode
        user.diagnostic_specialty = norm_spec if norm_mode == "specialty" else None
        user.diagnostic_completed_at = datetime.now(timezone.utc)
        user.xp += 100

        target_mastery_specs = list(CARDINAL_SPECIALTIES)
        if norm_mode == "specialty" and norm_spec and norm_spec not in target_mastery_specs:
            target_mastery_specs.append(norm_spec)

        for spec_name in target_mastery_specs:
            spec_questions = [r for r in results_detail if r["specialty"] == spec_name]
            if spec_questions:
                spec_correct = sum(1 for r in spec_questions if r["is_correct"])
                calibrated_score = round((spec_correct / len(spec_questions)) * 100.0, 1)
            elif norm_mode == "general":
                calibrated_score = score_pct
            elif spec_name == norm_spec:
                calibrated_score = score_pct
            else:
                calibrated_score = 50.0

            mastery = db.query(StudentMastery).filter_by(user_id=user.id, specialty=spec_name).first()
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
                mastery.updated_at = datetime.now(timezone.utc)

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
