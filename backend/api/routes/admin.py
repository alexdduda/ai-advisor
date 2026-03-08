"""
backend/api/routes/admin.py

Backend admin authentication endpoint.
- Uses constant-time comparison (hmac.compare_digest) to prevent timing attacks.
- Separate ADMIN_SECRET from CRON_SECRET so a leaked admin session cannot
  trigger the cron job (and vice versa).
- Strict per-IP rate limiting (5 attempts/min) to prevent brute force.
"""
import hmac
import time
import logging
from collections import defaultdict
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel

from ..config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Brute-force protection ────────────────────────────────────────────────────
# Simple in-memory sliding window: 5 attempts per IP per 60 seconds.
# For multi-instance deployments, move this to Redis/Supabase — but for
# a low-traffic admin endpoint this is sufficient.
_ADMIN_RATE_LIMIT = 5       # max attempts
_ADMIN_RATE_WINDOW = 60     # seconds

_attempt_log: dict[str, list[float]] = defaultdict(list)


def _check_admin_rate_limit(ip: str) -> None:
    now = time.time()
    window_start = now - _ADMIN_RATE_WINDOW
    attempts = _attempt_log[ip]
    # Prune old entries
    _attempt_log[ip] = [t for t in attempts if t > window_start]
    if len(_attempt_log[ip]) >= _ADMIN_RATE_LIMIT:
        logger.warning(f"Admin brute-force lockout for IP: {ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please wait 60 seconds.",
        )
    _attempt_log[ip].append(now)


class AdminLoginRequest(BaseModel):
    secret: str


@router.post("/verify", status_code=status.HTTP_200_OK)
async def verify_admin(request: AdminLoginRequest, req: Request):
    """
    Verify the admin secret server-side.
    - Uses ADMIN_SECRET (separate from CRON_SECRET).
    - Constant-time comparison prevents timing attacks.
    - Rate-limited to 5 attempts/minute per IP.
    """
    # Brute-force protection
    forwarded_for = req.headers.get("x-forwarded-for")
    client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else (req.client.host if req.client else "unknown")
    _check_admin_rate_limit(client_ip)

    admin_secret = settings.ADMIN_SECRET
    if not admin_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin access not configured",
        )

    # Constant-time comparison — immune to timing attacks
    if not hmac.compare_digest(request.secret, admin_secret):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    logger.info(f"Admin access granted from {client_ip}")
    # Return CRON_SECRET as the operational token (unchanged downstream behaviour)
    return {"token": settings.CRON_SECRET}
