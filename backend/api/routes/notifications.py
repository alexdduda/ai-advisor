"""
backend/api/routes/notifications.py

Handles:
  POST /api/notifications/schedule  – save event + queue notifications
  DELETE /api/notifications/{event_id} – remove event + queue
  GET  /api/notifications/events    – list user's calendar events
  POST /api/notifications/cron      – daily cron: send due notifications (service key protected)
"""

from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import logging
from datetime import date, timedelta
import resend
from ..config import settings
from ..utils.supabase_client import get_supabase

router = APIRouter()
logger = logging.getLogger(__name__)


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


def _send_email(to: str, event_title: str, event_date: str, days_before: int):
    """Send reminder email via Resend."""
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set – skipping email")
        return False

    resend.api_key = settings.RESEND_API_KEY

    if days_before == 0:
        subject = f"📅 Today: {event_title}"
        timing  = "is <strong>today</strong>"
    elif days_before == 1:
        subject = f"⏰ Tomorrow: {event_title}"
        timing  = "is <strong>tomorrow</strong>"
    else:
        subject = f"📌 {days_before} days away: {event_title}"
        timing  = f"is in <strong>{days_before} days</strong>"

    html = (
        '<div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#fff;'
        'border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">'
        '<div style="background:#ed1b2f;padding:20px 28px;">'
        '<h2 style="color:#fff;margin:0;font-size:18px;">McGill AI Advisor</h2>'
        '</div>'
        '<div style="padding:28px;">'
        f'<h3 style="margin:0 0 8px;font-size:20px;color:#111827;">{event_title}</h3>'
        f'<p style="color:#6b7280;font-size:15px;margin:0 0 20px;">'
        f'This event {timing} &mdash; <strong>{event_date}</strong>.</p>'
        '<a href="https://ai-advisor-pi.vercel.app" '
        'style="display:inline-block;padding:11px 24px;background:#ed1b2f;color:#fff;'
        'border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">'
        'Open Calendar</a>'
        '</div>'
        '<div style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;'
        'font-size:12px;color:#9ca3af;">'
        'You are receiving this because you enabled reminders in McGill AI Advisor.'
        '</div>'
        '</div>'
    )

    try:
        resend.Emails.send({
            "from":    "McGill AI Advisor <onboarding@resend.dev>",
            "to":      [to],
            "subject": subject,
            "html":    html,
        })
        return True
    except Exception as e:
        logger.error(f"Resend error: {e}")
        return False


def _send_sms(to: str, event_title: str, event_date: str, days_before: int):
    """Send reminder SMS via Twilio."""
    if not (settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_FROM_NUMBER):
        logger.warning("Twilio not configured – skipping SMS")
        return False

    try:
        from twilio.rest import Client as TwilioClient
        client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

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
async def schedule_event(event: CalendarEventIn):
    """Save a calendar event and queue its notifications."""
    try:
        supabase = get_supabase()

        # Upsert calendar event
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

        # Remove old queue entries for this event if editing
        # (identified by title+date+user – crude but effective for user edits)
        supabase.table("notification_queue") \
            .delete() \
            .eq("user_id", event.user_id) \
            .eq("event_id", db_event_id) \
            .execute()

        # Queue new notifications
        if event.notify_enabled:
            notif_rows = _build_notification_rows(db_event_id, event.user_id, event)
            if notif_rows:
                supabase.table("notification_queue").insert(notif_rows).execute()

        return {"success": True, "event_id": db_event_id, "queued": len(notif_rows) if event.notify_enabled else 0}

    except Exception as e:
        logger.error(f"schedule_event error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/events/{user_id}")
async def get_user_events(user_id: str):
    """Return all calendar events for a user."""
    try:
        supabase = get_supabase()
        result = supabase.table("calendar_events") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("date") \
            .execute()
        return {"events": result.data}
    except Exception as e:
        logger.error(f"get_user_events error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/events/{event_id}")
async def delete_event(event_id: str, user_id: str):
    """Delete a calendar event and its queued notifications."""
    try:
        supabase = get_supabase()
        supabase.table("notification_queue").delete().eq("event_id", event_id).execute()
        supabase.table("calendar_events").delete() \
            .eq("id", event_id).eq("user_id", user_id).execute()
        return {"success": True}
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
    if settings.CRON_SECRET and x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Invalid cron secret")

    today = date.today().isoformat()
    supabase = get_supabase()

    # Fetch all unsent notifications due today or earlier
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
            ok &= _send_email("alexanderdanielduda@gmail.com", row["event_title"], event_date, days_before)

        if row["method"] in ("sms", "both") and row.get("phone"):
            ok &= _send_sms(row["phone"], row["event_title"], event_date, days_before)

        if ok:
            supabase.table("notification_queue").update(
                {"sent": True, "sent_at": date.today().isoformat()}
            ).eq("id", row["id"]).execute()
            sent_count += 1
        else:
            failed_ids.append(row["id"])

    logger.info(f"Cron: sent={sent_count}, failed={len(failed_ids)}")
    return {"sent": sent_count, "failed": len(failed_ids), "failed_ids": failed_ids}
