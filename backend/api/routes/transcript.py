"""
backend/api/routes/transcript.py
Parse a McGill unofficial transcript PDF using Claude,
then bulk-import completed + current courses and update the user profile.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import anthropic
import base64
import logging
import re
import json

from ..utils.supabase_client import get_supabase, get_user_by_id, update_user
from ..exceptions import UserNotFoundException
from ..config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

VALID_TERMS = {"fall", "winter", "summer"}

VALID_GRADES = {
    "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F",
    "P", "S", "U",
    "W", "L", "EX", "IP", "CO", "HH", "K",
}

COURSE_CODE_PATTERN = re.compile(
    r"^[A-Z]{3,4}\s\d{3}([A-Z]\d?)?$",
    re.IGNORECASE,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def normalize_course_code(code: str) -> str:
    code = code.strip().upper()
    code = re.sub(r"^([A-Z]{2,4})(\d)", r"\1 \2", code)
    code = re.sub(r"\s{2,}", " ", code)
    return code


# ── Extraction prompt ─────────────────────────────────────────────────────────

EXTRACTION_PROMPT = """You are parsing a McGill University unofficial transcript PDF.
Your job is to carefully read every section and return a single JSON object.
== STEP 1: Read the program header at the top of the transcript ==
Extract student_info fields:
  - major: the text after "Major Concentration" (e.g. "Computer Science")
  - minor: the text after "Minor Concentration" (e.g. "Science for Arts Students")
  - faculty: the degree name (e.g. "Arts", "Science", "Engineering")
  - year: the Year number shown (e.g. "Year 1" -> 1, "Year 2" -> 2) as an integer
  - cum_gpa: the CUMULATIVE GPA on the final summary line labelled "CUM GPA"
  - advanced_standing: ALL courses listed under "Credits/Exemptions" or
    "Advanced Placement Exams" — these are AP/IB/transfer credits. Capture every one.
== STEP 2: Completed courses ==
Include ANY course row that has a final grade — including:
  - Standard letter grades: A, A-, B+, B, B-, C+, C, C-, D, F
  - Pass/fail grades: P (Pass), S (Satisfactory), U (Unsatisfactory)
  - Administrative grades: W (Withdrew), L (Deferred), EX (Exempt), IP (In Progress),
    CO (Complete), HH (High Honour), K (Incomplete)
Pass/fail courses (P, S, U) DO count toward credit requirements even though they
don't affect GPA — include them. Do NOT include courses from Credits/Exemptions here.
== STEP 3: Current / in-progress courses ==
These are courses prefixed "RW" (registered or waitlisted) with NO grade yet.
IMPORTANT — multi-term courses:
  McGill uses suffixes like D1/D2 or J1/J2 for year-long courses split across two terms.
  If FRSL 207D1 appears in Fall with RW and no grade, it is STILL IN PROGRESS even though
  Winter shows FRSL 207D2 also with RW. Include BOTH D1 and D2 in current_courses.
  Always include every RW course from every term that has no grade.
Return ONLY this JSON — no markdown, no explanation:
{
  "student_info": {
    "major": "Computer Science",
    "minor": "Science for Arts Students",
    "faculty": "Arts",
    "year": 2,
    "cum_gpa": 3.39,
    "advanced_standing": [
      {"course_code": "BIOL 111", "course_title": "Biology 1", "credits": 3}
    ]
  },
  "completed_courses": [
    {
      "course_code": "COMP 206",
      "course_title": "Intro to Software Systems",
      "subject": "COMP",
      "catalog": "206",
      "term": "Fall",
      "year": 2024,
      "grade": "B-",
      "credits": 3
    }
  ],
  "current_courses": [
    {
      "course_code": "COMP 251",
      "course_title": "Algorithms and Data Structures",
      "subject": "COMP",
      "catalog": "251",
      "credits": 3
    }
  ]
}
Additional rules:
  - term must be exactly "Fall", "Winter", or "Summer"
  - year is the 4-digit calendar year the term occurred (e.g. 2024)
  - credits: use the numeric value on the transcript (typically 3 or 4)
  - catalog for multi-term courses includes the full suffix: "207D1", "207D2"
  - If a field is unknown, use null"""


# ── Claude extraction ─────────────────────────────────────────────────────────

async def extract_transcript_data(pdf_bytes: bytes) -> dict:
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    pdf_b64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")

    message = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=4000,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": pdf_b64,
                        },
                    },
                    {"type": "text", "text": EXTRACTION_PROMPT},
                ],
            }
        ],
    )

    raw = message.content[0].text.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
    raw = re.sub(r"\s*```\s*$", "", raw, flags=re.MULTILINE)
    return json.loads(raw.strip())


# ── Route ─────────────────────────────────────────────────────────────────────

@router.post("/parse/{user_id}")
async def parse_transcript(
    user_id: str,
    file: UploadFile = File(...),
    dry_run: str = Form(default="false"),
):
    is_dry_run = dry_run.lower() in ("true", "1", "yes")

    try:
        get_user_by_id(user_id)
    except UserNotFoundException:
        raise HTTPException(status_code=404, detail="User not found")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=422, detail="File too large (max 10MB)")

    try:
        extracted = await extract_transcript_data(pdf_bytes)
    except json.JSONDecodeError as e:
        logger.error(f"Claude returned invalid JSON: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse transcript — Claude returned invalid data. Please try again.")
    except Exception as e:
        logger.exception(f"Transcript extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcript extraction failed: {str(e)}")

    # Normalize course codes
    for course in extracted.get("completed_courses", []):
        if course.get("course_code"):
            course["course_code"] = normalize_course_code(course["course_code"])
    for course in extracted.get("current_courses", []):
        if course.get("course_code"):
            course["course_code"] = normalize_course_code(course["course_code"])
    for course in (extracted.get("student_info") or {}).get("advanced_standing", []):
        if course.get("course_code"):
            course["course_code"] = normalize_course_code(course["course_code"])

    if is_dry_run:
        return {"parsed": extracted, "saved": False}

    # ── Persist ───────────────────────────────────────────────────────────────
    supabase = get_supabase()
    results = {
        "completed_added": 0,
        "completed_skipped": 0,
        "current_added": 0,
        "current_skipped": 0,
        "profile_updated": False,
    }

    # 1. Update profile
    student_info = extracted.get("student_info") or {}
    profile_updates = {}
    if student_info.get("major"):
        profile_updates["major"] = str(student_info["major"]).strip()
    if student_info.get("minor"):
        profile_updates["minor"] = str(student_info["minor"]).strip()
    if student_info.get("faculty"):
        profile_updates["faculty"] = str(student_info["faculty"]).strip()
    if student_info.get("year") is not None:
        try:
            profile_updates["year"] = int(student_info["year"])
        except (ValueError, TypeError):
            pass
    if student_info.get("cum_gpa") is not None:
        try:
            profile_updates["current_gpa"] = round(float(student_info["cum_gpa"]), 2)
        except (ValueError, TypeError):
            pass
    if student_info.get("advanced_standing"):
        profile_updates["advanced_standing"] = student_info["advanced_standing"]

    if profile_updates:
        try:
            update_user(user_id, profile_updates)
            results["profile_updated"] = True
        except Exception as e:
            logger.warning(f"Profile update failed for {user_id}: {e}")

    # 2. Wipe existing completed courses — transcript is the source of truth
    try:
        supabase.table("completed_courses").delete().eq("user_id", user_id).execute()
        logger.info(f"Cleared existing completed courses for {user_id}")
    except Exception as e:
        logger.warning(f"Could not clear existing completed courses: {e}")

    # 3. Insert completed courses from transcript
    inserted_completed: set[str] = set()
    for course in extracted.get("completed_courses", []):
        code = (course.get("course_code") or "").strip()
        if not code or not COURSE_CODE_PATTERN.match(code):
            results["completed_skipped"] += 1
            continue

        term = str(course.get("term") or "Fall").strip().capitalize()
        if term.lower() not in VALID_TERMS:
            term = "Fall"

        raw_grade = course.get("grade")
        grade = raw_grade.strip().upper() if raw_grade else None
        if grade and grade not in VALID_GRADES:
            grade = None

        parts = code.split()
        try:
            supabase.table("completed_courses").insert({
                "user_id": user_id,
                "course_code": code,
                "course_title": course.get("course_title") or code,
                "subject": (course.get("subject") or parts[0]).upper(),
                "catalog": str(course.get("catalog") or (parts[1] if len(parts) > 1 else "")),
                "term": term,
                "year": int(course.get("year") or 2024),
                "grade": grade,
                "credits": int(course.get("credits") or 3),
            }).execute()
            inserted_completed.add(code)
            results["completed_added"] += 1
        except Exception as e:
            logger.warning(f"Failed to insert completed course {code}: {e}")
            results["completed_skipped"] += 1

    # 4. Wipe existing current courses — transcript is the source of truth
    try:
        supabase.table("current_courses").delete().eq("user_id", user_id).execute()
        logger.info(f"Cleared existing current courses for {user_id}")
    except Exception as e:
        logger.warning(f"Could not clear existing current courses: {e}")

    # 5. Insert current courses from transcript (skip if already in completed)
    for course in extracted.get("current_courses", []):
        code = (course.get("course_code") or "").strip()
        if not code or not COURSE_CODE_PATTERN.match(code):
            results["current_skipped"] += 1
            continue
        # Don't add as current if it was already inserted as completed
        if code in inserted_completed:
            results["current_skipped"] += 1
            continue

        parts = code.split()
        try:
            supabase.table("current_courses").insert({
                "user_id": user_id,
                "course_code": code,
                "course_title": course.get("course_title") or code,
                "subject": (course.get("subject") or parts[0]).upper(),
                "catalog": str(course.get("catalog") or (parts[1] if len(parts) > 1 else "")),
                "credits": int(course.get("credits") or 3),
            }).execute()
            results["current_added"] += 1
        except Exception as e:
            logger.warning(f"Failed to insert current course {code}: {e}")
            results["current_skipped"] += 1

    logger.info(
        f"Transcript import for {user_id}: "
        f"{results['completed_added']} completed, "
        f"{results['current_added']} current, "
        f"profile_updated={results['profile_updated']}"
    )

    return {
        "parsed": extracted,
        "saved": True,
        "results": results,
        "message": (
            f"Replaced all courses with transcript data: {results['completed_added']} completed, {results['current_added']} current. Profile {'updated' if results['profile_updated'] else 'unchanged'}."
        ),
    }
