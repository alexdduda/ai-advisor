"""
Stale-club cleanup — not an HTTP route, called from notifications.py's
daily cron job. Delete a club if neither the Owner nor any Manager has
signed in to Symbolos for over STALE_CLUB_THRESHOLD_DAYS.
"""
from datetime import datetime, timedelta, timezone
import logging

from ...utils.supabase_client import get_supabase

logger = logging.getLogger(__name__)

STALE_CLUB_THRESHOLD_DAYS = 730   # ~2 years (365 * 2)
STALE_CLUB_GRACE_DAYS     = 7     # don't auto-delete clubs created less than this many days ago


def _user_last_signin(supabase, user_id: str):
    """Return the last_sign_in_at datetime for a user, or None if unavailable."""
    try:
        resp = supabase.auth.admin.get_user_by_id(user_id)
        if not resp or not resp.user:
            return None
        ts = resp.user.last_sign_in_at
        if not ts:
            return None
        # Supabase returns ISO 8601; normalise to aware datetime
        if isinstance(ts, str):
            return datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return ts
    except Exception:
        return None


def run_stale_club_cleanup_cron(dry_run: bool = False) -> dict:
    """
    For each verified club: collect every Owner + Manager user_id, look up
    their last sign-in via Supabase auth, and if the most recent sign-in
    across the whole leadership team is more than STALE_CLUB_THRESHOLD_DAYS
    old, delete the club.

    Returns a summary dict. Pass dry_run=True to log what would be deleted
    without actually deleting anything.
    """
    try:
        supabase = get_supabase()
        threshold = datetime.now(timezone.utc) - timedelta(days=STALE_CLUB_THRESHOLD_DAYS)
        grace_cutoff = datetime.now(timezone.utc) - timedelta(days=STALE_CLUB_GRACE_DAYS)

        all_clubs = (supabase.table("clubs")
                     .select("id, name, created_by, created_at")
                     .execute().data or [])

        checked = 0
        deleted = 0
        kept_recent_signin = 0
        kept_too_new = 0
        deleted_names: list[str] = []

        for club in all_clubs:
            club_id = club.get("id")
            if not club_id:
                continue
            checked += 1

            # Skip very-new clubs even if they have no admins yet — give them
            # the grace window before judging them stale.
            club_created_at = club.get("created_at")
            try:
                if club_created_at:
                    created_dt = datetime.fromisoformat(str(club_created_at).replace("Z", "+00:00"))
                    if created_dt > grace_cutoff:
                        kept_too_new += 1
                        continue
            except Exception:
                pass

            # Collect every Manager/Owner user_id for this club
            admin_ids: set[str] = set()
            if club.get("created_by"):
                admin_ids.add(club["created_by"])
            try:
                rows = (supabase.table("user_clubs")
                        .select("user_id, role")
                        .eq("club_id", club_id)
                        .execute().data or [])
                for r in rows:
                    if (r.get("role") or "").lower() in ("owner", "admin") and r.get("user_id"):
                        admin_ids.add(r["user_id"])
            except Exception:
                pass

            # Find the most recent sign-in across all admins
            latest_signin = None
            for uid in admin_ids:
                ts = _user_last_signin(supabase, uid)
                if ts is None:
                    continue
                if latest_signin is None or ts > latest_signin:
                    latest_signin = ts

            # Decide
            if latest_signin is not None and latest_signin >= threshold:
                kept_recent_signin += 1
                continue

            # Either no admins exist with sign-in records, OR everyone's last
            # sign-in is older than the threshold → delete (or log if dry_run)
            club_name = club.get("name") or club_id
            deleted_names.append(club_name)
            if dry_run:
                logger.info(f"[stale-club cleanup DRY] would delete club {club_id} ({club_name})")
                continue

            try:
                # Cascade-clean: subscriptions, manager requests, events,
                # announcements, user_clubs, then the club itself. Most have
                # ON DELETE CASCADE in the schema, but be explicit for safety.
                supabase.table("club_manager_requests").delete().eq("club_id", club_id).execute()
                supabase.table("club_subscriptions").delete().eq("club_id", club_id).execute()
                supabase.table("user_clubs").delete().eq("club_id", club_id).execute()
                supabase.table("club_events").delete().eq("club_id", club_id).execute()
                supabase.table("club_announcements").delete().eq("club_id", club_id).execute()
                try:
                    supabase.table("club_managers").delete().eq("club_id", club_id).execute()
                except Exception:
                    pass
                supabase.table("clubs").delete().eq("id", club_id).execute()
                deleted += 1
                logger.info(f"[stale-club cleanup] deleted {club_id} ({club_name}) — no admin sign-in in {STALE_CLUB_THRESHOLD_DAYS} days")
            except Exception as e:
                logger.exception(f"[stale-club cleanup] failed to delete {club_id}: {e}")

        return {
            "checked":             checked,
            "deleted":             deleted,
            "deleted_names":       deleted_names,
            "kept_recent_signin":  kept_recent_signin,
            "kept_too_new":        kept_too_new,
            "threshold_days":      STALE_CLUB_THRESHOLD_DAYS,
            "dry_run":             dry_run,
        }
    except Exception as e:
        logger.exception(f"Stale-club cleanup cron failed: {e}")
        return {"deleted": 0, "error": str(e)}
