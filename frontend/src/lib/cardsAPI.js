const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const normalizeUrl = (url) => {
  let normalized = url.replace(/\/$/, '')
  if (normalized.endsWith('/api')) normalized = normalized.slice(0, -4)
  return normalized
}

const BASE_URL = normalizeUrl(API_URL)

export const CARD_CATEGORIES = [
  'deadlines',
  'degree',
  'courses',
  'grades',
  'planning',
  'opportunities',
]

export const CATEGORY_LABELS = {
  deadlines:     'Deadlines',
  degree:        'Degree',
  courses:       'Courses',
  grades:        'Grades',
  planning:      'Planning',
  opportunities: 'Opportunities',
}

export const CATEGORY_ICONS = {
  deadlines:     '📅',
  degree:        '🎓',
  courses:       '📚',
  grades:        '📊',
  planning:      '🗺️',
  opportunities: '✨',
}

const cardsAPI = {
  /** Fetch stored cards instantly — call on load */
  async getCards(userId) {
    const response = await fetch(`${BASE_URL}/api/cards/${userId}`)
    if (!response.ok) throw new Error('Failed to fetch advisor cards')
    return response.json()
  },

  /** Trigger card generation (skips if fresh unless force=true) */
  async generateCards(userId, force = false) {
    const response = await fetch(`${BASE_URL}/api/cards/generate/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force }),
    })
    if (!response.ok) throw new Error('Failed to generate advisor cards')
    return response.json()
  },

  /**
   * User asks a freeform question.
   * Returns { card } — a single new card inserted at top of feed.
   */
  async askCard(userId, question) {
    const response = await fetch(`${BASE_URL}/api/cards/ask/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, question }),
    })
    if (!response.ok) throw new Error('Failed to generate card from question')
    return response.json()
  },

  /** Follow-up message inside a card thread. Returns the AI's reply string. */
  async sendThreadMessage(cardId, userId, message, cardContext) {
    const response = await fetch(`${BASE_URL}/api/cards/${cardId}/thread`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, message, card_context: cardContext }),
    })
    if (!response.ok) throw new Error('Failed to send thread message')
    const data = await response.json()
    return data.response
  },

  /** Permanently delete a single card from the DB */
  async deleteCard(userId, cardId) {
    const response = await fetch(`${BASE_URL}/api/cards/${userId}/${cardId}`, {
      method: 'DELETE',
    })
    // 204 No Content on success, 404 if already gone — both are fine
    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to delete card')
    }
  },

  /** Clear AI-generated, non-saved cards */
  async clearCards(userId) {
    const response = await fetch(`${BASE_URL}/api/cards/${userId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to clear advisor cards')
  },

  /**
   * Pin or unpin a card so it survives the nightly 3am regeneration.
   * Returns the updated card object.
   */
  async saveCard(cardId, isSaved) {
    const response = await fetch(`${BASE_URL}/api/cards/${cardId}/save`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_saved: isSaved }),
    })
    if (!response.ok) throw new Error('Failed to update card saved state')
    return response.json()
  },

  /**
   * Persist a new drag-and-drop order.
   * @param {string} userId
   * @param {Array<{id: string, sort_order: number}>} order
   */
  async reorderCards(userId, order) {
    const response = await fetch(`${BASE_URL}/api/cards/${userId}/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    })
    if (!response.ok) throw new Error('Failed to reorder cards')
    return response.json()
  },
}

export default cardsAPI
