import { describe, it, expect } from 'vitest'
import { normalizeQuery, closestSubject, closestSubjects, buildCorrectionCandidates } from './fuzzySearch'

describe('normalizeQuery', () => {
  it('normalizes compact codes', () => {
    expect(normalizeQuery('comp202')).toBe('COMP 202')
    expect(normalizeQuery('COMP  202')).toBe('COMP 202')
    expect(normalizeQuery('comp202L')).toBe('COMP 202')
  })
})

describe('closestSubjects', () => {
  it('ranks anagram (letter-swap) candidates first among distance ties', () => {
    // CMOP is 2 edits from both CCOM and COMP; COMP is the anagram.
    expect(closestSubjects('CMOP')[0]).toBe('COMP')
    expect(closestSubjects('CMOP')).toContain('CCOM')
  })

  it('returns empty for hopeless input', () => {
    expect(closestSubjects('ZZZZZZ')).toEqual([])
  })

  it('closestSubject returns the top-ranked tie', () => {
    expect(closestSubject('CMOP')).toBe('COMP')
    expect(closestSubject('MTAH')).toBe('MATH')
  })
})

describe('buildCorrectionCandidates', () => {
  it('emits one candidate per closest-subject tie, best first', () => {
    const candidates = buildCorrectionCandidates('CMOP 202')
    expect(candidates[0].query).toBe('COMP 202')
    expect(candidates.length).toBeGreaterThan(1)
  })

  it('handles compact single-token codes', () => {
    expect(buildCorrectionCandidates('MTAH240')[0].query).toBe('MATH 240')
  })

  it('returns nothing for already-valid subjects', () => {
    expect(buildCorrectionCandidates('COMP 202')).toEqual([])
  })
})
