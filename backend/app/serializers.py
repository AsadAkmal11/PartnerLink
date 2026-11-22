from app.models import ApprovalStatus, DomainLinkType, Professor, Project, ProjectStatus, Student, User
from app.schemas import (
    DomainOut,
    ProfessorProfileOut,
    ProjectOut,
    ProjectProfessorOut,
    StudentProfileOut,
    UserOut,
)


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


def project_out(project: Project) -> ProjectOut:
    linked = [link.domain for link in project.domains if link.domain is not None]
    prof = project.professor
    return ProjectOut(
        id=project.id,
        title=project.title,
        summary=project.summary,
        team_size=project.team_size,
        status=project.status.value,
        domains=[DomainOut.model_validate(d) for d in linked if d.kind != "skill"],
        skills=[DomainOut.model_validate(d) for d in linked if d.kind == "skill"],
        professor=ProjectProfessorOut(
            id=prof.id,
            name=prof.user.name,
            email=prof.user.email,
            department=prof.department,
        ),
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


def professor_profile_out(professor: Professor, *, open_projects_only: bool = False) -> ProfessorProfileOut:
    status = professor.approval.status if professor.approval else ApprovalStatus.PENDING
    projects = [
        p for p in professor.projects if not open_projects_only or p.status == ProjectStatus.OPEN
    ]
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
        projects=[project_out(p) for p in projects],
    )
