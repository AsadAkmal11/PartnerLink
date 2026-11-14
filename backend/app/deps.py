from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Professor, ProfessorDomain, Student, StudentDomain, User, UserRole
from app.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_roles(*roles: UserRole):
    def _checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return _checker


def load_student(db: Session, user_id: str) -> Student | None:
    return db.execute(
        select(Student)
        .where(Student.user_id == user_id)
        .options(
            selectinload(Student.user),
            selectinload(Student.primary_domain),
            selectinload(Student.domains).selectinload(StudentDomain.domain),
        )
    ).scalar_one_or_none()


def load_professor(db: Session, user_id: str) -> Professor | None:
    return db.execute(
        select(Professor)
        .where(Professor.user_id == user_id)
        .options(
            selectinload(Professor.user),
            selectinload(Professor.domains).selectinload(ProfessorDomain.domain),
            selectinload(Professor.approval),
        )
    ).scalar_one_or_none()
