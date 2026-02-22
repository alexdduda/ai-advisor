"""
backend/api/routes/notifications.py

Handles:
  POST /api/notifications/schedule  – save event + queue notifications
  DELETE /api/notifications/{event_id} – remove event + queue
  GET  /api/notifications/events    – list user's calendar events
  POST /api/notifications/cron      – daily cron: send due notifications (service key protected)
"""

from fastapi import APIRouter, HTTPException, Header, Depends, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import logging
from datetime import date, timedelta
import resend
from ..config import settings
from ..utils.supabase_client import get_supabase

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Feature flag ─────────────────────────────────────────────────────────────
# Set to True when you're ready to go live with email notifications.
# Keeping this False means the cron runs, marks rows as processed, but
# does NOT actually send any emails. Safe for pre-launch testing.
NOTIFICATIONS_ENABLED = False


# ── Pydantic schemas ─────────────────────────────────────────────────────────

class CalendarEventIn(BaseModel):
    id: Optional[str] = None          # client-side id; we store our own UUID
    user_id: str
    title: str
    date: str                          # ISO "YYYY-MM-DD"
    time: Optional[str] = None
    type: str = "personal"
    category: Optional[str] = None
    description: Optional[str] = None
    notify_enabled: bool = True
    notify_email: bool = True
    notify_sms: bool = False
    notify_email_addr: Optional[str] = None
    notify_phone: Optional[str] = None
    notify_same_day: bool = False
    notify_1day: bool = True
    notify_7days: bool = True


# ── Auth helper ──────────────────────────────────────────────────────────────

def _verify_token_matches_user(request: Request, user_id: str) -> None:
    """
    Verify the Bearer token in the Authorization header belongs to the given user_id.
    Raises HTTP 401 if no token, 403 if the token's sub doesn't match user_id.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header.split(" ", 1)[1]
    try:
        supabase = get_supabase()
        result = supabase.auth.get_user(token)
        if not result or not result.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        if result.user.id != user_id:
            raise HTTPException(status_code=403, detail="Token does not match requested user")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Token verification failed")


# ── Helpers ──────────────────────────────────────────────────────────────────

def _build_notification_rows(event_db_id: str, user_id: str, event: CalendarEventIn) -> list:
    """Return rows to insert into notification_queue based on timing flags."""
    event_date = date.fromisoformat(event.date)
    today = date.today()
    rows = []

    method = "both" if (event.notify_email and event.notify_sms) \
             else "sms" if event.notify_sms \
             else "email"

    offsets = []
    if event.notify_7days:
        offsets.append(7)
    if event.notify_1day:
        offsets.append(1)
    if event.notify_same_day:
        offsets.append(0)

    for days_before in offsets:
        send_on = event_date - timedelta(days=days_before)
        if send_on >= today:                   # don't queue past dates
            rows.append({
                "user_id":     user_id,
                "event_id":    event_db_id,
                "event_title": event.title,
                "event_date":  event.date,
                "send_on":     send_on.isoformat(),
                "method":      method,
                "email":       event.notify_email_addr,
                "phone":       event.notify_phone,
                "sent":        False,
            })
    return rows


def _send_email(to: str, event_title: str, event_date: str, days_before: int) -> bool:
    """Send reminder email via Resend. Returns True on success."""
    if not NOTIFICATIONS_ENABLED:
        logger.info(f"[NOTIFICATIONS DISABLED] Would send email to {to} for '{event_title}'")
        return True

    try:
        if days_before == 0:
            subject = f"📅 Today: {event_title}"
            body = f"Reminder: '{event_title}' is happening today ({event_date})."
        elif days_before == 1:
            subject = f"⏰ Tomorrow: {event_title}"
            body = f"Reminder: '{event_title}' is tomorrow ({event_date})."
        else:
            subject = f"📌 Upcoming: {event_title} in {days_before} days"
            body = f"Reminder: '{event_title}' is in {days_before} days, on {event_date}."

        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": "Symboulos <reminders@symboulos.ca>",
            "to": [to],
            "subject": subject,
            "text": body,
        })
        return True
    except Exception as e:
        logger.error(f"Resend error: {e}")
        return False


def _send_sms(to: str, event_title: str, event_date: str, days_before: int) -> bool:
    """Send reminder SMS via Twilio. Returns True on success."""
    if not NOTIFICATIONS_ENABLED:
        logger.info(f"[NOTIFICATIONS DISABLED] Would send SMS to {to} for '{event_title}'")
        return True

    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        if days_before == 0:
            body = f"📅 McGill Reminder: '{event_title}' is TODAY ({event_date})."
        elif days_before == 1:
            body = f"⏰ McGill Reminder: '{event_title}' is TOMORROW ({event_date})."
        else:
            body = f"📌 McGill Reminder: '{event_title}' is in {days_before} days ({event_date})."

        client.messages.create(body=body, from_=settings.TWILIO_FROM_NUMBER, to=to)
        return True
    except Exception as e:
        logger.error(f"Twilio error: {e}")
        return False


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/schedule")
async def schedule_event(event: CalendarEventIn, request: Request):
    """Save a calendar event and queue its notifications."""
    _verify_token_matches_user(request, event.user_id)

    try:
        supabase = get_supabase()

        event_row = {
            "user_id":          event.user_id,
            "title":            event.title,
            "date":             event.date,
            "time":             event.time,
            "type":             event.type,
            "category":         event.category,
            "description":      event.description,
            "notify_enabled":   event.notify_enabled,
            "notify_email":     event.notify_email,
            "notify_sms":       event.notify_sms,
            "notify_email_addr": event.notify_email_addr,
            "notify_phone":     event.notify_phone,
            "notify_same_day":  event.notify_same_day,
            "notify_1day":      event.notify_1day,
            "notify_7days":     event.notify_7days,
        }

        result = supabase.table("calendar_events").insert(event_row).execute()
        db_event_id = result.data[0]["id"]

        supabase.table("notification_queue") \
            .delete() \
            .eq("user_id", event.user_id) \
            .eq("event_id", db_event_id) \
            .execute()

        notif_rows = []
        if event.notify_enabled:
            notif_rows = _build_notification_rows(db_event_id, event.user_id, event)
            if notif_rows:
                supabase.table("notification_queue").insert(notif_rows).execute()

        return {"success": True, "event_id": db_event_id, "queued": len(notif_rows)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"schedule_event error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/events/{user_id}")
async def get_user_events(user_id: str, request: Request):
    """Return all calendar events for a user."""
    _verify_token_matches_user(request, user_id)

    try:
        supabase = get_supabase()
        result = supabase.table("calendar_events") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("date") \
            .execute()
        return {"events": result.data}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"get_user_events error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/events/{event_id}")
async def delete_event(event_id: str, user_id: str, request: Request):
    """Delete a calendar event and its queued notifications."""
    _verify_token_matches_user(request, user_id)

    try:
        supabase = get_supabase()
        supabase.table("notification_queue").delete().eq("event_id", event_id).execute()
        supabase.table("calendar_events").delete() \
            .eq("id", event_id).eq("user_id", user_id).execute()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"delete_event error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cron")
async def run_notification_cron(x_cron_secret: Optional[str] = Header(None)):
    """
    Called daily by Vercel Cron (or manually).
    Sends all due notifications and marks them sent.
    Protected by CRON_SECRET header.
    """
    if not settings.CRON_SECRET:
        raise HTTPException(status_code=500, detail="CRON_SECRET not configured")
    if x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Invalid cron secret")

    today = date.today().isoformat()
    supabase = get_supabase()

    rows = supabase.table("notification_queue") \
        .select("*") \
        .lte("send_on", today) \
        .eq("sent", False) \
        .execute().data

    sent_count = 0
    failed_ids = []

    for row in rows:
        event_date = row["event_date"]
        days_before = (
            date.fromisoformat(event_date) - date.fromisoformat(row["send_on"])
        ).days
        ok = True

        if row["method"] in ("email", "both") and row.get("email"):
            ok &= _send_email(row["email"], row["event_title"], event_date, days_before)

        if row["method"] in ("sms", "both") and row.get("phone"):
            ok &= _send_sms(row["phone"], row["event_title"], event_date, days_before)

        if ok:
            supabase.table("notification_queue").update(
                {"sent": True, "sent_at": date.today().isoformat()}
            ).eq("id", row["id"]).execute()
            sent_count += 1
        else:
            failed_ids.append(row["id"])

    logger.info(f"Cron: enabled={NOTIFICATIONS_ENABLED}, sent={sent_count}, failed={len(failed_ids)}")
    return {
        "sent": sent_count,
        "failed": len(failed_ids),
        "failed_ids": failed_ids,
        "notifications_enabled": NOTIFICATIONS_ENABLED,
    }