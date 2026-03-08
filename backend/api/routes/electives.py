"""
Elective recommendations via Claude AI

Security fixes applied:
- Authentication required via Depends(get_current_user_id)
- Field() constraints on all user-supplied inputs (length + list size limits)
- Module-level AsyncAnthropic singleton (not re-created per request)
- Input sanitized before prompt interpolation to strip prompt injection attempts
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
import anthropic
import json
import re

from api.config import settings
from api.auth import get_current_user_id

router = APIRouter()

# ── Module-level singleton — created once, reused across all requests ─────────
_async_client: Optional[anthropic.AsyncAnthropic] = None


def _get_client() -> anthropic.AsyncAnthropic:
    global _async_client
    if _async_client is None:
        _async_client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _async_client


# ── Input sanitization ────────────────────────────────────────────────────────
_INJECTION_PATTERNS = [
    "ignore previous", "ignore all", "disregard", "forget instructions",
    "you are now", "new instructions", "system prompt", "override",
    "jailbreak", "do anything now", "dan mode",
]


def _sanitize_field(value: str) -> str:
    """Strip obvious prompt injection attempts from a single field."""
    lower = value.lower()
    for pattern in _INJECTION_PATTERNS:
        if pattern in lower:
            raise HTTPException(
                status_code=400,
                detail="Message contains disallowed content.",
            )
    return value.strip()


class ElectivesRequest(BaseModel):
    major:           Optional[str]       = Field(None, max_length=100)
    minor:           Optional[str]       = Field(None, max_length=100)
    concentration:   Optional[str]       = Field(None, max_length=100)
    year:            Optional[int]       = Field(None, ge=1, le=5)
    interests:       Optional[str]       = Field(None, max_length=500)
    courses_taken:   Optional[List[str]] = Field(default_factory=list, max_items=50)
    exclude_courses: Optional[List[str]] = Field(default_factory=list, max_items=50)


@router.post("/recommend")
async def recommend_electives(
    req: ElectivesRequest,
    _: str = Depends(get_current_user_id),
):
    try:
        client = _get_client()

        # Sanitize user-controlled fields before prompt interpolation
        safe_major         = _sanitize_field(req.major or "")         or "Not set"
        safe_minor         = _sanitize_field(req.minor or "")         or "Not set"
        safe_concentration = _sanitize_field(req.concentration or "") or "Not specified"
        safe_interests     = _sanitize_field(req.interests or "")     or "Not specified"

        # Sanitize individual course codes (short strings, low injection risk, but be consistent)
        safe_courses_taken   = [_sanitize_field(c)[:20] for c in (req.courses_taken or [])]
        safe_exclude_courses = [_sanitize_field(c)[:20] for c in (req.exclude_courses or [])]

        course_list  = ", ".join(safe_courses_taken)  if safe_courses_taken  else "None yet"
        exclude_str  = ", ".join(safe_exclude_courses) if safe_exclude_courses else "None"

        prompt = f"""You are an academic advisor at McGill University Faculty of Arts.

Student profile:
- Major: {safe_major}
- Minor: {safe_minor}
- Concentration: {safe_concentration}
- Year: {"U" + str(req.year) if req.year else "Not specified"}
- Interests: {safe_interests}
- Courses taken/taking: {course_list}

IMPORTANT — Do NOT recommend any of these required major/minor courses: {exclude_str}

Recommend exactly 8 ELECTIVE courses from McGill's course catalogue — courses outside the required program.
These should complement their interests, open new perspectives, or advance their career goals.
Mix of: breadth courses, upper-level courses in adjacent fields, interdisciplinary options.
Use real McGill course codes (COMP, MATH, PSYC, PHIL, ECON, HIST, POLI, SOCI, CLAS, LING, etc.)

Respond ONLY with valid JSON, no markdown, no explanation:
{{
  "theme": "one sentence about why these courses suit this student",
  "recommendations": [
    {{
      "subject": "COMP",
      "catalog": "396",
      "title": "Undergraduate Research Project",
      "credits": 3,
      "why": "one sentence why this suits this student specifically",
      "category": "one of: Breadth | Career | Advanced | Interdisciplinary | Interest"
    }}
  ]
}}"""

        message = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1200,
            messages=[{"role": "user", "content": prompt}]
        )

        raw = message.content[0].text.strip()
        raw = re.sub(r'^```(?:json)?\s*', '', raw, flags=re.MULTILINE)
        raw = re.sub(r'\s*```\s*$', '', raw, flags=re.MULTILINE)
        parsed = json.loads(raw.strip())
        return {"success": True, "data": parsed}

    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
