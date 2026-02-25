// frontend/src/lib/clubsAPI.js
// API client for clubs endpoints

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const normalizeUrl = (url) => {
  let normalized = url.replace(/\/$/, '')
  if (normalized.endsWith('/api')) normalized = normalized.slice(0, -4)
  return normalized
}

const BASE_URL = normalizeUrl(API_URL)

const clubsAPI = {
  async getClubs({ search, category, limit = 50 } = {}) {
    const params = new URLSearchParams()
    if (search)   params.set('search', search)
    if (category) params.set('category', category)
    params.set('limit', limit)
    const res = await fetch(`${BASE_URL}/api/clubs?${params}`)
    if (!res.ok) throw new Error('Failed to fetch clubs')
    return res.json()
  },

  async getStarterClubs(userId, major) {
    const params = new URLSearchParams({ user_id: userId })
    if (major) params.set('major', major)
    const res = await fetch(`${BASE_URL}/api/clubs/starter?${params}`)
    if (!res.ok) throw new Error('Failed to fetch starter clubs')
    return res.json()
  },

  async getUserClubs(userId) {
    const res = await fetch(`${BASE_URL}/api/clubs/user/${userId}`)
    if (!res.ok) throw new Error('Failed to fetch user clubs')
    return res.json()
  },

  async joinClub(userId, clubId) {
    const res = await fetch(`${BASE_URL}/api/clubs/user/${userId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ club_id: clubId }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Failed to join club')
    }
    return res.json()
  },

  async leaveClub(userId, clubId) {
    const res = await fetch(`${BASE_URL}/api/clubs/user/${userId}/leave/${clubId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to leave club')
    return res.json()
  },

  async toggleCalendarSync(userId, clubId, synced) {
    const res = await fetch(
      `${BASE_URL}/api/clubs/user/${userId}/calendar/${clubId}?synced=${synced}`,
      { method: 'PATCH' }
    )
    if (!res.ok) throw new Error('Failed to update calendar sync')
    return res.json()
  },

  async submitClub(data) {
    const res = await fetch(`${BASE_URL}/api/clubs/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Failed to submit club')
    }
    return res.json()
  },

  async getCategories() {
    const res = await fetch(`${BASE_URL}/api/clubs/categories`)
    if (!res.ok) throw new Error('Failed to fetch categories')
    return res.json()
  },
}

export default clubsAPI