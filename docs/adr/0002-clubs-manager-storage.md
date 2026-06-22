# Consolidate Club Manager storage onto user_clubs.role

Club Managers (see CONTEXT.md) have two competing backend mechanisms today: the legacy `club_managers` table (written by `add_club_manager`, read by `get_club_managers`/`remove_club_manager`) and `user_clubs.role = "admin"` (written by the Manager Invite accept flow — the *only* manager-creation path the frontend actually calls; `addClubManager` exists in `clubsAPI.js` but is never invoked). The result: a Manager added the only way the UI supports doesn't appear in their own club's manager list, and "Remove Manager" on them is a no-op.

We're consolidating onto `user_clubs.role`, since that's what the live creation path already writes. `get_club_managers` and `remove_club_manager` will be rewritten to read/write `user_clubs.role = "admin"` instead of `club_managers`, and the `club_managers` table, `add_club_manager` endpoint, and its `clubsAPI.js` binding will be removed as part of the `clubs.py` refactor.

## Considered Options

- **Consolidate onto the `club_managers` table instead** — rejected: would mean rewriting the Manager Invite accept flow (the thing that actually works today) rather than the two broken read paths, and `user_clubs.role` already carries Owner/Member in the same place, so Manager living there too keeps one source of truth for "what can this person do in this club" instead of two.
