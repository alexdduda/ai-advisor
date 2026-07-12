"""
Regression tests for create_user() conflict handling.

Context (Sentry issues SYMBOLOS-BACKEND-K / -J / -2): a duplicate username on
signup used to raise a 500 DatabaseException. Because create_user() auto-derives
a username from the email's first name, two students sharing a first name
(john.smith@ / john.doe@ → "John") collided, and the second signup got a
misleading "Database operation failed" 500 that also paged us in Sentry.

New contract:
  • Auto-derived username collision  → silently de-collide (John → John2 → …).
  • Explicitly chosen username taken  → 409 UsernameAlreadyTakenException.
  • Email already owned by another    → 409 UserAlreadyExistsException.
Never a 500 for any of these routine, user-correctable conditions.
"""
from types import SimpleNamespace

import pytest

import api.utils.supabase_client as supa
from api.exceptions import UsernameAlreadyTakenException, UserAlreadyExistsException


_UNIQUE_VIOLATION = (
    'duplicate key value violates unique constraint "users_{col}_key"'
)


class _FakeUsersTable:
    """Minimal `users` table that raises a Postgres unique violation whenever
    an insert would collide on a value already in `taken[col]`."""

    def __init__(self, taken):
        self.taken = taken  # e.g. {"username": {"John"}, "email": {"a@b.c"}}
        self.inserted = []

    def table(self, name):
        assert name == "users"
        return self

    def insert(self, row):
        self._row = dict(row)
        return self

    def execute(self):
        for col, values in self.taken.items():
            if self._row.get(col) in values:
                raise Exception(_UNIQUE_VIOLATION.format(col=col))
        self.inserted.append(self._row)
        return SimpleNamespace(data=[self._row])


@pytest.fixture
def patch_db(monkeypatch):
    """Point create_user() at a supplied fake and make the duplicate-path
    self-heal lookup miss (so we exercise the conflict branches, not the
    'same user retrying' short-circuit)."""

    def _apply(fake):
        monkeypatch.setattr(supa, "get_supabase", lambda: fake)

        def _miss(uid):
            raise supa.UserNotFoundException(uid)

        monkeypatch.setattr(supa, "get_user_by_id", _miss)
        return fake

    return _apply


def test_auto_derived_username_collision_is_de_collided(patch_db):
    fake = patch_db(_FakeUsersTable(taken={"username": {"John"}}))
    # No username supplied → derived as "John", which is taken → expect "John2".
    result = supa.create_user({"id": "u1", "email": "john.doe@mail.mcgill.ca"})
    assert result["username"] == "John2"
    assert fake.inserted[-1]["username"] == "John2"


def test_auto_derived_username_skips_multiple_taken_suffixes(patch_db):
    fake = patch_db(_FakeUsersTable(taken={"username": {"John", "John2", "John3"}}))
    result = supa.create_user({"id": "u1", "email": "john.roe@mail.mcgill.ca"})
    assert result["username"] == "John4"


def test_explicit_duplicate_username_raises_409(patch_db):
    patch_db(_FakeUsersTable(taken={"username": {"chosen_one"}}))
    with pytest.raises(UsernameAlreadyTakenException) as exc:
        # Username explicitly provided → the student must be told to pick another.
        supa.create_user(
            {"id": "u1", "email": "a.b@mail.mcgill.ca", "username": "chosen_one"}
        )
    assert exc.value.status_code == 409


def test_duplicate_email_raises_409(patch_db):
    patch_db(_FakeUsersTable(taken={"email": {"taken@mail.mcgill.ca"}}))
    with pytest.raises(UserAlreadyExistsException) as exc:
        supa.create_user(
            {"id": "u1", "email": "taken@mail.mcgill.ca", "username": "fresh_name"}
        )
    assert exc.value.status_code == 409


def test_same_user_retrying_returns_existing_row(monkeypatch):
    """A double-submit / self-heal where the auth user's row already exists must
    return that row, not raise."""
    fake = _FakeUsersTable(taken={"username": {"John"}})
    monkeypatch.setattr(supa, "get_supabase", lambda: fake)
    existing = {"id": "u1", "email": "john.doe@mail.mcgill.ca", "username": "John"}
    monkeypatch.setattr(supa, "get_user_by_id", lambda uid: existing)
    result = supa.create_user({"id": "u1", "email": "john.doe@mail.mcgill.ca"})
    assert result is existing
