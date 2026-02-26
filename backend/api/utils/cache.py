"""
backend/api/utils/cache.py
In-memory cache with TTL for course data.
Caches /courses/subjects, /courses/search (same queries), and course details.
"""
import time
import logging
from typing import Any, Optional, Dict

logger = logging.getLogger(__name__)

# Evict stale entries once the store grows beyond this many keys.
# Keeps memory bounded without needing a background thread.
_EVICT_THRESHOLD = 500


class SimpleCache:
    """
    Lightweight in-memory TTL cache.
    """

    def __init__(self, default_ttl: int = 300):
        """
        Args:
            default_ttl: Default time-to-live in seconds (5 minutes).
        """
        self._store: Dict[str, Dict[str, Any]] = {}
        self._default_ttl = default_ttl

    def _evict_expired(self) -> None:
        """Remove all entries whose TTL has elapsed.

        Called lazily in set() when the store exceeds _EVICT_THRESHOLD keys so
        that expired items don't accumulate indefinitely on long-running servers.
        The threshold avoids paying the scan cost on every small cache.
        """
        now = time.time()
        expired_keys = [k for k, v in self._store.items() if now > v["expires_at"]]
        for k in expired_keys:
            del self._store[k]
        if expired_keys:
            logger.debug(f"Cache evicted {len(expired_keys)} expired entries")

    def get(self, key: str) -> Optional[Any]:
        """Return cached value or None if expired / missing."""
        entry = self._store.get(key)
        if entry is None:
            return None
        if time.time() > entry["expires_at"]:
            del self._store[key]
            return None
        return entry["value"]

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Store a value with optional custom TTL."""
        # FIX: Proactively evict expired entries when the store gets large so
        # stale keys don't accumulate indefinitely on long-running processes.
        if len(self._store) >= _EVICT_THRESHOLD:
            self._evict_expired()

        self._store[key] = {
            "value": value,
            "expires_at": time.time() + (ttl or self._default_ttl),
        }

    def invalidate(self, key: str) -> None:
        """Remove a specific key."""
        self._store.pop(key, None)

    def clear(self) -> None:
        """Flush entire cache."""
        self._store.clear()

    @property
    def size(self) -> int:
        return len(self._store)


# ── Shared cache instances ───────────────────────────────────────────────
# Subjects change ~never → 1-hour TTL
subjects_cache = SimpleCache(default_ttl=3600)

# Search results are repeated often → 5-minute TTL
search_cache = SimpleCache(default_ttl=300)

# Individual course details → 10-minute TTL
course_detail_cache = SimpleCache(default_ttl=600)