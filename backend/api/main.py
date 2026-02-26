"""
backend/api/main.py

"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import time
import logging
from collections import defaultdict

from .config import settings
from .logging_config import setup_logging
from .exceptions import (
    AppException,
    app_exception_handler,
    validation_exception_handler,
    general_exception_handler,
    RateLimitException,
)

from .routes import chat, courses, users, favorites, completed, notifications, current, suggestions, cards, transcript, degree_requirements, electives, clubs, syllabus  # ← added clubs

# Setup logging
logger = setup_logging()

def _validate_startup():
    """Fail fast if critical configuration is missing or invalid."""
    errors = []

    if not settings.ANTHROPIC_API_KEY:
        errors.append("ANTHROPIC_API_KEY is not set")
    elif not settings.ANTHROPIC_API_KEY.startswith("sk-ant-"):
        errors.append("ANTHROPIC_API_KEY has invalid format")

    if not settings.SUPABASE_URL:
        errors.append("SUPABASE_URL is not set")
    elif not settings.SUPABASE_URL.startswith("https://"):
        errors.append("SUPABASE_URL must start with https://")

    if not settings.SUPABASE_SERVICE_KEY:
        errors.append("SUPABASE_SERVICE_KEY is not set")

    if errors:
        for err in errors:
            logger.critical(f"STARTUP VALIDATION FAILED: {err}")
        raise RuntimeError(
            "Startup validation failed — fix the errors above before running."
        )

    logger.info("✅ Startup validation passed")

class InMemoryRateLimiter:
    """Token-bucket style rate limiter keyed by client IP."""

    def __init__(self, default_rpm: int = 100):
        self.default_rpm = default_rpm
        self._buckets: dict[str, list] = defaultdict(list)

    def is_allowed(self, key: str, rpm: int | None = None) -> bool:
        limit = rpm or self.default_rpm
        now = time.time()
        bucket = self._buckets[key]
        # Remove entries older than 60 s
        self._buckets[key] = bucket = [t for t in bucket if now - t < 60]
        if len(bucket) >= limit:
            return False
        bucket.append(now)
        return True


@asynccontextmanager
async def lifespan(app: FastAPI):
    _validate_startup()
    logger.info(f"Starting {settings.API_TITLE} v{settings.API_VERSION}")
    yield
    logger.info("Shutting down…")


app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    lifespan=lifespan,
    docs_url=f"{settings.API_PREFIX}/docs" if settings.DEBUG else None,
    redoc_url=f"{settings.API_PREFIX}/redoc" if settings.DEBUG else None,
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time", "X-Request-ID"],
)


# Rate limiter instance
_limiter = InMemoryRateLimiter(default_rpm=settings.RATE_LIMIT_PER_MINUTE)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.headers.get("x-forwarded-for", request.client.host)
    path = request.url.path

    # Stricter limit for chat
    if "/chat" in path:
        rpm = settings.CHAT_RATE_LIMIT_PER_MINUTE
    else:
        rpm = settings.RATE_LIMIT_PER_MINUTE

    if not _limiter.is_allowed(f"{client_ip}:{path}", rpm):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=429,
            content={
                "detail": "Too many requests. Please try again later.",
                "details": {"retry_after": 60},
            },
        )

    return await call_next(request)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    request_id = f"{int(start_time * 1000)}"
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Request-ID"] = request_id
    return response


# Register exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

app.include_router(chat.router,                prefix=f"{settings.API_PREFIX}/chat",                tags=["Chat"])
app.include_router(courses.router,             prefix=f"{settings.API_PREFIX}/courses",             tags=["Courses"])
app.include_router(users.router,               prefix=f"{settings.API_PREFIX}/users",               tags=["Users"])
app.include_router(favorites.router,           prefix=f"{settings.API_PREFIX}/favorites",           tags=["Favorites"])
app.include_router(completed.router,           prefix=f"{settings.API_PREFIX}/completed",           tags=["Completed"])
app.include_router(notifications.router,       prefix=f"{settings.API_PREFIX}/notifications",       tags=["Notifications"])
app.include_router(current.router,             prefix=f"{settings.API_PREFIX}/current",             tags=["Current Courses"])
app.include_router(suggestions.router,         prefix=f"{settings.API_PREFIX}/suggestions",         tags=["Suggestions"])
app.include_router(cards.router,               prefix=f"{settings.API_PREFIX}/cards",               tags=["Cards"])
app.include_router(transcript.router,          prefix=f"{settings.API_PREFIX}/transcript",          tags=["Transcript"])
app.include_router(degree_requirements.router, prefix=f"{settings.API_PREFIX}/degree-requirements", tags=["Degree Requirements"])
app.include_router(electives.router,           prefix=f"{settings.API_PREFIX}/electives",           tags=["Electives"])
app.include_router(clubs.router,               prefix=f"{settings.API_PREFIX}/clubs",               tags=["Clubs"])  # ← added
app.include_router(syllabus.router,             prefix=f"{settings.API_PREFIX}/syllabus",           tags=["Syllabus"])


@app.get("/")
async def root():
    return {
        "service": settings.API_TITLE,
        "version": settings.API_VERSION,
        "status": "operational",
        "docs": f"{settings.API_PREFIX}/docs" if settings.DEBUG else None,
    }


@app.get(f"{settings.API_PREFIX}/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT,
    }