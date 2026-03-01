"""
backend/api/routes/professors.py

Professor RMP (Rate My Professors) lookup endpoints.

Given a professor name (from a syllabus upload or degree requirements),
look up their RMP data from the courses table, which already has
rmp_rating, rmp_difficulty, rmp_num_ratings, rmp_would_take_again,
and rmp_url stored per course/instructor row.

Endpoints:
  GET /professors/rmp?name=<name>            — lookup by instructor name
  GET /professors/rmp-by-course?subject=ECON&catalog=208 — lookup by course
  GET /professors/search?q=<name>            — search/suggest professors
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from pydantic import BaseModel
import logging
import re
from difflib import SequenceMatcher

from ..utils.supabase_client import get_supabase
from ..utils.cache import search_cache

router = APIRouter()
logger = logging.getLogger(__name__)

# Columns we need from the courses table for RMP data
_RMP_COLS = (
    'instructor, Course, course_name, '
    'rmp_rating, rmp_difficulty, rmp_num_ratings, rmp_would_take_again, rmp_url'
)

# Cache keys
_RMP_PROF_PREFIX = "rmp_prof:"
_RMP_COURSE_PREFIX = "rmp_course:"


def _name_similarity(a: str, b: str) -> float:
    """Return similarity ratio between two professor name strings (0-1)."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def _normalize_name(name: str) -> str:
    """Strip titles, extra whitespace, normalise to lowercase for fuzzy matching."""
    name = re.sub(r'\b(dr|prof|professor|mr|mrs|ms)\b\.?', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+', ' ', name).strip()
    return name.lower()


def _best_rmp_row(rows: list, target_name: str) -> dict | None:
    """
    Given raw DB rows, find the best RMP match for `target_name`.
    Returns the row dict or None if nothing good enough is found.
    Threshold: 0.65 similarity — catches last-name-only matches and
    slight spelling differences while avoiding wrong professor matches.
    """
    best_row = None
    best_score = 0.0
    target_norm = _normalize_name(target_name)

    for row in rows:
        instr = row.get('instructor') or ''
        if not instr:
            continue
        # Only rows that actually have RMP data are useful
        if not row.get('rmp_rating'):
            continue
        score = _name_similarity(target_norm, _normalize_name(instr))
        if score > best_score:
            best_score = score
            best_row = row

    if best_score >= 0.60:
        return best_row
    return None


def _format_professor(row: dict) -> dict:
    """Convert a raw courses row into a clean professor RMP dict."""
    instr = row.get('instructor') or ''
    parts = instr.split() if instr else []
    first = parts[0] if len(parts) > 1 else ''
    last  = parts[-1] if parts else instr

    return {
        'name':                 instr,
        'first_name':           first,
        'last_name':            last,
        'avg_rating':           row.get('rmp_rating'),
        'avg_difficulty':       row.get('rmp_difficulty'),
        'num_ratings':          int(row.get('rmp_num_ratings') or 0),
        'would_take_again_percent': (
            round(float(row['rmp_would_take_again']))
            if row.get('rmp_would_take_again') is not None else None
        ),
        'rmp_url':              row.get('rmp_url'),
        'course_code':          row.get('Course'),
        'course_name':          row.get('course_name'),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/rmp-bulk", response_model=dict)
async def get_rmp_bulk(
    courses: str = Query(..., description="Comma-separated list of course codes e.g. ECON208,ECON230D1"),
):
    """
    Batch RMP lookup for a list of course codes.
    Returns { "ratings": { "ECON 208": { professor, rmp... } | null, ... } }
    Used by DegreeRequirementsView to show RMP badges per block without N+1 requests.
    """
    codes = [c.strip().upper().replace(' ', '') for c in courses.split(',') if c.strip()]
    if not codes:
        raise HTTPException(status_code=422, detail="No course codes provided")
    if len(codes) > 60:
        codes = codes[:60]

    cache_key = f"rmp_bulk:{'|'.join(sorted(codes))}"
    cached = search_cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        supabase = get_supabase()

        # Build an OR filter on the Course column
        or_filter = ','.join(f'Course.eq.{c}' for c in codes)
        rows = (
            supabase.from_('courses')
            .select(_RMP_COLS + ', "Term Name"')
            .or_(or_filter)
            .execute()
            .data or []
        )

        # Group by course code, pick the best-rated row
        by_course: dict[str, list] = {}
        for row in rows:
            code = (row.get('Course') or '').upper()
            by_course.setdefault(code, []).append(row)

        ratings: dict = {}
        for code in codes:
            # Normalize key to "SUBJ NNN" format for consistency
            normalized = re.sub(r'^([A-Z]{2,6})(\d)', r'\1 \2', code)
            course_rows = by_course.get(code, [])
            best = max(
                (r for r in course_rows if r.get('rmp_rating')),
                key=lambda r: float(r.get('rmp_rating') or 0),
                default=None
            )
            ratings[normalized] = _format_professor(best) if best else None

        result = {'ratings': ratings, 'courses_checked': len(codes)}
        search_cache.set(cache_key, result, ttl=600)
        return result

    except Exception as e:
        logger.exception(f"Bulk RMP lookup failed: {e}")
        raise HTTPException(status_code=500, detail="Bulk RMP lookup failed")


@router.get("/rmp", response_model=dict)
async def get_rmp_by_name(
    name: str = Query(..., min_length=2, max_length=100,
                      description="Professor full name or last name"),
    subject: Optional[str] = Query(None, min_length=2, max_length=6,
                                   description="Optional subject filter (e.g. ECON)"),
):
    """
    Look up RMP data for a professor by name.

    First tries an exact `instructor ilike` match, then fuzzy-matches
    among all rows with rmp_rating data if an exact hit isn't found.

    Returns: { found: bool, professor: {...} | null, match_score: float }
    """
    clean_name = name.strip()
    cache_key  = f"{_RMP_PROF_PREFIX}{subject or ''}:{clean_name.lower()}"
    cached     = search_cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        supabase = get_supabase()

        # ── Try exact/fuzzy ilike on instructor column ─────────────────────────
        # Grab last name for the initial query (most robust signal)
        parts     = clean_name.split()
        last_name = parts[-1] if parts else clean_name

        qb = (
            supabase.from_('courses')
            .select(_RMP_COLS)
            .ilike('instructor', f'%{last_name}%')
            .not_.is_('rmp_rating', 'null')
        )
        if subject:
            qb = qb.like('Course', f'{subject.upper()}%')
        qb = qb.order('Course').limit(200)

        rows = qb.execute().data or []

        best = _best_rmp_row(rows, clean_name)

        # ── Fallback: broaden search if nothing found ──────────────────────────
        if best is None and len(parts) > 1:
            first_name = parts[0]
            qb2 = (
                supabase.from_('courses')
                .select(_RMP_COLS)
                .ilike('instructor', f'%{first_name}%')
                .not_.is_('rmp_rating', 'null')
            )
            if subject:
                qb2 = qb2.like('Course', f'{subject.upper()}%')
            qb2 = qb2.order('Course').limit(200)
            rows2 = qb2.execute().data or []
            best = _best_rmp_row(rows2, clean_name)

        if best is None:
            result = {'found': False, 'professor': None, 'match_score': 0.0}
        else:
            prof_data   = _format_professor(best)
            match_score = _name_similarity(
                _normalize_name(clean_name),
                _normalize_name(best.get('instructor') or '')
            )
            result = {
                'found':       True,
                'professor':   prof_data,
                'match_score': round(match_score, 3),
            }

        # Cache for 10 minutes
        search_cache.set(cache_key, result, ttl=600)
        return result

    except Exception as e:
        logger.exception(f"RMP lookup by name failed for '{name}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to look up professor rating",
        )


@router.get("/rmp-by-course", response_model=dict)
async def get_rmp_by_course(
    subject: str = Query(..., min_length=2, max_length=6),
    catalog: str = Query(..., min_length=1, max_length=10),
):
    """
    Return all instructors (with RMP data) who have taught this course,
    most recent first.

    Used by DegreeRequirementsView and CoursesTab to surface instructor
    ratings for a specific course code.
    """
    clean_subject = subject.strip().upper()
    clean_catalog = catalog.strip()
    course_code   = f"{clean_subject}{clean_catalog}"

    cache_key = f"{_RMP_COURSE_PREFIX}{course_code}"
    cached    = search_cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        supabase = get_supabase()

        response = (
            supabase.from_('courses')
            .select(_RMP_COLS + ', "Term Name"')
            .eq('Course', course_code)
            .execute()
        )

        rows = response.data or []

        # Group by instructor, keeping the row with highest rmp_rating
        seen: dict[str, dict] = {}
        for row in rows:
            instr = row.get('instructor') or ''
            if not instr:
                continue
            if instr not in seen:
                seen[instr] = row
            elif row.get('rmp_rating') and (
                not seen[instr].get('rmp_rating')
                or float(row['rmp_rating']) > float(seen[instr]['rmp_rating'] or 0)
            ):
                seen[instr] = row

        professors = []
        for instr, row in seen.items():
            if row.get('rmp_rating'):
                professors.append(_format_professor(row))

        # Sort: highest rated first
        professors.sort(key=lambda p: p['avg_rating'] or 0, reverse=True)

        result = {
            'course_code': f"{clean_subject} {clean_catalog}",
            'professors':  professors,
            'count':       len(professors),
        }
        search_cache.set(cache_key, result, ttl=600)
        return result

    except Exception as e:
        logger.exception(f"RMP by-course failed for {course_code}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to look up course professors",
        )


@router.get("/search", response_model=dict)
async def search_professors(
    q: str = Query(..., min_length=2, max_length=80, description="Professor name search query"),
    subject: Optional[str] = Query(None, min_length=2, max_length=6),
    limit: int = Query(default=10, ge=1, le=50),
):
    """
    Search for professors by name (for autocomplete / suggestions).
    Returns distinct instructors with their RMP data.
    """
    clean_q    = q.strip()
    cache_key  = f"prof_search:{subject or ''}:{clean_q.lower()}:{limit}"
    cached     = search_cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        supabase = get_supabase()

        qb = (
            supabase.from_('courses')
            .select(_RMP_COLS)
            .ilike('instructor', f'%{clean_q}%')
        )
        if subject:
            qb = qb.like('Course', f'{subject.upper()}%')
        qb = qb.order('instructor').limit(500)
        rows = qb.execute().data or []

        # Deduplicate by instructor name, keep best-rated row
        seen: dict[str, dict] = {}
        for row in rows:
            instr = row.get('instructor') or ''
            if not instr:
                continue
            if instr not in seen or (
                row.get('rmp_rating')
                and float(row['rmp_rating']) > float((seen[instr].get('rmp_rating') or 0))
            ):
                seen[instr] = row

        professors = [_format_professor(row) for row in seen.values()]
        professors.sort(key=lambda p: (p['avg_rating'] or 0), reverse=True)
        professors = professors[:limit]

        result = {
            'professors': professors,
            'count':      len(professors),
            'query':      clean_q,
        }
        search_cache.set(cache_key, result, ttl=300)
        return result

    except Exception as e:
        logger.exception(f"Professor search failed for '{q}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search professors",
        )


class BulkRmpRequest(BaseModel):
    codes: List[str]  # list of course codes like "ECON208" or "ECON 208"


@router.post("/rmp-bulk", response_model=dict)
async def get_rmp_bulk(body: BulkRmpRequest):
    """
    Bulk lookup: given a list of course codes, return the best RMP data
    for the most-recent instructor of each course.

    Returns { ratings: { "ECON 208": { avg_rating, avg_difficulty, ... } | null } }

    Used by DegreeRequirementsView to fetch a whole block's worth of ratings
    in a single request rather than one call per course row.
    """
    if not body.codes:
        return {"ratings": {}}

    # Normalise: "ECON208" → "ECON208", keep compact form for DB equality
    def compact(code):
        code = re.sub(r'\s+', '', code.strip().upper())
        return code

    compact_codes = [compact(c) for c in body.codes[:100]]  # cap at 100

    cache_key = f"rmp_bulk:{'|'.join(sorted(compact_codes))}"
    cached = search_cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        supabase = get_supabase()

        # Single query: fetch all matching rows for all requested courses
        response = (
            supabase.from_("courses")
            .select(_RMP_COLS + ', "Term Name"')
            .in_("Course", compact_codes)
            .not_.is_("rmp_rating", "null")
            .execute()
        )
        rows = response.data or []

        # Group by course code, keep best-rated row per course
        by_course: dict[str, dict] = {}
        for row in rows:
            code = row.get("Course") or ""
            if not code:
                continue
            if code not in by_course:
                by_course[code] = row
            elif float(row.get("rmp_rating") or 0) > float(by_course[code].get("rmp_rating") or 0):
                by_course[code] = row

        # Build normalised key → rating map
        # Key format: "ECON 208" (with space) for frontend consumption
        def spaced(code):
            return re.sub(r'^([A-Z]{2,6})(\d)', r'\1 \2', code)

        ratings: dict = {}
        for compact_code in compact_codes:
            spaced_code = spaced(compact_code)
            row = by_course.get(compact_code)
            if row and row.get("rmp_rating"):
                ratings[spaced_code] = {
                    "name":                     row.get("instructor"),
                    "avg_rating":               row.get("rmp_rating"),
                    "avg_difficulty":           row.get("rmp_difficulty"),
                    "num_ratings":              int(row.get("rmp_num_ratings") or 0),
                    "would_take_again_percent": (
                        round(float(row["rmp_would_take_again"]))
                        if row.get("rmp_would_take_again") is not None else None
                    ),
                    "rmp_url": row.get("rmp_url"),
                }
            else:
                ratings[spaced_code] = None

        result = {"ratings": ratings, "found": sum(1 for v in ratings.values() if v)}
        search_cache.set(cache_key, result, ttl=600)
        return result

    except Exception as e:
        logger.exception(f"Bulk RMP lookup failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to bulk-lookup professor ratings",
        )
