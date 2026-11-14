import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_uuid() -> str:
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    student = "student"
    professor = "professor"
    admin = "admin"


class DomainLinkType(str, enum.Enum):
    SKILL = "SKILL"
    DESIRED_DOMAIN = "DESIRED_DOMAIN"


class ApprovalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    student: Mapped["Student | None"] = relationship(back_populates="user", uselist=False)
    professor: Mapped["Professor | None"] = relationship(back_populates="user", uselist=False)


class Domain(Base):
    __tablename__ = "domains"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    kind: Mapped[str] = mapped_column(String(32), default="general", nullable=False)


class Student(Base):
    __tablename__ = "students"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    cgpa: Mapped[float | None] = mapped_column(Float, nullable=True)
    program: Mapped[str | None] = mapped_column(String(120), nullable=True)
    primary_domain_id: Mapped[str | None] = mapped_column(ForeignKey("domains.id"), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped[User] = relationship(back_populates="student")
    primary_domain: Mapped[Domain | None] = relationship()
    domains: Mapped[list["StudentDomain"]] = relationship(
        back_populates="student",
        cascade="all, delete-orphan",
    )


class StudentDomain(Base):
    __tablename__ = "student_domains"
    __table_args__ = (UniqueConstraint("student_id", "domain_id", "type", name="uq_student_domain_type"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    student_id: Mapped[str] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"))
    domain_id: Mapped[str] = mapped_column(ForeignKey("domains.id", ondelete="CASCADE"))
    type: Mapped[DomainLinkType] = mapped_column(Enum(DomainLinkType), nullable=False)

    student: Mapped[Student] = relationship(back_populates="domains")
    domain: Mapped[Domain] = relationship()


class Professor(Base):
    __tablename__ = "professors"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    department: Mapped[str] = mapped_column(String(160), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped[User] = relationship(back_populates="professor")
    domains: Mapped[list["ProfessorDomain"]] = relationship(
        back_populates="professor",
        cascade="all, delete-orphan",
    )
    approval: Mapped["ProfessorApproval | None"] = relationship(
        back_populates="professor",
        uselist=False,
        cascade="all, delete-orphan",
    )


class ProfessorDomain(Base):
    __tablename__ = "professor_domains"
    __table_args__ = (UniqueConstraint("professor_id", "domain_id", name="uq_professor_domain"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    professor_id: Mapped[str] = mapped_column(ForeignKey("professors.id", ondelete="CASCADE"))
    domain_id: Mapped[str] = mapped_column(ForeignKey("domains.id", ondelete="CASCADE"))

    professor: Mapped[Professor] = relationship(back_populates="domains")
    domain: Mapped[Domain] = relationship()


class Match(Base):
    __tablename__ = "matches"
    __table_args__ = (UniqueConstraint("student_a_id", "student_b_id", name="uq_match_pair"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    student_a_id: Mapped[str] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    student_b_id: Mapped[str] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class ProfessorApproval(Base):
    __tablename__ = "professor_approvals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    professor_id: Mapped[str] = mapped_column(
        ForeignKey("professors.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    admin_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    status: Mapped[ApprovalStatus] = mapped_column(
        Enum(ApprovalStatus),
        default=ApprovalStatus.PENDING,
        nullable=False,
    )
    acted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    professor: Mapped[Professor] = relationship(back_populates="approval")
    admin: Mapped[User | None] = relationship()
