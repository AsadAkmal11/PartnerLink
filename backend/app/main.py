import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.matching import recompute_all_matches
from app.routers import admin, auth, domains, health, matches, professors, profiles, students
from app.seed import seed_database

logger = logging.getLogger("partnerlink")
settings = get_settings()


async def _match_refresh_loop(stop_event: asyncio.Event) -> None:
    """Periodically refresh cached MATCH scores."""
    while not stop_event.is_set():
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=300)
            break
        except asyncio.TimeoutError:
            db = SessionLocal()
            try:
                count = recompute_all_matches(db)
                logger.info("Periodic match refresh updated %s pairs", count)
            except Exception:  # noqa: BLE001
                logger.exception("Periodic match refresh failed")
            finally:
                db.close()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Path("data").mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    stop_event = asyncio.Event()
    task = asyncio.create_task(_match_refresh_loop(stop_event))
    yield
    stop_event.set()
    await task


app = FastAPI(
    title="PartnerLink API",
    description="GIKI FYP partner matching platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(domains.router, prefix="/api")
app.include_router(profiles.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(professors.router, prefix="/api")
app.include_router(matches.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
