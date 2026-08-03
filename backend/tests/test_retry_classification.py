"""
Regression tests for with_retry's failure classification.

Origin: SYMBOLOS-BACKEND-10/14 — /api/cards 500s in production. The retry
wrapper existed and looked correct, but its signal list contained only the
substring "timeout", while httpx.ReadTimeout's message is "The read operation
timed out". "timed out" != "timeout", so read timeouts were never classified as
retryable and every one became an immediate 500.

The fix must also NOT over-correct: a read timeout means the request reached
the server, so retrying a non-idempotent write could duplicate a row.
"""
import httpx
import pytest

from api.utils import supabase_client as sc


class TestClassification:
    def test_httpx_read_timeout_is_a_timeout(self):
        """The exact production exception. Was False before the fix."""
        assert sc._is_timeout(httpx.ReadTimeout("The read operation timed out"))

    def test_read_timeout_is_not_a_connection_error(self):
        """It must not be treated as always-safe — the request WAS sent."""
        assert not sc._is_connection_error(httpx.ReadTimeout("The read operation timed out"))

    @pytest.mark.parametrize("msg", ["The read operation timed out", "timed out", "Timeout"])
    def test_both_spellings_match(self, msg):
        assert sc._is_timeout(Exception(msg))

    @pytest.mark.parametrize("exc", [
        httpx.ConnectTimeout("timed out"),
        httpx.PoolTimeout("timed out"),
        httpx.ConnectError("connection refused"),
        Exception("Server disconnected without sending a response"),
    ])
    def test_connection_failures_are_always_retryable(self, exc):
        """Never reached the server, so safe to retry even for writes."""
        assert sc._is_connection_error(exc)

    def test_unrelated_errors_are_not_retryable(self):
        assert not sc._is_connection_error(ValueError("bad input"))
        assert not sc._is_timeout(ValueError("bad input"))


class TestWithRetry:
    def _flaky(self, exc, succeed_on):
        calls = {"n": 0}

        def fn():
            calls["n"] += 1
            if calls["n"] < succeed_on:
                raise exc
            return "ok"
        return fn, calls

    def test_read_timeout_retries_when_idempotent(self, monkeypatch):
        """The reported bug: get_user_by_id should survive one read timeout."""
        monkeypatch.setattr(sc, "RETRY_BACKOFF", 0)
        fn, calls = self._flaky(httpx.ReadTimeout("The read operation timed out"), succeed_on=2)
        assert sc.with_retry("get_user_by_id", fn, retry_on_timeout=True) == "ok"
        assert calls["n"] == 2

    def test_read_timeout_does_NOT_retry_by_default(self, monkeypatch):
        """A timed-out write may have been applied — retrying could duplicate."""
        monkeypatch.setattr(sc, "RETRY_BACKOFF", 0)
        fn, calls = self._flaky(httpx.ReadTimeout("The read operation timed out"), succeed_on=2)
        with pytest.raises(httpx.ReadTimeout):
            sc.with_retry("forum_create_post", fn)
        assert calls["n"] == 1, "a non-idempotent write must not be retried on timeout"

    def test_connection_error_retries_even_for_writes(self, monkeypatch):
        monkeypatch.setattr(sc, "RETRY_BACKOFF", 0)
        fn, calls = self._flaky(Exception("Server disconnected"), succeed_on=2)
        assert sc.with_retry("save_message", fn) == "ok"
        assert calls["n"] == 2

    def test_gives_up_after_max_retries(self, monkeypatch):
        monkeypatch.setattr(sc, "RETRY_BACKOFF", 0)
        fn, calls = self._flaky(httpx.ReadTimeout("The read operation timed out"), succeed_on=99)
        with pytest.raises(httpx.ReadTimeout):
            sc.with_retry("get_user_by_id", fn, retry_on_timeout=True)
        assert calls["n"] == sc.MAX_RETRIES

    def test_non_retryable_fails_immediately(self, monkeypatch):
        monkeypatch.setattr(sc, "RETRY_BACKOFF", 0)
        fn, calls = self._flaky(ValueError("bad input"), succeed_on=2)
        with pytest.raises(ValueError):
            sc.with_retry("get_user_by_id", fn, retry_on_timeout=True)
        assert calls["n"] == 1
