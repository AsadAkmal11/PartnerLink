from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.deps import require_roles
from app.models import ApprovalStatus, Professor, ProfessorApproval, ProfessorDomain, User, UserRole
from app.schemas import ApprovalActionRequest, ApprovalOut, DomainOut

router = APIRouter(prefix="/admin", tags=["admin"])


def _approval_out(row: ProfessorApproval) -> ApprovalOut:
    professor = row.professor
    return ApprovalOut(
        id=row.id,
        professor_id=professor.id,
        professor_name=professor.user.name,
        professor_email=professor.user.email,
        department=professor.department,
        domains=[DomainOut.model_validate(link.domain) for link in professor.domains if link.domain],
        status=row.status.value,
        admin_id=row.admin_id,
        acted_at=row.acted_at,
        note=row.note,
        created_at=row.created_at,
    )


@router.get("/approvals", response_model=list[ApprovalOut])
def list_approvals(
    status_filter: ApprovalStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _user: User = Depends(require_roles(UserRole.admin)),
):
    query = select(ProfessorApproval).options(
        selectinload(ProfessorApproval.professor)
        .selectinload(Professor.user),
        selectinload(ProfessorApproval.professor)
        .selectinload(Professor.domains)
        .selectinload(ProfessorDomain.domain),
    )
    if status_filter:
        query = query.where(ProfessorApproval.status == status_filter)
    rows = db.execute(query.order_by(ProfessorApproval.created_at.desc())).scalars().all()
    return [_approval_out(row) for row in rows]


def _act_on_approval(
    approval_id: str,
    new_status: ApprovalStatus,
    note: str | None,
    admin: User,
    db: Session,
) -> ApprovalOut:
    row = db.execute(
        select(ProfessorApproval)
        .where(ProfessorApproval.id == approval_id)
        .options(
            selectinload(ProfessorApproval.professor).selectinload(Professor.user),
            selectinload(ProfessorApproval.professor)
            .selectinload(Professor.domains)
            .selectinload(ProfessorDomain.domain),
        )
    ).scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval request not found")

    row.status = new_status
    row.admin_id = admin.id
    row.acted_at = datetime.now(timezone.utc)
    row.note = note
    db.commit()
    db.refresh(row)
    # Reload relationships after commit
    row = db.execute(
        select(ProfessorApproval)
        .where(ProfessorApproval.id == approval_id)
        .options(
            selectinload(ProfessorApproval.professor).selectinload(Professor.user),
            selectinload(ProfessorApproval.professor)
            .selectinload(Professor.domains)
            .selectinload(ProfessorDomain.domain),
        )
    ).scalar_one()
    return _approval_out(row)


@router.post("/approvals/{approval_id}/approve", response_model=ApprovalOut)
def approve_professor(
    approval_id: str,
    payload: ApprovalActionRequest | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.admin)),
):
    note = payload.note if payload else None
    return _act_on_approval(approval_id, ApprovalStatus.APPROVED, note, admin, db)


@router.post("/approvals/{approval_id}/reject", response_model=ApprovalOut)
def reject_professor(
    approval_id: str,
    payload: ApprovalActionRequest | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.admin)),
):
    note = payload.note if payload else None
    return _act_on_approval(approval_id, ApprovalStatus.REJECTED, note, admin, db)
