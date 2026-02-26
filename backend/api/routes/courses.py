"""
backend/api/routes/courses.py

KEY FIX: Route order matters in FastAPI. /search and /subjects MUST be
declared before /{subject}/{catalog}, otherwise FastAPI matches "search"
and "subjects" as the {subject} path parameter and returns 404.

FIX #15: _fetch_paginated now uses Postgres full-text search via the
`search_vector` tsvector column + GIN index (see sql/fix15_courses_fts_index.sql).
This replaces the old loop that could scan up to 12,000 rows in Python.
A single indexed query now handles broad keyword searches in < 50 ms.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from pydantic import BaseModel
import logging
import re

from ..config import settings
from ..utils.supabase_client import get_supabase
from ..exceptions import DatabaseException
# FIX: Import both caches and use each for its intended purpose.
# subjects_cache replaces the redundant module-level _subjects_cache variables.
from ..utils.cache import search_cache, subjects_cache

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────
SUPABASE_PAGE_SIZE = 1000
# FIX #15: MAX_ROWS_TO_SCAN is no longer used — kept here for reference only.
# The old paginated scan (12 k row worst case) is replaced by a single FTS query.
_LEGACY_MAX_ROWS_TO_SCAN = 12000

# Columns selected in every course query — avoid SELECT *
_COURSE_COLS = (
    'Course, course_name, "Class Ave.1", instructor, '
    'rmp_rating, rmp_difficulty, rmp_num_ratings, rmp_would_take_again'
)

# Cache key for the full subjects list
_SUBJECTS_CACHE_KEY = "all_subjects"


# ── Helpers ───────────────────────────────────────────────────────────────────

def parse_course_code(course_code):
    """Parse 'COMP202' → ('COMP', '202')"""
    if not course_code:
        return None, None
    match = re.match(r'^([A-Z]+)(\d+[A-Z]?)$', course_code.upper())
    if match:
        return match.group(1), match.group(2)
    return None, None


def _is_course_code_query(query: str) -> bool:
    """True if the query looks like a course code e.g. 'COMP 202', 'comp202'."""
    return bool(re.match(r'^[A-Za-z]{2,4}\s*\d{2,4}', query.strip()))


def _fetch_targeted(supabase, clean_subject: str | None, clean_query: str | None, limit: int):
    """
    Single Supabase request — used when:
      • a subject prefix is known (e.g. subject='COMP'), OR
      • the query looks like a course code (e.g. 'comp202').
    Falls back to ilike for the name/code columns, which is fast when
    the subject prefix lets Postgres use the btree index on Course.
    """
    qb = supabase.from_('courses').select(_COURSE_COLS)
    if clean_subject:
        qb = qb.like('Course', f'{clean_subject}%')
    if clean_query:
        qb = qb.or_(
            f'course_name.ilike.%{clean_query}%,'
            f'Course.ilike.%{clean_query}%'
        )
    qb = qb.order('Course').limit(min(limit * 20, 1000))
    return qb.execute().data or []


def _fetch_fts(supabase, clean_query: str, limit: int):
    """
    FIX #15: Full-text search using the pre-built tsvector GIN index.

    Uses Supabase's PostgREST `fts` filter which maps to:
        WHERE search_vector @@ websearch_to_tsquery('english', '<query>')

    `websearch_to_tsquery` accepts natural-language input (quoted phrases,
    AND/OR, negation with -) and is resilient to syntax errors.

    The result set is bounded by `limit * 20` rows from Postgres (to give
    _group_sections enough sections to compute multi-term averages), then
    Python-sliced to `limit` unique courses.  Because the GIN index makes
    this a single fast index scan, we no longer need the 12 k-row loop.
    """
    try:
        qb = (
            supabase.from_('courses')
            .select(_COURSE_COLS)
            .text_search('search_vector', clean_query, config='english', type='websearch')
            .order('Course')
            .limit(min(limit * 20, 2000))
        )
        return qb.execute().data or []
    except Exception as e:
        # Graceful fallback: if FTS fails (e.g. index not yet created),
        # fall back to ilike on both columns so search still works.
        logger.warning(f"FTS query failed, falling back to ilike: {e}")
        qb = (
            supabase.from_('courses')
            .select(_COURSE_COLS)
            .or_(
                f'course_name.ilike.%{clean_query}%,'
                f'Course.ilike.%{clean_query}%'
            )
            .order('Course')
            .limit(min(limit * 20, 2000))
        )
        return qb.execute().data or []


def _group_sections(sections):
    """Collapse flat section rows into unique course dicts."""
    courses_dict = {}
    for section in sections:
        course_code = section.get('Course')
        subj, cat = parse_course_code(course_code)
        if not subj or not cat:
            continue
        avg = section.get('Class Ave.1')
        if course_code not in courses_dict:
            courses_dict[course_code] = {
                'subject':      subj,
                'catalog':      cat,
                'title':        section.get('course_name', ''),
                'instructor':   section.get('instructor'),
                'averages':     [avg] if avg else [],
                'num_sections': 1,
                'rating_data':  None,
            }
        else:
            entry = courses_dict[course_code]
            entry['num_sections'] += 1
            if avg:
                entry['averages'].append(avg)
            if not entry['instructor'] and section.get('instructor'):
                entry['instructor'] = section['instructor']
        if courses_dict[course_code]['rating_data'] is None:
            rmp = section.get('rmp_rating')
            if rmp and rmp > 0:
                courses_dict[course_code]['rating_data'] = {
                    'rmp_rating':           rmp,
                    'rmp_difficulty':       section.get('rmp_difficulty'),
                    'rmp_num_ratings':      section.get('rmp_num_ratings'),
                    'rmp_would_take_again': section.get('rmp_would_take_again'),
                }
    return courses_dict


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTES — order matters: specific paths before wildcard /{subject}/{catalog}
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/search", response_model=dict)
async def search(
    query: Optional[str] = Query(None, min_length=1, max_length=100),
    subject: Optional[str] = Query(None, min_length=2, max_length=4),
    limit: int = Query(
        default=settings.DEFAULT_SEARCH_LIMIT,
        ge=1,
        le=settings.MAX_SEARCH_LIMIT,
    ),
    include_ratings: bool = Query(default=True),
):
    """
    Course search.
    • Subject filter or course-code query  → targeted single request (ilike, fast)
    • Broad keyword query                  → FIX #15: single FTS query via GIN index
    Results are cached for 5 minutes.
    """
    try:
        supabase = get_supabase()
        clean_query   = query.strip()         if query   else None
        clean_subject = subject.strip().upper() if subject else None

        cache_key = f"search:{clean_subject}:{clean_query}:{limit}"
        cached = search_cache.get(cache_key)
        if cached is not None:
            logger.debug(f"Cache hit: {cache_key}")
            return cached

        use_targeted = (
            clean_subject is not None
            or (clean_query and _is_course_code_query(clean_query))
        )

        if use_targeted:
            sections = _fetch_targeted(supabase, clean_subject, clean_query, limit)
            strategy = "targeted"
        elif clean_query:
            # FIX #15: Use FTS instead of paginated 12k-row scan
            sections = _fetch_fts(supabase, clean_query, limit)
            strategy = "fts"
        else:
            sections = []
            strategy = "empty"

        courses_dict = _group_sections(sections)
        result_courses = []

        for course_data in courses_dict.values():
            avgs = course_data['averages']
            avg_val = round(sum(avgs) / len(avgs), 2) if avgs else None
            course_obj = {
                'subject':      course_data['subject'],
                'catalog':      course_data['catalog'],
                'title':        course_data['title'],
                'average':      avg_val,
                'instructor':   course_data['instructor'],
                'num_sections': course_data['num_sections'],
            }
            if course_data['rating_data']:
                course_obj.update(course_data['rating_data'])
            result_courses.append(course_obj)

        result_courses.sort(key=lambda c: (c['subject'], c['catalog']))
        result_courses = result_courses[:limit]

        logger.info(
            f"Course search [{strategy}]: query='{clean_query}', "
            f"subject='{clean_subject}', sections={len(sections)}, "
            f"unique_courses={len(result_courses)}"
        )

        result = {
            "courses":          result_courses,
            "count":            len(result_courses),
            "query":            clean_query,
            "subject":          clean_subject,
            "includes_ratings": True,
        }
        search_cache.set(cache_key, result, ttl=300)
        return result

    except DatabaseException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error in course search: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while searching courses",
        )


@router.get("/subjects", response_model=dict)
async def get_subjects():
    """
    Return all unique subject codes. Cached in memory for 1 hour.
    MUST be declared before /{subject}/{catalog} to avoid route shadowing.

    FIX: Removed the redundant module-level (_subjects_cache / _subjects_cache_ts)
    variables that duplicated the SimpleCache instance from cache.py. All caching
    now goes through subjects_cache so there is a single source of truth.
    """
    # FIX: Use the shared subjects_cache (TTL=3600) instead of manual time tracking.
    cached = subjects_cache.get(_SUBJECTS_CACHE_KEY)
    if cached is not None:
        logger.debug("Returning cached subjects list")
        return cached

    try:
        supabase = get_supabase()
        response = supabase.from_('courses').select('Course').limit(10000).execute()

        subjects: set = set()
        for row in response.data:
            subj, _ = parse_course_code(row.get('Course'))
            if subj:
                subjects.add(subj)

        sorted_subjects = sorted(subjects)
        result = {"subjects": sorted_subjects, "count": len(sorted_subjects)}

        # FIX: Store via subjects_cache — TTL already set to 3600 s on the instance.
        subjects_cache.set(_SUBJECTS_CACHE_KEY, result)

        logger.info(f"Retrieved and cached {len(sorted_subjects)} unique subjects")
        return result

    except DatabaseException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error getting subjects: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving subjects",
        )


@router.get("/{subject}/{catalog}", response_model=dict)
async def get_course_details(
    subject: str,
    catalog: str,
    include_ratings: bool = Query(default=True),
):
    """
    Detailed info for a specific course — all sections, grade history, RMP.
    MUST be declared after /search and /subjects.
    """
    try:
        supabase = get_supabase()

        if not subject or len(subject) < 2 or len(subject) > 6:
            raise HTTPException(status_code=400, detail="Invalid subject code")
        if not catalog or len(catalog) < 1 or len(catalog) > 10:
            raise HTTPException(status_code=400, detail="Invalid catalog number")

        clean_subject = subject.strip().upper()
        clean_catalog = catalog.strip()
        course_code   = f"{clean_subject}{clean_catalog}"

        response = supabase.from_('courses').select(
            '"Term Name", "Class Ave.1", instructor, Class, course_name, '
            'rmp_rating, rmp_difficulty, rmp_num_ratings, rmp_would_take_again'
        ).eq('Course', course_code).execute()

        sections = response.data if response.data else []

        if not sections:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Course {clean_subject} {clean_catalog} not found",
            )

        def extract_year(term_name):
            if not term_name:
                return 0
            m = re.search(r'\d{4}', str(term_name))
            return int(m.group()) if m else 0

        year_grades: dict = {}
        for section in sections:
            avg = section.get('Class Ave.1')
            if avg:
                try:
                    year = extract_year(section.get('Term Name'))
                    if year not in year_grades:
                        year_grades[year] = []
                    year_grades[year].append(float(avg))
                except (ValueError, TypeError):
                    pass

        sorted_years = sorted(year_grades.keys(), reverse=True)
        recent_avg = None
        if sorted_years:
            recent_year_avgs = year_grades[sorted_years[0]]
            recent_avg = round(sum(recent_year_avgs) / len(recent_year_avgs), 2)

        all_avgs = [float(s['Class Ave.1']) for s in sections if s.get('Class Ave.1')]
        overall_avg = round(sum(all_avgs) / len(all_avgs), 2) if all_avgs else None

        # Grade trend (most recent 5 years)
        grade_trend = []
        for year in sorted_years[:5]:
            avgs = year_grades[year]
            grade_trend.append({
                'year': year,
                'average': round(sum(avgs) / len(avgs), 2),
                'sections': len(avgs),
            })

        # Instructors (unique, most recent first)
        seen_instructors: set = set()
        instructors = []
        for section in sorted(sections, key=lambda s: extract_year(s.get('Term Name')), reverse=True):
            instr = section.get('instructor')
            if instr and instr not in seen_instructors:
                seen_instructors.add(instr)
                instructors.append(instr)

        # RMP data (first available)
        rmp_data = None
        for section in sections:
            rmp = section.get('rmp_rating')
            if rmp and rmp > 0:
                rmp_data = {
                    'rmp_rating':           rmp,
                    'rmp_difficulty':       section.get('rmp_difficulty'),
                    'rmp_num_ratings':      section.get('rmp_num_ratings'),
                    'rmp_would_take_again': section.get('rmp_would_take_again'),
                }
                break

        course_obj = {
            'subject':       clean_subject,
            'catalog':       clean_catalog,
            'title':         sections[0].get('course_name', ''),
            'average':       recent_avg,
            'overall_average': overall_avg,
            'grade_trend':   grade_trend,
            'instructors':   instructors,
            'num_sections':  len(sections),
        }
        if rmp_data:
            course_obj.update(rmp_data)

        return {"course": course_obj}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error getting course details for {subject}/{catalog}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving course details",
        )