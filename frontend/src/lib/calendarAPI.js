/**
 * frontend/src/lib/calendarAPI.js
 *
 * Fix #16: Replaces direct localStorage reads/writes for user calendar events
 * with Supabase persistence.  The table uses RLS so users can only access
 * their own rows — no server-side API route is required.
 *
 * All functions are async and resolve to the event array or throw on error.
 * CalendarTab.jsx uses these in place of the old setUserEvents + useEffect
 * that wrote to localStorage.
 */

import { createClient } from '@supabase/supabase-js'

// Re-use the same Supabase client the rest of the frontend uses.
// Import from wherever your project initialises it; adjust the path if needed.
import { supabase } from './supabase'   // e.g. frontend/src/lib/supabase.js

const TABLE = 'calendar_events'

// ── Column mapping ────────────────────────────────────────────────────────────
// JS event objects use camelCase; the DB uses snake_case.
// These two functions convert between them.

function toDb(event, userId) {
  return {
    id:              event.id,
    user_id:         userId,
    title:           event.title,
    date:            event.date,
    time:            event.time    || null,
    type:            event.type    || 'personal',
    category:        event.category || null,
    description:     event.description || null,
    notify_enabled:  event.notifyEnabled  ?? false,
    notify_same_day: event.notifySameDay  ?? false,
    notify_1_day:    event.notify1Day     ?? false,
    notify_7_days:   event.notify7Days    ?? false,
  }
}

function fromDb(row) {
  return {
    id:            row.id,
    title:         row.title,
    date:          row.date,          // 'YYYY-MM-DD' string — same as JS format
    time:          row.time || '',
    type:          row.type,
    category:      row.category || '',
    description:   row.description || '',
    notifyEnabled: row.notify_enabled,
    notifySameDay: row.notify_same_day,
    notify1Day:    row.notify_1_day,
    notify7Days:   row.notify_7_days,
  }
}

// ── API ───────────────────────────────────────────────────────────────────────

/**
 * Fetch all events for a user.
 * Returns an array of JS event objects, sorted by date ascending.
 */
export async function getEvents(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (error) throw error
  return (data || []).map(fromDb)
}

/**
 * Upsert a single event (insert or update).
 * Pass the full JS event object; userId is required for the user_id column.
 * Returns the saved event object.
 */
export async function saveEvent(event, userId) {
  const row = toDb(event, userId)

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return fromDb(data)
}

/**
 * Delete a single event by ID.
 */
export async function deleteEvent(eventId, userId) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId)   // belt-and-suspenders; RLS already enforces this

  if (error) throw error
}

/**
 * Migrate existing localStorage events into Supabase for a user.
 * Call this once after the user logs in.  Skips events that already
 * exist (upsert on id).  Clears localStorage after a successful migration.
 */
export async function migrateLocalStorageEvents(userId) {
  const LS_KEY = 'mcgill_calendar_events'
  let localEvents = []
  try {
    localEvents = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return
  }

  if (localEvents.length === 0) return

  const rows = localEvents.map(e => toDb(e, userId))

  const { error } = await supabase
    .from(TABLE)
    .upsert(rows, { onConflict: 'id' })

  if (error) {
    console.error('Failed to migrate localStorage events:', error)
    return
  }

  // Only clear localStorage after a confirmed successful write
  localStorage.removeItem(LS_KEY)
  console.info(`Migrated ${localEvents.length} calendar events from localStorage to Supabase`)
}