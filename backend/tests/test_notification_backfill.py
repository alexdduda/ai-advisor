"""
_backfill_missing_notification_queue_rows — self-healing safety net for the
notification cron.

Incident this fixes: every syllabus-extracted assessment (midterms, finals,
quizzes, assignments) had notify_enabled=true and correct reminder windows,
but zero rows in notification_queue — the one-shot queuing call in
syllabus.py's _persist_syllabus_result omitted the required event_date
column, so the whole batch insert silently failed and was swallowed by a
bare try/except. Since that queuing only ever runs once, at syllabus-upload
time, the failure was permanent: no retry, ever, for any of those events.

Rather than trust each one-shot queuing path to always succeed, the cron
now re-derives what should be queued from calendar_events itself and fills
in whatever's missing before every send. These tests pin that backfill
function's behaviour directly (no HTTP layer, no auth) using the same
FakeSupabase/FakeTable harness the rest of this suite shares.
"""
from datetime import date, timedelta

from api.routes.notifications import _backfill_missing_notification_queue_rows


def _iso(days_from_today: int) -> str:
    return (date.today() + timedelta(days=days_from_today)).isoformat()


class TestBackfillMissingNotificationQueueRows:
    def test_syllabus_style_event_gets_backfilled_using_account_email(self, fake_supabase):
        sb = fake_supabase
        sb.set_table("calendar_events", [{
            "id": "ev1", "user_id": "u1", "title": "COMP 302 — Midterm 1",
            "date": _iso(7), "type": "academic",
            "notify_enabled": True, "notify_email": True,
            "notify_email_addr": None,
            "notify_same_day": False, "notify_1day": True, "notify_7days": True,
        }])
        sb.set_table("users", [{"id": "u1", "email": "student@mail.mcgill.ca"}])
        sb.set_table("notification_queue", [])

        added = _backfill_missing_notification_queue_rows(sb)

        assert added == 2
        rows = sb._tables["notification_queue"]
        assert {r["send_on"] for r in rows} == {_iso(0), _iso(6)}
        for r in rows:
            assert r["email"] == "student@mail.mcgill.ca"
            assert r["event_date"] == _iso(7)  # the actual regression
            assert r["event_id"] == "ev1"
            assert r["event_title"] == "COMP 302 — Midterm 1"
            assert r["sent"] is False

    def test_manually_created_event_uses_its_own_notify_email_addr(self, fake_supabase):
        sb = fake_supabase
        sb.set_table("calendar_events", [{
            "id": "ev2", "user_id": "u1", "title": "Dentist appointment",
            "date": _iso(1), "type": "personal",
            "notify_enabled": True, "notify_email": True,
            "notify_email_addr": "custom@example.com",
            "notify_same_day": True, "notify_1day": False, "notify_7days": False,
        }])
        # Deliberately no matching users row — if the function fell back to
        # looking this user up, it would find nothing and skip the event.
        sb.set_table("users", [])
        sb.set_table("notification_queue", [])

        added = _backfill_missing_notification_queue_rows(sb)

        assert added == 1
        assert sb._tables["notification_queue"][0]["email"] == "custom@example.com"

    def test_already_queued_offset_is_not_duplicated(self, fake_supabase):
        sb = fake_supabase
        sb.set_table("calendar_events", [{
            "id": "ev3", "user_id": "u1", "title": "MATH 423 — Quiz 3",
            "date": _iso(7), "type": "academic",
            "notify_enabled": True, "notify_email": True,
            "notify_email_addr": None,
            "notify_same_day": False, "notify_1day": True, "notify_7days": True,
        }])
        sb.set_table("users", [{"id": "u1", "email": "student@mail.mcgill.ca"}])
        # The 1-day-before row already exists (e.g. queued successfully by
        # some earlier path) — only the 7-day-before row is actually missing.
        sb.set_table("notification_queue", [{
            "event_id": "ev3", "send_on": _iso(6), "sent": False,
        }])

        added = _backfill_missing_notification_queue_rows(sb)

        assert added == 1
        new_rows = [r for r in sb._tables["notification_queue"] if r.get("send_on") == _iso(0)]
        assert len(new_rows) == 1

    def test_notify_disabled_event_is_skipped(self, fake_supabase):
        sb = fake_supabase
        sb.set_table("calendar_events", [{
            "id": "ev4", "user_id": "u1", "title": "Should not queue",
            "date": _iso(3), "type": "academic",
            "notify_enabled": False, "notify_email": True,
            "notify_email_addr": None,
            "notify_same_day": False, "notify_1day": True, "notify_7days": True,
        }])
        sb.set_table("users", [{"id": "u1", "email": "student@mail.mcgill.ca"}])
        sb.set_table("notification_queue", [])

        added = _backfill_missing_notification_queue_rows(sb)

        assert added == 0
        assert sb._tables["notification_queue"] == []

    def test_no_reminder_windows_selected_skips_event(self, fake_supabase):
        sb = fake_supabase
        sb.set_table("calendar_events", [{
            "id": "ev5", "user_id": "u1", "title": "No windows set",
            "date": _iso(3), "type": "academic",
            "notify_enabled": True, "notify_email": True,
            "notify_email_addr": None,
            "notify_same_day": False, "notify_1day": False, "notify_7days": False,
        }])
        sb.set_table("users", [{"id": "u1", "email": "student@mail.mcgill.ca"}])
        sb.set_table("notification_queue", [])

        assert _backfill_missing_notification_queue_rows(sb) == 0

    def test_offset_landing_in_the_past_is_not_queued(self, fake_supabase):
        sb = fake_supabase
        # Event is tomorrow; a 7-day-before reminder would land in the past
        # and must be skipped, but the 1-day-before one is still valid.
        sb.set_table("calendar_events", [{
            "id": "ev6", "user_id": "u1", "title": "Tomorrow's exam",
            "date": _iso(1), "type": "academic",
            "notify_enabled": True, "notify_email": True,
            "notify_email_addr": None,
            "notify_same_day": False, "notify_1day": True, "notify_7days": True,
        }])
        sb.set_table("users", [{"id": "u1", "email": "student@mail.mcgill.ca"}])
        sb.set_table("notification_queue", [])

        added = _backfill_missing_notification_queue_rows(sb)

        assert added == 1
        assert sb._tables["notification_queue"][0]["send_on"] == _iso(0)

    def test_no_events_at_all_is_a_safe_no_op(self, fake_supabase):
        sb = fake_supabase
        sb.set_table("calendar_events", [])
        sb.set_table("notification_queue", [])

        assert _backfill_missing_notification_queue_rows(sb) == 0
