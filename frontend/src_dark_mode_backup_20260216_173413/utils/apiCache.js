/**
 * frontend/src/utils/apiCache.js
 *
 * Simple client-side cache with timestamp invalidation.
 * Prevents identical API requests from hitting the backend repeatedly.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

class ApiCache {
  constructor(ttlMs = DEFAULT_TTL_MS) {
    this._store = new Map()
    this._ttlMs = ttlMs
  }

  /**
   * Get a cached value by key, or null if expired/missing.
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const entry = this._store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key)
      return null
    }
    return entry.value
  }

  /**
   * Store a value with optional custom TTL.
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlMs]
   */
  set(key, value, ttlMs) {
    this._store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs || this._ttlMs),
    })
  }

  /**
   * Remove a specific key.
   * @param {string} key
   */
  invalidate(key) {
    this._store.delete(key)
  }

  /** Flush entire cache. */
  clear() {
    this._store.clear()
  }
}

// Shared singleton for course search results
export const courseSearchCache = new ApiCache()

// Shared singleton for subject list (rarely changes)
export const subjectsCache = new ApiCache(60 * 60 * 1000) // 1 hour

export default ApiCache