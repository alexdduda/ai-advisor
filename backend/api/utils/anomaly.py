"""
Per-user write-action anomaly logger.

The audit recommended bot mitigation. With email verification + per-user
rate limits + the McGill-domain gate already in place, blocking is overkill
for our scale — but *seeing* anomalous behavior matters so that if/when
abuse does appear, we know within an hour instead of finding out from a
user complaint a week later.

This module increments a sliding 1-hour counter per user per action class
and emits a WARN-level log line (which surfaces in Sentry as a breadcrumb
once we hook that up) whenever the count crosses a class-specific threshold.

It does NOT block. It only logs.

Thresholds tuned for "real student maxing out a normal workflow":

  forum_post     : 5 / hour  — 5 thoughtful posts in an hour is already a lot
  forum_reply    : 20 / hour — replying in a long thread is fine
  club_submit    : 2 / hour  — submitting a club is rare
  club_join      : 10 / hour — discovery binge is normal
  manager_invite : 5 / hour  — a real exec setting up the team
  card_chip_click: 50 / hour — clicking around the brief is fine

Anything above these is plausibly automation. We log and move on.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone

from .supabase_client import get_supabase

logger = logging.getLogger(__name__)


# Per-class thresholds. Override via env vars if a class generates noise.
DEFAULT_THRESHOLDS: dict[str, int] = {
    "forum_post":      int(os.getenv("ANOMALY_FORUM_POST",      "5")),
    "forum_reply":     int(os.getenv("ANOMALY_FORUM_REPLY",     "20")),
    "club_submit":     int(os.getenv("ANOMALY_CLUB_SUBMIT",     "2")),
    "club_join":       int(os.getenv("ANOMALY_CLUB_JOIN",       "10")),
    "manager_invite":  int(os.getenv("ANOMALY_MANAGER_INVITE",  "5")),
    "card_chip_click": int(os.getenv("ANOMALY_CARD_CHIP_CLICK", "50")),
    "verification_send": int(os.getenv("ANOMALY_VERIFICATION_SEND", "3")),
}


def record_action(user_id: str, action: str) -> None:
    """Tick the user/action counter, log once if it crosses the threshold.

    Best-effort: a DB failure here MUST NOT break the calling endpoint.
    The action is a privacy-safe label like "forum_post" — never raw content.
    """
    if not user_id or not action:
        return

    now = datetime.now(timezone.utc)
    # Hour bucket — we reuse the same rate_limits table as the rate
    # limiter, just with a distinct key namespace so we don't collide.
    bucket = now.replace(minute=0, second=0, microsecond=0).isoformat()
    key = f"anomaly:{action}:{user_id}"
    threshold = DEFAULT_THRESHOLDS.get(action, 30)

    try:
        sb = get_supabase()
        read = (
            sb.table("rate_limits")
            .select("count")
            .eq("key", key)
            .eq("window_start", bucket)
            .execute()
        )
        if read.data:
            new_count = (read.data[0].get("count") or 0) + 1
            sb.table("rate_limits").update({
                "count": new_count,
                "updated_at": now.isoformat(),
            }).eq("key", key).eq("window_start", bucket).execute()
        else:
            new_count = 1
            sb.table("rate_limits").insert({
                "key": key,
                "window_start": bucket,
                "count": 1,
                "updated_at": now.isoformat(),
            }).execute()

        # Log exactly once when we cross the threshold (i.e. on the
        # transition request) so we don't spam the log file. The next
        # tick will be (threshold + 1) and won't re-log; the hour bucket
        # resets naturally at the next clock-hour rollover.
        if new_count == threshold + 1:
            logger.warning(
                "ANOMALY user=%s action=%s count=%d/hr threshold=%d",
                user_id, action, new_count, threshold,
            )
    except Exception as exc:
        logger.debug("anomaly logger DB failure: %s", type(exc).__name__)
