from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import load_student, require_roles
from app.matching import recommendations_for, recompute_all_matches
from app.models import User, UserRole
from app.schemas import MatchRecommendation, MessageOut
from app.serializers import student_profile_out

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/recommendations", response_model=list[MatchRecommendation])
def get_recommendations(
    limit: int = Query(default=12, ge=1, le=50),
    user: User = Depends(require_roles(UserRole.student)),
    db: Session = Depends(get_db),
):
    student = load_student(db, user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    pairs = recommendations_for(db, student.id, limit=limit)
    return [
        MatchRecommendation(student=student_profile_out(peer), similarity_score=score)
        for peer, score in pairs
    ]


@router.post("/recompute", response_model=MessageOut)
def recompute_matches(
    _user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    count = recompute_all_matches(db)
    return MessageOut(message=f"Recomputed {count} match pairs")
