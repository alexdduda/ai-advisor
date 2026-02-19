import { createContext, useContext, useState, useCallback } from 'react'

const TimezoneContext = createContext(null)

const TIMEZONES = [
  // Canada
  { value: 'America/Montreal',     label: 'Montreal / Toronto (ET)' },
  { value: 'America/Vancouver',    label: 'Vancouver (PT)' },
  { value: 'America/Edmonton',     label: 'Calgary / Edmonton (MT)' },
  { value: 'America/Winnipeg',     label: 'Winnipeg (CT)' },
  { value: 'America/Halifax',      label: 'Halifax (AT)' },
  { value: 'America/St_Johns',     label: "St. John's (NT)" },
  // USA
  { value: 'America/New_York',     label: 'New York (ET)' },
  { value: 'America/Chicago',      label: 'Chicago (CT)' },
  { value: 'America/Denver',       label: 'Denver (MT)' },
  { value: 'America/Los_Angeles',  label: 'Los Angeles (PT)' },
  { value: 'Pacific/Honolulu',     label: 'Honolulu (HT)' },
  // Europe
  { value: 'Europe/London',        label: 'London (GMT/BST)' },
  { value: 'Europe/Paris',         label: 'Paris / Brussels (CET)' },
  { value: 'Europe/Berlin',        label: 'Berlin / Amsterdam (CET)' },
  { value: 'Europe/Rome',          label: 'Rome / Madrid (CET)' },
  { value: 'Europe/Athens',        label: 'Athens / Helsinki (EET)' },
  { value: 'Europe/Moscow',        label: 'Moscow (MSK)' },
  // Asia
  { value: 'Asia/Dubai',           label: 'Dubai (GST)' },
  { value: 'Asia/Karachi',         label: 'Karachi / Islamabad (PKT)' },
  { value: 'Asia/Kolkata',         label: 'Mumbai / Delhi (IST)' },
  { value: 'Asia/Dhaka',           label: 'Dhaka (BST)' },
  { value: 'Asia/Bangkok',         label: 'Bangkok / Jakarta (ICT)' },
  { value: 'Asia/Shanghai',        label: 'Beijing / Shanghai (CST)' },
  { value: 'Asia/Tokyo',           label: 'Tokyo (JST)' },
  { value: 'Asia/Seoul',           label: 'Seoul (KST)' },
  { value: 'Asia/Singapore',       label: 'Singapore (SGT)' },
  { value: 'Asia/Hong_Kong',       label: 'Hong Kong (HKT)' },
  // Middle East & Africa
  { value: 'Africa/Cairo',         label: 'Cairo (EET)' },
  { value: 'Africa/Johannesburg',  label: 'Johannesburg (SAST)' },
  { value: 'Africa/Lagos',         label: 'Lagos / Accra (WAT)' },
  // Pacific & Oceania
  { value: 'Australia/Sydney',     label: 'Sydney / Melbourne (AEST)' },
  { value: 'Australia/Perth',      label: 'Perth (AWST)' },
  { value: 'Pacific/Auckland',     label: 'Auckland (NZST)' },
  // Latin America
  { value: 'America/Sao_Paulo',    label: 'São Paulo / Rio (BRT)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/Bogota',       label: 'Bogotá / Lima (COT)' },
  { value: 'America/Mexico_City',  label: 'Mexico City (CST)' },
  // UTC
  { value: 'UTC',                  label: 'UTC' },
]

export { TIMEZONES }

export function TimezoneProvider({ children }) {
  const [timezone, setTimezoneState] = useState(
    () => localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
  )

  const setTimezone = useCallback((tz) => {
    setTimezoneState(tz)
    localStorage.setItem('timezone', tz)
  }, [])

  // Get today's date string "YYYY-MM-DD" in the selected timezone
  const getTodayStr = useCallback(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: timezone })
  }, [timezone])

  // Get a timezone-aware "now" Date for year/month/day calculations
  const getNow = useCallback(() => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }))
  }, [timezone])

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone, getTodayStr, getNow, TIMEZONES }}>
      {children}
    </TimezoneContext.Provider>
  )
}

export function useTimezone() {
  const ctx = useContext(TimezoneContext)
  if (!ctx) throw new Error('useTimezone must be used inside TimezoneProvider')
  return ctx
}
