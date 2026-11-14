from sqlalchemy import select
from sqlalchemy.orm import Session

from app.matching import recompute_all_matches
from app.models import (
    ApprovalStatus,
    Domain,
    DomainLinkType,
    Professor,
    ProfessorApproval,
    ProfessorDomain,
    Student,
    StudentDomain,
    User,
    UserRole,
)
from app.security import hash_password

DOMAIN_NAMES = [
    ("Python", "skill"),
    ("PyTorch", "skill"),
    ("OpenCV", "skill"),
    ("C/C++", "skill"),
    ("Arduino", "skill"),
    ("PCB Design", "skill"),
    ("React", "skill"),
    ("Node.js", "skill"),
    ("PostgreSQL", "skill"),
    ("Networking", "skill"),
    ("Linux", "skill"),
    ("Go", "skill"),
    ("Computer Vision", "research"),
    ("Embedded Systems", "research"),
    ("NLP", "research"),
    ("Robotics", "research"),
    ("Web Platforms", "research"),
    ("Cybersecurity", "research"),
    ("Machine Learning", "research"),
    ("Distributed Systems", "research"),
]


def _domain_map(db: Session) -> dict[str, Domain]:
    existing = {d.name: d for d in db.execute(select(Domain)).scalars().all()}
    for name, kind in DOMAIN_NAMES:
        if name not in existing:
            domain = Domain(name=name, kind=kind)
            db.add(domain)
            existing[name] = domain
    db.flush()
    return existing


def _ensure_user(
    db: Session,
    *,
    email: str,
    name: str,
    password: str,
    role: UserRole,
) -> User:
    user = db.execute(select(User).where(User.email == email.lower())).scalar_one_or_none()
    if user:
        return user
    user = User(
        email=email.lower(),
        name=name,
        password_hash=hash_password(password),
        role=role,
    )
    db.add(user)
    db.flush()
    return user


def seed_database(db: Session) -> None:
    domains = _domain_map(db)

    admin = _ensure_user(
        db,
        email="admin@giki.edu.pk",
        name="Platform Admin",
        password="admin123",
        role=UserRole.admin,
    )

    demo_students = [
        {
            "email": "aria.noor@giki.edu.pk",
            "name": "Aria Noor",
            "password": "student123",
            "program": "Computer Science",
            "cgpa": 3.6,
            "primary": "Computer Vision",
            "skills": ["Python", "PyTorch", "OpenCV"],
            "desired": ["Computer Vision", "Robotics"],
            "bio": "Building vision systems for campus robotics.",
        },
        {
            "email": "zayan.malik@giki.edu.pk",
            "name": "Zayan Malik",
            "password": "student123",
            "program": "Computer Engineering",
            "cgpa": 3.4,
            "primary": "Embedded Systems",
            "skills": ["C/C++", "Arduino", "PCB Design"],
            "desired": ["Embedded Systems", "Robotics"],
            "bio": "Hardware-first maker exploring edge AI.",
        },
        {
            "email": "hira.saeed@giki.edu.pk",
            "name": "Hira Saeed",
            "password": "student123",
            "program": "Software Engineering",
            "cgpa": 3.7,
            "primary": "Web Platforms",
            "skills": ["React", "Node.js", "PostgreSQL"],
            "desired": ["Web Platforms", "NLP"],
            "bio": "Full-stack engineer interested in language tech.",
        },
        {
            "email": "omar.farooq@giki.edu.pk",
            "name": "Omar Farooq",
            "password": "student123",
            "program": "Cyber Security",
            "cgpa": 3.3,
            "primary": "Cybersecurity",
            "skills": ["Networking", "Linux", "Go"],
            "desired": ["Cybersecurity", "Embedded Systems"],
            "bio": "Secure systems and embedded device hardening.",
        },
        {
            "email": "sara.khan@giki.edu.pk",
            "name": "Sara Khan",
            "password": "student123",
            "program": "Computer Science",
            "cgpa": 3.8,
            "primary": "NLP",
            "skills": ["Python", "React", "PostgreSQL"],
            "desired": ["NLP", "Machine Learning"],
            "bio": "Interested in Urdu NLP and retrieval systems.",
        },
        {
            "email": "bilal.ahmed@giki.edu.pk",
            "name": "Bilal Ahmed",
            "password": "student123",
            "program": "Artificial Intelligence",
            "cgpa": 3.5,
            "primary": "Machine Learning",
            "skills": ["Python", "PyTorch", "Linux"],
            "desired": ["Machine Learning", "Computer Vision"],
            "bio": "Applied ML for perception and classification.",
        },
    ]

    for item in demo_students:
        user = _ensure_user(
            db,
            email=item["email"],
            name=item["name"],
            password=item["password"],
            role=UserRole.student,
        )
        student = db.execute(select(Student).where(Student.user_id == user.id)).scalar_one_or_none()
        if student:
            continue
        student = Student(
            user_id=user.id,
            cgpa=item["cgpa"],
            program=item["program"],
            primary_domain_id=domains[item["primary"]].id,
            bio=item["bio"],
        )
        db.add(student)
        db.flush()
        for skill in item["skills"]:
            db.add(
                StudentDomain(
                    student_id=student.id,
                    domain_id=domains[skill].id,
                    type=DomainLinkType.SKILL,
                )
            )
        for desired in item["desired"]:
            db.add(
                StudentDomain(
                    student_id=student.id,
                    domain_id=domains[desired].id,
                    type=DomainLinkType.DESIRED_DOMAIN,
                )
            )

    demo_professors = [
        {
            "email": "faculty.a@giki.edu.pk",
            "name": "Faculty Member A",
            "password": "prof123",
            "department": "Faculty of Computer Science & Engineering",
            "domains": ["Computer Vision", "Machine Learning"],
            "status": ApprovalStatus.APPROVED,
            "bio": "Vision and medical imaging research.",
        },
        {
            "email": "faculty.b@giki.edu.pk",
            "name": "Faculty Member B",
            "password": "prof123",
            "department": "Faculty of Engineering Sciences",
            "domains": ["Embedded Systems", "Robotics"],
            "status": ApprovalStatus.APPROVED,
            "bio": "Embedded systems and edge sensing.",
        },
        {
            "email": "faculty.c@giki.edu.pk",
            "name": "Faculty Member C",
            "password": "prof123",
            "department": "Faculty of Computer Science & Engineering",
            "domains": ["Distributed Systems", "Web Platforms"],
            "status": ApprovalStatus.PENDING,
            "bio": "Cloud platforms and distributed data systems.",
        },
        {
            "email": "faculty.d@giki.edu.pk",
            "name": "Faculty Member D",
            "password": "prof123",
            "department": "Faculty of Computer Science & Engineering",
            "domains": ["NLP", "Machine Learning"],
            "status": ApprovalStatus.PENDING,
            "bio": "Information retrieval and language technology.",
        },
    ]

    for item in demo_professors:
        user = _ensure_user(
            db,
            email=item["email"],
            name=item["name"],
            password=item["password"],
            role=UserRole.professor,
        )
        professor = db.execute(select(Professor).where(Professor.user_id == user.id)).scalar_one_or_none()
        if professor:
            continue
        professor = Professor(
            user_id=user.id,
            department=item["department"],
            bio=item["bio"],
        )
        db.add(professor)
        db.flush()
        for domain_name in item["domains"]:
            db.add(
                ProfessorDomain(
                    professor_id=professor.id,
                    domain_id=domains[domain_name].id,
                )
            )
        db.add(
            ProfessorApproval(
                professor_id=professor.id,
                status=item["status"],
                admin_id=admin.id if item["status"] == ApprovalStatus.APPROVED else None,
            )
        )

    db.commit()
    recompute_all_matches(db)
