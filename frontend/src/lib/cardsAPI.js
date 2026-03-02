import { BASE_URL } from './apiConfig'

export const CARD_CATEGORIES = [
  'deadlines',
  'degree',
  'courses',
  'grades',
  'planning',
  'opportunities',
  'other',
]

export const CATEGORY_LABELS = {
  deadlines:     'Deadlines',
  degree:        'Degree',
  courses:       'Courses',
  grades:        'Grades',
  planning:      'Planning',
  opportunities: 'Opportunities',
  other:         'Other',
}

export const CATEGORY_ICONS = {
  deadlines:     '📅',
  degree:        '🎓',
  courses:       '📚',
  grades:        '📊',
  planning:      '🗺️',
  opportunities: '✨',
  other:         '💬',
}

/** Always read language directly from localStorage so every request is current. */
function getLang() {
  return localStorage.getItem('language') === 'fr' ? 'fr' : 'en'
}

const cardsAPI = {
  async getCards(userId) {
    const response = await fetch(`${BASE_URL}/api/cards/${userId}`)
    if (!response.ok) throw new Error('Failed to fetch advisor cards')
    return response.json()
  },

  async generateCards(userId, force = false) {
    const response = await fetch(`${BASE_URL}/api/cards/generate/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force, language: getLang() }),
    })
    if (!response.ok) throw new Error('Failed to generate advisor cards')
    return response.json()
  },

  /** Re-generate all non-saved user-asked cards in the current language. */
  async retranslateCards(userId) {
    const response = await fetch(`${BASE_URL}/api/cards/retranslate/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: getLang() }),
    })
    if (!response.ok) throw new Error('Failed to retranslate cards')
    return response.json()
  },

  async askCard(userId, question) {
    const response = await fetch(`${BASE_URL}/api/cards/ask/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, question, language: getLang() }),
    })
    if (!response.ok) throw new Error('Failed to generate card from question')
    return response.json()
  },

  async sendThreadMessage(cardId, userId, message, cardContext) {
    const response = await fetch(`${BASE_URL}/api/cards/${cardId}/thread`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, message, card_context: cardContext, language: getLang() }),
    })
    if (!response.ok) throw new Error('Failed to send thread message')
    const data = await response.json()
    return data.response
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
