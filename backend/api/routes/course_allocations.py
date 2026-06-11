"""
Course allocations — which program a student counts a given course toward.

  GET    /api/users/{user_id}/course-allocations
  PUT    /api/users/{user_id}/course-allocations         (upsert one)
  DELETE /api/users/{user_id}/course-allocations/{code}  (remove one)

Backs the Degree Planning tab. Replaces the old localStorage-only storage so
allocations follow a user across devices. The frontend still keeps a
localStorage copy for instant paint, but this table is the source of truth.
"""
from __future__ import annotations

import logging
import re

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from ..auth import get_current_user_id, require_self
from ..utils.supabase_client import get_supabase

router = APIRouter()
logger = logging.getLogger(__name__)

# "SUBJ CAT" — 2–6 letters, space, 3 digits + optional trailing letter.
_CODE_RE = re.compile(r"^[A-Z]{2,6}\s\d{3}[A-Z]?$")


def _normalize_code(raw: str) -> str:
    """Uppercase + collapse to a single space; insert the space if missing
    (COMP202 → COMP 202) so storage is consistent with the frontend keys."""
    s = (raw or "").upper().strip()
    s = re.sub(r"([A-Z])(\d)", r"\1 \2", s)
    s = re.sub(r"\s+", " ", s)
    return s


class AllocationIn(BaseModel):
    course_code: str = Field(..., min_length=3, max_length=20)
    program_key: str = Field(..., min_length=1, max_length=120)


@router.get("/{user_id}/course-allocations")
async def get_allocations(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """Return the user's allocations as a flat map { "ANTH 209": "anth_minor" }."""
    require_self(current_user_id, user_id)
    try:
        rows = (
            get_supabase().table("course_allocations")
            .select("course_code, program_key")
            .eq("user_id", user_id)
            .execute()
        ).data or []
        return {"allocations": {r["course_code"]: r["program_key"] for r in rows}}
    except Exception as exc:
        logger.warning("get_allocations failed for %s: %s", user_id, type(exc).__name__)
        # Soft-fail: the frontend falls back to its localStorage copy.
        return {"allocations": {}}


@router.put("/{user_id}/course-allocations")
async def set_allocation(
    user_id: str,
    body: AllocationIn,
    current_user_id: str = Depends(get_current_user_id),
):
    """Upsert one allocation (course → program)."""
    require_self(current_user_id, user_id)

    code = _normalize_code(body.course_code)
    if not _CODE_RE.match(code):
        raise HTTPException(status_code=422, detail="Invalid course code")
    program_key = body.program_key.strip()

    try:
        sb = get_supabase()
        # Upsert on the (user_id, course_code) unique constraint.
        sb.table("course_allocations").upsert(
            {"user_id": user_id, "course_code": code, "program_key": program_key},
            on_conflict="user_id,course_code",
        ).execute()
        return {"ok": True, "course_code": code, "program_key": program_key}
    except Exception as exc:
        logger.exception("set_allocation failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save allocation")


@router.delete("/{user_id}/course-allocations/{course_code}", status_code=status.HTTP_200_OK)
async def delete_allocation(
    user_id: str,
    course_code: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """Remove an allocation — the course returns to the Electives pool."""
    require_self(current_user_id, user_id)
    code = _normalize_code(course_code)
    try:
        (get_supabase().table("course_allocations")
            .delete()
            .eq("user_id", user_id)
            .eq("course_code", code)
            .execute())
        return {"ok": True, "course_code": code}
    except Exception as exc:
        logger.exception("delete_allocation failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to remove allocation")
