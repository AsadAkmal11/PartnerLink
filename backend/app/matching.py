"""Ranked matching algorithm + MATCH table cache."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.models import DomainLinkType, Match, Student, StudentDomain


def _ids_for_type(student: Student, link_type: DomainLinkType) -> set[str]:
    return {link.domain_id for link in student.domains if link.type == link_type}


def jaccard(a: set[str], b: set[str]) -> float:
    if not a and not b:
        return 0.0
    union = a | b
    if not union:
        return 0.0
    return len(a & b) / len(union)


def cgpa_score(a: float | None, b: float | None) -> float:
    if a is None or b is None:
        return 0.5
    # Max CGPA distance on a 4.0 scale → score in [0, 1]
    return max(0.0, 1.0 - abs(a - b) / 4.0)


def domain_alignment(a: Student, b: Student) -> float:
    if a.primary_domain_id and b.primary_domain_id and a.primary_domain_id == b.primary_domain_id:
        return 1.0
    desired_a = _ids_for_type(a, DomainLinkType.DESIRED_DOMAIN)
    desired_b = _ids_for_type(b, DomainLinkType.DESIRED_DOMAIN)
    return jaccard(desired_a, desired_b)


def compute_similarity(a: Student, b: Student) -> float:
    skills_a = _ids_for_type(a, DomainLinkType.SKILL)
    skills_b = _ids_for_type(b, DomainLinkType.SKILL)
    desired_a = _ids_for_type(a, DomainLinkType.DESIRED_DOMAIN)
    desired_b = _ids_for_type(b, DomainLinkType.DESIRED_DOMAIN)

    skill_overlap = jaccard(skills_a, skills_b)
    interest_overlap = jaccard(desired_a, desired_b)
    # Also reward complementary skills vs desired domains
    cross = (jaccard(skills_a, desired_b) + jaccard(skills_b, desired_a)) / 2

    weighted = (
        0.35 * skill_overlap
        + 0.25 * interest_overlap
        + 0.15 * cross
        + 0.15 * cgpa_score(a.cgpa, b.cgpa)
        + 0.10 * domain_alignment(a, b)
    )
    return round(min(1.0, max(0.0, weighted)), 4)


def _ordered_pair(a_id: str, b_id: str) -> tuple[str, str]:
    return (a_id, b_id) if a_id < b_id else (b_id, a_id)


def recompute_all_matches(db: Session) -> int:
    students = (
        db.execute(
            select(Student).options(
                selectinload(Student.domains),
                selectinload(Student.user),
            )
        )
        .scalars()
        .all()
    )

    existing = {
        (m.student_a_id, m.student_b_id): m
        for m in db.execute(select(Match)).scalars().all()
    }
    seen: set[tuple[str, str]] = set()
    now = datetime.now(timezone.utc)
    count = 0

    for i, left in enumerate(students):
        for right in students[i + 1 :]:
            a_id, b_id = _ordered_pair(left.id, right.id)
            score = compute_similarity(left, right)
            key = (a_id, b_id)
            seen.add(key)
            row = existing.get(key)
            if row:
                row.similarity_score = score
                row.updated_at = now
            else:
                db.add(
                    Match(
                        student_a_id=a_id,
                        student_b_id=b_id,
                        similarity_score=score,
                        updated_at=now,
                    )
                )
            count += 1

    for key, row in existing.items():
        if key not in seen:
            db.delete(row)

    db.commit()
    return count


def recompute_for_student(db: Session, student_id: str) -> None:
    student = db.execute(
        select(Student)
        .where(Student.id == student_id)
        .options(selectinload(Student.domains))
    ).scalar_one_or_none()
    if not student:
        return

    others = (
        db.execute(
            select(Student)
            .where(Student.id != student_id)
            .options(selectinload(Student.domains))
        )
        .scalars()
        .all()
    )
    now = datetime.now(timezone.utc)

    for other in others:
        a_id, b_id = _ordered_pair(student.id, other.id)
        score = compute_similarity(student, other)
        row = db.execute(
            select(Match).where(Match.student_a_id == a_id, Match.student_b_id == b_id)
        ).scalar_one_or_none()
        if row:
            row.similarity_score = score
            row.updated_at = now
        else:
            db.add(
                Match(
                    student_a_id=a_id,
                    student_b_id=b_id,
                    similarity_score=score,
                    updated_at=now,
                )
            )
    db.commit()


def recommendations_for(db: Session, student_id: str, limit: int = 20) -> list[tuple[Student, float]]:
    rows = db.execute(
        select(Match)
        .where(or_(Match.student_a_id == student_id, Match.student_b_id == student_id))
        .order_by(Match.similarity_score.desc())
        .limit(limit)
    ).scalars().all()

    peer_ids = [
        row.student_b_id if row.student_a_id == student_id else row.student_a_id for row in rows
    ]
    if not peer_ids:
        return []

    peers = {
        s.id: s
        for s in db.execute(
            select(Student)
            .where(Student.id.in_(peer_ids))
            .options(
                selectinload(Student.user),
                selectinload(Student.domains).selectinload(StudentDomain.domain),
                selectinload(Student.primary_domain),
            )
        ).scalars().all()
    }

    score_map = {
        (row.student_b_id if row.student_a_id == student_id else row.student_a_id): row.similarity_score
        for row in rows
    }
    result: list[tuple[Student, float]] = []
    for peer_id in peer_ids:
        peer = peers.get(peer_id)
        if peer:
            result.append((peer, score_map[peer_id]))
    return result
