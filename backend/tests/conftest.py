"""
pytest fixtures shared by the security smoke tests.

We don't talk to Supabase / Anthropic / Resend in CI. Every external
client is patched here so the tests run hermetically in <1s.

Strategy: don't try to swap auth dependencies via
`app.dependency_overrides`. FastAPI caches the dependency signature at
route-registration time, and the override's parameters get re-parsed
in confusing ways. Instead we let the REAL `get_current_user_id` run
end-to-end and just mock the single Supabase call it ends with —
`supabase.auth.get_user(token)`. The tests then send a plain
`Authorization: Bearer <user-id>` header and the rest of the codepath
behaves exactly like production.
"""
from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

# Make `api.*` importable regardless of where pytest is invoked from.
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


# ── Fakes ─────────────────────────────────────────────────────────────────────

class FakeAuthAdmin:
    """Mimics supabase.auth.admin.get_user(user_id) — returns a user
    object whose `email` matches whatever the test sets up."""
    def __init__(self, email: str = "tester@mail.mcgill.ca", confirmed: bool = True):
        self.email = email
        self.confirmed = confirmed

    def get_user(self, user_id: str):
        user = SimpleNamespace(
            id=user_id,
            email=self.email,
            created_at="2025-01-01T00:00:00Z",
            last_sign_in_at="2025-06-01T00:00:00Z",
            email_confirmed_at="2025-01-01T00:00:00Z" if self.confirmed else None,
        )
        return SimpleNamespace(user=user)


class FakeTable:
    """Records every query and returns canned data."""
    def __init__(self, name: str, data):
        self._name = name
        self._data = data if data is not None else []
        self._eq_filters: list = []

    def select(self, *args, **kwargs): return self
    def eq(self, col, val):
        self._eq_filters.append((col, val))
        return self
    def ilike(self, col, val): return self
    def or_(self, *args, **kwargs):
        """PostgREST OR — no-op shim. Defense-in-depth Python filters
        in the endpoints still enforce the security assertions."""
        return self
    def order(self, *args, **kwargs): return self
    def limit(self, n): return self
    def in_(self, col, vals): return self
    def single(self): return self
    def insert(self, row):
        self._data.append(row if isinstance(row, dict) else dict(row))
        return self
    def update(self, row): return self
    def delete(self): return self

    def execute(self):
        rows = list(self._data)
        for col, val in self._eq_filters:
            rows = [r for r in rows if r.get(col) == val]
        return SimpleNamespace(data=rows, count=len(rows))


class FakeSupabase:
    """Stand-in for the supabase client.

    `.auth.get_user(token)` interprets the Bearer token AS the user_id —
    that lets the real `get_current_user_id` dependency resolve cleanly
    when tests send `Authorization: Bearer <user-id>`.

    `.auth.admin.get_user(user_id)` returns the configured auth identity
    (email + email_confirmed_at) used by the McGill-flag logic.
    """
    def __init__(self, auth_email: str = "tester@mail.mcgill.ca"):
        self._tables: dict = {}
        self._auth_email = auth_email

        def _resolve_token(token):
            """get_current_user_id's path. The token IS the user id."""
            if not token or token == "invalid":
                raise Exception("invalid token")
            return SimpleNamespace(user=SimpleNamespace(id=token))

        self.auth = SimpleNamespace(
            get_user=_resolve_token,
            admin=FakeAuthAdmin(email=auth_email),
        )

    # Allow tests to swap the auth-identity email (audit fix #2 test)
    def set_auth_email(self, email: str) -> None:
        self._auth_email = email
        self.auth.admin = FakeAuthAdmin(email=email)

    def set_table(self, name: str, rows: list) -> None:
        self._tables[name] = rows

    def table(self, name: str) -> FakeTable:
        return FakeTable(name, self._tables.setdefault(name, []))

    def rpc(self, *args, **kwargs):
        return SimpleNamespace(execute=lambda: SimpleNamespace(data=1))


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def fake_supabase(monkeypatch):
    """Patch every importable `get_supabase` reference so all routes see
    the fake regardless of where they imported it from."""
    sb = FakeSupabase()

    import api.utils.supabase_client as supa
    monkeypatch.setattr(supa, "get_supabase", lambda: sb)
    monkeypatch.setattr(supa, "get_user_supabase", lambda jwt: sb)

    # Each route does `from ..utils.supabase_client import get_supabase`
    # at module load time, binding the original function into its own
    # namespace. Override those bindings too.
    for module_path in (
        "api.routes.clubs",
        "api.routes.users",
        "api.routes.verification",
        "api.routes.forum",
        "api.routes.cards",
        "api.routes.chat",
        "api.routes.courses",
        "api.routes.webhooks",
        "api.utils.verified_user",
        "api.utils.llm_budget",
        "api.utils.anomaly",
        "api.main",
    ):
        try:
            mod = __import__(module_path, fromlist=["get_supabase"])
        except Exception:
            continue
        if hasattr(mod, "get_supabase"):
            monkeypatch.setattr(mod, "get_supabase", lambda: sb)

    # Patch the auth module too — get_current_user_id calls get_supabase
    # to resolve the JWT, and we want it to hit the fake.
    import api.auth as auth_module
    monkeypatch.setattr(auth_module, "get_supabase", lambda: sb)

    return sb


@pytest.fixture
def client(fake_supabase, monkeypatch):
    """A FastAPI TestClient that lets the real auth path run.

    Tests pass `Authorization: Bearer <user_id>` and the fake supabase
    resolves it via its `.auth.get_user(token)` shim, which returns a
    user object whose id == token. The real `get_current_user_id`
    dependency then returns that id without modification, matching the
    production codepath exactly.
    """
    # Soft-stub the verified-email gate + LLM budget so the smoke tests
    # don't need to mock those flows. We're only asserting auth/PII/cache
    # invariants here — verified-email is its own thing.
    from api.utils import verified_user as vu
    from api.utils import llm_budget as lb
    monkeypatch.setattr(vu, "is_email_verified", lambda _uid: True)
    monkeypatch.setattr(lb, "check_and_record_llm_usage", lambda *a, **kw: None)

    # Anomaly logger is best-effort — don't let it hit the fake's DB shim.
    from api.utils import anomaly as an
    monkeypatch.setattr(an, "record_action", lambda *a, **kw: None)

    from fastapi.testclient import TestClient
    from api.main import app
    return TestClient(app)


# ── Helpers tests can use ─────────────────────────────────────────────────────

def auth(user_id: str) -> dict:
    """Convenience: produce the headers a test needs to authenticate
    as `user_id`. The fake supabase decodes the Bearer to the same id."""
    return {"Authorization": f"Bearer {user_id}"}
