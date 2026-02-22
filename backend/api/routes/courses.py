"""
backend/api/routes/courses.py

KEY FIX: Route order matters in FastAPI. /search and /subjects MUST be
declared before /{subject}/{catalog}, otherwise FastAPI matches "search"
and "subjects" as the {subject} path parameter and returns 404.

Also includes the smart search strategy (targeted vs paginated) from the
previous fix, plus the existing get_course_details logic unchanged.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from pydantic import BaseModel
import logging
import re
import time

from ..config import settings
from ..utils.supabase_client import get_supabase
from ..exceptions import DatabaseException
from ..utils.cache import search_cache

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Subjects cache ────────────────────────────────────────────────────────────
_subjects_cache: list = []
_subjects_cache_ts: float = 0.0
_SUBJECTS_CACHE_TTL: float = 3600.0

# ── Pagination constants ──────────────────────────────────────────────────────
SUPABASE_PAGE_SIZE = 1000
MAX_ROWS_TO_SCAN   = 12000


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


def _fetch_targeted(supabase, clean_subject, clean_query, limit):
    """Single Supabase request — used when subject is known or query is a code."""
    qb = supabase.from_('courses').select(
        'Course, course_name, "Class Ave.1", instructor, rmp_rating, '
        'rmp_difficulty, rmp_num_ratings, rmp_would_take_again'
    )
    if clean_subject:
        qb = qb.like('Course', f'{clean_subject}%')
    if clean_query:
        qb = qb.or_(
            f'course_name.ilike.%{clean_query}%,'
            f'Course.ilike.%{clean_query}%'
        )
    qb = qb.order('Course').limit(min(limit * 20, 1000))
    return qb.execute().data or []


def _fetch_paginated(supabase, clean_query, limit):
    """Paginated scan for broad keyword searches (no subject filter)."""
    all_sections = []
    offset = 0
    while offset < MAX_ROWS_TO_SCAN:
        qb = supabase.from_('courses').select(
            'Course, course_name, "Class Ave.1", instructor, rmp_rating, '
            'rmp_difficulty, rmp_num_ratings, rmp_would_take_again'
        )
        if clean_query:
            qb = qb.or_(
                f'course_name.ilike.%{clean_query}%,'
                f'Course.ilike.%{clean_query}%'
            )
        qb = qb.order('Course').range(offset, offset + SUPABASE_PAGE_SIZE - 1)
        page = qb.execute().data or []
        all_sections.extend(page)
        if len(page) < SUPABASE_PAGE_SIZE:
            break
        offset += SUPABASE_PAGE_SIZE
        if len(all_sections) >= limit * 10:
            break
    return all_sections


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
    Course search. Uses a single request for subject/code queries, full
    paginated scan for broad keyword searches. Results cached 5 minutes.
    """
    try:
        supabase = get_supabase()
        clean_query   = query.strip()   if query   else None
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
        else:
            sections = _fetch_paginated(supabase, clean_query, limit)
            strategy = "paginated"

        courses_dict  = _group_sections(sections)
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
    """
    global _subjects_cache, _subjects_cache_ts

    now = time.monotonic()
    if _subjects_cache and (now - _subjects_cache_ts) < _SUBJECTS_CACHE_TTL:
        logger.debug("Returning cached subjects list")
        return {"subjects": _subjects_cache, "count": len(_subjects_cache)}

    try:
        supabase = get_supabase()
        response = supabase.from_('courses').select('Course').limit(10000).execute()

        subjects: set = set()
        for row in response.data:
            subj, _ = parse_course_code(row.get('Course'))
            if subj:
                subjects.add(subj)

        sorted_subjects = sorted(subjects)
        _subjects_cache    = sorted_subjects
        _subjects_cache_ts = now

        logger.info(f"Retrieved and cached {len(sorted_subjects)} unique subjects")
        return {"subjects": sorted_subjects, "count": len(sorted_subjects)}

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

        # ── Year extraction ───────────────────────────────────────────────────
        def extract_year(term_name):
            if not term_name:
                return 0
            m = re.search(r'\d{4}', str(term_name))
            return int(m.group()) if m else 0

        # ── Find most-recent year average ─────────────────────────────────────
        year_grades: dict = {}
        for section in sections:
            avg = section.get('Class Ave.1')
            if avg:
                try:
                    year = extract_year(section.get('Term Name'))
                    if year > 0:
                        year_grades.setdefault(year, []).append(float(avg))
                except (ValueError, TypeError):
                    pass

        last_year_avg = None
        if year_grades:
            latest_year     = max(year_grades.keys())
            last_year_grades = year_grades[latest_year]
            last_year_avg   = round(sum(last_year_grades) / len(last_year_grades), 2)

        # ── Format sections ───────────────────────────────────────────────────
        formatted_sections = []
        professor_rating   = None
        grades             = []

        for section in sections:
            formatted_section = {
                'term':       section.get('Term Name'),
                'average':    section.get('Class Ave.1'),
                'instructor': section.get('instructor'),
                'class':      section.get('Class'),
            }

            avg = section.get('Class Ave.1')
            if avg:
                try:
                    grades.append(float(avg))
                except (ValueError, TypeError):
                    pass

            if section.get('rmp_rating') is not None:
                formatted_section['rmp_rating']          = section['rmp_rating']
                formatted_section['rmp_difficulty']      = section.get('rmp_difficulty')
                formatted_section['rmp_num_ratings']     = section.get('rmp_num_ratings')
                formatted_section['rmp_would_take_again'] = section.get('rmp_would_take_again')

                if not professor_rating:
                    professor_rating = {
                        'rmp_rating':           section['rmp_rating'],
                        'rmp_difficulty':       section.get('rmp_difficulty'),
                        'rmp_num_ratings':      section.get('rmp_num_ratings'),
                        'rmp_would_take_again': section.get('rmp_would_take_again'),
                        'instructor':           section.get('instructor'),
                    }

            formatted_sections.append(formatted_section)

        avg_grade = round(sum(grades) / len(grades), 2) if grades else None

        course_detail = {
            "subject":         clean_subject,
            "catalog":         clean_catalog,
            "title":           sections[0].get('course_name', ''),
            "average_grade":   avg_grade,
            "last_year_average": last_year_avg,
            "num_sections":    len(sections),
            "sections":        formatted_sections,
            "professor_rating": professor_rating,
            "includes_ratings": True,
        }

        logger.info(f"Course details retrieved: {clean_subject} {clean_catalog}")
        return {"course": course_detail}

    except HTTPException:
        raise
    except DatabaseException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error getting course details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving course details",
        )