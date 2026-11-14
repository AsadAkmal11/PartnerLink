from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import load_professor, load_student, require_roles
from app.matching import recompute_for_student
from app.models import Domain, DomainLinkType, ProfessorDomain, StudentDomain, User, UserRole
from app.schemas import ProfessorProfileOut, ProfessorProfileUpdate, StudentProfileOut, StudentProfileUpdate
from app.serializers import professor_profile_out, student_profile_out

router = APIRouter(prefix="/profiles", tags=["profiles"])


def _validate_domain_ids(db: Session, ids: list[str]) -> None:
    if not ids:
        return
    found = db.execute(select(Domain.id).where(Domain.id.in_(ids))).scalars().all()
    if len(found) != len(set(ids)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid domain ids")


@router.get("/student/me", response_model=StudentProfileOut)
def get_my_student_profile(
    user: User = Depends(require_roles(UserRole.student)),
    db: Session = Depends(get_db),
):
    student = load_student(db, user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student_profile_out(student)


@router.put("/student/me", response_model=StudentProfileOut)
def update_my_student_profile(
    payload: StudentProfileUpdate,
    user: User = Depends(require_roles(UserRole.student)),
    db: Session = Depends(get_db),
):
    student = load_student(db, user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    if payload.name is not None:
        user.name = payload.name.strip()
    if payload.cgpa is not None:
        student.cgpa = payload.cgpa
    if payload.program is not None:
        student.program = payload.program
    if payload.bio is not None:
        student.bio = payload.bio
    if payload.primary_domain_id is not None:
        if payload.primary_domain_id == "":
            student.primary_domain_id = None
        else:
            _validate_domain_ids(db, [payload.primary_domain_id])
            student.primary_domain_id = payload.primary_domain_id

    if payload.skill_ids is not None:
        _validate_domain_ids(db, payload.skill_ids)
        db.execute(
            delete(StudentDomain)
            .where(
                StudentDomain.student_id == student.id,
                StudentDomain.type == DomainLinkType.SKILL,
            )
            .execution_options(synchronize_session="fetch")
        )
        for domain_id in set(payload.skill_ids):
            db.add(
                StudentDomain(student_id=student.id, domain_id=domain_id, type=DomainLinkType.SKILL)
            )

    if payload.desired_domain_ids is not None:
        _validate_domain_ids(db, payload.desired_domain_ids)
        db.execute(
            delete(StudentDomain)
            .where(
                StudentDomain.student_id == student.id,
                StudentDomain.type == DomainLinkType.DESIRED_DOMAIN,
            )
            .execution_options(synchronize_session="fetch")
        )
        for domain_id in set(payload.desired_domain_ids):
            db.add(
                StudentDomain(
                    student_id=student.id,
                    domain_id=domain_id,
                    type=DomainLinkType.DESIRED_DOMAIN,
                )
            )

    db.commit()
    recompute_for_student(db, student.id)
    student = load_student(db, user.id)
    return student_profile_out(student)


@router.get("/professor/me", response_model=ProfessorProfileOut)
def get_my_professor_profile(
    user: User = Depends(require_roles(UserRole.professor)),
    db: Session = Depends(get_db),
):
    professor = load_professor(db, user.id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor profile not found")
    return professor_profile_out(professor)


@router.put("/professor/me", response_model=ProfessorProfileOut)
def update_my_professor_profile(
    payload: ProfessorProfileUpdate,
    user: User = Depends(require_roles(UserRole.professor)),
    db: Session = Depends(get_db),
):
    professor = load_professor(db, user.id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor profile not found")

    if payload.name is not None:
        user.name = payload.name.strip()
    if payload.department is not None:
        professor.department = payload.department.strip()
    if payload.bio is not None:
        professor.bio = payload.bio
    if payload.domain_ids is not None:
        _validate_domain_ids(db, payload.domain_ids)
        db.execute(delete(ProfessorDomain).where(ProfessorDomain.professor_id == professor.id))
        db.flush()
        for domain_id in set(payload.domain_ids):
            db.add(ProfessorDomain(professor_id=professor.id, domain_id=domain_id))

    db.commit()
    professor = load_professor(db, user.id)
    return professor_profile_out(professor)
