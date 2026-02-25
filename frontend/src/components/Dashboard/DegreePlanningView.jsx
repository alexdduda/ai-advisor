import React, { useState, useEffect, useMemo } from 'react'
import {
  FaHeart, FaRegHeart, FaCheckCircle, FaStar, FaBook,
  FaBullseye, FaFileUpload, FaChevronDown, FaChevronUp,
  FaGraduationCap, FaListAlt, FaLightbulb, FaExternalLinkAlt,
  FaChevronRight, FaCircle, FaBolt
} from 'react-icons/fa'
import { useLanguage } from '../../contexts/LanguageContext'
import DegreeProgressTracker from './DegreeProgressTracker'
import DegreeRequirementsView from './DegreeRequirementsView'
import './DegreePlanningView.css'

// Fix double /api/api bug
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_BASE = rawBase.replace(/\/api\/?$/, '')

// Map profile major/minor names to program_keys
function toProgramKey(name, type = 'major') {
  if (!name) return null
  const map = {
    'Anthropology': 'anthropology',
    'Art History': 'art_history',
    'Economics': 'economics',
    'Political Science': 'political_science',
    'Psychology': 'psychology',
    'Sociology': 'sociology',
    'Linguistics': 'linguistics',
    'History': 'history',
    'Philosophy': 'philosophy',
    'English': 'english_literature',
    'Communication Studies': 'communication_studies',
    'International Development Studies': 'intl_development',
    'Gender, Sexuality, Feminist and Social Justice Studies': 'gsfsj',
    'Canadian Studies': 'canadian_studies',
    'Classical Studies': 'classics',
    'Jewish Studies': 'jewish_studies',
    'East Asian Studies': 'east_asian_studies',
    'Geography': 'geography',
    'Computer Science': 'computer_science_arts',
    'German Studies': 'german_studies',
    'Hispanic Studies': 'hispanic_studies',
    'Italian Studies': 'italian_studies',
    'Religious Studies': 'religious_studies',
    'African Studies': 'african_studies',
    'Information Studies': 'information_studies',
    'Latin American and Caribbean Studies': 'latin_american_caribbean',
  }
  const slug = map[name] || name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  return `${slug}_${type}`
}

function matchCourse(req, userCourses) {
  if (!req.catalog) return null
  const key = `${req.subject} ${req.catalog}`.toUpperCase()
  return userCourses.find(c =>
    `${c.subject || ''} ${c.catalog || ''}`.toUpperCase() === key
  ) || null
}

// Transfer credits show as done but do NOT count toward credits
function normalizeCode(code) {
  return (code || '').toUpperCase()
    .replace(/([A-Z])(\d)/g, '$1 $2')  // COMP202 -> COMP 202
    .replace(/\s+/g, ' ')
    .trim()
}
function matchTransfer(req, advancedStanding = [], { requireMajorCredit = false } = {}) {
  if (!req.catalog) return false
  const key = normalizeCode(`${req.subject} ${req.catalog}`)
  return advancedStanding.some(t => {
    if (normalizeCode(t.course_code) !== key) return false
    if (requireMajorCredit) return !!t.counts_toward_major
    return true
  })
}

// ── Accordion ─────────────────────────────────────────────────────────────────
function AccordionCard({ icon, title, count, accentColor, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`dp-accordion ${open ? 'dp-accordion--open' : ''}`}>
      <button className="dp-accordion-header" onClick={() => setOpen(o => !o)}>
        <div className="dp-accordion-left">
          <span className="dp-accordion-icon" style={{ color: accentColor }}>{icon}</span>
          <span className="dp-accordion-title">{title}</span>
          {count != null && count > 0 && (
            <span className="dp-accordion-badge" style={{ background: accentColor }}>{count}</span>
          )}
        </div>
        <span className="dp-accordion-chevron">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {open && <div className="dp-accordion-body">{children}</div>}
    </div>
  )
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="dp-empty">
      <span className="dp-empty-icon">{icon}</span>
      <p className="dp-empty-title">{title}</p>
      <p className="dp-empty-sub">{subtitle}</p>
    </div>
  )
}

function CourseRow({ course, onClick, actions }) {
  return (
    <div className="dp-course-row">
      <div className="dp-course-info" onClick={onClick}>
        <span className="dp-course-code">{course.subject} {course.catalog}</span>
        <span className="dp-course-title">{course.course_title || course.title}</span>
        {(course.term || course.year || course.credits) && (
          <span className="dp-course-meta">
            {course.term && course.year ? `${course.term} ${course.year}` : ''}
            {course.credits ? ` · ${course.credits} cr` : ''}
          </span>
        )}
      </div>
      <div className="dp-course-actions">{actions}</div>
    </div>
  )
}


// ── Electives Panel ────────────────────────────────────────────────────────────
function ElectivesPanel({ profile, completedCourses, currentCourses, programData, minorData }) {
  const [recs, setRecs]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const allCourses = [...completedCourses, ...currentCourses]
  const courseList = allCourses.map(c => `${c.subject} ${c.catalog} ${c.course_title || ''}`).join(', ')

  const generateRecs = async () => {
    setLoading(true)
    setError(null)
    try {
      const advancedStanding = profile?.advanced_standing || []
      const allCourses = [...completedCourses, ...currentCourses]
      const coursesTaken = [
        ...allCourses.map(c => `${c.subject} ${c.catalog} ${c.course_title || ''}`.trim()),
        ...advancedStanding.map(t => `${t.course_code} ${t.course_title || '(transfer)'}`.trim()),
      ]

      // Build list of required major/minor courses to exclude from electives
      const requiredCodes = new Set()
      ;[programData, minorData].forEach(prog => {
        prog?.blocks?.forEach(b => b.courses?.forEach(c => {
          if (c.catalog) requiredCodes.add(`${c.subject} ${c.catalog}`.toUpperCase())
        }))
      })
      const excludeCourses = Array.from(requiredCodes)

      const res = await fetch(`${API_BASE}/api/electives/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          major:          profile?.major        || null,
          minor:          profile?.minor        || null,
          concentration:  profile?.concentration|| null,
          year:           profile?.year         || null,
          interests:      profile?.interests    || null,
          courses_taken:  coursesTaken,
          exclude_courses: excludeCourses,
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.detail || 'Failed')
      setRecs(data.data)
    } catch(e) {
      setError('Could not generate recommendations. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate when profile changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { generateRecs() }, [profile?.major, profile?.minor, profile?.interests, courseList])

  const CATEGORY_COLORS = {
    'Breadth':         { bg: '#eff6ff', color: '#1d4ed8' },
    'Career':          { bg: '#f0fdf4', color: '#15803d' },
    'Advanced':        { bg: '#faf5ff', color: '#7c3aed' },
    'Interdisciplinary': { bg: '#fff7ed', color: '#c2410c' },
    'Interest':        { bg: '#fef9c3', color: '#92400e' },
  }

  return (
    <div className="dp-electives">
      <div className="dp-electives-header">
        <div className="dp-electives-title-row">
          <span className="dp-electives-spark">✦</span>
          <div>
            <h3 className="dp-electives-title">Recommended Electives</h3>
            <p className="dp-electives-sub">
              Personalized for {[profile?.major, profile?.minor].filter(Boolean).join(' + ')}
              {profile?.interests ? ` · ${profile.interests}` : ''}
            </p>
          </div>
        </div>
        <button className="dp-electives-refresh" onClick={generateRecs} disabled={loading}>
          {loading ? '...' : '↻'}
        </button>
      </div>

      {loading && (
        <div className="dp-electives-loading">
          <div className="dp-req-spinner" />
          <span>Generating personalized recommendations…</span>
        </div>
      )}

      {error && !loading && (
        <div className="dp-electives-error">
          {error}
          <button onClick={generateRecs}>Retry</button>
        </div>
      )}

      {recs && !loading && (
        <>
          {recs.theme && (
            <p className="dp-electives-theme">💡 {recs.theme}</p>
          )}
          <div className="dp-electives-grid">
            {recs.recommendations?.map((c, i) => {
              const alreadyTaken = [...completedCourses, ...currentCourses].some(uc =>
                `${uc.subject} ${uc.catalog}`.toUpperCase() === `${c.subject} ${c.catalog}`.toUpperCase()
              )
              const catStyle = CATEGORY_COLORS[c.category] || CATEGORY_COLORS['Breadth']
              return (
                <div key={i} className={`dp-elective-card ${alreadyTaken ? 'dp-elective-card--taken' : ''}`}>
                  <div className="dp-elective-top">
                    <span className="dp-elective-code">{c.subject} {c.catalog}</span>
                    <span className="dp-elective-cat" style={{ background: catStyle.bg, color: catStyle.color }}>
                      {c.category}
                    </span>
                    {alreadyTaken && <span className="dp-elective-taken">✓ Taking</span>}
                  </div>
                  <p className="dp-elective-title">{c.title}</p>
                  <p className="dp-elective-why">{c.why}</p>
                  <span className="dp-elective-credits">{c.credits} cr</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ── My Program Requirements card ──────────────────────────────────────────────
function ProgramSection({ prog, completedCourses, currentCourses, advStanding, openBlocks, setOpenBlocks }) {
  if (!prog) return null

  // Progress: count all matched non-transfer courses toward total_credits
  const totalCredits = prog.total_credits || 36
  let earnedCredits = 0
  const seenKeys = new Set()
  prog.blocks?.forEach(b => b.courses?.forEach(c => {
    if (!c.catalog) return
    const key = `${c.subject} ${c.catalog}`.toUpperCase()
    if (seenKeys.has(key)) return
    seenKeys.add(key)
    const isTransfer = matchTransfer(c, advStanding)
    if (!isTransfer) {
      const inCompleted = completedCourses.some(uc => `${uc.subject} ${uc.catalog}`.toUpperCase() === key)
      const inCurrent   = currentCourses.some(uc => `${uc.subject} ${uc.catalog}`.toUpperCase() === key)
      if (inCompleted || inCurrent) earnedCredits += parseFloat(c.credits || 3)
    }
  }))
  const pct = Math.min(100, Math.round((earnedCredits / totalCredits) * 100))

  return (
    <div className="dp-prog-section">
      {/* Progress bar */}
      <div className="dp-prog-bar-wrap">
        <div className="dp-prog-bar-track">
          <div className="dp-prog-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="dp-prog-bar-label">{earnedCredits} / {totalCredits} credits</span>
      </div>

      {/* Blocks */}
      {prog.blocks?.map(block => {
        const isOpen = openBlocks[block.id]
        // For block progress: count matched courses (any, not just is_required)
        const blockCourses = block.courses?.filter(c => c.catalog) || []
        const blockMatched = blockCourses.filter(c => {
          const key = `${c.subject} ${c.catalog}`.toUpperCase()
          if (matchTransfer(c, advStanding)) return false
          return completedCourses.some(uc => `${uc.subject} ${uc.catalog}`.toUpperCase() === key) ||
                 currentCourses.some(uc => `${uc.subject} ${uc.catalog}`.toUpperCase() === key)
        })
        const creditsNeeded = block.credits_needed || 0
        const creditsEarned = blockMatched.reduce((s, c) => s + parseFloat(c.credits || 3), 0)
        const blockDone = creditsNeeded > 0 && creditsEarned >= creditsNeeded

        return (
          <div key={block.id} className={`dp-req-block ${blockDone ? 'dp-req-block--done' : ''}`}>
            <button
              className="dp-req-block-header"
              onClick={() => setOpenBlocks(p => ({ ...p, [block.id]: !p[block.id] }))}
            >
              <div className="dp-req-block-left">
                <span className="dp-req-block-chevron">{isOpen ? <FaChevronDown /> : <FaChevronRight />}</span>
                <span className="dp-req-block-name">{block.title}</span>
                {block.credits_needed && <span className="dp-req-block-cr">{block.credits_needed}cr</span>}
              </div>
              <div className="dp-req-block-right">
                <span className={`dp-req-pill ${blockDone ? 'dp-req-pill--done' : ''}`}>
                  {blockDone ? '✓' : `${creditsEarned}/${creditsNeeded}cr`}
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="dp-req-block-courses">
                {block.notes && <p className="dp-req-block-note">{block.notes}</p>}
                {block.courses?.map(c => {
                  const key = `${c.subject} ${c.catalog}`.toUpperCase()
                  const isTransfer = matchTransfer(c, advStanding)
                  const done = isTransfer || completedCourses.some(uc => `${uc.subject} ${uc.catalog}`.toUpperCase() === key)
                  const taking = !done && currentCourses.some(uc => `${uc.subject} ${uc.catalog}`.toUpperCase() === key)
                  return (
                    <div key={c.id} className={`dp-req-course ${done ? 'dp-req-course--done' : ''} ${taking ? 'dp-req-course--taking' : ''}`}>
                      {done
                        ? <FaCheckCircle className="dp-req-course-icon dp-req-course-icon--done" />
                        : taking
                          ? <FaCircle className="dp-req-course-icon dp-req-course-icon--taking" />
                          : <FaCircle className="dp-req-course-icon dp-req-course-icon--empty" />
                      }
                      <span className="dp-req-course-code">{c.subject} {c.catalog || '•••'}</span>
                      <span className="dp-req-course-title">{c.title}</span>
                      {done && isTransfer  && <span className="dp-req-transfer-tag">Transfer</span>}
                      {done && !isTransfer && <span className="dp-req-done-tag">Done</span>}
                      {taking             && <span className="dp-req-taking-tag">Taking</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function MyProgramCard({ profile, completedCourses, currentCourses }) {
  const [programData, setProgramData] = useState(null)
  const [minorData, setMinorData]     = useState(null)
  const [loading, setLoading]         = useState(false)
  const [seeding, setSeeding]         = useState(false)
  const [openBlocks, setOpenBlocks]   = useState({})
  const [activeTab, setActiveTab]     = useState('major')
  const [loadFailed, setLoadFailed]   = useState(false)

  const advStanding = profile?.advanced_standing || []
  const majorKey    = toProgramKey(profile?.major, 'major')
  const minorKey    = toProgramKey(profile?.minor, 'minor')

  const fetchProgram = async (key, setter, autoSeedOnMiss = false) => {
    if (!key) return
    try {
      const res = await fetch(`${API_BASE}/api/degree-requirements/programs/${key}`, {
        cache: 'no-store'
      })
      if (res.status === 404) {
        if (autoSeedOnMiss) {
          // Trigger seed and wait for it to fully complete
          await fetch(`${API_BASE}/api/degree-requirements/seed`, { method: 'POST' })
          // Poll up to 8 times (up to ~16s) for the program to appear
          for (let i = 0; i < 8; i++) {
            await new Promise(r => setTimeout(r, 2000))
            const retry = await fetch(`${API_BASE}/api/degree-requirements/programs/${key}`, { cache: 'no-store' })
            if (retry.ok) {
              const retryData = await retry.json()
              setter(retryData)
              setOpenBlocks(prev => {
                const init = { ...prev }
                retryData.blocks?.forEach((b, i) => { if (i < 2) init[b.id] = true })
                return init
              })
              return
            }
          }
        }
        return
      }
      if (!res.ok) return
      const data = await res.json()
      setter(data)
      setOpenBlocks(prev => {
        const init = { ...prev }
        data.blocks?.forEach((b, i) => { if (i < 2) init[b.id] = true })
        return init
      })
    } catch {}
  }

  // profile loads async — track whether we've fetched once this session
  const fetchedRef = React.useRef(false)

  useEffect(() => {
    // Wait until profile is loaded (non-null) before fetching
    if (!profile) return
    if (!majorKey && !minorKey) return
    setLoading(true)
    setLoadFailed(false)
    setProgramData(null)
    setMinorData(null)
    fetchedRef.current = true
    Promise.all([
      fetchProgram(majorKey, setProgramData, true),
      fetchProgram(minorKey, setMinorData, true),
    ]).finally(() => setLoading(false))
  // profile being truthy for first time triggers this, as do key changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [majorKey, minorKey, !!profile])

  // Re-render on course changes — no re-fetch needed, just re-renders
  const allCourseKeys = useMemo(
    () => [...completedCourses, ...currentCourses].map(c => `${c.subject} ${c.catalog}`).join(','),
    [completedCourses, currentCourses]
  )

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await fetch(`${API_BASE}/api/degree-requirements/seed`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        await Promise.all([
          fetchProgram(majorKey, setProgramData, true),
          fetchProgram(minorKey, setMinorData, true),
        ])
      }
    } catch {}
    finally { setSeeding(false) }
  }

  if (!profile?.major && !profile?.minor) return null

  const hasMajor = !!programData
  const hasMinor = !!minorData
  const hasAny   = hasMajor || hasMinor

  // Tabs: only show tabs that have data or are expected
  const tabs = []
  if (profile?.major) tabs.push({ id: 'major', label: profile.major, data: programData })
  if (profile?.minor) tabs.push({ id: 'minor', label: profile.minor, data: minorData })
  const currentTabData = tabs.find(t => t.id === activeTab)?.data

  // Quick progress for ring display
  const calcRingProgress = (prog) => {
    if (!prog) return { pct: 0, earned: 0, total: prog?.total_credits || 36 }
    const total = prog.total_credits || 36
    let earned = 0
    const seen = new Set()
    prog.blocks?.forEach(b => b.courses?.forEach(c => {
      if (!c.catalog) return
      const key = `${c.subject} ${c.catalog}`.toUpperCase()
      if (seen.has(key)) return
      seen.add(key)
      if (matchTransfer(c, advStanding)) return
      const matched = completedCourses.some(uc => `${uc.subject} ${uc.catalog}`.toUpperCase() === key) ||
                      currentCourses.some(uc => `${uc.subject} ${uc.catalog}`.toUpperCase() === key)
      if (matched) earned += parseFloat(c.credits || 3)
    }))
    return { pct: Math.min(100, Math.round((earned / total) * 100)), earned, total }
  }

  const majorRing = calcRingProgress(programData)
  const minorRing = calcRingProgress(minorData)

  return (
    <div className="dp-req-card">
      <div className="dp-req-card-header">
        <span className="dp-req-card-icon"><FaListAlt /></span>
        <div>
          <h2 className="dp-req-card-title">My Program Requirements</h2>
          <p className="dp-req-card-sub">
            {[profile?.major, profile?.minor].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      {loading && (
        <div className="dp-req-loading"><div className="dp-req-spinner" /> Loading requirements…</div>
      )}

      {!loading && !hasAny && (
        <div className="dp-req-empty">
          <p>Requirements not loaded yet.</p>
          <button className="dp-req-seed-btn" onClick={handleSeed} disabled={seeding}>
            <FaBolt /> {seeding ? 'Loading…' : 'Load Requirements'}
          </button>
        </div>
      )}

      {!loading && hasAny && (
        <div className="dp-req-body">

          {/* Progress rings */}
          <div className="dp-req-progress-row">
            {hasMajor && (
              <div className="dp-req-progress-item">
                <div className="dp-req-ring">
                  <svg viewBox="0 0 36 36" className="dp-req-ring-svg">
                    <circle cx="18" cy="18" r="15.9" className="dp-req-ring-bg" />
                    <circle cx="18" cy="18" r="15.9"
                      className="dp-req-ring-fill dp-req-ring-fill--major"
                      strokeDasharray={`${majorRing.pct} ${100 - majorRing.pct}`}
                      strokeDashoffset="25"
                    />
                  </svg>
                  <span className="dp-req-ring-label">{majorRing.pct}%</span>
                </div>
                <div className="dp-req-prog-text">
                  <span className="dp-req-prog-name">Major</span>
                  <span className="dp-req-prog-detail">{majorRing.earned}/{majorRing.total} credits</span>
                </div>
              </div>
            )}
            {hasMinor && (
              <div className="dp-req-progress-item">
                <div className="dp-req-ring">
                  <svg viewBox="0 0 36 36" className="dp-req-ring-svg">
                    <circle cx="18" cy="18" r="15.9" className="dp-req-ring-bg" />
                    <circle cx="18" cy="18" r="15.9"
                      className="dp-req-ring-fill dp-req-ring-fill--minor"
                      strokeDasharray={`${minorRing.pct} ${100 - minorRing.pct}`}
                      strokeDashoffset="25"
                    />
                  </svg>
                  <span className="dp-req-ring-label">{minorRing.pct}%</span>
                </div>
                <div className="dp-req-prog-text">
                  <span className="dp-req-prog-name">Minor</span>
                  <span className="dp-req-prog-detail">{minorRing.earned}/{minorRing.total} credits</span>
                </div>
              </div>
            )}
          </div>

          {/* Tab switcher: Major / Minor / Electives */}
          <div className="dp-prog-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`dp-prog-tab ${activeTab === tab.id ? 'dp-prog-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.id === 'major' ? 'Major' : 'Minor'}: {tab.label}
              </button>
            ))}
            <button
              className={`dp-prog-tab ${activeTab === 'electives' ? 'dp-prog-tab--active dp-prog-tab--electives' : ''}`}
              onClick={() => setActiveTab('electives')}
            >
              ✦ Electives
            </button>
          </div>

          {/* Active program blocks */}
          {activeTab !== 'electives' && (
            <ProgramSection
              prog={currentTabData}
              completedCourses={completedCourses}
              currentCourses={currentCourses}
              advStanding={advStanding}
              openBlocks={openBlocks}
              setOpenBlocks={setOpenBlocks}
            />
          )}

          {/* Electives tab */}
          {activeTab === 'electives' && (
            <ElectivesPanel
              profile={profile}
              completedCourses={completedCourses}
              currentCourses={currentCourses}
              programData={programData}
              minorData={minorData}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DegreePlanningView({
  favorites = [],
  completedCourses = [],
  currentCourses = [],
  completedCoursesMap = new Set(),
  currentCoursesMap = new Set(),
  favoritesMap = new Set(),
  profile = {},
  onToggleFavorite,
  onToggleCompleted,
  onToggleCurrent,
  onCourseClick,
  onImportTranscript,
}) {
  const { t } = useLanguage()
  const [subTab, setSubTab] = useState('my_courses')

  const isCompleted = (s, c) => completedCoursesMap.has(`${s} ${c}`)
  const isCurrent   = (s, c) => currentCoursesMap.has(`${s} ${c}`)
  const isFavorited = (s, c) => favoritesMap.has(`${s}${c}`)

  return (
    <div className="dp-view">

      {/* ── Beautiful sub-tabs ────────────────────────────── */}
      <div className="dp-subtab-bar">
        <button
          className={`dp-subtab-btn ${subTab === 'my_courses' ? 'dp-subtab-btn--active' : ''}`}
          onClick={() => setSubTab('my_courses')}
        >
          <FaGraduationCap className="dp-subtab-icon" />
          <span>My Courses</span>
          {(favorites.length + completedCourses.length + currentCourses.length) > 0 && (
            <span className="dp-subtab-count">
              {favorites.length + completedCourses.length + currentCourses.length}
            </span>
          )}
        </button>
        <button
          className={`dp-subtab-btn ${subTab === 'requirements' ? 'dp-subtab-btn--active' : ''}`}
          onClick={() => setSubTab('requirements')}
        >
          <FaListAlt className="dp-subtab-icon" />
          <span>Degree Requirements</span>
        </button>
      </div>

      {/* ── Degree Requirements tab ───────────────────────── */}
      {subTab === 'requirements' && (
        <div className="dp-req-tab-wrap">
          <DegreeRequirementsView
            completedCourses={completedCourses}
            currentCourses={currentCourses}
            profile={profile}
          />
        </div>
      )}

      {/* ── My Courses tab ────────────────────────────────── */}
      {subTab === 'my_courses' && (
        <>
          {/* Degree Progress */}
          <div className="dp-section-card">
            <div className="dp-section-header">
              <span className="dp-section-icon"><FaBullseye /></span>
              <h2 className="dp-section-title">{t('profile.degreeProgress')}</h2>
              {onImportTranscript && (
                <button className="dp-import-btn" onClick={onImportTranscript}>
                  <FaFileUpload /> Import Transcript
                </button>
              )}
            </div>
            <DegreeProgressTracker completedCourses={completedCourses} profile={profile} />
          </div>

          {/* My Program Requirements card */}
          <MyProgramCard
            profile={profile}
            completedCourses={completedCourses}
            currentCourses={currentCourses}
          />

          {/* Saved Courses */}
          <AccordionCard
            icon={<FaStar />}
            title={t('saved.savedCourses') || 'Saved Courses'}
            count={favorites.length}
            accentColor="var(--accent-primary)"
          >
            {favorites.length === 0 ? (
              <EmptyState icon={<FaStar />} title="No Saved Courses Yet" subtitle="Save courses from the Course Explorer to see them here" />
            ) : (
              <div className="dp-course-list">
                {favorites.map((course, idx) => (
                  <CourseRow
                    key={idx}
                    course={course}
                    onClick={() => onCourseClick?.(course)}
                    actions={<>
                      <button
                        className="dp-action-btn dp-action-btn--fav dp-action-btn--active"
                        onClick={e => { e.stopPropagation(); onToggleFavorite?.({ subject: course.subject, catalog: course.catalog, title: course.course_title }) }}
                        title="Remove from saved"
                      ><FaHeart /></button>
                      {onToggleCompleted && (
                        <button
                          className={`dp-action-btn dp-action-btn--done ${isCompleted(course.subject, course.catalog) ? 'dp-action-btn--active dp-action-btn--done-active' : ''}`}
                          onClick={e => { e.stopPropagation(); onToggleCompleted({ subject: course.subject, catalog: course.catalog, title: course.course_title }) }}
                          title={isCompleted(course.subject, course.catalog) ? 'Mark incomplete' : 'Mark completed'}
                        ><FaCheckCircle /></button>
                      )}
                      {onToggleCurrent && (
                        <button
                          className={`dp-action-btn dp-action-btn--cur ${isCurrent(course.subject, course.catalog) ? 'dp-action-btn--active dp-action-btn--cur-active' : ''}`}
                          onClick={e => { e.stopPropagation(); onToggleCurrent({ subject: course.subject, catalog: course.catalog, title: course.course_title }) }}
                          title={isCurrent(course.subject, course.catalog) ? 'Remove from current' : 'Add to current'}
                        ><FaBook /></button>
                      )}
                    </>}
                  />
                ))}
              </div>
            )}
          </AccordionCard>

          {/* Current Courses */}
          <AccordionCard
            icon={<FaBook />}
            title="Current Courses"
            count={currentCourses.length}
            accentColor="#1d4ed8"
          >
            {currentCourses.length === 0 ? (
              <EmptyState icon={<FaBook />} title="No Current Courses" subtitle="Add courses you're enrolled in this semester from the Course Explorer" />
            ) : (
              <div className="dp-course-list">
                {currentCourses.map((course, idx) => (
                  <CourseRow
                    key={idx}
                    course={{ ...course, term: 'Current', year: '' }}
                    onClick={() => onCourseClick?.(course)}
                    actions={<>
                      {onToggleFavorite && (
                        <button
                          className={`dp-action-btn dp-action-btn--fav ${isFavorited(course.subject, course.catalog) ? 'dp-action-btn--active' : ''}`}
                          onClick={e => { e.stopPropagation(); onToggleFavorite({ subject: course.subject, catalog: course.catalog, title: course.course_title }) }}
                        >{isFavorited(course.subject, course.catalog) ? <FaHeart /> : <FaRegHeart />}</button>
                      )}
                      {onToggleCompleted && (
                        <button
                          className={`dp-action-btn dp-action-btn--done ${isCompleted(course.subject, course.catalog) ? 'dp-action-btn--active dp-action-btn--done-active' : ''}`}
                          onClick={e => { e.stopPropagation(); onToggleCompleted({ subject: course.subject, catalog: course.catalog, title: course.course_title }) }}
                        ><FaCheckCircle /></button>
                      )}
                      <button
                        className="dp-action-btn dp-action-btn--cur dp-action-btn--active dp-action-btn--cur-active"
                        onClick={e => { e.stopPropagation(); onToggleCurrent?.({ subject: course.subject, catalog: course.catalog, title: course.course_title }) }}
                      ><FaBook /></button>
                    </>}
                  />
                ))}
              </div>
            )}
          </AccordionCard>

          {/* Completed Courses */}
          <AccordionCard
            icon={<FaCheckCircle />}
            title={t('saved.completed') || 'Completed Courses'}
            count={completedCourses.length}
            accentColor="#16a34a"
            defaultOpen={false}
          >
            {completedCourses.length === 0 ? (
              <EmptyState icon={<FaGraduationCap />} title="No Completed Courses Yet" subtitle="Mark courses as completed to track your progress" />
            ) : (
              <div className="dp-course-list">
                {completedCourses.map((course, idx) => (
                  <CourseRow
                    key={idx}
                    course={course}
                    onClick={() => onCourseClick?.(course)}
                    actions={<>
                      {course.grade && <span className="dp-grade-badge">{course.grade}</span>}
                      {onToggleFavorite && (
                        <button
                          className={`dp-action-btn dp-action-btn--fav ${isFavorited(course.subject, course.catalog) ? 'dp-action-btn--active' : ''}`}
                          onClick={e => { e.stopPropagation(); onToggleFavorite({ subject: course.subject, catalog: course.catalog, title: course.course_title }) }}
                        >{isFavorited(course.subject, course.catalog) ? <FaHeart /> : <FaRegHeart />}</button>
                      )}
                      <button
                        className="dp-action-btn dp-action-btn--done dp-action-btn--active dp-action-btn--done-active"
                        onClick={e => { e.stopPropagation(); onToggleCompleted?.({ subject: course.subject, catalog: course.catalog, title: course.course_title }) }}
                      ><FaCheckCircle /></button>
                    </>}
                  />
                ))}
              </div>
            )}
          </AccordionCard>
        </>
      )}
    </div>
  )
}
