"""Permission checks shared across the clubs feature.

Two unrelated things both get called "admin" in this codebase — see
CONTEXT.md. ADMIN_USER_IDS / is_admin_user is the platform-wide Symbolos
admin (you and Alex). The per-club Manager role is checked by
is_club_owner_or_admin, which is unrelated despite the name.
"""
from fastapi import HTTPException, Request

from ...utils.supabase_client import get_supabase

ADMIN_USER_IDS = {
    "82e6f229-ce80-47a8-a63c-f099b03dfc73",  # aduda2469@gmail.com
    "65ad96d2-1704-4ff2-b661-42626f153fe8",  # dphimister24@gmail.com
}


def is_admin_user(user_id: str) -> bool:
    """Check if the authenticated user is a platform-wide Symbolos admin."""
    return user_id in ADMIN_USER_IDS


def is_club_owner_or_admin(club_id: str, user_id: str) -> bool:
    """Check if user is the club creator (Owner), a global admin, or a
    per-club Manager (stored as user_clubs.role == 'admin' — see CONTEXT.md
    for why that column value is named "admin" despite meaning Manager)."""
    if is_admin_user(user_id):
        return True
    supabase = get_supabase()
    club = supabase.table("clubs").select("created_by").eq("id", club_id).execute()
    if club.data and club.data[0].get("created_by") == user_id:
        return True
    membership = supabase.table("user_clubs").select("role").eq("user_id", user_id).eq("club_id", club_id).execute()
    if membership.data and membership.data[0].get("role") == "admin":
        return True
    # Defensive legacy fallback (see docs/adr/0002): add_club_manager is
    # deleted and nothing writes club_managers anymore, but if any historical
    # row exists from before the invite flow, don't strand that manager out
    # of their own club. Safe to drop once we've confirmed the table is empty.
    try:
        mgr = supabase.table("club_managers").select("id").eq("club_id", club_id).eq("user_id", user_id).execute()
        if mgr.data:
            return True
    except Exception:
        pass  # Table may not exist
    return False


def verify_admin_token(req: Request):
    """Verify admin token from X-Cron-Secret header."""
    from ..admin import verify_admin_token as _verify_admin_token
    token = req.headers.get("x-cron-secret", "")
    if not _verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Invalid admin token")
