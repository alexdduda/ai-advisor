import { describe, it, expect } from 'vitest'
import {
  wildcardBand,
  matchCourse,
  blockWildcardMatches,
  explicitlyClaimedCourseKeys,
  programClaimableKeys,
  overlappingCourseKeys,
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

describe('overlappingCourseKeys', () => {
  // The real shape that produced the bug: a Computer Science major that names
  // its courses outright, plus an Anthropology minor made entirely of wildcard
  // bands. Nothing is shared between them.
  const csMajor = {
    program_key: 'computer_science_arts_major',
    blocks: [
      { title: 'Required Courses', courses: [course('COMP', '250'), course('COMP', '206')] },
      { title: 'Group A', courses: [course('MATH', '222'), course('MATH', '323')] },
    ],
  }
  const anthMinor = {
    program_key: 'anthropology_minor',
    blocks: [
      { title: '200-level', courses: [wildRow('ANTH', 200, 'Anthropology')] },
      { title: '300+', courses: [wildRow('ANTH', 300, 'Anthropology')] },
    ],
  }
  const taken = [course('COMP', '250'), course('COMP', '206'), course('MATH', '222'), course('ANTH', '209')]

  it('reports nothing when two programs share no courses', () => {
    // Regression: each of these was counted twice — once as a course the
    // student had taken that CS can claim, once as a course CS names — so all
    // four came back as "overlapping with another program" when no second
    // program wanted any of them.
    expect([...overlappingCourseKeys([csMajor, anthMinor], taken)]).toEqual([])
  })

  it('still reports a course two different programs both name', () => {
    const statsMinor = {
      program_key: 'statistics_minor',
      blocks: [{ title: 'Required', courses: [course('MATH', '222')] }],
    }
    expect([...overlappingCourseKeys([csMajor, statsMinor], taken)]).toEqual(['MATH 222'])
  })

  it('still reports a course one program names and another claims by wildcard', () => {
    const anthMajor = {
      program_key: 'anthropology_major',
      blocks: [{ title: 'Required', courses: [course('ANTH', '209')] }],
    }
    // ANTH 209 is named by the major and swept up by the minor's 200-level band.
    expect([...overlappingCourseKeys([anthMajor, anthMinor], taken)]).toEqual(['ANTH 209'])
  })

  it('does not report a course a single program both names and claims', () => {
    expect([...overlappingCourseKeys([csMajor], taken)]).toEqual([])
  })

  it('ignores programs with no program_key rather than merging them', () => {
    const anon = { blocks: [{ courses: [course('COMP', '250')] }] }
    expect([...overlappingCourseKeys([csMajor, anon], taken)]).toEqual([])
  })
})

describe('open-ended level bands ("or above")', () => {
  const band = (subject, catalog, title) => wildcardBand({ subject, catalog, title })

  it('reads "300-level ... or above" as open-ended, not a single hundred', () => {
    // McGill's phrasing for 300/400/500. Reading it as 300–399 silently dropped
    // every 400- and 500-level course toward the requirement — on a real
    // account, COMP 421 and COMP 559 landed in Electives instead.
    const b = band('COMP', '300', 'Any 300-level COMP course or above (excluding COMP 396).')
    expect(b).toEqual({ subject: 'COMP', min: 300, max: Infinity })
  })

  it.each([
    ['Any 300-level or above Geography course', 'GEOG', '300'],
    ['Any COMP course at 300 level or above (excluding specified projects)', 'COMP', '300'],
    ['Any MUHL course at 300-level or higher', 'MUHL', '300'],
    ['Any Psychology course at 300-level or above', 'PSYC', '300'],
  ])('handles %s', (title, subject, catalog) => {
    expect(band(subject, catalog, title).max).toBe(Infinity)
  })

  it('parses "NNN+" phrasing that never mentions "level"', () => {
    // These rows have a null catalog, so failing to produce a band dropped them
    // into the legacy any-course-in-this-subject path.
    expect(band('COMP', null, 'Any COMP course at 300+')).toEqual({ subject: 'COMP', min: 300, max: Infinity })
    expect(band('MATH', null, 'Any MATH statistics course at 400+')).toEqual({ subject: 'MATH', min: 400, max: Infinity })
  })

  it('leaves a plain single-hundred band closed', () => {
    expect(band('ANTH', '200', 'Any 200-level Anthropology course')).toEqual({ subject: 'ANTH', min: 200, max: 299 })
    expect(band('ANTH', '300', 'Any 300-level Anthropology course')).toEqual({ subject: 'ANTH', min: 300, max: 399 })
  })

  it('a parseable null-catalog row no longer triggers the legacy catch-all', () => {
    // Before: "Any MATH course at 300+" produced no band AND had a null
    // catalog, so the block matched every MATH course the student had.
    const block = { credits_needed: 6, courses: [{ subject: 'MATH', catalog: null, title: 'Any MATH course at 300+' }] }
    const taken = [course('MATH', '133'), course('MATH', '323'), course('COMP', '250')]
    expect(blockWildcardMatches(block, taken)).toEqual([course('MATH', '323')])
  })

  it('still falls back to the catch-all for a row it cannot interpret', () => {
    const block = { credits_needed: 6, courses: [{ subject: 'MATH', catalog: null, title: 'Mathematics elective' }] }
    const taken = [course('MATH', '133'), course('COMP', '250')]
    expect(blockWildcardMatches(block, taken)).toEqual([course('MATH', '133')])
  })
})
