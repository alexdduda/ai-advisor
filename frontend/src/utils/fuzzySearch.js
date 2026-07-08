/**
 * Fuzzy course search correction utilities.
 *
 * Strategy:
 *  1. Normalize spacing — "COMP202" or "comp 202" → "COMP 202"
 *  2. Extract subject + catalog parts if recognisable
 *  3. If zero results come back, compute Levenshtein distance between the
 *     typed subject and every known McGill subject code, then retry with
 *     the closest match (≤ 2 edits away).
 *  4. For free-text queries (e.g. "introdcution to programming") run a
 *     simple token-level fuzzy match against known title fragments.
 */

// ── All active McGill subject prefixes ──────────────────────────────────────
export const KNOWN_SUBJECTS = [
  'ACCT','ANAT','ANTH','ARAB','ARBC','ARCG','ARCH','ARTH','ARTS',
  'ATOC','BIOL','BIOC','BMDE','BREE','CANS','CATH','CCOM','CDNS',
  'CHEM','CHIN','CHEE','CIVE','CLCV','CLAS','COMM','COMP','CONS',
  'DENT','DEWA','DNTP','DRSL','EARS','EAST','ECSE','EDEC','EDPE',
  'EDSL','EDUC','ENGL','ENGR','ENVB','ENVI','EPSC','ESYS','EXMD',
  'FINE','FREN','GEOG','GEOL','GERM','GKIR','GLAM','HIST','HLTH',
  'HRPD','HURO','IBUS','IDFT','INTD','IPHA','ISLA','ITAL','ITSN',
  'JRNL','KORE','LARC','LATI','LATN','LAWS','LING','LSCI','MASC',
  'MATH','MDPH','MGSC','MIMM','MNGT','MUSC','NASC','NEUR','NSCI',
  'NUTR','OCCU','OFFS','PHAR','PHGY','PHIL','PHYS','PLNT','POLI',
  'PORT','PSYC','PTOT','RELG','RELI','RUSS','SLIS','SLPG','SOCI',
  'SPAN','SPCH','SURG','SWRK','THEA','THEO','TURK','URBS','VETS',
  'WILD','WMST','YIDD',
]

// ── Levenshtein distance (capped at maxD for speed) ─────────────────────────
function levenshtein(a, b, maxD = 3) {
  if (Math.abs(a.length - b.length) > maxD) return maxD + 1
  const dp = Array.from({ length: a.length + 1 }, (_, i) => i)
  for (let j = 1; j <= b.length; j++) {
    let prev = j
    for (let i = 1; i <= a.length; i++) {
      const temp = dp[i - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)
      dp[i - 1] = prev
      prev = Math.min(prev + 1, dp[i] + 1, temp)
    }
    dp[a.length] = prev
    if (Math.min(...dp) > maxD) return maxD + 1
  }
  return dp[a.length]
}

// ── Closest known subjects (all ties at the best distance) ──────────────────
// Several subjects can sit at the same edit distance ("CMOP" is 2 edits from
// both CCOM and COMP), so return every tie and let the caller retry each in
// order. Anagrams of the typed prefix rank first — a same-letters candidate
// is almost always a letter-swap typo (CMOP → COMP), which plain Levenshtein
// under-ranks because it counts a transposition as two substitutions.
export function closestSubjects(typed, maxD = 2) {
  const upper = typed.toUpperCase().replace(/[^A-Z]/g, '')
  if (upper.length < 2) return []
  let bestD = maxD + 1
  let best = []
  for (const s of KNOWN_SUBJECTS) {
    const d = levenshtein(upper, s, maxD)
    if (d < bestD) { bestD = d; best = [s] }
    else if (d === bestD && d <= maxD) best.push(s)
  }
  if (bestD > maxD) return []
  const sortedUpper = [...upper].sort().join('')
  const isAnagram = (s) => [...s].sort().join('') === sortedUpper
  return best.sort((a, b) => (isAnagram(b) ? 1 : 0) - (isAnagram(a) ? 1 : 0))
}

// ── Closest known subject (returns null if nothing within maxD edits) ────────
export function closestSubject(typed, maxD = 2) {
  return closestSubjects(typed, maxD)[0] ?? null
}

// ── Normalise a raw user query ───────────────────────────────────────────────
// "comp202" → "COMP 202"
// "comp  202" → "COMP 202"
// "COMP202L" → "COMP 202"  (strip section letter if any)
const COURSE_CODE_RE = /^([A-Za-z]{2,6})\s*(\d{3}[A-Za-z]?)$/

export function normalizeQuery(raw) {
  const trimmed = raw.trim()
  const m = trimmed.match(COURSE_CODE_RE)
  if (m) {
    // Strip trailing letter suffix from catalog (e.g. 202L → 202)
    const catalog = m[2].replace(/[A-Za-z]+$/, '')
    return `${m[1].toUpperCase()} ${catalog}`
  }
  // Collapse multiple spaces
  return trimmed.replace(/\s+/g, ' ')
}

// ── Build correction candidates from a zero-result query ────────────────────
// Returns every closest-subject tie as its own candidate; the caller retries
// them in order and uses the first that produces results.
export function buildCorrectionCandidates(raw) {
  const normalized = normalizeQuery(raw)
  const parts = normalized.split(' ')

  const toCandidates = (subjectPart, catalog) =>
    closestSubjects(subjectPart)
      .filter(s => s !== subjectPart.toUpperCase())
      .map(s => ({ query: `${s} ${catalog}`, note: `${s} ${catalog}` }))

  // Might be a course code like "CMOP 202"
  if (parts.length >= 2 && /^\d{3}$/.test(parts[parts.length - 1])) {
    const candidates = toCandidates(parts.slice(0, -1).join(''), parts[parts.length - 1])
    if (candidates.length) return candidates
  }

  // Single token that looks like a malformed code e.g. "CMOP202"
  const m = raw.trim().match(/^([A-Za-z]{2,6})(\d{3})$/)
  if (m) {
    const candidates = toCandidates(m[1], m[2])
    if (candidates.length) return candidates
  }

  return []
}
