import { describe, it, expect } from 'vitest'
import { PENDING_CARD_PREFIX, isPendingCardId } from './pendingCard'

/**
 * A placeholder card exists only in the browser until the model answers, so its
 * id has no row in `advisor_cards`. Every handler that takes a card id checks
 * this before calling the API — save, delete, reorder. A false negative here
 * means a request against an id the server has never seen.
 */
describe('isPendingCardId', () => {
  it('recognises an id built from the prefix', () => {
    expect(isPendingCardId(`${PENDING_CARD_PREFIX}${Date.now()}`)).toBe(true)
  })

  it('rejects a real card id', () => {
    // advisor_cards.id is a uuid
    expect(isPendingCardId('8f9022ad-ac43-40ce-b2d7-5d9c8f2f95a7')).toBe(false)
  })

  it('is not a valid uuid, so it can never collide with a real id', () => {
    const id = `${PENDING_CARD_PREFIX}${Date.now()}`
    expect(id).not.toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  it('only matches at the start, not anywhere in the string', () => {
    expect(isPendingCardId(`abc${PENDING_CARD_PREFIX}123`)).toBe(false)
  })

  it.each([null, undefined, '', 0, 42, {}, [], NaN])('handles %s without throwing', (v) => {
    expect(isPendingCardId(v)).toBe(false)
  })
})
