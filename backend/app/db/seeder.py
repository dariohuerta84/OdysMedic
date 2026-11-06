import json
import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.config import settings
from app.db.models import User, StudentMastery, MedicalReferenceDB

logger = logging.getLogger(__name__)

CARDINAL_SPECIALTIES: List[str] = [
    "nefrologia",
    "endocrinologia",
    "neurologia",
    "reumatologia",
    "ginecologia_obstetricia",
]

DEMO_USER_EMAIL = "demo.medico@upch.pe"
DEMO_USER_PASSWORD_HASH = "$2b$12$e80Yv8yM3N6K5Qp7/m71qO0XbF3V8t1T7/m71qO0XbF3V8t1T71qO"


def seed_initial_data(db: Session) -> Dict[str, Any]:
    """
    Seeds initial reference and user data idempotently.
    - Canonical medical references from medical_references.json
    - Default UPCH demo user
    - 5 cardinal specialties StudentMastery records
    """
    summary: Dict[str, Any] = {
        "references_seeded": 0,
        "demo_user_created": False,
        "mastery_profiles_seeded": 0,
    }

    try:
        # 1. Canonical medical references
        ref_file = settings.medical_references_file
        if ref_file.exists():
            with open(ref_file, "r", encoding="utf-8") as f:
                books_data = json.load(f)

            for book in books_data:
                excerpts = book.get("excerpts", [])
                for exc in excerpts:
                    ref_id = exc.get("reference_id")
                    if not ref_id:
                        continue
                    existing_ref = db.query(MedicalReferenceDB).filter_by(ref_id=ref_id).first()
                    if not existing_ref:
                        associated_cases = exc.get("associated_cases", [])
                        assoc_case_str = ", ".join(associated_cases) if associated_cases else None
                        if assoc_case_str and len(assoc_case_str) > 100:
                            assoc_case_str = assoc_case_str[:100]

                        ref_record = MedicalReferenceDB(
                            ref_id=ref_id,
                            title=exc.get("source_title", book.get("title", "")),
                            publisher=exc.get("organization_or_publisher", book.get("authors_or_organization", "")),
                            year=int(exc.get("year", 2024)),
                            specialty=exc.get("associated_specialty", book.get("specialty", "")),
                            key_recommendation=exc.get("key_recommendation", ""),
                            evidence_level=exc.get("evidence_level", "Clase I, Nivel A"),
                            associated_case=assoc_case_str,
                        )
                        db.add(ref_record)
                        summary["references_seeded"] += 1

        # 2. Demo User
        demo_user = db.query(User).filter_by(email=DEMO_USER_EMAIL).first()
        if not demo_user:
            demo_user = User(
                email=DEMO_USER_EMAIL,
                password_hash=DEMO_USER_PASSWORD_HASH,
                full_name="Médico Demo UPCH",
                university="Universidad Peruana Cayetano Heredia",
                stage="Internado Rotatorio 2026",
                target_exam="ENIM-EsSalud",
                plan_tier="free",
                xp=0,
                streak_days=1,
            )
            db.add(demo_user)
            db.flush()
            summary["demo_user_created"] = True

        # 3. 5 Cardinal Specialties StudentMastery records
        for specialty in CARDINAL_SPECIALTIES:
            existing_mastery = db.query(StudentMastery).filter_by(
                user_id=demo_user.id,
                specialty=specialty,
            ).first()
            if not existing_mastery:
                mastery = StudentMastery(
                    user_id=demo_user.id,
                    specialty=specialty,
                    mastery_score=50.0,
                    competency_level="deficiente",
                    cases_completed=0,
                )
                db.add(mastery)
                summary["mastery_profiles_seeded"] += 1

        db.commit()
    except Exception:
        db.rollback()
        raise

    return summary
