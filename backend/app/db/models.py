from datetime import datetime
from typing import Optional, List
from sqlalchemy import Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    university: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Universidad Peruana Cayetano Heredia",
    )
    stage: Mapped[str] = mapped_column(String(50), default="Internado Rotatorio 2026")
    target_exam: Mapped[str] = mapped_column(String(50), default="ENIM-EsSalud")
    plan_tier: Mapped[str] = mapped_column(String(20), default="free")
    xp: Mapped[int] = mapped_column(Integer, default=0)
    streak_days: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    mastery_profiles: Mapped[List["StudentMastery"]] = relationship(
        "StudentMastery",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    gap_metrics: Mapped[List["StudentGapMetric"]] = relationship(
        "StudentGapMetric",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    attempts: Mapped[List["CaseAttempt"]] = relationship(
        "CaseAttempt",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    repetition_tasks: Mapped[List["SpacedRepetitionTask"]] = relationship(
        "SpacedRepetitionTask",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class StudentMastery(Base):
    __tablename__ = "student_mastery"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    specialty: Mapped[str] = mapped_column(String(50), nullable=False)
    mastery_score: Mapped[float] = mapped_column(Float, default=50.0)
    competency_level: Mapped[str] = mapped_column(String(50), default="deficiente")
    cases_completed: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    user: Mapped["User"] = relationship("User", back_populates="mastery_profiles")


class StudentGapMetric(Base):
    __tablename__ = "student_gap_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    gap_type: Mapped[str] = mapped_column(String(50), nullable=False)
    fail_count: Mapped[int] = mapped_column(Integer, default=0)
    last_concept: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    user: Mapped["User"] = relationship("User", back_populates="gap_metrics")


class CaseAttempt(Base):
    __tablename__ = "case_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    case_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    station_id: Mapped[int] = mapped_column(Integer, default=1)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    passed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    selected_option: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    response_time_ms: Mapped[int] = mapped_column(Integer, default=0)
    detected_gap: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="attempts")


class MedicalReferenceDB(Base):
    __tablename__ = "medical_references"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ref_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    publisher: Mapped[str] = mapped_column(String(255), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    specialty: Mapped[str] = mapped_column(String(50), nullable=False)
    key_recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_level: Mapped[str] = mapped_column(String(50), default="Clase I, Nivel A")
    associated_case: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)


class SpacedRepetitionTask(Base):
    __tablename__ = "spaced_repetition_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    case_id: Mapped[str] = mapped_column(String(100), nullable=False)
    gap_type: Mapped[str] = mapped_column(String(50), nullable=False)
    scheduled_for: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    repetition_cycle: Mapped[str] = mapped_column(String(20), default="D7")
    status: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="repetition_tasks")
