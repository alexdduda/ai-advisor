"""
Club Managers (per-club leadership) — listing, removal, and the invite flow.

FIX (docs/adr/0002): Managers used to have two competing storage mechanisms
— the legacy club_managers table (add_club_manager/get_club_managers/
remove_club_manager) and user_clubs.role == 'admin' (granted by the invite
flow below, the only Manager-creation path the frontend actually calls).
get_club_managers and remove_club_manager are now rewritten to use
user_clubs.role; add_club_manager is deleted (it was unreachable dead code).
is_club_owner_or_admin (permissions.py) keeps a defensive read-only
club_managers fallback for any pre-existing legacy row.
"""
from fastapi import HTTPException, Depends
from datetime import datetime, timezone
import logging

from ...utils.supabase_client import get_supabase
from ...auth import get_current_user_id
from ._router import router
from .helpers import display_name_from_email
from .permissions import is_admin_user, is_club_owner_or_admin
from .schemas import ManagerInviteCreate, ManagerInviteAction

logger = logging.getLogger(__name__)


@router.get("/{club_id}/managers")
async def get_club_managers(club_id: str, current_user_id: str = Depends(get_current_user_id)):
    """List a club's Managers plus its Owner.

    SEC FIX #3 (HIGH IDOR, original finding): the previous version returned
    the full manager roster — names, emails, user IDs — to any logged-in
    user. That was a direct PII leak. Still scoped to:
      * club owner / Manager -> full roster
      * everyone else        -> 403
    """
    if not is_club_owner_or_admin(club_id, current_user_id):
        raise HTTPException(
            status_code=403,
            detail="Only club managers can view the manager list.",
        )
    try:
        supabase = get_supabase()
        admin_rows = (
            supabase.table("user_clubs")
            .select("id, user_id, role, joined_at")
            .eq("club_id", club_id)
            .eq("role", "admin")
            .execute()
        )
        managers = []
        for m in (admin_rows.data or []):
            profile = {"id": m.get("id"), "user_id": m["user_id"], "role": "manager", "added_at": m.get("joined_at")}
            try:
                p = supabase.table("users").select("email").eq("id", m["user_id"]).execute()
                if p.data:
                    email = p.data[0].get("email", "") or ""
                    # Privacy: show the email-derived first name, never the
                    # user's custom username (same convention as /members).
                    profile["name"] = display_name_from_email(email)
                    profile["email"] = email
            except Exception:
                pass
            managers.append(profile)

        # Also include the club creator (Owner) as a manager (always)
        club_result = supabase.table("clubs").select("created_by").eq("id", club_id).execute()
        creator_id = club_result.data[0].get("created_by") if club_result.data else None
        if creator_id and not any(m["user_id"] == creator_id for m in managers):
            creator_profile = {"id": None, "user_id": creator_id, "role": "owner", "added_at": None}
            try:
                p = supabase.table("users").select("email").eq("id", creator_id).execute()
                if p.data:
                    email = p.data[0].get("email", "") or ""
                    creator_profile["name"] = display_name_from_email(email)
                    creator_profile["email"] = email
            except Exception:
                pass
            managers.insert(0, creator_profile)

        return {"managers": managers, "count": len(managers)}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error fetching club managers: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch managers")


@router.delete("/{club_id}/managers/{manager_user_id}")
async def remove_club_manager(club_id: str, manager_user_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Revoke a club Manager's role — demotes them to Member, doesn't remove
    them from the club. Only the club owner or a platform admin."""
    try:
        supabase = get_supabase()
        club_result = supabase.table("clubs").select("created_by").eq("id", club_id).execute()
        if not club_result.data:
            raise HTTPException(status_code=404, detail="Club not found")
        owner_id = club_result.data[0].get("created_by")

        if current_user_id != owner_id and not is_admin_user(current_user_id):
            raise HTTPException(status_code=403, detail="Only the club owner or global admins can remove managers")

        if manager_user_id == owner_id:
            raise HTTPException(status_code=400, detail="Cannot remove the club owner as a manager")

        supabase.table("user_clubs").update({"role": "member"}).eq("club_id", club_id).eq("user_id", manager_user_id).execute()
        # Defensive cleanup of any legacy club_managers row too, in case this
        # particular manager predates the invite flow.
        try:
            supabase.table("club_managers").delete().eq("club_id", club_id).eq("user_id", manager_user_id).execute()
        except Exception:
            pass
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error removing club manager: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove manager")


# ════════════════════════════════════════════════════════════════════
#  Manager Invite flow
#  Owner/Manager -> invite another Symbolos user to become a Manager.
#  Target user accepts/denies from their Clubs tab.
# ════════════════════════════════════════════════════════════════════

@router.post("/{club_id}/manager-requests")
async def create_manager_request(
    club_id: str,
    body: ManagerInviteCreate,
    current_user_id: str = Depends(get_current_user_id),
):
    """Owner/Manager invites another Symbolos user (by email) to become a
    Manager. Inserts a pending row in club_manager_requests; the target sees
    and acts on it from their Clubs tab."""
    from ...utils.anomaly import record_action
    record_action(current_user_id, "manager_invite")
    supabase = get_supabase()
    if not is_club_owner_or_admin(club_id, current_user_id):
        raise HTTPException(status_code=403, detail="Only the club owner or admins can invite managers")

    email = body.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=422, detail="Invalid email")

    # Find the target user
    target = supabase.table("users").select("id, email").ilike("email", email).execute()
    if not target.data:
        raise HTTPException(status_code=404, detail=f"No Symbolos account found for {email}")
    target_user_id = target.data[0]["id"]

    if target_user_id == current_user_id:
        raise HTTPException(status_code=400, detail="You can't invite yourself")

    # Already a manager / owner?
    existing_role = supabase.table("user_clubs").select("role") \
        .eq("club_id", club_id).eq("user_id", target_user_id).execute()
    if existing_role.data:
        role = (existing_role.data[0].get("role") or "").lower()
        if role in ("owner", "admin"):
            raise HTTPException(status_code=400, detail=f"That user is already a {role}")

    # Existing pending invite?
    pending = supabase.table("club_manager_requests").select("id") \
        .eq("club_id", club_id).eq("target_user_id", target_user_id) \
        .eq("status", "pending").execute()
    if pending.data:
        raise HTTPException(status_code=400, detail="A pending invite already exists for that user")

    try:
        row = {
            "club_id":        club_id,
            "target_user_id": target_user_id,
            "requested_by":   current_user_id,
            "status":         "pending",
            "message":        (body.message or "").strip()[:500] or None,
        }
        result = supabase.table("club_manager_requests").insert(row).execute()
        invite = result.data[0] if result.data else row

        # Out-of-band email so the target doesn't have to open the site to learn
        # about the invite. The in-app inbox is still the canonical UI; the email
        # is just a heads-up. Non-fatal — failures are logged but don't break
        # the request flow.
        try:
            from .email import _send_manager_invite_email
            target_email_addr = (target.data[0].get("email") or "").strip()
            requester_row = supabase.table("users").select("email") \
                .eq("id", current_user_id).execute()
            requester_email_addr = (requester_row.data[0].get("email") if requester_row.data else "") or ""
            club_row = supabase.table("clubs").select("name").eq("id", club_id).execute()
            club_name = (club_row.data[0].get("name") if club_row.data else "your club") or "your club"
            _send_manager_invite_email(
                target_email      = target_email_addr,
                target_first_name = display_name_from_email(target_email_addr),
                club_name         = club_name,
                requester_first_name = display_name_from_email(requester_email_addr),
                message           = (body.message or "").strip(),
            )
        except Exception as e:
            logger.warning(f"Manager invite email failed (non-fatal): {e}")

        return {"ok": True, "invite": invite}
    except Exception as e:
        logger.exception(f"create_manager_request failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to send manager invite")


@router.get("/manager-requests/incoming")
async def list_incoming_manager_requests(
    current_user_id: str = Depends(get_current_user_id),
):
    """Pending Manager Invites for the current user, with club info.
    Used to render the inbox at the top of My Clubs."""
    supabase = get_supabase()
    try:
        resp = (supabase.table("club_manager_requests")
                .select("id, club_id, requested_by, message, created_at, status, clubs(name, category, logo_url)")
                .eq("target_user_id", current_user_id)
                .eq("status", "pending")
                .order("created_at", desc=True)
                .execute())
        rows = resp.data or []
        # Resolve "requested_by" emails to first names (privacy: same
        # email-derived display name we use for club members).
        requester_ids = [r.get("requested_by") for r in rows if r.get("requested_by")]
        names: dict = {}
        if requester_ids:
            try:
                u = supabase.table("users").select("id, email").in_("id", requester_ids).execute()
                for row in (u.data or []):
                    names[row["id"]] = display_name_from_email(row.get("email", ""))
            except Exception:
                pass
        for r in rows:
            r["requested_by_name"] = names.get(r.get("requested_by"), "Member")
        return {"requests": rows, "count": len(rows)}
    except Exception as e:
        logger.exception(f"list_incoming_manager_requests failed: {e}")
        return {"requests": [], "count": 0}


@router.post("/manager-requests/{request_id}/action")
async def respond_to_manager_request(
    request_id: str,
    body: ManagerInviteAction,
    current_user_id: str = Depends(get_current_user_id),
):
    """Accept or deny a Manager Invite. Only the target user can act."""
    if body.action not in ("accept", "deny"):
        raise HTTPException(status_code=422, detail="action must be 'accept' or 'deny'")

    supabase = get_supabase()
    inv_res = supabase.table("club_manager_requests").select("*").eq("id", request_id).execute()
    if not inv_res.data:
        raise HTTPException(status_code=404, detail="Invite not found")
    invite = inv_res.data[0]

    if invite.get("target_user_id") != current_user_id:
        raise HTTPException(status_code=403, detail="This invite is not for you")
    if invite.get("status") != "pending":
        raise HTTPException(status_code=400, detail=f"Invite is already {invite.get('status')}")

    club_id = invite["club_id"]
    new_status = "accepted" if body.action == "accept" else "denied"

    try:
        if body.action == "accept":
            # Upsert membership row with admin role (= Manager, see CONTEXT.md)
            existing = (supabase.table("user_clubs")
                        .select("id, role")
                        .eq("club_id", club_id)
                        .eq("user_id", current_user_id)
                        .execute().data or [])
            if existing:
                if (existing[0].get("role") or "").lower() != "owner":
                    supabase.table("user_clubs") \
                        .update({"role": "admin"}) \
                        .eq("id", existing[0]["id"]).execute()
            else:
                supabase.table("user_clubs").insert({
                    "club_id": club_id,
                    "user_id": current_user_id,
                    "role":    "admin",
                }).execute()

        supabase.table("club_manager_requests").update({
            "status":       new_status,
            "responded_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", request_id).execute()

        return {"ok": True, "status": new_status}
    except Exception as e:
        logger.exception(f"respond_to_manager_request failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to respond to invite")
