"""
cards.py — Proactive advisor card generation

POST /api/cards/generate/{user_id}   — Generate AI proactive cards
GET  /api/cards/{user_id}            — Fetch stored cards (instant)
DELETE /api/cards/{user_id}          — Clear AI-generated cards
POST /api/cards/ask/{user_id}        — User asks a question → single card
POST /api/cards/{card_id}/thread     — Follow-up thread on a card
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import anthropic
import logging
import json
from datetime import datetime, timezone

from api.utils.supabase_client import get_supabase, get_user_by_id
from api.config import settings
from api.exceptions import UserNotFoundException

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Permanent category set ───────────────────────────────────────
CARD_CATEGORIES = [
    "deadlines",
    "degree",
    "courses",
    "grades",
    "planning",
    "opportunities",
    "other",
]
CATEGORIES_PROMPT_LIST = "\n".join(f'  - "{c}"' for c in CARD_CATEGORIES)


# ── Pydantic models ──────────────────────────────────────────────

class ThreadRequest(BaseModel):
    user_id: str
    message: str
    card_context: str

class GenerateRequest(BaseModel):
    force: bool = False

class AskRequest(BaseModel):
    user_id: str
    question: str


# ── Supabase helpers ─────────────────────────────────────────────

def fetch_student_context(user_id: str) -> dict:
    supabase = get_supabase()
    user = get_user_by_id(user_id)

    favorites = (supabase.table("favorites")
        .select("course_code, course_title, subject, catalog")
        .eq("user_id", user_id).order("created_at", desc=True).limit(30)
        .execute().data or [])

    completed = (supabase.table("completed_courses")
        .select("course_code, course_title, subject, catalog, term, year, grade, credits")
        .eq("user_id", user_id).order("year", desc=True).limit(50)
        .execute().data or [])

    current = (supabase.table("current_courses")
        .select("course_code, course_title, subject, catalog, credits")
        .eq("user_id", user_id).execute().data or [])

    today = datetime.now(timezone.utc).date().isoformat()
    calendar = (supabase.table("calendar_events")
        .select("title, date, time, type, description")
        .eq("user_id", user_id).gte("date", today)
        .order("date", desc=False).limit(20)
        .execute().data or [])

    return {"user": user, "favorites": favorites,
            "completed": completed, "current": current, "calendar": calendar}


def cards_are_fresh(user_id: str, max_age_hours: int = 12) -> bool:
    try:
        supabase = get_supabase()
        resp = (supabase.table("advisor_cards")
            .select("generated_at").eq("user_id", user_id).eq("source", "ai")
            .order("generated_at", desc=True).limit(1).execute())
        if not resp.data:
            return False
        generated_at = datetime.fromisoformat(
            resp.data[0]["generated_at"].replace("Z", "+00:00"))
        age_hours = (datetime.now(timezone.utc) - generated_at).total_seconds() / 3600
        return age_hours < max_age_hours
    except Exception:
        return False


def _sanitise_category(card: dict) -> str:
    cat = card.get("category", "other")
    return cat if cat in CARD_CATEGORIES else "other"


def save_cards(user_id: str, cards: list) -> None:
    """Replace AI-generated cards; preserve user-asked cards."""
    supabase = get_supabase()
    supabase.table("advisor_cards").delete() \
        .eq("user_id", user_id).eq("source", "ai").execute()
    if not cards:
        return
    now = datetime.now(timezone.utc).isoformat()
    rows = [{
        "user_id": user_id,
        "card_type": card.get("type", "insight"),
        "icon": card.get("icon", "💡"),
        "label": card.get("label", "INSIGHT"),
        "title": card.get("title", ""),
        "body": card.get("body", ""),
        "actions": json.dumps(card.get("actions", [])),
        "priority": card.get("priority", i + 1),
        "category": _sanitise_category(card),
        "source": "ai",
        "expires_at": card.get("expires_at"),
        "generated_at": now,
    } for i, card in enumerate(cards)]
    supabase.table("advisor_cards").insert(rows).execute()


def insert_user_card(user_id: str, card: dict, question: str) -> dict:
    """Insert a single user-asked card at priority=0 (top of feed)."""
    supabase = get_supabase()
    row = {
        "user_id": user_id,
        "card_type": card.get("type", "insight"),
        "icon": card.get("icon", "💬"),
        "label": card.get("label", "YOUR QUESTION"),
        "title": card.get("title", question[:80]),
        "body": card.get("body", ""),
        "actions": json.dumps(card.get("actions", [])),
        "priority": 0,
        "category": _sanitise_category(card),
        "source": "user",
        "user_question": question,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    result = supabase.table("advisor_cards").insert(row).execute()
    inserted = result.data[0] if result.data else row
    if isinstance(inserted.get("actions"), str):
        inserted["actions"] = json.loads(inserted["actions"])
    return inserted


# ── Prompt builders ──────────────────────────────────────────────

def build_rich_context(ctx: dict) -> str:
    user = ctx["user"]
    completed, current, favorites, calendar = (
        ctx["completed"], ctx["current"], ctx["favorites"], ctx["calendar"])

    total_credits = sum(c.get("credits") or 3 for c in completed)
    adv = user.get("advanced_standing") or []
    adv_credits = sum(a.get("credits", 0) for a in adv)
    adv_summary = ", ".join(f"{a['course_code']} ({a['credits']} cr)" for a in adv) or "None"

    def fmt_completed():
        return "\n".join(
            f"  - {c['course_code']} ({c.get('course_title','')}) | "
            f"Grade: {c.get('grade') or 'N/A'} | Term: {c.get('term','?')} {c.get('year','')}"
            for c in completed) or "  None recorded"

    def fmt_list(items, code_key="course_code", title_key="course_title"):
        return "\n".join(
            f"  - {i[code_key]} ({i.get(title_key,'')})" for i in items
        ) or "  None recorded"

    calendar_str = "\n".join(
        f"  - {e['date']}: {e['title']} [{e.get('type','personal')}]"
        + (f" — {e['description']}" if e.get('description') else "")
        for e in calendar) or "  No upcoming events"

    majors_str = user.get("major", "Undeclared")
    for m in (user.get("other_majors") or []):
        majors_str += f", {m}"
    minors_str = user.get("minor") or "None"
    for m in (user.get("other_minors") or []):
        minors_str += f", {m}"

    return f"""You are a proactive AI academic advisor for McGill University.
Analyse the student's profile and generate 3–6 high-value briefing cards.

Today: {datetime.now(timezone.utc).date().isoformat()}

STUDENT PROFILE
  Name/email   : {user.get('username') or user.get('email', 'Student')}
  Faculty      : {user.get('faculty') or 'Not specified'}
  Major(s)     : {majors_str}
  Minor(s)     : {minors_str}
  Concentration: {user.get('concentration') or 'None'}
  Year         : U{user.get('year') or '?'}
  GPA          : {user.get('current_gpa') or 'Not specified'}
  Interests    : {user.get('interests') or 'Not specified'}
  Credits done : {total_credits} + {adv_credits} adv = {total_credits + adv_credits}/120
  Adv standing : {adv_summary}

CURRENT COURSES
{fmt_list(current)}

COMPLETED COURSES
{fmt_completed()}

SAVED COURSES
{fmt_list(favorites)}

UPCOMING CALENDAR
{calendar_str}

Surface things the student NEEDS to know: deadlines, prereq gaps, GPA warnings,
degree milestones, smart recommendations. Be specific — use real course codes and numbers.

Each card must have exactly one category from:
{CATEGORIES_PROMPT_LIST}

Respond with ONLY a JSON array. No preamble, no markdown fences.
Each object:
{{
  "type": "urgent"|"warning"|"insight"|"progress",
  "icon": "<emoji>",
  "label": "<3-5 WORD UPPERCASE LABEL>",
  "title": "<max 10 words>",
  "body": "<1-2 sentences, specific>",
  "actions": ["<chip 1>", "<chip 2>"],
  "priority": <1-10>,
  "category": "<deadlines|degree|courses|grades|planning|opportunities|other>"
}}"""


def build_ask_context(ctx: dict, question: str) -> str:
    user = ctx["user"]
    completed, current, favorites = ctx["completed"], ctx["current"], ctx["favorites"]
    total_credits = sum(c.get("credits") or 3 for c in completed)

    completed_str = "\n".join(
        f"  - {c['course_code']} | Grade: {c.get('grade') or 'N/A'}"
        for c in completed[:20]) or "  None"
    current_str = "\n".join(
        f"  - {c['course_code']} ({c.get('course_title','')})"
        for c in current) or "  None"
    favorites_str = "\n".join(
        f"  - {f['course_code']} ({f.get('course_title','')})"
        for f in favorites[:15]) or "  None"

    return f"""You are an AI academic advisor for McGill University.
A student asked you a question. Answer it as a single briefing card.

Today: {datetime.now(timezone.utc).date().isoformat()}

STUDENT: {user.get('username') or user.get('email')} | U{user.get('year','?')} | {user.get('major','?')} | GPA: {user.get('current_gpa','?')} | Credits: {total_credits}

Current courses:
{current_str}
Completed courses:
{completed_str}
Saved courses:
{favorites_str}

QUESTION: "{question}"

Answer directly and specifically. Reference the student's actual data.
Pick the best category from:
{CATEGORIES_PROMPT_LIST}

Respond with ONLY a single JSON object. No preamble, no markdown fences.
{{
  "type": "urgent"|"warning"|"insight"|"progress",
  "icon": "<emoji>",
  "label": "<3-5 WORD UPPERCASE LABEL>",
  "title": "<answer summary, max 10 words>",
  "body": "<direct answer, 2-3 sentences>",
  "actions": ["<follow-up 1>", "<follow-up 2>"],
  "category": "<deadlines|degree|courses|grades|planning|opportunities|other>"
}}"""


def build_thread_context(card_title: str, card_body: str, thread: list) -> str:
    return f"""You are a concise AI academic advisor for McGill University.
The student is asking a follow-up about this card:
  Title: {card_title}
  Body : {card_body}

Answer directly in 2–4 sentences. Use real McGill course codes where relevant.
Do not repeat the card content back."""


# ── Routes ───────────────────────────────────────────────────────

@router.post("/generate/{user_id}", response_model=dict)
async def generate_cards(user_id: str, request: GenerateRequest = GenerateRequest()):
    try:
        get_user_by_id(user_id)
        if not request.force and cards_are_fresh(user_id):
            return await get_cards(user_id)

        ctx = fetch_student_context(user_id)
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-sonnet-4-20250514", max_tokens=2048,
            system=build_rich_context(ctx),
            messages=[{"role": "user", "content": "Generate my advisor cards now."}])

        raw = message.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        cards = json.loads(raw)
        if not isinstance(cards, list):
            raise ValueError("AI did not return a JSON array")

        for card in cards:
            card["category"] = _sanitise_category(card)
            card.setdefault("type", "insight")
            card.setdefault("icon", "💡")
            card.setdefault("actions", [])

        save_cards(user_id, cards)
        logger.info(f"Generated {len(cards)} cards for {user_id}")
        return await get_cards(user_id)

    except UserNotFoundException:
        raise HTTPException(status_code=404, detail="User not found")
    except json.JSONDecodeError as e:
        logger.error(f"Card JSON parse error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        logger.exception(f"Card generation failed for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate advisor cards")


@router.post("/ask/{user_id}", response_model=dict)
async def ask_card(user_id: str, request: AskRequest):
    try:
        get_user_by_id(user_id)
        question = request.question.strip()
        if not question:
            raise HTTPException(status_code=400, detail="Question cannot be empty")

        ctx = fetch_student_context(user_id)
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-sonnet-4-20250514", max_tokens=512,
            system=build_ask_context(ctx, question),
            messages=[{"role": "user", "content": question}])

        raw = message.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        card = json.loads(raw)
        if not isinstance(card, dict):
            raise ValueError("AI did not return a JSON object")

        card["category"] = _sanitise_category(card)
        card.setdefault("type", "insight")
        card.setdefault("icon", "💬")
        card.setdefault("actions", [])

        inserted = insert_user_card(user_id, card, question)
        logger.info(f"User-asked card for {user_id}: {card.get('title')}")
        return {"card": inserted}

    except UserNotFoundException:
        raise HTTPException(status_code=404, detail="User not found")
    except json.JSONDecodeError as e:
        logger.error(f"Ask card JSON parse error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Ask card failed for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate card")


@router.get("/{user_id}", response_model=dict)
async def get_cards(user_id: str):
    try:
        get_user_by_id(user_id)
        supabase = get_supabase()
        resp = (supabase.table("advisor_cards").select("*")
            .eq("user_id", user_id).order("priority", desc=False).execute())
        cards = resp.data or []
        for card in cards:
            if isinstance(card.get("actions"), str):
                card["actions"] = json.loads(card["actions"])
        ai_cards = [c for c in cards if c.get("source") == "ai"]
        generated_at = ai_cards[0].get("generated_at") if ai_cards else None
        return {"cards": cards, "count": len(cards),
                "generated_at": generated_at, "fresh": cards_are_fresh(user_id)}
    except UserNotFoundException:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        logger.exception(f"Failed to get cards for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve advisor cards")


@router.delete("/{user_id}", status_code=204)
async def clear_cards(user_id: str):
    try:
        get_user_by_id(user_id)
        supabase = get_supabase()
        supabase.table("advisor_cards").delete() \
            .eq("user_id", user_id).eq("source", "ai").execute()
    except UserNotFoundException:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        logger.exception(f"Failed to clear cards for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear cards")


@router.post("/{card_id}/thread", response_model=dict)
async def append_thread_message(card_id: str, request: ThreadRequest):
    try:
        supabase = get_supabase()
        card_resp = (supabase.table("advisor_cards")
            .select("title, body, user_id").eq("id", card_id).single().execute())
        if not card_resp.data:
            raise HTTPException(status_code=404, detail="Card not found")
        card = card_resp.data
        if card["user_id"] != request.user_id:
            raise HTTPException(status_code=403, detail="Forbidden")

        existing = (supabase.table("card_threads")
            .select("role, content").eq("card_id", card_id)
            .order("created_at", desc=False).execute().data or [])

        messages = [{"role": m["role"], "content": m["content"]} for m in existing]
        messages.append({"role": "user", "content": request.message})

        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        response = client.messages.create(
            model="claude-sonnet-4-20250514", max_tokens=512,
            system=build_thread_context(card["title"], card["body"], existing),
            messages=messages)

        ai_response = response.content[0].text.strip()
        supabase.table("card_threads").insert([
            {"card_id": card_id, "user_id": request.user_id,
             "role": "user", "content": request.message},
            {"card_id": card_id, "user_id": request.user_id,
             "role": "assistant", "content": ai_response},
        ]).execute()

        return {"response": ai_response}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Thread append failed for card {card_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to process thread message")