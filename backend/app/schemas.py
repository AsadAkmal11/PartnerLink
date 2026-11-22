from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class StudentRegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6)
    program: str | None = None
    cgpa: float | None = Field(default=None, ge=0, le=4)


class ProfessorRegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6)
    department: str = Field(min_length=2, max_length=160)
    domain_ids: list[str] = Field(default_factory=list)


class DomainOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    kind: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    name: str
    role: Literal["student", "professor", "admin"]
    created_at: datetime


class StudentProfileOut(BaseModel):
    id: str
    user_id: str
    name: str
    email: EmailStr
    cgpa: float | None
    program: str | None
    bio: str | None
    primary_domain: DomainOut | None
    skills: list[DomainOut]
    desired_domains: list[DomainOut]


class StudentProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    cgpa: float | None = Field(default=None, ge=0, le=4)
    program: str | None = None
    bio: str | None = None
    primary_domain_id: str | None = None
    skill_ids: list[str] | None = None
    desired_domain_ids: list[str] | None = None


class ProjectProfessorOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    department: str


class ProjectOut(BaseModel):
    id: str
    title: str
    summary: str
    team_size: int
    status: Literal["OPEN", "CLOSED"]
    domains: list[DomainOut]
    skills: list[DomainOut]
    professor: ProjectProfessorOut
    created_at: datetime
    updated_at: datetime


class ProjectCreate(BaseModel):
    title: str = Field(min_length=4, max_length=160)
    summary: str = Field(min_length=20, max_length=4000)
    team_size: int = Field(default=3, ge=1, le=6)
    domain_ids: list[str] = Field(default_factory=list)
    skill_ids: list[str] = Field(default_factory=list)


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=4, max_length=160)
    summary: str | None = Field(default=None, min_length=20, max_length=4000)
    team_size: int | None = Field(default=None, ge=1, le=6)
    status: Literal["OPEN", "CLOSED"] | None = None
    domain_ids: list[str] | None = None
    skill_ids: list[str] | None = None


class ProfessorProfileOut(BaseModel):
    id: str
    user_id: str
    name: str
    email: EmailStr
    department: str
    bio: str | None
    domains: list[DomainOut]
    approval_status: Literal["PENDING", "APPROVED", "REJECTED"]
    approval_note: str | None = None
    projects: list[ProjectOut] = Field(default_factory=list)


class ProfessorProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    department: str | None = Field(default=None, min_length=2, max_length=160)
    bio: str | None = None
    domain_ids: list[str] | None = None


class MeResponse(BaseModel):
    user: UserOut
    student: StudentProfileOut | None = None
    professor: ProfessorProfileOut | None = None


class MatchRecommendation(BaseModel):
    student: StudentProfileOut
    similarity_score: float


class ApprovalOut(BaseModel):
    id: str
    professor_id: str
    professor_name: str
    professor_email: EmailStr
    department: str
    domains: list[DomainOut]
    status: Literal["PENDING", "APPROVED", "REJECTED"]
    admin_id: str | None
    acted_at: datetime | None
    note: str | None
    created_at: datetime


class ApprovalActionRequest(BaseModel):
    note: str | None = None


class MessageOut(BaseModel):
    message: str
