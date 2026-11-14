from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, load_professor, load_student
from app.models import (
    ApprovalStatus,
    Domain,
    Professor,
    ProfessorApproval,
    ProfessorDomain,
    Student,
    User,
    UserRole,
)
from app.schemas import (
    LoginRequest,
    MeResponse,
    MessageOut,
    ProfessorRegisterRequest,
    StudentRegisterRequest,
    TokenResponse,
)
from app.security import create_access_token, hash_password, is_giki_email, verify_password
from app.serializers import professor_profile_out, student_profile_out, user_out

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register/student", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_student(payload: StudentRegisterRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if not is_giki_email(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student registration requires a @giki.edu.pk email",
        )
    if db.execute(select(User).where(User.email == email)).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=email,
        name=payload.name.strip(),
        password_hash=hash_password(payload.password),
        role=UserRole.student,
    )
    db.add(user)
    db.flush()
    db.add(
        Student(
            user_id=user.id,
            cgpa=payload.cgpa,
            program=payload.program,
        )
    )
    db.commit()
    token = create_access_token(user.id, user.role.value)
    return TokenResponse(access_token=token)


@router.post("/register/professor", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_professor(payload: ProfessorRegisterRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if not is_giki_email(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Professor registration requires a @giki.edu.pk email",
        )
    if db.execute(select(User).where(User.email == email)).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    if payload.domain_ids:
        found = db.execute(select(Domain).where(Domain.id.in_(payload.domain_ids))).scalars().all()
        if len(found) != len(set(payload.domain_ids)):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid domain ids")

    user = User(
        email=email,
        name=payload.name.strip(),
        password_hash=hash_password(payload.password),
        role=UserRole.professor,
    )
    db.add(user)
    db.flush()
    professor = Professor(
        user_id=user.id,
        department=payload.department.strip(),
    )
    db.add(professor)
    db.flush()
    for domain_id in set(payload.domain_ids):
        db.add(ProfessorDomain(professor_id=professor.id, domain_id=domain_id))
    db.add(ProfessorApproval(professor_id=professor.id, status=ApprovalStatus.PENDING))
    db.commit()
    token = create_access_token(user.id, user.role.value)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(user.id, user.role.value)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = load_student(db, user.id) if user.role == UserRole.student else None
    professor = load_professor(db, user.id) if user.role == UserRole.professor else None
    return MeResponse(
        user=user_out(user),
        student=student_profile_out(student) if student else None,
        professor=professor_profile_out(professor) if professor else None,
    )


@router.get("/ping-auth", response_model=MessageOut)
def ping_auth(_user: User = Depends(get_current_user)):
    return MessageOut(message="authenticated")
