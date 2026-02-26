import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { usersAPI } from '../../lib/api'
import { validateUsername } from '../../utils/validation'
import {
  FaUser, FaGraduationCap, FaFileUpload, FaCheckCircle,
  FaExclamationTriangle, FaArrowRight, FaLightbulb, FaSpinner,
  FaTimes, FaCloudUploadAlt, FaCheck, FaBook, FaCalendarAlt,
  FaChalkboardTeacher, FaPlus,
} from 'react-icons/fa'
import './ProfileSetup.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const BASE_URL = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '')

export default function ProfileSetup() {
  const { user, completeOnboarding } = useAuth()

  // 'profile' | 'transcript' | 'syllabus'
  const [step, setStep] = useState('profile')

  // ── Profile form ───────────────────────────────────────
  const [username, setUsername]     = useState('')
  const [major, setMajor]           = useState('')
  const [year, setYear]             = useState('')
  const [interests, setInterests]   = useState('')
  const [currentGpa, setCurrentGpa] = useState('')
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState('')

  // ── Transcript ─────────────────────────────────────────
  const [txStep, setTxStep]       = useState('idle')
  const [dragOver, setDragOver]   = useState(false)
  const [file, setFile]           = useState(null)
  const [txError, setTxError]     = useState('')
  const [txResults, setTxResults] = useState(null)
  const fileRef = useRef(null)

  // ── Syllabus ───────────────────────────────────────────
  const [sylStep, setSylStep]     = useState('idle')   // idle | uploading | done | error
  const [sylFiles, setSylFiles]   = useState([])       // array of File objects
  const [sylDragOver, setSylDragOver] = useState(false)
  const [sylError, setSylError]   = useState('')
  const [sylResults, setSylResults] = useState(null)
  const sylFileRef = useRef(null)

  const [finishing, setFinishing] = useState(false)

  const finish = async () => {
    setFinishing(true)
    await completeOnboarding()
  }

  // ── Profile submit ─────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (username.trim()) {
      const err = validateUsername(username)
      if (err) { setFormError(err); return }
    }
    if (currentGpa) {
      const g = parseFloat(currentGpa)
      if (isNaN(g) || g < 0 || g > 4) { setFormError('GPA must be between 0.0 and 4.0'); return }
    }

    setSaving(true)
    try {
      const updates = {}
      if (username.trim())  updates.username    = username.trim()
      if (major.trim())     updates.major       = major.trim()
      if (year)             updates.year        = parseInt(year)
      if (interests.trim()) updates.interests   = interests.trim()
      if (currentGpa)       updates.current_gpa = parseFloat(currentGpa)

      if (Object.keys(updates).length > 0) {
        try {
          await usersAPI.updateUser(user.id, updates)
        } catch (updateErr) {
          if (updateErr.response?.status === 404) {
            await usersAPI.createUser({ id: user.id, email: user.email, ...updates })
          } else {
            throw updateErr
          }
        }
      } else {
        try {
          await usersAPI.createUser({ id: user.id, email: user.email })
        } catch (createErr) {
          if (createErr.response?.status !== 409 && createErr.response?.data?.code !== 'user_already_exists') {
            throw createErr
          }
        }
      }

      setStep('transcript')
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSkipProfile = async () => {
    try {
      await usersAPI.createUser({ id: user.id, email: user.email })
    } catch (err) {
      if (err.response?.status !== 409 && err.response?.data?.code !== 'user_already_exists') {
        console.warn('Could not ensure profile row on skip:', err)
      }
    }
    setStep('transcript')
  }

  // ── Transcript helpers ─────────────────────────────────
  const pickFile = (f) => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) { setTxError('Please upload a PDF file.'); return }
    if (f.size > 10 * 1024 * 1024) { setTxError('File must be under 10 MB.'); return }
    setTxError('')
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    pickFile(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setTxStep('uploading')
    setTxError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('dry_run', 'false')
      const res = await fetch(`${BASE_URL}/api/transcript/parse/${user.id}`, { method: 'POST', body: form })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || `Upload failed (${res.status})`)
      }
      const data = await res.json()
      setTxResults(data.results)
      setTxStep('done')
    } catch (err) {
      setTxError(err.message)
      setTxStep('error')
    }
  }

  // ── Syllabus helpers ───────────────────────────────────
  const pickSylFiles = (fileList) => {
    const valid = []
    for (const f of fileList) {
      if (!f.name.toLowerCase().endsWith('.pdf')) continue
      if (f.size > 15 * 1024 * 1024) continue
      valid.push(f)
    }
    if (valid.length === 0) { setSylError('Please upload PDF files only (max 15 MB each).'); return }
    setSylError('')
    setSylFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...valid.filter(f => !existing.has(f.name))]
    })
  }

  const handleSylDrop = (e) => {
    e.preventDefault()
    setSylDragOver(false)
    pickSylFiles(Array.from(e.dataTransfer.files))
  }

  const removeSylFile = (name) => {
    setSylFiles(prev => prev.filter(f => f.name !== name))
  }

  const handleSylUpload = async () => {
    if (sylFiles.length === 0) return
    setSylStep('uploading')
    setSylError('')
    try {
      const form = new FormData()
      sylFiles.forEach(f => form.append('files', f))
      form.append('dry_run', 'false')
      const res = await fetch(`${BASE_URL}/api/syllabus/parse/${user.id}`, { method: 'POST', body: form })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || `Upload failed (${res.status})`)
      }
      const data = await res.json()
      setSylResults(data)
      setSylStep('done')
    } catch (err) {
      setSylError(err.message)
      setSylStep('error')
    }
  }

  // ── Step bar ───────────────────────────────────────────
  const stepOrder = ['profile', 'transcript', 'syllabus']
  const stepIdx = stepOrder.indexOf(step)

  const StepBar = () => (
    <div className="ps-stepbar">
      {/* Step 1: Profile */}
      <div className={`ps-stepbar-item ${stepIdx === 0 ? 'active' : 'done'}`}>
        <div className="ps-stepbar-dot">
          {stepIdx > 0 ? <FaCheck size={10} /> : <span>1</span>}
        </div>
        <span className="ps-stepbar-label">Profile</span>
      </div>

      <div className={`ps-stepbar-line ${stepIdx > 0 ? 'filled' : ''}`} />

      {/* Step 2: Transcript */}
      <div className={`ps-stepbar-item ${stepIdx === 1 ? 'active' : stepIdx > 1 ? 'done' : ''}`}>
        <div className="ps-stepbar-dot">
          {stepIdx > 1 ? <FaCheck size={10} /> : <span>2</span>}
        </div>
        <span className="ps-stepbar-label">Transcript</span>
      </div>

      <div className={`ps-stepbar-line ${stepIdx > 1 ? 'filled' : ''}`} />

      {/* Step 3: Syllabuses */}
      <div className={`ps-stepbar-item ${stepIdx === 2 ? 'active' : ''}`}>
        <div className="ps-stepbar-dot"><span>3</span></div>
        <span className="ps-stepbar-label">Syllabuses</span>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════
  // Step 1: Profile
  // ══════════════════════════════════════════════════════════
  if (step === 'profile') {
    return (
      <div className="ps-page">
        <div className="ps-container">
          <div className="ps-header">
            <div className="ps-header-icon"><FaUser /></div>
            <div>
              <h1 className="ps-title">Set up your profile</h1>
              <p className="ps-subtitle">All fields are optional — fill in what you know and update anytime.</p>
            </div>
          </div>
          <StepBar />
          {formError && (
            <div className="ps-alert ps-alert--error">
              <FaExclamationTriangle className="ps-alert-icon" />
              <span>{formError}</span>
            </div>
          )}
          <form className="ps-form" onSubmit={handleProfileSubmit}>
            <div className="ps-row">
              <div className="ps-field">
                <label className="ps-label">Username</label>
                <input className="ps-input" type="text" placeholder="e.g. jdoe2025"
                  value={username} onChange={e => setUsername(e.target.value)}
                  disabled={saving} autoComplete="username" />
              </div>
              <div className="ps-field">
                <label className="ps-label">Year</label>
                <select className="ps-input" value={year} onChange={e => setYear(e.target.value)} disabled={saving}>
                  <option value="">Select year</option>
                  <option value="1">U0 / U1</option>
                  <option value="2">U2</option>
                  <option value="3">U3</option>
                  <option value="4">U4+</option>
                </select>
              </div>
            </div>
            <div className="ps-field">
              <label className="ps-label">Major</label>
              <input className="ps-input" type="text" placeholder="e.g. Computer Science"
                value={major} onChange={e => setMajor(e.target.value)} disabled={saving} autoComplete="off" />
            </div>
            <div className="ps-row">
              <div className="ps-field">
                <label className="ps-label">Current GPA</label>
                <input className="ps-input" type="number" step="0.01" min="0" max="4"
                  placeholder="0.00 – 4.00" value={currentGpa}
                  onChange={e => setCurrentGpa(e.target.value)} disabled={saving} />
              </div>
              <div className="ps-field ps-field--grow">
                <label className="ps-label">Interests</label>
                <input className="ps-input" type="text" placeholder="e.g. ML, Web Dev, Finance"
                  value={interests} onChange={e => setInterests(e.target.value)} disabled={saving} />
              </div>
            </div>
            <div className="ps-actions">
              <button type="submit" className="ps-btn ps-btn--primary" disabled={saving}>
                {saving ? <><FaSpinner className="ps-spin" /> Saving…</> : <>Continue <FaArrowRight /></>}
              </button>
              <button type="button" className="ps-btn ps-btn--ghost" onClick={handleSkipProfile} disabled={saving}>
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════
  // Step 2: Transcript
  // ══════════════════════════════════════════════════════════
  if (step === 'transcript') {
    return (
      <div className="ps-page">
        <div className="ps-container">
          <div className="ps-header">
            <div className="ps-header-icon ps-header-icon--green"><FaGraduationCap /></div>
            <div>
              <h1 className="ps-title">Import your transcript</h1>
              <p className="ps-subtitle">We'll automatically pull your courses, grades, GPA, and program info.</p>
            </div>
          </div>
          <StepBar />

          {txStep === 'idle' && (
            <>
              <div
                className={`ps-dropzone ${dragOver ? 'ps-dropzone--over' : ''} ${file ? 'ps-dropzone--has-file' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
                  onChange={e => pickFile(e.target.files[0])} />
                {file ? (
                  <div className="ps-dropzone-file">
                    <FaCheckCircle className="ps-dropzone-check" />
                    <div>
                      <p className="ps-dropzone-filename">{file.name}</p>
                      <p className="ps-dropzone-filesize">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button className="ps-dropzone-remove" onClick={e => { e.stopPropagation(); setFile(null) }}>
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="ps-dropzone-empty">
                    <FaCloudUploadAlt className="ps-dropzone-icon" />
                    <p className="ps-dropzone-main">Drop your unofficial transcript here</p>
                    <p className="ps-dropzone-sub">or click to browse · PDF only · max 10 MB</p>
                  </div>
                )}
              </div>

              {txError && (
                <div className="ps-alert ps-alert--error">
                  <FaExclamationTriangle className="ps-alert-icon" />
                  <span>{txError}</span>
                </div>
              )}

              <div className="ps-actions">
                <button className="ps-btn ps-btn--primary" onClick={handleUpload} disabled={!file}>
                  Import Transcript <FaArrowRight />
                </button>
                <button className="ps-btn ps-btn--ghost" onClick={() => setStep('syllabus')}>
                  Skip for now
                </button>
              </div>
              <div className="ps-hint">
                <FaLightbulb className="ps-hint-icon" />
                <p>You can also do this later from the <strong>Profile tab</strong> — find <strong>Import Transcript</strong> in the Degree Progress card.</p>
              </div>
            </>
          )}

          {txStep === 'uploading' && (
            <div className="ps-status">
              <div className="ps-status-icon ps-status-icon--spin"><FaSpinner /></div>
              <h3 className="ps-status-title">Importing your transcript…</h3>
              <p className="ps-status-sub">Claude is reading your courses, grades, and program info.</p>
            </div>
          )}

          {txStep === 'done' && txResults && (
            <div className="ps-status">
              <div className="ps-status-icon ps-status-icon--success"><FaCheckCircle /></div>
              <h3 className="ps-status-title">Transcript imported!</h3>
              <p className="ps-status-sub">Your academic history is ready. Next, upload your syllabuses.</p>
              <div className="ps-chips">
                {txResults.completed_added > 0 && (
                  <div className="ps-chip">
                    <span className="ps-chip-num">{txResults.completed_added}</span>
                    <span className="ps-chip-label">completed courses</span>
                  </div>
                )}
                {txResults.current_added > 0 && (
                  <div className="ps-chip">
                    <span className="ps-chip-num">{txResults.current_added}</span>
                    <span className="ps-chip-label">current courses</span>
                  </div>
                )}
                {txResults.profile_updated && (
                  <div className="ps-chip ps-chip--success">
                    <FaCheck className="ps-chip-check" />
                    <span className="ps-chip-label">profile updated</span>
                  </div>
                )}
              </div>
              <button className="ps-btn ps-btn--primary" onClick={() => setStep('syllabus')}>
                Continue to Syllabuses <FaArrowRight />
              </button>
            </div>
          )}

          {txStep === 'error' && (
            <div className="ps-status">
              <div className="ps-status-icon ps-status-icon--warning"><FaExclamationTriangle /></div>
              <h3 className="ps-status-title">Import failed</h3>
              <p className="ps-status-sub">{txError}</p>
              <div className="ps-actions ps-actions--center">
                <button className="ps-btn ps-btn--secondary" onClick={() => { setTxStep('idle'); setTxError('') }}>Try Again</button>
                <button className="ps-btn ps-btn--ghost" onClick={() => setStep('syllabus')}>
                  Skip to Syllabuses
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════
  // Step 3: Syllabuses
  // ══════════════════════════════════════════════════════════
  return (
    <div className="ps-page">
      <div className="ps-container">
        <div className="ps-header">
          <div className="ps-header-icon ps-header-icon--blue"><FaBook /></div>
          <div>
            <h1 className="ps-title">Upload your syllabuses</h1>
            <p className="ps-subtitle">We'll extract schedules, exams, and professor info — and fill in your calendar automatically.</p>
          </div>
        </div>
        <StepBar />

        {sylStep === 'idle' && (
          <>
            {/* What we extract — info chips */}
            <div className="ps-syl-info">
              <div className="ps-syl-info-item">
                <FaCalendarAlt className="ps-syl-info-icon" />
                <span>Lecture times &amp; rooms added to your calendar</span>
              </div>
              <div className="ps-syl-info-item">
                <FaChalkboardTeacher className="ps-syl-info-icon" />
                <span>Professor, office hours &amp; contact info</span>
              </div>
              <div className="ps-syl-info-item">
                <FaCheck className="ps-syl-info-icon ps-syl-info-icon--green" />
                <span>Exams &amp; assignment deadlines with reminders</span>
              </div>
            </div>

            {/* Drop zone */}
            <div
              className={`ps-dropzone ps-dropzone--multi ${sylDragOver ? 'ps-dropzone--over' : ''}`}
              onDragOver={e => { e.preventDefault(); setSylDragOver(true) }}
              onDragLeave={() => setSylDragOver(false)}
              onDrop={handleSylDrop}
              onClick={() => sylFileRef.current?.click()}
            >
              <input
                ref={sylFileRef} type="file" accept=".pdf" multiple
                style={{ display: 'none' }}
                onChange={e => pickSylFiles(Array.from(e.target.files))}
              />
              <FaCloudUploadAlt className="ps-dropzone-icon" />
              <p className="ps-dropzone-main">Drop syllabus PDFs here</p>
              <p className="ps-dropzone-sub">Upload all at once · PDF only · max 15 MB each</p>
            </div>

            {/* File list */}
            {sylFiles.length > 0 && (
              <div className="ps-syl-filelist">
                {sylFiles.map(f => (
                  <div key={f.name} className="ps-syl-filerow">
                    <FaBook className="ps-syl-filerow-icon" />
                    <span className="ps-syl-filerow-name">{f.name}</span>
                    <span className="ps-syl-filerow-size">{(f.size / 1024).toFixed(0)} KB</span>
                    <button className="ps-syl-filerow-remove" onClick={() => removeSylFile(f.name)}>
                      <FaTimes />
                    </button>
                  </div>
                ))}
                <button className="ps-syl-add-more" onClick={() => sylFileRef.current?.click()}>
                  <FaPlus /> Add more
                </button>
              </div>
            )}

            {sylError && (
              <div className="ps-alert ps-alert--error">
                <FaExclamationTriangle className="ps-alert-icon" />
                <span>{sylError}</span>
              </div>
            )}

            <div className="ps-actions">
              <button
                className="ps-btn ps-btn--primary"
                onClick={handleSylUpload}
                disabled={sylFiles.length === 0}
              >
                Import {sylFiles.length > 0 ? `${sylFiles.length} Syllabus${sylFiles.length > 1 ? 'es' : ''}` : 'Syllabuses'} <FaArrowRight />
              </button>
              <button className="ps-btn ps-btn--ghost" onClick={finish} disabled={finishing}>
                {finishing ? <><FaSpinner className="ps-spin" /> Loading…</> : 'Skip for now'}
              </button>
            </div>

            <div className="ps-hint">
              <FaLightbulb className="ps-hint-icon" />
              <p>You can upload syllabuses anytime from the <strong>Calendar</strong> or <strong>Profile</strong> tab.</p>
            </div>
          </>
        )}

        {sylStep === 'uploading' && (
          <div className="ps-status">
            <div className="ps-status-icon ps-status-icon--spin"><FaSpinner /></div>
            <h3 className="ps-status-title">Processing your syllabuses…</h3>
            <p className="ps-status-sub">Claude is reading course schedules, exams, and professor info from {sylFiles.length} file{sylFiles.length > 1 ? 's' : ''}.</p>
          </div>
        )}

        {sylStep === 'done' && sylResults && (
          <div className="ps-status">
            <div className="ps-status-icon ps-status-icon--success"><FaCheckCircle /></div>
            <h3 className="ps-status-title">Syllabuses imported!</h3>
            <p className="ps-status-sub">Your calendar and course profiles have been updated.</p>
            <div className="ps-chips">
              {sylResults.total_events_added > 0 && (
                <div className="ps-chip">
                  <span className="ps-chip-num">{sylResults.total_events_added}</span>
                  <span className="ps-chip-label">calendar events added</span>
                </div>
              )}
              {sylResults.total_courses_updated > 0 && (
                <div className="ps-chip ps-chip--success">
                  <FaCheck className="ps-chip-check" />
                  <span className="ps-chip-label">{sylResults.total_courses_updated} course{sylResults.total_courses_updated > 1 ? 's' : ''} enriched</span>
                </div>
              )}
              {/* Per-file breakdown */}
              {sylResults.results?.filter(r => r.success).map(r => (
                <div key={r.filename} className="ps-chip ps-chip--neutral">
                  <span className="ps-chip-label">{r.course_code || r.filename}</span>
                </div>
              ))}
            </div>

            {/* Show any failures */}
            {sylResults.results?.some(r => !r.success) && (
              <div className="ps-syl-errors">
                {sylResults.results.filter(r => !r.success).map(r => (
                  <p key={r.filename} className="ps-syl-error-row">
                    <FaExclamationTriangle /> {r.filename}: {r.error}
                  </p>
                ))}
              </div>
            )}

            <button className="ps-btn ps-btn--primary" onClick={finish} disabled={finishing}>
              {finishing ? <><FaSpinner className="ps-spin" /> Loading…</> : <>Go to Dashboard <FaArrowRight /></>}
            </button>
          </div>
        )}

        {sylStep === 'error' && (
          <div className="ps-status">
            <div className="ps-status-icon ps-status-icon--warning"><FaExclamationTriangle /></div>
            <h3 className="ps-status-title">Import failed</h3>
            <p className="ps-status-sub">{sylError}</p>
            <div className="ps-actions ps-actions--center">
              <button className="ps-btn ps-btn--secondary" onClick={() => { setSylStep('idle'); setSylError('') }}>Try Again</button>
              <button className="ps-btn ps-btn--ghost" onClick={finish} disabled={finishing}>
                {finishing ? <><FaSpinner className="ps-spin" /> Loading…</> : 'Skip to Dashboard'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}