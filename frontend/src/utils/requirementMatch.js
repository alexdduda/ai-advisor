/**
 * requirementMatch.js — shared course ↔ requirement matching.
 *
 * The bug this fixes: some degree-requirement blocks store a single
 * "wildcard placeholder" course instead of listing every eligible course.
 * e.g. the Anthropology Minor's "200-level ANTH Courses" block contains one
 * row: { subject:"ANTH", catalog:"200", title:"Any 200-level Anthropology
 * course" }. A student who took ANTH 209 got no credit because the old
 * matcher did an exact `"ANTH 209" === "ANTH 200"` comparison.
 *
 * wildcardBand() detects these placeholders from their title (and round-
 * hundred catalog) and returns the subject + catalog range they stand for,
 * so any course in that band matches. Applies to every program, so a
 * wildcard block in any faculty's requirements now resolves correctly.
 *
 * Patterns handled:
 *   "Any 200-level Anthropology course"      → ANTH 200–299
 *   "Any 300-level X course"                 → X   300–399
 *   "Any upper-level GERM course (300+)"     → GERM 300+
 *   "Any upper-level LING course"            → LING 300+
 *   round-hundred placeholder catalog (200)  → subject 200–299
 */

/** If `req` is a wildcard placeholder, return {subject, min, max}; else null. */
export function wildcardBand(req) {
  if (!req) return null
  const title = (req.title || '').toLowerCase()
  const looksWild = /\bany\b/.test(title) && /level/.test(title)
  if (!looksWild) return null

  const subject = (req.subject || '').toUpperCase()
  if (!subject) return null

  // "300+" / "(300+)" → open-ended from that level.
  let m = title.match(/(\d{3})\s*\+/)
  if (m) return { subject, min: parseInt(m[1], 10), max: Infinity }

  // "NNN-level" → that single hundred band.
  m = title.match(/(\d{3})\s*-?\s*level/)
  if (m) {
    const lvl = parseInt(m[1], 10)
    return { subject, min: lvl, max: lvl + 99 }
  }

  // "upper-level" with no explicit number → conventionally 300+.
  if (/upper[\s-]*level/.test(title)) return { subject, min: 300, max: Infinity }

  // Fallback: a round-hundred placeholder catalog (e.g. "200").
  const cat = parseInt(req.catalog, 10)
  if (!Number.isNaN(cat) && cat % 100 === 0) {
    return { subject, min: cat, max: cat + 99 }
  }
  return null
}

function keyOf(c) {
  return `${c?.subject || ''} ${c?.catalog || ''}`.toUpperCase()
}

/**
 * Every course code that appears as a real (non-wildcard) requirement row
 * anywhere in a program's blocks. Pass this as `excludeKeys` to matchCourse /
 * blockWildcardMatches to stop a wildcard/complementary block (e.g. "any
 * COMP 300+ course") from double-counting a course that already satisfies a
 * more specific requirement elsewhere in the SAME program (e.g. a Group D
 * requirement naming that exact course) — one course can't count toward two
 * different requirement categories at once.
 */
export function explicitlyClaimedCourseKeys(blocks = []) {
  const claimed = new Set()
  for (const block of blocks || []) {
    for (const c of block?.courses || []) {
      if (!c?.catalog || wildcardBand(c)) continue
      claimed.add(keyOf(c))
    }
  }
  return claimed
}

/**
 * Find the user course that satisfies requirement `req`, or null.
 * Handles both exact codes and wildcard-band placeholders.
 *
 * `excludeKeys` (optional): a Set of course keys to skip when resolving a
 * *wildcard* match — see explicitlyClaimedCourseKeys(). Exact-code matches
 * are never excluded, since a row explicitly naming a course is always
 * allowed to claim it.
 */
export function matchCourse(req, userCourses = [], excludeKeys = null) {
  const band = wildcardBand(req)
  if (band) {
    return userCourses.find(c => {
      if (excludeKeys && excludeKeys.has(keyOf(c))) return false
      if ((c.subject || '').toUpperCase() !== band.subject) return false
      const cat = parseInt(c.catalog, 10)
      return !Number.isNaN(cat) && cat >= band.min && cat <= band.max
    }) || null
  }

  if (!req.catalog) return null
  const key = `${req.subject} ${req.catalog}`.toUpperCase()
  return userCourses.find(c =>
    `${c.subject || ''} ${c.catalog || ''}`.toUpperCase() === key
  ) || null
}

/**
 * Every course the student has actually taken that `prog` could count —
 * whether by naming it explicitly or by claiming it through a wildcard /
 * complementary block.
 *
 * The overlap logic used to look only at requirement rows that name a course
 * outright, so a course that filled a wildcard block ("any 300-level ANTH") in
 * BOTH a major and a minor was counted twice with no way for the student to
 * say where it should go. Comparing these sets across programs is what turns
 * that into a single, assignable claim.
 */
export function programClaimableKeys(prog, userCourses = []) {
  const keys = new Set()
  if (!prog?.blocks) return keys

  const claims = explicitlyClaimedCourseKeys(prog.blocks)
  const takenKeys = new Set(userCourses.map(keyOf))

  for (const block of prog.blocks) {
    for (const c of block?.courses || []) {
      if (!c?.catalog || wildcardBand(c)) continue
      const k = keyOf(c)
      if (takenKeys.has(k)) keys.add(k)
    }
    for (const uc of blockWildcardMatches(block, userCourses, claims)) {
      keys.add(keyOf(uc))
    }
  }
  return keys
}

/**
 * Course keys that TWO OR MORE DIFFERENT programs would both count — the only
 * case where the student actually has to decide where a course goes.
 *
 * Counting distinct programs is the whole point. An earlier version kept a
 * single integer per course and incremented it once from the "programs that can
 * claim this taken course" pass and again from the "programs that name this
 * course in a requirement row" pass. Both passes see the SAME program for a
 * course the student has taken that their own program requires, so the counter
 * hit 2 and every such course was reported as overlapping. A Computer Science
 * major with an Anthropology minor — whose requirements share nothing — got an
 * "overlaps with another program" picker on all ten of their COMP/MATH rows.
 *
 * `programs` are the full program objects (needs `program_key` and `blocks`).
 */
export function overlappingCourseKeys(programs = [], userCourses = []) {
  const programsByCourse = new Map()
  const add = (courseKey, progKey) => {
    if (!progKey || !courseKey) return
    let progs = programsByCourse.get(courseKey)
    if (!progs) { progs = new Set(); programsByCourse.set(courseKey, progs) }
    progs.add(progKey)
  }

  for (const prog of programs) {
    if (!prog) continue
    // Courses the student has taken that this program could count.
    for (const k of programClaimableKeys(prog, userCourses)) add(k, prog.program_key)
    // Plus courses this program names outright, taken or not, so a conflict is
    // visible while planning.
    for (const block of prog.blocks || []) {
      for (const c of block?.courses || []) {
        if (!c?.catalog || wildcardBand(c)) continue
        add(keyOf(c), prog.program_key)
      }
    }
  }

  return new Set(
    [...programsByCourse.entries()].filter(([, progs]) => progs.size > 1).map(([k]) => k)
  )
}

/**
 * Return the user courses that satisfy a block's *wildcard* portion —
 * placeholder courses ("Any 200-level X course"), null-catalog entries, or
 * a block-level min_level. Does NOT apply any credit cap or de-dup against
 * exact matches; callers handle that bookkeeping (seen sets, overlap
 * allocation, per-block credit limits) themselves.
 *
 * `excludeKeys` (optional): a Set of course keys to never return — pass
 * explicitlyClaimedCourseKeys(programBlocks) so this block's wildcard slot
 * can't double-count a course a different block already claims by name.
 *
 * Used by all three progress computations (the program ring, the per-program
 * progress bar, and per-block credit counting) so they can't drift apart.
 */
export function blockWildcardMatches(block, userCourses = [], excludeKeys = null) {
  const bands = (block?.courses || []).map(c => wildcardBand(c)).filter(Boolean)
  const minLevel = block?.min_level || 0
  const legacyApplies = (block?.courses || []).some(c => !c.catalog) || minLevel > 0
  if (!legacyApplies && bands.length === 0) return []

  const blockSubjects = new Set(
    (block?.courses || []).map(c => (c.subject || '').toUpperCase()).filter(Boolean)
  )

  const out = []
  for (const uc of userCourses) {
    if (excludeKeys && excludeKeys.has(keyOf(uc))) continue
    const ucSubj = (uc.subject || '').toUpperCase()
    const ucLvl = parseInt(uc.catalog, 10)
    const inBand = bands.some(b =>
      b.subject === ucSubj && !Number.isNaN(ucLvl) && ucLvl >= b.min && ucLvl <= b.max)
    let inLegacy = legacyApplies && blockSubjects.has(ucSubj)
    if (inLegacy && minLevel > 0 && (Number.isNaN(ucLvl) || ucLvl < minLevel)) inLegacy = false
    if (inBand || inLegacy) out.push(uc)
  }
  return out
}
