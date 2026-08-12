/**
 * Placeholder advisor cards.
 *
 * When a student asks a freeform question we put a card in the feed and open
 * its chat immediately, before the model has answered, so the question is on
 * screen the moment they send it. That card has no row in `advisor_cards` yet,
 * so its id is local-only and must never be sent to the API — every handler
 * that takes a card id checks isPendingCardId() first.
 *
 * The prefix is deliberately not a valid UUID, so a placeholder id can never
 * collide with a real card id.
 */
export const PENDING_CARD_PREFIX = 'pending-card:'

export function isPendingCardId(cardId) {
  return typeof cardId === 'string' && cardId.startsWith(PENDING_CARD_PREFIX)
}
