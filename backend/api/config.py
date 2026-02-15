"""
backend/api/config.py

"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, Field
from typing import List, Union
from urllib.parse import urlparse
import os
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Application settings with validation"""

    # ── API Configuration ────────────────────────────────────────────────
    API_TITLE: str = "McGill AI Advisor API"
    API_VERSION: str = "3.1.0"
    API_PREFIX: str = "/api"

    # ── Environment ──────────────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # ── Database ─────────────────────────────────────────────────────────
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str

    # ── AI ───────────────────────────────────────────────────────────────
    ANTHROPIC_API_KEY: str
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"
    CLAUDE_MAX_TOKENS: int = 2048   # Balanced between quality and cost; increase for longer responses

    # ── Chat Configuration ───────────────────────────────────────────────
    CHAT_HISTORY_LIMIT: int = 10    # Max history entries returned per request
    CHAT_CONTEXT_MESSAGES: int = 6  # Messages sent to Claude for context
    MAX_MESSAGE_LENGTH: int = 4000  # Hard cap on user message length

    # ── Course Search Configuration ──────────────────────────────────────
    DEFAULT_SEARCH_LIMIT: int = 50  # Default page size for search results
    MAX_SEARCH_LIMIT: int = 200     # Absolute max to prevent huge queries

    # ── Security / CORS ──────────────────────────────────────────────────
    ALLOWED_ORIGINS: Union[str, List[str]] = Field(
        default="http://localhost:5173,https://ai-advisor-pi.vercel.app"
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v):
        """
        FIX #8: Parse comma-separated string or list, validate each URL,
        and fall back safely per environment.
        """
        raw_origins: List[str] = []

        if isinstance(v, str):
            raw_origins = [o.strip() for o in v.split(",") if o.strip()]
        elif isinstance(v, list):
            raw_origins = [str(o).strip() for o in v if str(o).strip()]

        # Validate URL format
        validated: List[str] = []
        for origin in raw_origins:
            parsed = urlparse(origin)
            if parsed.scheme in ("http", "https") and parsed.netloc:
                validated.append(origin)
            else:
                logger.warning(f"Ignoring invalid CORS origin: {origin!r}")

        if validated:
            return validated

        # Fallback per environment
        env = os.getenv("ENVIRONMENT", "development")
        if env == "production":
            logger.warning("No valid CORS origins — defaulting to Vercel domain only")
            return ["https://ai-advisor-pi.vercel.app"]
        else:
            return ["http://localhost:5173", "http://localhost:3000"]

    # ── Rate Limiting ────────────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 100    # General API rate limit per IP
    CHAT_RATE_LIMIT_PER_MINUTE: int = 50  # Chat endpoint rate limit per IP

    # ── Timeouts (seconds) ───────────────────────────────────────────────
    REQUEST_TIMEOUT: int = 30
    DATABASE_TIMEOUT: int = 10

    # ── Validators ───────────────────────────────────────────────────────
    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = ["development", "staging", "production"]
        if v not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}")
        return v

    @field_validator("SUPABASE_URL")
    @classmethod
    def validate_supabase_url(cls, v: str) -> str:
        if not v.startswith("https://"):
            raise ValueError("SUPABASE_URL must start with https://")
        return v

    @field_validator("ANTHROPIC_API_KEY")
    @classmethod
    def validate_anthropic_key(cls, v: str) -> str:
        if not v.startswith("sk-ant-"):
            raise ValueError("Invalid ANTHROPIC_API_KEY format")
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings"""
    return settings