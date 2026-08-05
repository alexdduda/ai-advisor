/**
 * foundationYear.js — the U0 / Freshman year, shared by the planner and the
 * requirements browser.
 *
 * The Foundation year is the 30-credit first year taken by students admitted
 * to a 120-credit degree (entering without CEGEP). It is a program in its own
 * right: McGill's rule is that a course used for the Foundation program cannot
 * also be counted toward a major, minor or concentration. Seeded by
 * backend/api/seeds/foundation_degree_requirements.py.
 */

export const FOUNDATION_PROGRAM_KEYS = new Set([
  'foundation_arts_ba',
  'foundation_science_bsc',
  'foundation_basc',
])

/** The Foundation program a student's entry faculty puts them in, or null. */
export function foundationProgramKey(faculty = '') {
  const fl = (faculty || '').toLowerCase()
  if (fl.includes('arts & science') || fl.includes('arts and science')) return 'foundation_basc'
  if (fl.includes('science')) return 'foundation_science_bsc'
  if (fl.includes('arts')) return 'foundation_arts_ba'
  // Other faculties (Engineering, Management, Music, …) run their own U0
  // structures that aren't seeded yet — better no tab than a wrong one.
  return null
}

/**
 * Is this student doing, or have they done, the Foundation year?
 *
 * `foundation_year` is the explicit profile answer. It can be null for accounts
 * created before the field existed, so fall back to "currently U0". That
 * fallback deliberately doesn't try to guess for U1+ students — someone who
 * finished U0 last year ticks the box in their profile.
 */
export function isFoundationStudent(profile) {
  if (profile?.foundation_year === true) return true
  if (profile?.foundation_year === false) return false
  return Number(profile?.year) === 0
}
