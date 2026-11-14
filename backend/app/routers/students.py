from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.deps import get_current_user
from app.models import Student, StudentDomain, User
from app.schemas import StudentProfileOut
from app.serializers import student_profile_out

router = APIRouter(prefix="/students", tags=["students"])


@router.get("", response_model=list[StudentProfileOut])
def list_students(
    search: str | None = None,
    skill: str | None = Query(default=None, description="Skill domain name"),
    domain: str | None = Query(default=None, description="Desired or primary research domain name"),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    students = (
        db.execute(
            select(Student).options(
                selectinload(Student.user),
                selectinload(Student.primary_domain),
                selectinload(Student.domains).selectinload(StudentDomain.domain),
            )
        )
        .scalars()
        .all()
    )

    results: list[StudentProfileOut] = []
    needle = (search or "").strip().lower()
    skill_needle = (skill or "").strip().lower()
    domain_needle = (domain or "").strip().lower()

    for student in students:
        profile = student_profile_out(student)
        if needle:
            hay = f"{profile.name} {profile.email} {profile.program or ''}".lower()
            if needle not in hay:
                continue
        if skill_needle:
            if not any(skill_needle in s.name.lower() for s in profile.skills):
                continue
        if domain_needle:
            names = [d.name.lower() for d in profile.desired_domains]
            if profile.primary_domain:
                names.append(profile.primary_domain.name.lower())
            if not any(domain_needle in name for name in names):
                continue
        results.append(profile)

    results.sort(key=lambda item: item.name.lower())
    return results
