"""
Locks in the club role model — specifically the two things that look like bugs
but are deliberate, plus the four Owner protections that genuinely are load-bearing.

Written after a business-logic review flagged "a Manager can demote another
Manager" as a possible privilege-escalation chain. Product decision: that is
INTENDED, so a club isn't stranded when the Owner goes inactive and the
remaining Managers need to reorganise. The dead check that claimed otherwise
was removed.

These tests exist so nobody re-adds that block after reading a stale comment.
The Owner protections below are the actual boundary — those must not regress.
"""
import ast
import pathlib

MEMBERS = pathlib.Path(__file__).parent.parent / "api/routes/clubs/members.py"
SRC = MEMBERS.read_text()


def _func(name):
    tree = ast.parse(SRC)
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == name:
            return ast.unparse(node)
    raise AssertionError(f"{name} not found in members.py")


class TestIntendedManagerPowers:
    """Deliberate. Not a vulnerability — see module docstring."""

    def test_no_dead_target_role_variable(self):
        """The removed block loaded target_role and never used it.

        If this fails, someone re-added the check that contradicts the
        owner-continuity decision. Confirm the product intent before "fixing".
        """
        assert "target_role" not in _func("update_member_role"), (
            "target_role is back — the dead 'Admins cannot change other admins' "
            "block was likely reinstated. Managers demoting Managers is intended."
        )

    def test_manager_is_accepted_by_the_role_change_gate(self):
        """caller_is_club_admin must remain a valid path into role changes."""
        fn = _func("update_member_role")
        assert "caller_is_club_admin" in fn
        assert "caller_is_owner or caller_is_global_admin or caller_is_club_admin" in fn


class TestOwnerProtections:
    """The real boundary. A rogue Manager must never reach the Owner or club."""

    def test_owner_cannot_be_demoted(self):
        fn = _func("update_member_role")
        assert "target_is_owner and new_role != 'owner'" in fn.replace('"', "'"), (
            "the owner-demotion guard is missing — a Manager could strip the Owner"
        )

    def test_only_owner_can_transfer_ownership(self):
        fn = _func("update_member_role")
        assert "if not caller_is_owner:" in fn, (
            "ownership transfer must require caller_is_owner"
        )

    def test_owner_cannot_be_removed(self):
        fn = _func("remove_club_member")
        assert "created_by" in fn, (
            "remove_club_member must still refuse to remove the club creator"
        )

    def test_role_values_are_constrained(self):
        """No arbitrary role strings — prevents inventing a super-role."""
        fn = _func("update_member_role")
        assert "('admin', 'member', 'owner')" in fn.replace('"', "'")


class TestClubDeletionIsPlatformAdminOnly:
    def test_delete_club_requires_platform_admin(self):
        discovery = (MEMBERS.parent / "discovery.py").read_text()
        tree = ast.parse(discovery)
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == "delete_club":
                body = ast.unparse(node)
                assert "is_admin_user" in body, (
                    "delete_club must stay platform-admin only — a club Manager "
                    "must never be able to delete the club"
                )
                return
        raise AssertionError("delete_club not found in discovery.py")
