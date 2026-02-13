"""
backend/api/utils/cache.py

In-memory cache with TTL for course data.
Caches /courses/subjects, /courses/search (same queries), and course details.
"""
import time
import logging
from typing import Any, Optional, Dict

logger = logging.getLogger(__name__)


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