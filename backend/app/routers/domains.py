from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Domain
from app.schemas import DomainOut

router = APIRouter(prefix="/domains", tags=["domains"])


@router.get("", response_model=list[DomainOut])
def list_domains(kind: str | None = None, db: Session = Depends(get_db)):
    query = select(Domain).order_by(Domain.name)
    if kind:
        query = query.where(Domain.kind == kind)
    return db.execute(query).scalars().all()
