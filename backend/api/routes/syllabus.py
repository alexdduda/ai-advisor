"""
backend/api/routes/syllabus.py

Parse one or more McGill syllabus PDFs using Claude.
Extracts course metadata, schedule, assessments, and instructor info,
then populates calendar_events and enriches current_courses.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from typing import List, Optional
import anthropic
import base64
import logging
import json
import re
from datetime import date, datetime

from ..utils.supabase_client import get_supabase, get_user_by_id
from ..exceptions import UserNotFoundException
from ..config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Extraction prompt ──────────────────────────────────────────────────────────

SYLLABUS_EXTRACTION_PROMPT = """You are parsing a McGill University course syllabus PDF.
Extract ALL available information and return a single JSON object with this exact structure.
If a field is not present in the syllabus, use null.

{
  "course_code": "COMP 251",
  "course_title": "Algorithms and Data Structures",
  "credits": 3,
  "term": "Winter",
  "year": 2026,
  "section": "001",
  "crn": "12345",
  "department": "School of Computer Science",
  "faculty": "Science",

  "instructor": {
    "name": "David Becerra",
    "email": "david.becerra@mcgill.ca",
    "office": "MC 123",
    "office_hours": [
      { "day": "Tuesday", "start_time": "14:00", "end_time": "15:00", "location": "MC 123" }
    ]
  },

  "tas": [
    { "name": "Jane Doe", "email": "jane.doe@mcgill.ca" }
  ],

  "course_email": "comp251.cs@mcgill.ca",

  "schedule": [
    {
      "day": "Tuesday",
      "start_time": "10:05",
      "end_time": "11:25",
      "location": "BURN 1B24",
      "type": "Lecture"
    },
    {
      "day": "Thursday",
      "start_time": "10:05",
      "end_time": "11:25",
      "location": "BURN 1B24",
      "type": "Lecture"
    }
  ],

  "assessments": [
    {
      "title": "Assignment 1",
      "type": "assignment",
      "weight": 7,
      "due_date": "2026-02-01",
      "description": "Data structures programming assignment"
    },
    {
      "title": "Midterm 1",
      "type": "midterm",
      "weight": 22,
      "date": "2026-02-10",
      "time": "18:00",
      "location": "ENGMC 204",
      "description": "Covers Data Structures"
    },
    {
      "title": "Final Exam",
      "type": "final",
      "weight": 33,
      "date": null,
      "description": "Graph Theory + all topics"
    }
  ],

  "textbooks": [
    { "title": "Introduction to Algorithms", "authors": "Cormen et al.", "edition": "3rd", "required": true }
  ],

  "prerequisites": ["COMP 250", "MATH 240"],
  "restrictions": ["Not open to students who have taken COMP 252"],

  "policies": {
    "late_penalty": "5% per day",
    "late_max_days": 7,
    "attendance": null,
    "technology": "Laptop allowed, no social media",
    "communication": "Use course email comp251.cs@mcgill.ca"
  },

  "description": "Brief 1-2 sentence course description.",
  "learning_outcomes": ["Analyze algorithm correctness", "Design efficient algorithms"],
  "course_url": null,
  "platform": "myCourses"
}

IMPORTANT RULES:
- For schedule entries, use 24-hour time format (HH:MM).
- For dates, use ISO format YYYY-MM-DD. If only a range is given (e.g. Feb 9-13), use the first date.
- If the syllabus lists multiple sections with different schedules, include ALL schedule entries.
- assessment "type" must be one of: assignment, quiz, midterm, final, project, lab, participation, other
- Return ONLY the JSON object, no markdown, no explanation.
"""


# ── Helpers ───────────────────────────────────────────────────────────────────

def _strip_json_fences(raw: str) -> str:
    raw = re.sub(r"^\s*```(?:json)?\s*", "", raw, flags=re.MULTILINE)
    raw = re.sub(r"\s*```\s*$", "", raw, flags=re.MULTILINE)
    return raw.strip()


async def _extract_syllabus_data(pdf_bytes: bytes) -> dict:
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    b64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")

    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": SYLLABUS_EXTRACTION_PROMPT,
                    },
                ],
            }
        ],
    )

    raw = msg.content[0].text
    raw = _strip_json_fences(raw)
    return json.loads(raw)


def _normalize_time(t: Optional[str]) -> Optional[str]:
    """Ensure time is HH:MM format."""
    if not t:
        return None
    t = t.strip()
    # Handle formats like "10:05am", "10:05 AM", "10:05"
    t = re.sub(r'\s*(am|pm)$', lambda m: m.group(0), t, flags=re.IGNORECASE)
    try:
        for fmt in ("%H:%M", "%I:%M %p", "%I:%M%p", "%I%p"):
            try:
                return datetime.strptime(t, fmt).strftime("%H:%M")
            except ValueError:
                continue
    except Exception:
        pass
    return t


def _day_abbrev(day: str) -> str:
    mapping = {
        "monday": "Mon", "tuesday": "Tue", "wednesday": "Wed",
        "thursday": "Thu", "friday": "Fri", "saturday": "Sat", "sunday": "Sun",
    }
    return mapping.get(day.lower(), day[:3].capitalize())


# ── Route ──────────────────────────────────────────────────────────────────────

@router.post("/parse/{user_id}")
async def parse_syllabuses(
    user_id: str,
    files: List[UploadFile] = File(...),
    dry_run: str = Form(default="false"),
):
    """
    Accept one or more syllabus PDFs.
    For each: extract data with Claude, then:
      - Save recurring lecture/lab slots as calendar_events (type='class')
      - Save assessments (exams, assignments) as calendar_events
      - Enrich matching current_courses row with professor, room, schedule string
    Returns per-file results.
    """
    is_dry_run = dry_run.lower() in ("true", "1", "yes")

    try:
        get_user_by_id(user_id)
    except UserNotFoundException:
        raise HTTPException(status_code=404, detail="User not found")

    if not files:
        raise HTTPException(status_code=422, detail="No files provided")

    supabase = get_supabase()
    all_results = []

    for upload in files:
        if not upload.filename.lower().endswith(".pdf"):
            all_results.append({
                "filename": upload.filename,
                "success": False,
                "error": "Only PDF files are accepted",
            })
            continue

        pdf_bytes = await upload.read()
        if len(pdf_bytes) > 15 * 1024 * 1024:
            all_results.append({
                "filename": upload.filename,
                "success": False,
                "error": "File too large (max 15MB)",
            })
            continue

        try:
            extracted = await _extract_syllabus_data(pdf_bytes)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON from Claude for {upload.filename}: {e}")
            all_results.append({
                "filename": upload.filename,
                "success": False,
                "error": "Failed to parse syllabus — Claude returned invalid data.",
            })
            continue
        except Exception as e:
            logger.exception(f"Extraction failed for {upload.filename}: {e}")
            all_results.append({
                "filename": upload.filename,
                "success": False,
                "error": f"Extraction failed: {str(e)}",
            })
            continue

        if is_dry_run:
            all_results.append({
                "filename": upload.filename,
                "success": True,
                "parsed": extracted,
                "saved": False,
            })
            continue

        # ── Persist ──────────────────────────────────────────────────────────
        result = {
            "filename": upload.filename,
            "success": True,
            "saved": True,
            "course_code": extracted.get("course_code"),
            "calendar_events_added": 0,
            "current_course_updated": False,
        }

        course_code = (extracted.get("course_code") or "").strip().upper()
        course_title = extracted.get("course_title") or course_code
        term = extracted.get("term") or "Winter"
        year = extracted.get("year") or date.today().year
        instructor = extracted.get("instructor") or {}
        schedule_slots = extracted.get("schedule") or []
        assessments = extracted.get("assessments") or []

        # ── 1. Enrich current_courses row ─────────────────────────────────────
        if course_code:
            try:
                # Build a human-readable schedule string e.g. "Mon/Wed 2:35–3:55 ENGMC 204"
                if schedule_slots:
                    day_parts = []
                    seen = set()
                    for slot in schedule_slots:
                        d = _day_abbrev(slot.get("day", ""))
                        if d not in seen:
                            day_parts.append(d)
                            seen.add(d)
                    days_str = "/".join(day_parts)
                    first = schedule_slots[0]
                    time_str = f"{first.get('start_time', '')}–{first.get('end_time', '')}"
                    loc_str = first.get("location") or ""
                    schedule_str = f"{days_str} {time_str} {loc_str}".strip()
                else:
                    schedule_str = None

                updates = {}
                if instructor.get("name"):
                    updates["professor"] = instructor["name"]
                if schedule_str:
                    updates["schedule"] = schedule_str
                if instructor.get("email"):
                    updates["professor_email"] = instructor["email"]
                if instructor.get("office"):
                    updates["professor_office"] = instructor["office"]
                if schedule_slots and schedule_slots[0].get("location"):
                    updates["room"] = schedule_slots[0]["location"]

                if updates:
                    # Try updating by course_code + user_id
                    res = supabase.table("current_courses") \
                        .update(updates) \
                        .eq("user_id", user_id) \
                        .eq("course_code", course_code) \
                        .execute()
                    if res.data:
                        result["current_course_updated"] = True
            except Exception as e:
                logger.warning(f"Could not update current_courses for {course_code}: {e}")

        # ── 2. Save recurring lecture slots as calendar events ─────────────────
        # We create events for each week of the term. 
        # As a simpler approach, create one "recurring" event per schedule slot
        # with a description noting the recurrence. This keeps it practical.
        for slot in schedule_slots:
            try:
                day = slot.get("day", "")
                start_time = _normalize_time(slot.get("start_time"))
                end_time = _normalize_time(slot.get("end_time"))
                location = slot.get("location") or ""
                slot_type = slot.get("type") or "Lecture"

                event_row = {
                    "user_id": user_id,
                    "title": f"{course_code} {slot_type}",
                    "date": _next_weekday_date(day, term, year),
                    "time": start_time,
                    "end_time": end_time,
                    "type": "academic",
                    "category": course_code,
                    "description": (
                        f"{course_title}\n"
                        f"Every {day} {start_time}–{end_time}\n"
                        f"Location: {location}\n"
                        f"Instructor: {instructor.get('name') or 'TBD'}"
                    ),
                    "location": location,
                    "course_code": course_code,
                    "recurrence": f"weekly_{day.lower()}",
                    "notify_enabled": False,
                    "notify_email": False,
                    "notify_sms": False,
                    "notify_email_addr": None,
                    "notify_phone": None,
                    "notify_same_day": False,
                    "notify_1day": False,
                    "notify_7days": False,
                }

                supabase.table("calendar_events").insert(event_row).execute()
                result["calendar_events_added"] += 1
            except Exception as e:
                logger.warning(f"Could not save lecture slot for {course_code}: {e}")

        # ── 3. Save assessments (exams, assignments) as calendar events ────────
        for assessment in assessments:
            event_date = assessment.get("date") or assessment.get("due_date")
            if not event_date:
                continue  # skip undated finals — they'll be set later
            try:
                a_type = assessment.get("type", "other")
                a_title = assessment.get("title") or a_type.capitalize()
                a_time = _normalize_time(assessment.get("time"))
                a_location = assessment.get("location") or ""
                a_weight = assessment.get("weight")

                # Determine notification defaults: exams get 7-day + 1-day reminders
                is_exam = a_type in ("midterm", "final", "quiz")
                notify_7 = is_exam
                notify_1 = is_exam
                notify_same = False

                weight_str = f" ({a_weight}%)" if a_weight else ""
                desc_parts = [f"{course_code} — {a_title}{weight_str}"]
                if assessment.get("description"):
                    desc_parts.append(assessment["description"])
                if a_location:
                    desc_parts.append(f"Location: {a_location}")
                category_label = f"{course_code} · {'Exam' if is_exam else 'Assignment'}"

                event_row = {
                    "user_id": user_id,
                    "title": f"{course_code} — {a_title}",
                    "date": event_date,
                    "time": a_time,
                    "type": "academic",
                    "category": category_label,
                    "description": "\n".join(desc_parts),
                    "location": a_location or None,
                    "course_code": course_code,
                    "notify_enabled": is_exam,
                    "notify_email": is_exam,
                    "notify_sms": False,
                    "notify_email_addr": None,
                    "notify_phone": None,
                    "notify_same_day": notify_same,
                    "notify_1day": notify_1,
                    "notify_7days": notify_7,
                }

                supabase.table("calendar_events").insert(event_row).execute()
                result["calendar_events_added"] += 1
            except Exception as e:
                logger.warning(f"Could not save assessment {assessment.get('title')} for {course_code}: {e}")

        # ── 4. Save office hours as calendar events ────────────────────────────
        for oh in (instructor.get("office_hours") or []):
            try:
                oh_date = _next_weekday_date(oh.get("day", ""), term, year)
                if not oh_date:
                    continue
                event_row = {
                    "user_id": user_id,
                    "title": f"{course_code} Office Hours — {instructor.get('name') or 'Instructor'}",
                    "date": oh_date,
                    "time": _normalize_time(oh.get("start_time")),
                    "end_time": _normalize_time(oh.get("end_time")),
                    "type": "personal",
                    "category": course_code,
                    "description": (
                        f"Office hours for {course_code}\n"
                        f"Instructor: {instructor.get('name') or 'TBD'}\n"
                        f"Location: {oh.get('location') or instructor.get('office') or 'TBD'}\n"
                        f"Every {oh.get('day')} {oh.get('start_time')}–{oh.get('end_time')}"
                    ),
                    "location": oh.get("location") or instructor.get("office") or None,
                    "course_code": course_code,
                    "recurrence": f"weekly_{oh.get('day', '').lower()}",
                    "notify_enabled": False,
                    "notify_email": False,
                    "notify_sms": False,
                    "notify_email_addr": None,
                    "notify_phone": None,
                    "notify_same_day": False,
                    "notify_1day": False,
                    "notify_7days": False,
                }
                supabase.table("calendar_events").insert(event_row).execute()
                result["calendar_events_added"] += 1
            except Exception as e:
                logger.warning(f"Could not save office hours for {course_code}: {e}")

        logger.info(
            f"Syllabus import for user {user_id}, course {course_code}: "
            f"{result['calendar_events_added']} events added, "
            f"current_course_updated={result['current_course_updated']}"
        )

        all_results.append(result)

    return {
        "results": all_results,
        "total_files": len(files),
        "total_events_added": sum(r.get("calendar_events_added", 0) for r in all_results if r.get("success")),
        "total_courses_updated": sum(1 for r in all_results if r.get("current_course_updated")),
    }


# ── Helpers ────────────────────────────────────────────────────────────────────

def _next_weekday_date(day_name: str, term: str, year: int) -> Optional[str]:
    """
    Return the ISO date string of the first occurrence of `day_name`
    within the given term's approximate start window.
    Winter: Jan 5, Summer: May 1, Fall: Sep 1
    """
    if not day_name:
        return None

    term_starts = {
        "winter": date(year, 1, 5),
        "summer": date(year, 5, 1),
        "fall": date(year, 9, 1),
    }
    day_numbers = {
        "monday": 0, "tuesday": 1, "wednesday": 2,
        "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6,
    }

    start = term_starts.get(term.lower(), date(year, 1, 5))
    target = day_numbers.get(day_name.lower())
    if target is None:
        return None

    days_ahead = (target - start.weekday()) % 7
    result_date = start + __import__("datetime").timedelta(days=days_ahead)
    return result_date.isoformat()