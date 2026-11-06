from datetime import datetime, timezone, timedelta
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
        stage: str = "Internado Rotatorio 2026",
        target_exam: str = "ENIM-EsSalud",
    ) -> User:
        existing_user = db.query(User).filter_by(email=email).first()
        if existing_user:
            raise ValueError(f"User with email '{email}' is already registered")

        password_hashed = hash_password(password)
        try:
            user = User(
                email=email,
                password_hash=password_hashed,
                full_name=full_name,
                university=university,
                stage=stage,
                target_exam=target_exam,
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

        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "university": user.university,
            "stage": user.stage,
            "target_exam": user.target_exam,
            "plan_tier": user.plan_tier,
            "xp": user.xp,
            "streak_days": user.streak_days,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "university": user.university,
                "stage": user.stage,
                "target_exam": user.target_exam,
                "plan_tier": user.plan_tier,
                "xp": user.xp,
                "streak_days": user.streak_days,
            },
            "specialties": specialty_profiles,
            "specialty_profiles": specialty_profiles,
            "radar": radar_data,
            "ocri_score": ocri_score,
            "global_ocri_score": ocri_score,
            "pending_repetition_tasks": formatted_tasks,
            "spaced_repetition_tasks": formatted_tasks,
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
