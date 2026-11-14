# PartnerLink

GIKI-exclusive Final Year Project partner matching platform.

Connect with peers, discover approved faculty, and form stronger FYP groups using skill overlap, research interests, and academic fit.

## Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router 7 |
| Backend  | Python FastAPI, SQLAlchemy                      |
| Database | SQLite (`backend/data/partnerlink.db`)          |
| Auth     | JWT (GIKI `@giki.edu.pk` email gate)            |

## Features

- Student registration & rich profiles (CGPA, skills, desired domains)
- Ranked peer recommendations (Jaccard + CGPA + domain alignment, cached in `MATCH`)
- Faculty self-onboarding with admin approval audit trail
- Directory discovery with skill/domain filters
- Role dashboards for student, professor, and admin

## Setup

### Prerequisites

- Node.js 18+
- Python 3.12+ (`py -3.12`)

### Install

```bash
npm install
npm install --prefix frontend

cd backend
py -3.12 -m venv .venv
.venv\Scripts\pip install -r requirements.txt
cd ..
```

Copy env files if needed:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

### Run

From the repo root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4000
- Health: http://localhost:4000/api/health
- Docs: http://localhost:4000/docs

## Demo accounts

| Role      | Email                   | Password    |
|-----------|-------------------------|-------------|
| Admin     | admin@giki.edu.pk       | admin123    |
| Student   | aria.noor@giki.edu.pk   | student123  |
| Professor | faculty.a@giki.edu.pk   | prof123     |
| Pending   | faculty.c@giki.edu.pk   | prof123     |

## Environment

### `backend/.env`

```env
PORT=4000
ALLOWED_ORIGINS=http://localhost:5173
DATABASE_URL=sqlite:///./data/partnerlink.db
JWT_SECRET=partnerlink-dev-secret-change-me
GIKI_EMAIL_DOMAIN=giki.edu.pk
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:4000
```
