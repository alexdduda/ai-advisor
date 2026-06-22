"""Club Activity feed and Faculty Stats."""
from fastapi import HTTPException, Depends
import logging

from ...utils.supabase_client import get_supabase
from ...auth import get_current_user_id
from ._router import router
from .permissions import is_club_owner_or_admin

logger = logging.getLogger(__name__)


@router.get("/{club_id}/activity")
async def get_club_activity(
    club_id: str,
    limit: int = 5,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Recent activity in a club — most recent N events + announcements merged,
    sorted newest-first. Used by the club drawer to give a "this club is alive"
    signal.

    SEC FIX #3: private clubs only expose activity to members + managers
    (matching the access pattern for the club's own content). Public clubs
    stay open to any signed-in user.
    """
    supabase = get_supabase()
    limit = max(1, min(limit, 20))
    try:
        # Private-club gate
        meta = supabase.table("clubs").select("is_private").eq("id", club_id).execute()
        if meta.data and meta.data[0].get("is_private"):
            if not is_club_owner_or_admin(club_id, current_user_id):
                membership = (
                    supabase.table("user_clubs")
                    .select("user_id").eq("club_id", club_id).eq("user_id", current_user_id)
                    .execute()
                )
                if not membership.data:
                    raise HTTPException(status_code=403, detail="This club is private.")
        anns = (supabase.table("club_announcements")
                .select("id, title, body, join_link, created_at")
                .eq("club_id", club_id)
                .order("created_at", desc=True)
                .limit(limit).execute()).data or []
        evts = (supabase.table("club_events")
                .select("id, title, description, date, time, location, join_link")
                .eq("club_id", club_id)
                .order("date", desc=True)
                .limit(limit).execute()).data or []

        items = []
        for a in anns:
            items.append({
                "type":       "announcement",
                "id":         a.get("id"),
                "title":      a.get("title") or "",
                "body":       (a.get("body") or "")[:200],
                "join_link":  a.get("join_link"),
                "timestamp":  a.get("created_at"),
            })
        for e in evts:
            ts = e.get("date") or ""
            if e.get("time"):
                ts = f"{ts}T{e['time']}"
            items.append({
                "type":      "event",
                "id":        e.get("id"),
                "title":     e.get("title") or "",
                "body":      (e.get("description") or "")[:200],
                "location":  e.get("location"),
                "join_link": e.get("join_link"),
                "timestamp": ts,
            })

        items.sort(key=lambda x: x.get("timestamp") or "", reverse=True)
        return {"items": items[:limit], "count": len(items[:limit])}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error fetching club activity: {e}")
        return {"items": [], "count": 0}


# SEC: privacy thresholds for faculty stats.
# - MIN_CLUB_SIZE: don't return any per-faculty breakdown for clubs under this size
#   (the entire member list would be tiny + easy to deduce identities).
# - MIN_BUCKET:    bucket per-faculty counts below this as the literal string "<5"
#   instead of an exact number, so a count-of-1 can't be back-solved to a person.
# The caller's OWN faculty count is returned exactly (they already know about
# themselves) so the "X students from your faculty" UI stays useful.
_FACULTY_STATS_MIN_CLUB_SIZE = 10
_FACULTY_STATS_MIN_BUCKET    = 5


@router.get("/{club_id}/faculty-stats")
async def get_club_faculty_stats(
    club_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Aggregate club membership by faculty. Returns counts only (no names) so it's
    privacy-safe for non-members to see "3 students from your faculty" in the
    drawer before joining.

    Privacy:
      - Per-faculty counts below MIN_BUCKET are returned as the string "<5"
        instead of an exact number, so a "1" can't be re-identified.
      - For very small clubs (total < MIN_CLUB_SIZE) the by_faculty array is
        suppressed entirely; only your_faculty_count is returned.
      - SEC FIX #3: private clubs gate this behind member/manager auth.
    """
    supabase = get_supabase()
    try:
        meta = supabase.table("clubs").select("is_private").eq("id", club_id).execute()
        if meta.data and meta.data[0].get("is_private"):
            if not is_club_owner_or_admin(club_id, current_user_id):
                membership = (
                    supabase.table("user_clubs")
                    .select("user_id").eq("club_id", club_id).eq("user_id", current_user_id)
                    .execute()
                )
                if not membership.data:
                    raise HTTPException(status_code=403, detail="This club is private.")
        # Caller's faculty for the "your faculty" highlight
        caller = supabase.table("users").select("faculty").eq("id", current_user_id).execute().data or []
        your_faculty = (caller[0].get("faculty") if caller else None) or None

        # Member IDs
        memberships = supabase.table("user_clubs").select("user_id").eq("club_id", club_id).execute().data or []
        user_ids = [m.get("user_id") for m in memberships if m.get("user_id")]
        if not user_ids:
            return {
                "your_faculty":       your_faculty,
                "your_faculty_count": 0,
                "by_faculty":         [],
                "total":              0,
            }

        # Fetch faculty for each member in one batched call
        users = supabase.table("users").select("id, faculty").in_("id", user_ids).execute().data or []
        counts: dict[str, int] = {}
        for u in users:
            f = (u.get("faculty") or "Unknown").strip() or "Unknown"
            counts[f] = counts.get(f, 0) + 1

        total = len(user_ids)
        # The caller knows about themselves, so always return their own faculty
        # count exactly (it's safe to disclose).
        your_faculty_count = counts.get(your_faculty or "", 0)

        # Bucket small counts and suppress the breakdown entirely for tiny clubs
        if total < _FACULTY_STATS_MIN_CLUB_SIZE:
            by_faculty = []
        else:
            def _safe_count(faculty: str, n: int):
                # Caller's own faculty: exact (they're inside that bucket anyway)
                if faculty == your_faculty:
                    return n
                return n if n >= _FACULTY_STATS_MIN_BUCKET else f"<{_FACULTY_STATS_MIN_BUCKET}"

            by_faculty = sorted(
                [{"faculty": k, "count": _safe_count(k, v)} for k, v in counts.items()],
                key=lambda x: (x["count"] if isinstance(x["count"], int) else 0),
                reverse=True,
            )

        return {
            "your_faculty":       your_faculty,
            "your_faculty_count": your_faculty_count,
            "by_faculty":         by_faculty,
            "total":              total,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error fetching club faculty stats: {e}")
        return {"your_faculty": None, "your_faculty_count": 0, "by_faculty": [], "total": 0}
