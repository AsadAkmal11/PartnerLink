from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.deps import get_current_user, is_approved_professor, load_professor
from app.models import (
    ApprovalStatus,
    Domain,
    Professor,
    Project,
    ProjectDomain,
    ProjectStatus,
    User,
    UserRole,
)
from app.schemas import ProjectCreate, ProjectOut, ProjectUpdate
from app.serializers import project_out

router = APIRouter(prefix="/projects", tags=["projects"])


def _project_query():
    return select(Project).options(
        selectinload(Project.domains).selectinload(ProjectDomain.domain),
        selectinload(Project.professor).selectinload(Professor.user),
        selectinload(Project.professor).selectinload(Professor.approval),
    )


def _get_project(db: Session, project_id: str) -> Project:
    project = db.execute(_project_query().where(Project.id == project_id)).scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def _require_owner(db: Session, user: User, project: Project) -> None:
    if user.role == UserRole.admin:
        return
    professor = load_professor(db, user.id) if user.role == UserRole.professor else None
    if not professor or professor.id != project.professor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the faculty member who posted this project can change it")


def _set_domains(db: Session, project: Project, domain_ids: list[str], skill_ids: list[str]) -> None:
    wanted = set(domain_ids) | set(skill_ids)
    if wanted:
        found = db.execute(select(Domain).where(Domain.id.in_(wanted))).scalars().all()
        if len(found) != len(wanted):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid domain or skill ids")
    project.domains.clear()
    db.flush()
    for domain_id in wanted:
        project.domains.append(ProjectDomain(domain_id=domain_id))


@router.get("", response_model=list[ProjectOut])
def list_projects(
    search: str | None = None,
    domain: str | None = Query(default=None, description="Research domain or skill name"),
    mine: bool = Query(default=False, description="Only projects posted by the signed-in faculty member"),
    include_closed: bool = False,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    projects = db.execute(_project_query().order_by(Project.created_at.desc())).scalars().all()
    own_professor = load_professor(db, user.id) if user.role == UserRole.professor else None
    own_id = own_professor.id if own_professor else None

    needle = (search or "").strip().lower()
    domain_needle = (domain or "").strip().lower()
    results: list[ProjectOut] = []
    for project in projects:
        is_own = project.professor_id == own_id
        if mine and not is_own:
            continue
        # Everyone sees open projects from approved faculty; owners and admins also see the rest.
        approved = bool(project.professor.approval and project.professor.approval.status == ApprovalStatus.APPROVED)
        if not is_own and user.role != UserRole.admin:
            if not approved or project.status != ProjectStatus.OPEN:
                continue
        elif not include_closed and not mine and project.status != ProjectStatus.OPEN:
            continue
        if needle:
            hay = f"{project.title} {project.summary} {project.professor.user.name} {project.professor.department}".lower()
            if needle not in hay:
                continue
        if domain_needle and not any(domain_needle in link.domain.name.lower() for link in project.domains if link.domain):
            continue
        results.append(project_out(project))
    return results


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.professor:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only faculty can post projects")
    if not is_approved_professor(db, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can post projects once an admin approves your faculty account",
        )
    professor = load_professor(db, user.id)
    project = Project(
        professor_id=professor.id,
        title=payload.title.strip(),
        summary=payload.summary.strip(),
        team_size=payload.team_size,
    )
    db.add(project)
    db.flush()
    _set_domains(db, project, payload.domain_ids, payload.skill_ids)
    db.commit()
    return project_out(_get_project(db, project.id))


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    project = _get_project(db, project_id)
    _require_owner(db, user, project)
    if payload.title is not None:
        project.title = payload.title.strip()
    if payload.summary is not None:
        project.summary = payload.summary.strip()
    if payload.team_size is not None:
        project.team_size = payload.team_size
    if payload.status is not None:
        project.status = ProjectStatus(payload.status)
    if payload.domain_ids is not None or payload.skill_ids is not None:
        current = [link.domain for link in project.domains if link.domain]
        domain_ids = payload.domain_ids if payload.domain_ids is not None else [d.id for d in current if d.kind != "skill"]
        skill_ids = payload.skill_ids if payload.skill_ids is not None else [d.id for d in current if d.kind == "skill"]
        _set_domains(db, project, domain_ids, skill_ids)
    db.commit()
    db.expire_all()
    return project_out(_get_project(db, project.id))


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    project = _get_project(db, project_id)
    _require_owner(db, user, project)
    db.delete(project)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
