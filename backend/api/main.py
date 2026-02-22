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

from .routes import chat, courses, users, favorites, completed, notifications, current, suggestions, cards

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

    def __init__(self):
        self._requests: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, key: str, max_requests: int, window_seconds: int = 60) -> bool:
        now = time.time()
        cutoff = now - window_seconds
        # Prune old entries
        self._requests[key] = [t for t in self._requests[key] if t > cutoff]
        if len(self._requests[key]) >= max_requests:
            return False
        self._requests[key].append(now)
        return True


rate_limiter = InMemoryRateLimiter()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    _validate_startup()
    logger.info(f"🚀 Starting {settings.API_TITLE} v{settings.API_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    yield
    logger.info("👋 Shutting down gracefully...")


app = FastAPI(
    title=settings.API_TITLE,
    description="AI-powered course recommendation system for McGill University",
    version=settings.API_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

@app.on_event("startup")
async def startup_event():
    """Warm up database connection on server start"""
    import asyncio
    from api.utils.supabase_client import get_supabase
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, get_supabase)
    logger.info("Startup complete - database connection ready")

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Apply per-IP rate limiting."""
    client_ip = request.client.host if request.client else "unknown"
    path = request.url.path

    # Determine limit based on endpoint
    if "/chat/send" in path:
        limit = settings.CHAT_RATE_LIMIT_PER_MINUTE
    else:
        limit = settings.RATE_LIMIT_PER_MINUTE

    if not rate_limiter.is_allowed(client_ip, limit):
        logger.warning(f"Rate limit exceeded for {client_ip} on {path}")
        from fastapi.responses import JSONResponse

        return JSONResponse(
            status_code=429,
            content={
                "code": "rate_limit_exceeded",
                "message": "Too many requests. Please try again later.",
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

app.include_router(chat.router, prefix=f"{settings.API_PREFIX}/chat", tags=["Chat"])
app.include_router(courses.router, prefix=f"{settings.API_PREFIX}/courses", tags=["Courses"])
app.include_router(users.router, prefix=f"{settings.API_PREFIX}/users", tags=["Users"])
app.include_router(favorites.router, prefix=f"{settings.API_PREFIX}/favorites", tags=["Favorites"])   # ← was "favorites"
app.include_router(completed.router, prefix=f"{settings.API_PREFIX}/completed", tags=["Completed"])    # ← was "completed"
app.include_router(notifications.router, prefix=f"{settings.API_PREFIX}/notifications", tags=["Notifications"])
app.include_router(current.router, prefix=f"{settings.API_PREFIX}/current", tags=["Current Courses"])
app.include_router(suggestions.router, prefix=f"{settings.API_PREFIX}/suggestions", tags=["Suggestions"])
app.include_router(cards.router, prefix=f"{settings.API_PREFIX}/cards", tags=["Cards"])
#


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
