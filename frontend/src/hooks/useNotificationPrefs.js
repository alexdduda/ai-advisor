import { useState, useEffect } from 'react'

const STORAGE_KEY = 'mcgill_notification_prefs'

const DEFAULT_PREFS = {
  method: 'email',          // 'email' | 'sms' | 'both' | 'none'
  email: '',                // filled from account email on first load
  phone: '',
  timing: {
    sameDay: false,
    oneDay: true,
    oneWeek: true,
  },
  eventTypes: {
    academic: true,
    union: true,
    club: true,
    personal: true,
  },
}

function loadPrefs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Deep merge with defaults to handle new keys added over time
      return {
        ...DEFAULT_PREFS,
        ...parsed,
        timing: { ...DEFAULT_PREFS.timing, ...(parsed.timing || {}) },
        eventTypes: { ...DEFAULT_PREFS.eventTypes, ...(parsed.eventTypes || {}) },
      }
    }
  } catch (_) {}
  return { ...DEFAULT_PREFS }
}

export default function useNotificationPrefs(accountEmail) {
  const [prefs, setPrefsState] = useState(loadPrefs)

  // Seed email from account on first load if not set
  useEffect(() => {
    if (accountEmail && !prefs.email) {
      setPrefsState(p => {
        const updated = { ...p, email: accountEmail }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    }
  }, [accountEmail]) // eslint-disable-line

  const setPrefs = (updater) => {
    setPrefsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return [prefs, setPrefs]
}
