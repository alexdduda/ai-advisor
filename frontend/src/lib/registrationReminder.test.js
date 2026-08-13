import { describe, it, expect, vi, beforeEach } from 'vitest'

const scheduleNotification = vi.fn(async () => ({ ok: true }))
vi.mock('../services/notificationService', () => ({ scheduleNotification }))

const { scheduleRegistrationReminder, REGISTRATION_EVENT_CLIENT_ID } =
  await import('./registrationReminder')

/**
 * Two ways this silently does nothing, both hit while building it:
 *
 *  - posting straight to /api/notifications/schedule omits notify_email_addr,
 *    and _queue_notifications only writes a row `if event.notify_email and
 *    email_addr` — the event lands on the calendar and never reminds anyone.
 *  - without a stable client_id the endpoint inserts rather than upserts, so a
 *    student correcting their time ends up with two events and two reminders.
 *
 * Delegating to notificationService fixes the first (it resolves the address
 * and the student's prefs); the clientId fixes the second.
 */
describe('scheduleRegistrationReminder', () => {
  beforeEach(() => scheduleNotification.mockClear())

  const call = () =>
    scheduleRegistrationReminder('u1', 'a@mail.mcgill.ca', '2027-05-28', '09:00', { method: 'email' })

  it('goes through notificationService, not a raw fetch', async () => {
    await call()
    expect(scheduleNotification).toHaveBeenCalledOnce()
  })

  it('passes the account email through so the backend can queue anything', async () => {
    await call()
    const [, userId, userEmail] = scheduleNotification.mock.calls[0]
    expect(userId).toBe('u1')
    expect(userEmail).toBe('a@mail.mcgill.ca')
  })

  it('forwards the student notification prefs rather than overriding them', async () => {
    await call()
    expect(scheduleNotification.mock.calls[0][3]).toEqual({ method: 'email' })
  })

  it('reminds the day before, and not same-day', async () => {
    await call()
    const ev = scheduleNotification.mock.calls[0][0]
    expect(ev.notify1Day).toBe(true)
    // A same-day email can arrive after an early-morning registration slot.
    expect(ev.notifySameDay).toBe(false)
    expect(ev.notify7Days).toBe(false)
  })

  it('uses a stable clientId so a corrected time updates instead of duplicating', async () => {
    await call()
    await call()
    const ids = scheduleNotification.mock.calls.map(c => c[0].clientId)
    expect(ids).toEqual([REGISTRATION_EVENT_CLIENT_ID, REGISTRATION_EVENT_CLIENT_ID])
  })

  it('lands on the calendar as a dated academic deadline', async () => {
    await call()
    const ev = scheduleNotification.mock.calls[0][0]
    expect(ev.date).toBe('2027-05-28')
    expect(ev.time).toBe('09:00')
    expect(ev.type).toBe('academic')
    expect(ev.category).toBe('deadlines')
  })

  it('accepts a date with no time, for students who only know the day', async () => {
    await scheduleRegistrationReminder('u1', 'a@mail.mcgill.ca', '2027-05-28', null)
    expect(scheduleNotification.mock.calls[0][0].time).toBeNull()
  })
})
