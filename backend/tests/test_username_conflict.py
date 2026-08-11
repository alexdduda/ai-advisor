"""
SYMBOLOS-BACKEND-15/16/17/18: PATCH /api/users/{id} with a username someone
else already has returned HTTP 500 and paged as a server error, when it is
ordinary user input.

Postgres raises 23505 on users_username_key. create_user already mapped that
to UsernameTakenException (409); the update path never did, so it fell through
to DatabaseException -> 500 and the student saw a generic failure with no hint
that the name was taken.

These tests exercise the real exception path — the first version of the fix
referenced UsernameTakenException in routes/users.py without importing it,
which would have raised NameError at runtime. Nothing caught that because no
test touched the path.
"""
import pytest

from api import exceptions as exc_mod
from api.exceptions import UsernameTakenException
from api.utils import supabase_client as sc


DUPE = (
    "{'message': 'duplicate key value violates unique constraint "
    "\"users_username_key\"', 'code': '23505', 'hint': None, "
    "'details': 'Key (username)=(Charles) already exists.'}"
)


class TestMapping:
    def test_duplicate_username_becomes_a_409_not_a_500(self, monkeypatch):
        monkeypatch.setattr(sc, "with_retry",
                            lambda *a, **k: (_ for _ in ()).throw(Exception(DUPE)))
        with pytest.raises(UsernameTakenException) as ei:
            sc.update_user("some-user-id", {"username": "Charles"})
        assert ei.value.status_code == 409

    def test_other_db_errors_still_raise_DatabaseException(self, monkeypatch):
        """The mapping must be narrow — unrelated failures stay 500s."""
        monkeypatch.setattr(sc, "with_retry",
                            lambda *a, **k: (_ for _ in ()).throw(Exception("connection reset by peer")))
        with pytest.raises(exc_mod.DatabaseException):
            sc.update_user("some-user-id", {"username": "Charles"})

    def test_a_different_unique_constraint_is_not_mapped(self, monkeypatch):
        """23505 on some other constraint is not a username conflict."""
        other = ("{'message': 'duplicate key value violates unique constraint "
                 "\"users_email_key\"', 'code': '23505'}")
        monkeypatch.setattr(sc, "with_retry",
                            lambda *a, **k: (_ for _ in ()).throw(Exception(other)))
        with pytest.raises(exc_mod.DatabaseException):
            sc.update_user("some-user-id", {"email": "x@y.z"})


class TestRouteImports:
    def test_route_module_has_the_symbol_bound(self):
        """Regression for the NameError: the route references
        UsernameTakenException in an except clause, so it must be imported."""
        from api.routes import users as users_route
        assert users_route.UsernameTakenException is UsernameTakenException

    def test_user_facing_message_names_the_actual_problem(self):
        assert "username" in UsernameTakenException().detail.lower()
