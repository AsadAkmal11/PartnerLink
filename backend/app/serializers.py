from app.models import ApprovalStatus, DomainLinkType, Professor, Student, User
from app.schemas import DomainOut, ProfessorProfileOut, StudentProfileOut, UserOut


def user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role.value,
        created_at=user.created_at,
    )


def student_profile_out(student: Student) -> StudentProfileOut:
    skills = [
        DomainOut.model_validate(link.domain)
        for link in student.domains
        if link.type == DomainLinkType.SKILL and link.domain is not None
    ]
    desired = [
        DomainOut.model_validate(link.domain)
        for link in student.domains
        if link.type == DomainLinkType.DESIRED_DOMAIN and link.domain is not None
    ]
    return StudentProfileOut(
        id=student.id,
        user_id=student.user_id,
        name=student.user.name,
        email=student.user.email,
        cgpa=student.cgpa,
        program=student.program,
        bio=student.bio,
        primary_domain=DomainOut.model_validate(student.primary_domain) if student.primary_domain else None,
        skills=skills,
        desired_domains=desired,
    )


def professor_profile_out(professor: Professor) -> ProfessorProfileOut:
    status = professor.approval.status if professor.approval else ApprovalStatus.PENDING
    return ProfessorProfileOut(
        id=professor.id,
        user_id=professor.user_id,
        name=professor.user.name,
        email=professor.user.email,
        department=professor.department,
        bio=professor.bio,
        domains=[DomainOut.model_validate(link.domain) for link in professor.domains if link.domain],
        approval_status=status.value,
        approval_note=professor.approval.note if professor.approval else None,
    )
