from fastapi import APIRouter, HTTPException

from ..config import settings
from ..supabase_client import get_service_client

router = APIRouter(prefix="/api/event", tags=["event"])


@router.get("")
def get_event():
    """Public, cacheable — no per-user data. Same shape as Symbolos's public
    /api/clubs endpoint: safe to sit behind a CDN cache."""
    client = get_service_client()
    event = client.table("events").select("*").eq("slug", settings.event_slug).single().execute().data
    if not event:
        raise HTTPException(status_code=404, detail="Event not configured")
    tiers = (
        client.table("ticket_tiers")
        .select("id, name, price_cents, currency, quantity_total, quantity_sold, sales_open_at, sales_close_at")
        .eq("event_id", event["id"])
        .order("price_cents")
        .execute()
        .data
    )
    lineup = (
        client.table("lineup_slots")
        .select("*")
        .eq("event_id", event["id"])
        .order("order_index")
        .execute()
        .data
    )
    going_count = (
        client.table("attendance")
        .select("user_id", count="exact")
        .eq("event_id", event["id"])
        .eq("status", "going")
        .execute()
        .count
    )
    return {"event": event, "tiers": tiers, "lineup": lineup, "going_count": going_count}
