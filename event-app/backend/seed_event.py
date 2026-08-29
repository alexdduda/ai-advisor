"""One-off script to create the event, ticket tiers, and lineup in a fresh
Supabase project. Run once per event: `python seed_event.py`.
"""

from app.config import settings
from app.supabase_client import get_service_client


def main() -> None:
    client = get_service_client()

    event = (
        client.table("events")
        .upsert(
            {
                "slug": settings.event_slug,
                "name": "Primadonis",
                "venue": "Your Campus Venue",
                "description": "One night. One stage. Everyone you know.",
                "doors_at": "2026-11-14T19:00:00-05:00",
                "starts_at": "2026-11-14T20:00:00-05:00",
                "ends_at": "2026-11-15T00:00:00-05:00",
            },
            on_conflict="slug",
        )
        .execute()
        .data[0]
    )

    client.table("ticket_tiers").upsert(
        [
            {"event_id": event["id"], "name": "General Admission", "price_cents": 2500, "quantity_total": 700},
            {"event_id": event["id"], "name": "VIP", "price_cents": 6000, "quantity_total": 100},
        ]
    ).execute()

    client.table("lineup_slots").upsert(
        [
            {
                "event_id": event["id"],
                "artist_name": "Opening Act",
                "stage": "Main Stage",
                "set_start": "2026-11-14T20:15:00-05:00",
                "order_index": 1,
            },
            {
                "event_id": event["id"],
                "artist_name": "Primadonis",
                "stage": "Main Stage",
                "set_start": "2026-11-14T21:30:00-05:00",
                "order_index": 2,
            },
        ]
    ).execute()

    print(f"Seeded event '{event['name']}' ({event['slug']})")


if __name__ == "__main__":
    main()
