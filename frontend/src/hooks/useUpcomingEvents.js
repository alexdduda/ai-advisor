/**
 * useUpcomingEvents — lightweight "what's next" feed for the Home tab.
 *
 * Merges the user's calendar events (with weekly recurrences expanded)
 * and final exams for their current courses, then returns the next
 * `limit` upcoming entries sorted by date/time.
 *
 * Deliberately simpler than CalendarTab's pipeline (no club events,
 * newsletters, or historical exams) — Home only needs a glanceable
 * "Up Next" list. Cached via userDataCache for instant first paint.
 */
import { useState, useEffect } from 'react'
import { getEvents, expandRecurringEvents } from '../lib/calendarAPI'
import { lookupExams } from '../utils/examSchedule'
import { readCache, writeCache } from '../lib/userDataCache'

const CACHE_PREFIX = 'home_upcoming'
const URGENT_WINDOW_DAYS = 7

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function buildFeed(userEvents, currentCourses) {
  const today = todayIso()

  const expanded = expandRecurringEvents(userEvents)
    .filter(ev => ev.date >= today)
    .map(ev => ({
      id: ev.id,
      title: ev.title,
      date: ev.date,
      time: ev.time || '',
      type: ev.type || 'personal',
      course_code: ev.course_code || '',
      location: ev.location || '',
    }))

  // Future final exams for current courses (student is presumably enrolled)
  const seen = new Set()
  const examEvents = []
  for (const course of currentCourses || []) {
    const code = course.course_code
    if (!code || seen.has(code)) continue
    seen.add(code)
    for (const exam of lookupExams(code)) {
      if (exam.date >= today) {
        examEvents.push({
          id: `exam-${code}-${exam.date}`,
          title: `${code} Final Exam`,
          date: exam.date,
          time: exam.start || '',
          type: 'exam',
          course_code: code,
          location: exam.campus || '',
        })
      }
    }
  }

  const all = [...expanded, ...examEvents].sort(
    (a, b) => a.date.localeCompare(b.date) || (a.time || '99').localeCompare(b.time || '99')
  )

  const urgentCutoff = new Date()
  urgentCutoff.setDate(urgentCutoff.getDate() + URGENT_WINDOW_DAYS)
  const cutoffIso = `${urgentCutoff.getFullYear()}-${String(urgentCutoff.getMonth() + 1).padStart(2, '0')}-${String(urgentCutoff.getDate()).padStart(2, '0')}`

  return {
    all,
    urgentCount: all.filter(ev => ev.date <= cutoffIso).length,
    // Setup-checklist signal: has the user imported a class schedule /
    // syllabus? (any calendar event tied to a course, past or future)
    hasCourseEvents: userEvents.some(ev => ev.course_code),
  }
}

export default function useUpcomingEvents(user, currentCourses, { limit = 5 } = {}) {
  const userId = user?.id

  const [feed, setFeed] = useState(() =>
    readCache(CACHE_PREFIX, userId, { all: [], urgentCount: 0, hasCourseEvents: false })
  )
  const [loading, setLoading] = useState(() => feed.all.length === 0)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    getEvents(userId)
      .then(userEvents => {
        if (cancelled) return
        const next = buildFeed(userEvents, currentCourses)
        setFeed(next)
        writeCache(CACHE_PREFIX, userId, next)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // currentCourses is identified by length — Dashboard replaces the array
    // wholesale on import, and per-item edits don't affect exam lookup keys.
  }, [userId, currentCourses?.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    events: feed.all.slice(0, limit),
    urgentCount: feed.urgentCount,
    hasCourseEvents: feed.hasCourseEvents,
    loading,
  }
}
