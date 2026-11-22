from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# The backend folder, so .env and the SQLite file resolve the same way no matter
# which directory the server is started from.
BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    port: int = 4000
    node_env: str = "development"
    allowed_origins: str = "http://localhost:5173"
    database_url: str = "sqlite:///./data/partnerlink.db"
    jwt_secret: str = "partnerlink-dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7
    giki_email_domain: str = "giki.edu.pk"

    @property
    def resolved_database_url(self) -> str:
        """Anchor relative SQLite paths (sqlite:///./data/x.db) to the backend folder."""
        prefix = "sqlite:///./"
        if self.database_url.startswith(prefix):
            path = BACKEND_DIR / self.database_url[len(prefix):]
            path.parent.mkdir(parents=True, exist_ok=True)
            return "sqlite:///" + path.as_posix()
        return self.database_url

    @property
    def origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
