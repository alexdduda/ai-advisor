#!/usr/bin/env python3
"""
scrap_mcgill.py  (v2 — full API rewrite)

The mcgill.courses API returns ALL data we need in one paginated endpoint:
  GET /api/courses?limit=N&offset=N
  
Each course object includes:
  - _id, title, credits, subject, code, terms, description
  - instructors: [{name, term}]
  - schedule: [{term, blocks: [{crn, display, location, timeblocks, campus}]}]
  - avgRating, avgDifficulty, reviewCount   ← mcgill.courses crowd ratings

Strategy:
  1. Page through /api/courses until all courses fetched
  2. For each course, upsert sections into mcgill_sections
  3. For each instructor in our courses table, match to mcgill.courses
     avgRating/avgDifficulty and update mc_rating, mc_num_ratings, blended_rating
"""

import argparse
import logging
import os
import time
from difflib import SequenceMatcher
from typing import Optional

import httpx
from dotenv import load_dotenv
from supabase import create_client, Client
from tqdm import tqdm

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

BASE_URL     = "https://mcgill.courses"
PAGE_SIZE    = 500       # courses per API page
REQUEST_DELAY = 0.25     # seconds between requests

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
    "Referer": "https://mcgill.courses/",
}

# ── Supabase ──────────────────────────────────────────────────────────────────

def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


# ── Fetch all courses from mcgill.courses ─────────────────────────────────────

def fetch_all_mc_courses(subjects: list[str] = None, limit: int = 0) -> list[dict]:
    """
    Page through GET /api/courses until all courses are retrieved.
    Returns list of raw course dicts from the API.
    """
    client = httpx.Client(headers=HEADERS, timeout=20.0, follow_redirects=True)
    all_courses = []
    offset = 0

    log.info("Fetching course list from mcgill.courses API...")

    while True:
        url = f"{BASE_URL}/api/courses"
        params = {"limit": PAGE_SIZE, "offset": offset}
        
        try:
            r = client.get(url, params=params)
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            log.error(f"API fetch failed at offset {offset}: {e}")
            break

        courses = data.get("courses", [])
        if not courses:
            break

        # Filter by subjects if specified
        if subjects:
            courses = [c for c in courses if c.get("subject", "").upper() in subjects]

        all_courses.extend(courses)
        total = data.get("courseCount") or "?"
        log.info(f"  Fetched {len(all_courses)} courses so far (total on site: {total})")

        # If we got fewer than PAGE_SIZE, we've reached the end
        if len(data.get("courses", [])) < PAGE_SIZE:
            break

        offset += PAGE_SIZE
        time.sleep(REQUEST_DELAY)

        if limit and len(all_courses) >= limit:
            all_courses = all_courses[:limit]
            break

    client.close()
    log.info(f"Total courses fetched from mcgill.courses: {len(all_courses)}")
    return all_courses


# ── Parse sections from a course object ──────────────────────────────────────

def parse_sections(course: dict) -> list[dict]:
    """
    Extract section rows from a mcgill.courses course object.
    
    schedule = [
      {
        "term": "Fall 2025",
        "blocks": [
          {
            "crn": "651",
            "display": "Lec 001",
            "location": "ENGTR 0100",
            "campus": "Downtown",
            "timeblocks": [{"day": "Monday", "t1": 895, "t2": 955}]
          }
        ]
      }
    ]
    instructors = [{"name": "Jane Smith", "term": "Fall 2025"}]
    """
    course_code = course.get("_id", "").upper()
    schedule    = course.get("schedule", []) or []
    instructors = course.get("instructors", []) or []

    # Build instructor lookup: term → [name, ...]
    instr_by_term: dict[str, list[str]] = {}
    for instr in instructors:
        term = instr.get("term") or ""
        name = instr.get("name") or ""
        if term and name:
            instr_by_term.setdefault(term, []).append(name)

    sections = []
    seen_keys = set()
    for sched in schedule:
        term   = sched.get("term") or ""
        blocks = sched.get("blocks") or []
        term_instructors = instr_by_term.get(term, [])

        for block in blocks:
            crn      = str(block.get("crn") or "")
            display  = block.get("display") or ""
            location = block.get("location") or ""
            campus   = block.get("campus") or ""

            # Parse section type from display (e.g. "Lec 001" → "Lecture")
            section_type = _parse_section_type(display)

            # Parse days/times from timeblocks
            timeblocks = block.get("timeblocks") or []
            days, times = _parse_timeblocks(timeblocks)

            # Assign instructor: join all for this term
            instructor = "; ".join(term_instructors) if term_instructors else None

            # Deduplicate by (crn, term) before adding
            dedup_key = (crn or "", term or "")
            if dedup_key in seen_keys:
                continue
            seen_keys.add(dedup_key)

            sections.append({
                "course_code":  course_code,
                "crn":          crn or None,
                "term":         term or None,
                "section_type": section_type,
                "instructor":   instructor,
                "days":         days,
                "times":        times,
                "location":     (f"{location} ({campus})" if campus and location else location or campus) or None,
                "capacity":     None,
                "enrolled":     None,
            })

    return sections


def _parse_section_type(display: str) -> str:
    d = display.lower()
    if "lec" in d:   return "Lecture"
    if "tut" in d:   return "Tutorial"
    if "lab" in d:   return "Lab"
    if "sem" in d:   return "Seminar"
    if "conf" in d:  return "Conference"
    if "student" in d: return "Online"
    return "Lecture"


def _parse_timeblocks(timeblocks: list[dict]) -> tuple[Optional[str], Optional[str]]:
    """Convert timeblocks to human-readable days and times strings."""
    if not timeblocks:
        return None, None

    DAY_ABBR = {
        "Monday": "M", "Tuesday": "T", "Wednesday": "W",
        "Thursday": "R", "Friday": "F", "Saturday": "S", "Sunday": "U",
    }

    def mins_to_time(mins: int) -> str:
        h, m = divmod(mins, 60)
        suffix = "AM" if h < 12 else "PM"
        h12 = h if h <= 12 else h - 12
        if h12 == 0:
            h12 = 12
        return f"{h12}:{m:02d}{suffix}"

    days_set  = []
    time_strs = []
    seen_days = set()

    for tb in timeblocks:
        day = tb.get("day") or ""
        t1  = tb.get("t1")
        t2  = tb.get("t2")
        if t1 is not None: t1 = int(t1)
        if t2 is not None: t2 = int(t2)

        abbr = DAY_ABBR.get(day, day[:1])
        if abbr not in seen_days:
            seen_days.add(abbr)
            days_set.append(abbr)

        if t1 is not None and t2 is not None:
            ts = f"{mins_to_time(t1)}-{mins_to_time(t2)}"
            if ts not in time_strs:
                time_strs.append(ts)

    return "".join(days_set) or None, ", ".join(time_strs) or None


# ── Rating blending ───────────────────────────────────────────────────────────

def blend_ratings(
    rmp_rating: Optional[float], rmp_num: Optional[int],
    mc_rating:  Optional[float], mc_num:  Optional[int],
) -> Optional[float]:
    rmp_r = float(rmp_rating) if rmp_rating else None
    mc_r  = float(mc_rating)  if mc_rating  else None
    rmp_n = int(rmp_num) if rmp_num else 0
    mc_n  = int(mc_num)  if mc_num  else 0

    if rmp_r and mc_r:
        total = rmp_n + mc_n
        if total == 0:
            return round((rmp_r + mc_r) / 2, 2)
        return round((rmp_r * rmp_n + mc_r * mc_n) / total, 2)
    return rmp_r or mc_r


def name_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


# ── Supabase operations ───────────────────────────────────────────────────────

def upsert_sections(sb: Client, sections: list[dict]) -> int:
    if not sections:
        return 0
    # Filter out rows with no crn AND no term (can't satisfy unique constraint)
    valid = [s for s in sections if s.get("crn") or s.get("term")]
    if not valid:
        return 0
    try:
        sb.table("mcgill_sections").upsert(
            valid,
            on_conflict="course_code,crn,term",
        ).execute()
        return len(valid)
    except Exception as e:
        log.warning(f"Section upsert failed ({len(valid)} rows): {e}")
        return 0


def update_ratings(
    sb: Client,
    course_code: str,
    mc_rating: float,
    mc_num: int,
    dry_run: bool,
) -> int:
    """
    Update mc_rating, mc_num_ratings, blended_rating for all rows of
    this course_code in the courses table.
    """
    if not mc_rating or mc_num == 0:
        return 0

    # Fetch all rows for this course to get their RMP data
    try:
        rows = (
            sb.from_("courses")
            .select("instructor, rmp_rating, rmp_num_ratings")
            .eq("Course", course_code)
            .execute()
            .data or []
        )
    except Exception as e:
        log.warning(f"Failed to fetch rows for {course_code}: {e}")
        return 0

    if not rows:
        return 0

    if dry_run:
        return len(rows)

    # Compute blended for this course's RMP data
    # (all rows share the same instructor/RMP in our denormalized table,
    #  but there may be multiple instructors — update all rows with mc data)
    try:
        # Get representative RMP values (use first non-null)
        rmp_r = next((r.get("rmp_rating") for r in rows if r.get("rmp_rating")), None)
        rmp_n = next((r.get("rmp_num_ratings") for r in rows if r.get("rmp_num_ratings")), 0)
        blended = blend_ratings(rmp_r, rmp_n, mc_rating, mc_num)

        sb.from_("courses").update({
            "mc_rating":      mc_rating,
            "mc_num_ratings": mc_num,
            "blended_rating": blended,
        }).eq("Course", course_code).execute()

        return len(rows)
    except Exception as e:
        log.warning(f"Failed to update ratings for {course_code}: {e}")
        return 0


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Scrape mcgill.courses — full API version")
    parser.add_argument("--subjects", help="Comma-separated subjects to filter (e.g. COMP,MATH)")
    parser.add_argument("--dry-run",  action="store_true", help="Don't write to DB")
    parser.add_argument("--limit",    type=int, default=0, help="Max courses (0 = all)")
    parser.add_argument("--no-sections", action="store_true", help="Skip section upserts (ratings only)")
    args = parser.parse_args()

    subjects = [s.strip().upper() for s in args.subjects.split(",")] if args.subjects else None

    # 1. Fetch all courses from mcgill.courses
    mc_courses = fetch_all_mc_courses(subjects=subjects, limit=args.limit)

    if not mc_courses:
        log.error("No courses fetched. Exiting.")
        return

    sb = get_supabase()

    total_sections = 0
    total_ratings  = 0
    failed         = []

    log.info(f"Processing {len(mc_courses)} courses...")

    for course in tqdm(mc_courses, desc="Processing"):
        code = (course.get("_id") or "").upper()
        if not code:
            continue

        try:
            # 2. Upsert sections
            if not args.no_sections:
                sections = parse_sections(course)
                if sections and not args.dry_run:
                    n = upsert_sections(sb, sections)
                    total_sections += n

            # 3. Update mc_rating / blended_rating
            mc_rating = course.get("avgRating") or 0
            mc_diff   = course.get("avgDifficulty") or 0
            mc_num    = course.get("reviewCount") or 0

            # mcgill.courses ratings are on 0–5 scale; skip if 0 (no reviews)
            if mc_rating > 0 and mc_num > 0:
                n = update_ratings(sb, code, mc_rating, mc_num, dry_run=args.dry_run)
                total_ratings += n

        except KeyboardInterrupt:
            log.info("Interrupted")
            break
        except Exception as e:
            log.warning(f"Error processing {code}: {e}")
            failed.append(code)

    log.info(
        f"\nDone! "
        f"Sections upserted: {total_sections}, "
        f"Courses with ratings updated: {total_ratings}, "
        f"Failed: {len(failed)}"
    )
    if failed:
        log.warning(f"Failed: {failed[:20]}")
    if args.dry_run:
        log.info("(dry-run — no DB writes)")


if __name__ == "__main__":
    main()