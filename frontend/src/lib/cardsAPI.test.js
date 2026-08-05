import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('./supabase', () => ({
  supabase: {
    auth: { getSession: async () => ({ data: { session: { access_token: 'test-token' } } }) },
  },
}))

const { default: cardsAPI } = await import('./cardsAPI')

/** The JSON body of the single fetch call made by the API under test. */
function sentBody() {
  return JSON.parse(global.fetch.mock.calls[0][1].body)
}

describe('cardsAPI.sendThreadMessage', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ response: 'ok' }) }))
  })
  afterEach(() => { vi.restoreAllMocks() })

  it('sends the prior conversation so a short follow-up can be resolved', async () => {
    // The bug this guards: without thread_history, a reply of "A" to the
    // advisor's own "A or B?" reached Claude with no idea what A was.
    const history = [
      { role: 'user', content: 'What should I take next term?' },
      { role: 'assistant', content: 'Would you rather focus on (A) stats or (B) theory?' },
    ]
    await cardsAPI.sendThreadMessage('card-1', 'user-1', 'A', 'Title: Body', 'en', null, history)

    expect(sentBody().thread_history).toEqual(history)
  })

  it('omits history on the first message of a thread', async () => {
    await cardsAPI.sendThreadMessage('card-1', 'user-1', 'Hi', 'Title: Body', 'en', null, [])
    expect(sentBody().thread_history).toBeUndefined()
  })

  it('drops malformed turns rather than sending them to the model', async () => {
    await cardsAPI.sendThreadMessage('card-1', 'user-1', 'A', 'Title: Body', 'en', null, [
      { role: 'user', content: 'real' },
      { role: 'system', content: 'not a conversational turn' },
      { role: 'assistant', content: '' },
      null,
    ])
    expect(sentBody().thread_history).toEqual([{ role: 'user', content: 'real' }])
  })

  it('caps history at the 16 turns the backend accepts', async () => {
    const long = Array.from({ length: 40 }, (_, i) => ({ role: 'user', content: `m${i}` }))
    await cardsAPI.sendThreadMessage('card-1', 'user-1', 'A', 'Title: Body', 'en', null, long)

    const sent = sentBody().thread_history
    expect(sent).toHaveLength(16)
    expect(sent[15].content).toBe('m39')   // keeps the most recent turns
  })

  it('still works when no history is passed at all', async () => {
    await cardsAPI.sendThreadMessage('card-1', 'user-1', 'Hi', 'Title: Body')
    expect(sentBody().thread_history).toBeUndefined()
  })
})
