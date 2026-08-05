import { describe, it, expect } from 'vitest'
import {
  wildcardBand,
  matchCourse,
  blockWildcardMatches,
  explicitlyClaimedCourseKeys,
  programClaimableKeys,
} from './requirementMatch'

const course = (subject, catalog, credits = 3) => ({ subject, catalog, credits })

// Shape used by the U0 Foundation seed: one per-subject wildcard row standing
// in for a whole approved-course category.
const wildRow = (subject, level, name) => ({
  subject,
  catalog: String(level),
  title: `Any ${level}-level ${name} course`,
  credits: 3,
})

describe('wildcardBand', () => {
  it('reads the band out of a Foundation category row', () => {
    expect(wildcardBand(wildRow('PHIL', 200, 'Philosophy')))
      .toEqual({ subject: 'PHIL', min: 200, max: 299 })
    expect(wildcardBand(wildRow('FRSL', 100, 'French as a Second Language')))
      .toEqual({ subject: 'FRSL', min: 100, max: 199 })
  })

  it('keeps parsing a parenthesised subject name', () => {
    // The Languages category names CLAS as "Classics (Latin / Ancient Greek)".
    expect(wildcardBand(wildRow('CLAS', 200, 'Classics (Latin / Ancient Greek)')))
      .toEqual({ subject: 'CLAS', min: 200, max: 299 })
  })

  it('returns null for a row that names a real course', () => {
    expect(wildcardBand({ subject: 'PSYC', catalog: '100', title: 'Introduction to Psychology' }))
      .toBeNull()
  })
})

describe('matchCourse against Foundation category rows', () => {
  const taken = [course('PHIL', '230'), course('SOCI', '210')]

  it('fills a category row with any course in the band', () => {
    expect(matchCourse(wildRow('PHIL', 200, 'Philosophy'), taken)).toEqual(course('PHIL', '230'))
  })

  it("doesn't fill a category the student has nothing in", () => {
    expect(matchCourse(wildRow('ARTH', 200, 'Art History'), taken)).toBeNull()
  })
})

describe('programClaimableKeys', () => {
  const foundation = {
    program_key: 'foundation_arts_ba',
    blocks: [
      { credits_needed: 6, courses: [wildRow('SOCI', 200, 'Sociology'), wildRow('POLI', 200, 'Political Science')] },
      { credits_needed: 6, courses: [wildRow('PHIL', 200, 'Philosophy')] },
    ],
  }
  const socioMinor = {
    program_key: 'sociology_minor',
    blocks: [
      { credits_needed: 18, courses: [course('SOCI', '210'), course('SOCI', '211')] },
    ],
  }

  it('claims courses matched by name', () => {
    const keys = programClaimableKeys(socioMinor, [course('SOCI', '210')])
    expect([...keys]).toEqual(['SOCI 210'])
  })

  it('claims courses matched only through a wildcard block', () => {
    // This is the case the old overlap check missed entirely.
    const keys = programClaimableKeys(foundation, [course('SOCI', '210'), course('PHIL', '230')])
    expect(keys.has('SOCI 210')).toBe(true)
    expect(keys.has('PHIL 230')).toBe(true)
  })

  it('ignores courses the student has not taken', () => {
    const keys = programClaimableKeys(socioMinor, [course('SOCI', '210')])
    expect(keys.has('SOCI 211')).toBe(false)
  })

  it('surfaces a course two programs would both count', () => {
    const taken = [course('SOCI', '210')]
    const a = programClaimableKeys(foundation, taken)
    const b = programClaimableKeys(socioMinor, taken)
    expect(a.has('SOCI 210') && b.has('SOCI 210')).toBe(true)
  })

  it('returns an empty set for a missing program', () => {
    expect(programClaimableKeys(null, [course('SOCI', '210')]).size).toBe(0)
  })
})

describe('explicitlyClaimedCourseKeys', () => {
  it('lists named rows but not wildcard placeholders', () => {
    const blocks = [{ courses: [course('EAST', '220'), wildRow('EAST', 200, 'East Asian Studies')] }]
    expect([...explicitlyClaimedCourseKeys(blocks)]).toEqual(['EAST 220'])
  })

  it('stops a category wildcard from also claiming a course named elsewhere', () => {
    // EAST 220 is listed by name under Languages, so the Humanities "any
    // 200-level EAST course" row must not count it a second time.
    const block = { credits_needed: 6, courses: [wildRow('EAST', 200, 'East Asian Studies')] }
    const claims = explicitlyClaimedCourseKeys([{ courses: [course('EAST', '220')] }])
    expect(blockWildcardMatches(block, [course('EAST', '220')], claims)).toEqual([])
    expect(blockWildcardMatches(block, [course('EAST', '211')], claims)).toEqual([course('EAST', '211')])
  })
})
