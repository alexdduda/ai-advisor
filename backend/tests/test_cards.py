"""
Tests for backend/api/routes/cards.py bug fixes:

1. PATCH /api/cards/{user_id}/reorder — Sentry: `null value in column
   "sort_order" of relation "advisor_cards" violates not-null constraint`,
   27 events, ongoing 4 weeks (every reorder attempt). The frontend always
   sends {id, sort_order} (AdvisorCards.jsx), which CardOrder.resolved_position
   correctly resolves to an int, but the RPC payload only ever included a
   "position" key — if the reorder_advisor_cards RPC (defined in Supabase,
   not in this repo) reads "sort_order" from each payload item to fill the
   sort_order column, that key was simply never present, writing NULL
   every time.

2. save_cards() — Sentry: `insert or update on table "advisor_cards"
   violates foreign key constraint "advisor_cards_user_id_fkey"` on
   POST /api/cards/stream/{user_id}. Streamed card generation can run for
   tens of seconds; if the account is deleted mid-stream, user_id no
   longer exists by the time save_cards persists the generated cards.
"""
from __future__ import annotations

from types import SimpleNamespace

import pytest
from postgrest.exceptions import APIError

from tests.conftest import auth
from api.routes.cards import save_cards


def test_reorder_sends_both_position_and_sort_order_keys(client, fake_supabase):
    fake_supabase.set_table("users", [{"id": "user-1", "email": "tester@mail.mcgill.ca"}])

    captured = {}

    def _rpc(name, params, *args, **kwargs):
        captured["name"] = name
        captured["params"] = params
        return SimpleNamespace(execute=lambda: SimpleNamespace(data=1))

    fake_supabase.rpc = _rpc

    resp = client.patch(
        "/api/cards/user-1/reorder",
        json={"order": [{"id": "card-1", "sort_order": 0}, {"id": "card-2", "sort_order": 1}]},
        headers=auth("user-1"),
    )
    assert resp.status_code == 200
    assert resp.json() == {"reordered": 2}

    assert captured["name"] == "reorder_advisor_cards"
    payload = captured["params"]["payload"]
    assert payload == [
        {"id": "card-1", "position": 0, "sort_order": 0},
        {"id": "card-2", "position": 1, "sort_order": 1},
    ]


def test_reorder_resolves_position_field_too(client, fake_supabase):
    """Older/other callers sending 'position' instead of 'sort_order' still work."""
    fake_supabase.set_table("users", [{"id": "user-1", "email": "tester@mail.mcgill.ca"}])

    captured = {}

    def _rpc(name, params, *args, **kwargs):
        captured["params"] = params
        return SimpleNamespace(execute=lambda: SimpleNamespace(data=1))

    fake_supabase.rpc = _rpc

    resp = client.patch(
        "/api/cards/user-1/reorder",
        json={"order": [{"id": "card-1", "position": 3}]},
        headers=auth("user-1"),
    )
    assert resp.status_code == 200
    assert captured["params"]["payload"] == [{"id": "card-1", "position": 3, "sort_order": 3}]


# ── save_cards: FK violation from a mid-stream account deletion ────────────

class _RaisingTable:
    """Stands in for supabase.table("advisor_cards") — delete() is a no-op,
    insert().execute() raises the given error."""
    def __init__(self, error):
        self._error = error
        self._is_insert = False
    def delete(self): return self
    def eq(self, *a, **kw): return self
    def insert(self, rows):
        self._is_insert = True
        return self
    def execute(self):
        if self._is_insert and self._error is not None:
            raise self._error
        return SimpleNamespace(data=[])


def test_save_cards_swallows_fk_violation_from_deleted_user(fake_supabase, monkeypatch):
    error = APIError({"code": "23503", "message": "FK violation", "details": None, "hint": None})
    monkeypatch.setattr(fake_supabase, "table", lambda name: _RaisingTable(error))

    # Should not raise — the user is gone, nothing left to persist for.
    save_cards("deleted-user", [{"title": "t", "body": "b", "type": "insight"}])


def test_save_cards_reraises_other_db_errors(fake_supabase, monkeypatch):
    error = APIError({"code": "42P01", "message": "undefined_table", "details": None, "hint": None})
    monkeypatch.setattr(fake_supabase, "table", lambda name: _RaisingTable(error))

    with pytest.raises(APIError):
        save_cards("user-1", [{"title": "t", "body": "b", "type": "insight"}])


class TestCourseRegistrationReminder:
    """Fall and Winter registration open on the SAME day at McGill — there is no
    separate Winter window. The reminder used to say "the courses you need next
    term", which reads as Fall only; students who planned just Fall came back in
    November to find the Winter sections they wanted already full.

    These pin the both-terms message so a future copy edit can't quietly drop it.
    """

    def _card(self, days_before_open, monkeypatch):
        """Run the insert and capture the row it would write, without a DB."""
        import api.routes.cards as cards
        captured = {}

        class _Tbl:
            def __init__(self, name): self.name = name
            def select(self, *a, **k): return self
            def eq(self, *a, **k): return self
            def gte(self, *a, **k): return self
            def limit(self, *a, **k): return self
            def update(self, *a, **k): return self
            def execute(self): return type('R', (), {'data': []})()
            def insert(self, row):
                if self.name == 'advisor_cards' and row.get('label') == cards.COURSE_REGISTRATION_REMINDER_LABEL:
                    captured.update(row)
                return self

        monkeypatch.setattr(cards, 'get_supabase', lambda: type('S', (), {'table': staticmethod(lambda n: _Tbl(n))})())
        monkeypatch.setattr(cards, '_has_active_course_registration_card', lambda uid: False)
        assert cards._insert_course_registration_card('u1', days_before_open) is True
        return captured

    def test_heads_up_card_names_both_terms(self, monkeypatch):
        card = self._card(8, monkeypatch)
        blob = f"{card['title']} {card['body']}".lower()
        assert 'fall' in blob and 'winter' in blob
        assert 'same time' in blob, 'must say the two terms open together'

    def test_day_of_card_names_both_terms(self, monkeypatch):
        card = self._card(0, monkeypatch)
        blob = f"{card['title']} {card['body']}".lower()
        assert 'fall' in blob and 'winter' in blob
        assert 'both' in blob

    def test_day_of_card_says_there_is_no_second_window(self, monkeypatch):
        """The actionable part: don't wait and register for Winter later."""
        body = self._card(0, monkeypatch)['body'].lower()
        assert 'no second registration date' in body

    def test_neither_card_says_only_next_term(self, monkeypatch):
        """The old wording. Singular "next term" is what caused the problem."""
        for days in (8, 0):
            blob = f"{self._card(days, monkeypatch)['body']}".lower()
            assert 'next term' not in blob, f'days_before_open={days} still says "next term"'

    def test_both_cards_send_the_student_to_minerva_for_their_own_time(self, monkeypatch):
        """McGill staggers registration start times per student, so "registration
        opens May 28" is not the same as "yours opens May 28". The card has to
        point at Minerva for the student's own slot rather than implying one
        shared time."""
        for days in (8, 0):
            body = self._card(days, monkeypatch)['body'].lower()
            assert 'minerva' in body, f'days_before_open={days}'
            assert 'stagger' in body, f'days_before_open={days} must say times differ per student'

    def test_chips_cover_both_terms(self, monkeypatch):
        import json as _json
        actions = _json.loads(self._card(0, monkeypatch)['actions'])
        text = ' '.join(a if isinstance(a, str) else a.get('label', '') for a in actions).lower()
        assert 'fall' in text and 'winter' in text
