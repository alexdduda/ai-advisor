import { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  FaGraduationCap, FaChevronDown, FaChevronUp, FaChevronRight,
  FaCheckCircle, FaCircle, FaStar, FaSearch,
  FaLightbulb, FaExternalLinkAlt, FaTimes, FaBolt
} from 'react-icons/fa'
import './DegreeRequirementsView.css'

// Fix double /api/api bug — strip trailing /api from env var
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_BASE = rawBase.replace(/\/api\/?$/, '')

const TYPE_LABELS = {
  major: 'Major', minor: 'Minor', honours: 'Honours', joint_honours: 'Joint Honours',
}
const TYPE_COLORS = {
  major: '#2563eb', minor: '#7c3aed', honours: '#b45309', joint_honours: '#0f766e',
}
const TYPE_BG = {
  major: '#eff6ff', minor: '#f5f3ff', honours: '#fef3c7', joint_honours: '#f0fdfa',
}

function matchCourse(req, userCourses) {
  if (!req.catalog) return null
  const key = `${req.subject} ${req.catalog}`.toUpperCase()
  return userCourses.find(c => {
    const cKey = `${c.subject || ''} ${c.catalog || ''}`.toUpperCase()
    return cKey === key
  }) || null
}

export default function DegreeRequirementsView({ completedCourses = [], currentCourses = [], profile = {} }) {
  const [programs, setPrograms]           = useState([])
  const [selectedKey, setSelectedKey]     = useState(null)
  const [programDetail, setProgramDetail] = useState(null)
  const [loading, setLoading]             = useState(false)
  const [seeding, setSeeding]             = useState(false)
  const [seedDone, setSeedDone]           = useState(false)
  const [error, setError]                 = useState(null)
  const [search, setSearch]               = useState('')
  const [typeFilter, setTypeFilter]       = useState('all')
  const [openBlocks, setOpenBlocks]       = useState({})
  const [showAllCourses, setShowAllCourses] = useState({})
  const [showRecommended, setShowRecommended] = useState(false)
  const [sidebarOpen, setSidebarOpen]     = useState(true)
  const [facultyFilter, setFacultyFilter] = useState('Faculty of Arts')

  const allUserCourses = useMemo(
    () => [...completedCourses, ...currentCourses],
    [completedCourses, currentCourses]
  )

  useEffect(() => {
    const fParam = facultyFilter ? `?faculty=${encodeURIComponent(facultyFilter)}` : ''
    fetch(`${API_BASE}/api/degree-requirements/programs${fParam}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPrograms(data) })
      .catch(() => setError('Could not load programs. Try loading requirements first.'))
  }, [seedDone, facultyFilter])

  useEffect(() => {
    if (!selectedKey) return
    setLoading(true)
    setProgramDetail(null)
    setOpenBlocks({})
    setShowAllCourses({})
    fetch(`${API_BASE}/api/degree-requirements/programs/${selectedKey}`)
      .then(r => r.json())
      .then(data => {
        setProgramDetail(data)
        const initial = {}
        data.blocks?.forEach((b, i) => { if (i < 2) initial[b.id] = true })
        setOpenBlocks(initial)
      })
      .catch(() => setError('Could not load program details.'))
      .finally(() => setLoading(false))
  }, [selectedKey])

  const handleSeed = async () => {
    setSeeding(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/degree-requirements/seed`, { method: 'POST' })
      const data = await res.json()
      if (data.success) setSeedDone(v => !v)
      else setError('Load failed: ' + JSON.stringify(data.detail || data))
    } catch { setError('Load request failed. Is the backend running?') }
    finally { setSeeding(false) }
  }

  const filteredPrograms = useMemo(() => programs.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchType   = typeFilter === 'all' || p.program_type === typeFilter
    return matchSearch && matchType
  }), [programs, search, typeFilter])

  const progress = useMemo(() => {
    if (!programDetail) return null
    let required = 0, completed = 0
    programDetail.blocks?.forEach(block => {
      block.courses?.forEach(c => {
        if (c.is_required) {
          required += parseFloat(c.credits || 3)
          if (matchCourse(c, allUserCourses)) completed += parseFloat(c.credits || 3)
        }
      })
    })
    return { required, completed, pct: required > 0 ? Math.round((completed / required) * 100) : 0 }
  }, [programDetail, allUserCourses])

  const toggleBlock   = id => setOpenBlocks(p => ({ ...p, [id]: !p[id] }))
  const toggleShowAll = id => setShowAllCourses(p => ({ ...p, [id]: !p[id] }))

  return (
    <div className="drv-root">

      {/* Sidebar */}
      <aside className={`drv-sidebar ${sidebarOpen ? 'drv-sidebar--open' : ''}`}>
        <div className="drv-sidebar-header">
          <FaGraduationCap className="drv-sidebar-icon" />
          <span>Programs</span>
          <button className="drv-sidebar-close" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
        </div>

        <div className="drv-faculty-select-wrap">
          <select
            className="drv-faculty-select"
            value={facultyFilter}
            onChange={e => { setFacultyFilter(e.target.value); setSelectedKey(null); setProgramDetail(null) }}
          >
            <option value="">All Faculties</option>
            <option value="Faculty of Arts">Faculty of Arts</option>
            <option value="Faculty of Science">Faculty of Science</option>
            <option value="Faculty of Engineering">Faculty of Engineering</option>
            <option value="Desautels Faculty of Management">Management (Desautels)</option>
            <option value="Faculty of Education">Faculty of Education</option>
            <option value="Faculty of Law">Faculty of Law</option>
            <option value="Schulich School of Music">Schulich School of Music</option>
            <option value="Faculty of Agricultural and Environmental Sciences">Agricultural & Environmental Sciences</option>
            <option value="Faculty of Medicine and Health Sciences">Medicine & Health Sciences</option>
            <option value="Faculty of Dental Medicine and Oral Health Sciences">Dental Medicine</option>
          </select>
        </div>

        <div className="drv-sidebar-search">
          <FaSearch className="drv-search-icon" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search programs…"
            className="drv-search-input"
          />
        </div>

        <div className="drv-type-filters">
          {['all','major','minor','honours'].map(t => (
            <button
              key={t}
              className={`drv-type-chip ${typeFilter === t ? 'drv-type-chip--active' : ''}`}
              onClick={() => setTypeFilter(t)}
            >{t === 'all' ? 'All' : TYPE_LABELS[t]}</button>
          ))}
        </div>

        {programs.length === 0 && (
          <button className="drv-seed-btn" onClick={handleSeed} disabled={seeding}>
            <FaBolt /> {seeding ? 'Loading…' : 'Load Requirements'}
          </button>
        )}

        <div className="drv-program-list">
          {filteredPrograms.length === 0 && programs.length > 0 && (
            <div className="drv-empty-search">No programs match.</div>
          )}
          {filteredPrograms.map(prog => (
            <button
              key={prog.program_key}
              className={`drv-program-item ${selectedKey === prog.program_key ? 'drv-program-item--active' : ''}`}
              onClick={() => { setSelectedKey(prog.program_key); if (window.innerWidth < 760) setSidebarOpen(false) }}
            >
              <span className="drv-type-dot" style={{ background: TYPE_COLORS[prog.program_type] }} />
              <span className="drv-program-name">{prog.name}</span>
              <span className="drv-program-credits">{prog.total_credits}cr</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="drv-main">
        <button className="drv-open-sidebar" onClick={() => setSidebarOpen(true)}>
          ☰ Browse Programs
        </button>

        {error && (
          <div className="drv-error">
            {error}
            {programs.length === 0 && (
              <button className="drv-seed-btn drv-seed-btn--inline" onClick={handleSeed} disabled={seeding}>
                <FaBolt /> {seeding ? 'Loading…' : 'Load Requirements'}
              </button>
            )}
          </div>
        )}

        {!selectedKey && !loading && (
          <div className="drv-welcome">
            <div className="drv-welcome-icon-wrap"><FaGraduationCap /></div>
            <h2>Degree Requirements</h2>
            <p>Select a program from the sidebar to see its full requirements, your progress, and recommended courses.</p>
            {programs.length > 0 && (
              <p className="drv-welcome-count">{programs.length} Arts programs available</p>
            )}
            {programs.length === 0 && (
              <button className="drv-seed-btn" onClick={handleSeed} disabled={seeding}>
                <FaBolt /> {seeding ? 'Loading data…' : 'Load Arts Requirements'}
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="drv-loading">
            <div className="drv-spinner" />
            <span>Loading requirements…</span>
          </div>
        )}

        {programDetail && !loading && (
          <div className="drv-detail">
            <div className="drv-detail-header">
              <div className="drv-detail-header-left">
                <span
                  className="drv-detail-type-badge"
                  style={{
                    background: TYPE_BG[programDetail.program_type],
                    color: TYPE_COLORS[programDetail.program_type],
                    border: `1px solid ${TYPE_COLORS[programDetail.program_type]}33`
                  }}
                >
                  {TYPE_LABELS[programDetail.program_type]}
                </span>
                <h1 className="drv-detail-title">{programDetail.name}</h1>
                {programDetail.description && (
                  <p className="drv-detail-desc">{programDetail.description}</p>
                )}
              </div>
              <div className="drv-detail-meta">
                <div className="drv-meta-card">
                  <span className="drv-meta-label">Credits:</span>
                  <span className="drv-meta-val">{programDetail.total_credits}</span>
                </div>
                {progress && progress.required > 0 && (
                  <div className="drv-meta-card drv-meta-card--green">
                    <span className="drv-meta-label">Required done:</span>
                    <span className="drv-meta-val">{progress.pct}%</span>
                  </div>
                )}
                {programDetail.ecalendar_url && (
                  <a href={programDetail.ecalendar_url} target="_blank" rel="noreferrer" className="drv-ecal-link">
                    eCalendar <FaExternalLinkAlt />
                  </a>
                )}
              </div>
            </div>

            {progress && progress.required > 0 && (
              <div className="drv-progress-wrap">
                <div className="drv-progress-track">
                  <div className="drv-progress-fill" style={{ width: `${progress.pct}%` }} />
                </div>
                <span className="drv-progress-label">
                  {progress.completed}/{progress.required} required credits completed
                </span>
              </div>
            )}

            <div className="drv-controls">
              <button
                className={`drv-rec-toggle ${showRecommended ? 'drv-rec-toggle--active' : ''}`}
                onClick={() => setShowRecommended(v => !v)}
              >
                <FaLightbulb /> {showRecommended ? 'All Courses' : 'Recommended Only'}
              </button>
            </div>

            <div className="drv-blocks">
              {programDetail.blocks?.map(block => {
                const isOpen  = openBlocks[block.id]
                const showAll = showAllCourses[block.id]
                const courses = showRecommended
                  ? block.courses?.filter(c => c.recommended)
                  : block.courses

                const PREVIEW = 5
                const visible      = showAll ? courses : courses?.slice(0, PREVIEW)
                const required     = block.courses?.filter(c => c.is_required) || []
                const completedReq = required.filter(c => matchCourse(c, allUserCourses))
                const blockDone    = required.length > 0 && completedReq.length === required.length

                return (
                  <div key={block.id} className={`drv-block ${blockDone ? 'drv-block--done' : ''}`}>
                    <button className="drv-block-header" onClick={() => toggleBlock(block.id)}>
                      <div className="drv-block-header-left">
                        <span className="drv-chevron">
                          {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                        <div>
                          <span className="drv-block-title">{block.title}</span>
                          {block.credits_needed && (
                            <span className="drv-block-credits"> · {block.credits_needed}cr needed</span>
                          )}
                        </div>
                      </div>
                      <div className="drv-block-header-right">
                        {required.length > 0 && (
                          <span className={`drv-block-pill ${blockDone ? 'drv-block-pill--done' : ''}`}>
                            {blockDone ? '✓ Complete' : `${completedReq.length}/${required.length} req`}
                          </span>
                        )}
                        <span className="drv-block-count">{block.courses?.length}</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="drv-block-body">
                        {(block.notes || block.min_level || block.max_credits_200 || block.min_credits_400) && (
                          <div className="drv-block-info">
                            {block.notes && <span>{block.notes}</span>}
                            {block.min_level && <span>Min level: {block.min_level}+</span>}
                            {block.max_credits_200 && <span>Max {block.max_credits_200}cr at 200-level</span>}
                            {block.min_credits_400 && <span>Min {block.min_credits_400}cr at 400/500-level</span>}
                          </div>
                        )}

                        <div className="drv-course-list">
                          {visible?.map(course => {
                            const isCompleted = completedCourses.some(c =>
                              `${c.subject} ${c.catalog}`.toUpperCase() ===
                              `${course.subject} ${course.catalog}`.toUpperCase()
                            )
                            const isCurrent = currentCourses.some(c =>
                              `${c.subject} ${c.catalog}`.toUpperCase() ===
                              `${course.subject} ${course.catalog}`.toUpperCase()
                            )

                            return (
                              <div
                                key={course.id}
                                className={[
                                  'drv-course-row',
                                  course.is_required ? 'drv-course-row--required' : '',
                                  isCompleted        ? 'drv-course-row--done'     : '',
                                  isCurrent          ? 'drv-course-row--current'  : '',
                                ].filter(Boolean).join(' ')}
                              >
                                <div className="drv-course-status">
                                  {isCompleted
                                    ? <FaCheckCircle className="drv-status-icon drv-status-icon--done" />
                                    : isCurrent
                                      ? <FaCircle className="drv-status-icon drv-status-icon--current" />
                                      : <FaCircle className="drv-status-icon drv-status-icon--empty" />
                                  }
                                </div>

                                <div className="drv-course-info">
                                  <div className="drv-course-top">
                                    <span className={`drv-course-code ${!course.catalog ? 'drv-course-code--wildcard' : ''}`}>
                                      {course.subject} {course.catalog || '•••'}
                                    </span>
                                    <span className="drv-course-title">{course.title}</span>
                                    <div className="drv-course-badges">
                                      {course.is_required && <span className="drv-badge drv-badge--required">Required</span>}
                                      {course.recommended && <span className="drv-badge drv-badge--rec"><FaStar /> Rec</span>}
                                    </div>
                                  </div>
                                  {course.recommended && course.recommendation_reason && (
                                    <p className="drv-rec-reason">
                                      <FaLightbulb className="drv-rec-icon" />
                                      {course.recommendation_reason}
                                    </p>
                                  )}
                                </div>

                                <div className="drv-course-right">
                                  <span className="drv-course-credits">{course.credits}cr</span>
                                  {isCompleted && <span className="drv-tag drv-tag--done">✓ Done</span>}
                                  {isCurrent && !isCompleted && <span className="drv-tag drv-tag--cur">Taking</span>}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {courses && courses.length > PREVIEW && (
                          <button className="drv-show-more" onClick={() => toggleShowAll(block.id)}>
                            {showAll
                              ? <><FaChevronUp /> Show less</>
                              : <><FaChevronDown /> Show {courses.length - PREVIEW} more</>
                            }
                          </button>
                        )}

                        {showRecommended && (!courses || courses.length === 0) && (
                          <p className="drv-no-rec">No recommended courses in this block.</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
