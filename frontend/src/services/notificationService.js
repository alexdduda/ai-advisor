/**
 * notificationService.js
 * Talks to /api/notifications/* on the backend.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Save an event to Supabase and queue its notifications.
 * @param {object} event     - form data from EventModal
 * @param {string} userId    - Supabase auth user id
 * @param {string} userEmail - Account email (always used as recipient)
 */
export async function scheduleNotification(event, userId, userEmail) {
  const payload = {
    user_id:          userId,
    title:            event.title,
    date:             event.date,
    time:             event.time        || null,
    type:             event.type        || 'personal',
    category:         event.category    || null,
    description:      event.description || null,
    notify_enabled:   event.notifyEnabled ?? true,
    notify_email:     true,
    notify_sms:       false,
    notify_email_addr: userEmail,
    notify_phone:     null,
    notify_same_day:  event.notifySameDay ?? false,
    notify_1day:      event.notify1Day   ?? true,
    notify_7days:     event.notify7Days  ?? true,
    method:           'email',
  }

  const res = await fetch(`${BASE}/api/notifications/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to schedule notification')
  }

  return res.json()
}

/**
 * Fetch all calendar events for a user from Supabase.
 */
export async function getUserEvents(userId) {
  const res = await fetch(`${BASE}/api/notifications/events/${userId}`)
  if (!res.ok) throw new Error('Failed to fetch events')
  const data = await res.json()
  return data.events || []
}

/**
 * Delete an event (cascade removes its notification_queue rows).
 */
export async function deleteEvent(eventId, userId) {
  const res = await fetch(`${BASE}/api/notifications/events/${eventId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  })
  if (!res.ok) throw new Error('Failed to delete event')
  return res.json()
}
