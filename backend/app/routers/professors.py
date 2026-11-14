from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.deps import get_current_user
from app.models import ApprovalStatus, Professor, ProfessorDomain, User
from app.schemas import ProfessorProfileOut
from app.serializers import professor_profile_out

router = APIRouter(prefix="/professors", tags=["professors"])


@router.get("", response_model=list[ProfessorProfileOut])
def list_approved_professors(
    search: str | None = None,
    domain: str | None = Query(default=None, description="Research domain name"),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    professors = (
        db.execute(
            select(Professor).options(
                selectinload(Professor.user),
                selectinload(Professor.domains).selectinload(ProfessorDomain.domain),
                selectinload(Professor.approval),
            )
        )
        .scalars()
        .all()
    )

    results: list[ProfessorProfileOut] = []
    needle = (search or "").strip().lower()
    domain_needle = (domain or "").strip().lower()

    for professor in professors:
        if not professor.approval or professor.approval.status != ApprovalStatus.APPROVED:
            continue
        profile = professor_profile_out(professor)
        if needle:
            hay = f"{profile.name} {profile.email} {profile.department}".lower()
            if needle not in hay:
                continue
        if domain_needle and not any(domain_needle in d.name.lower() for d in profile.domains):
            continue
        results.append(profile)

    results.sort(key=lambda item: item.name.lower())
    return results
