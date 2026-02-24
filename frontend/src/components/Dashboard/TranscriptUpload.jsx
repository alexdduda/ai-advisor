import { useState, useRef } from 'react'
import { FaFileUpload, FaTimes, FaCheckCircle, FaSpinner, FaGraduationCap, FaBook, FaExclamationTriangle } from 'react-icons/fa'
import './TranscriptUpload.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const normalizeUrl = (url) => {
  let n = url.replace(/\/$/, '')
  if (n.endsWith('/api')) n = n.slice(0, -4)
  return n
}
const BASE_URL = normalizeUrl(API_URL)

export default function TranscriptUpload({ userId, onImportComplete, onClose }) {
  const [step, setStep] = useState('upload')
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [parsed, setParsed] = useState(null)
  const [results, setResults] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) { setErrorMsg('Please upload a PDF file.'); return }
    if (f.size > 10 * 1024 * 1024) { setErrorMsg('File must be under 10MB.'); return }
    setErrorMsg('')
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleParse = async () => {
    if (!file) return
    setStep('parsing')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('dry_run', 'true')
      const res = await fetch(`${BASE_URL}/api/transcript/parse/${userId}`, { method: 'POST', body: form })
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Parsing failed') }
      const data = await res.json()
      setParsed(data.parsed)
      setStep('preview')
    } catch (e) {
      setErrorMsg(e.message)
      setStep('error')
    }
  }

  const handleImport = async () => {
    if (!file) return
    setStep('importing')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('dry_run', 'false')
      const res = await fetch(`${BASE_URL}/api/transcript/parse/${userId}`, { method: 'POST', body: form })
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Import failed') }
      const data = await res.json()
      setResults(data.results)
      setStep('done')
      onImportComplete?.(data)
    } catch (e) {
      setErrorMsg(e.message)
      setStep('error')
    }
  }

  const studentInfo = parsed?.student_info || {}
  const completedCourses = parsed?.completed_courses || []
  const currentCourses = parsed?.current_courses || []
  const advancedStanding = studentInfo?.advanced_standing || []

  return (
    <div className="transcript-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="transcript-modal">
        <div className="transcript-header">
          <div className="transcript-header-left">
            <FaGraduationCap className="transcript-header-icon" />
            <div>
              <h2 className="transcript-title">Import Transcript</h2>
              <p className="transcript-subtitle">Upload your McGill unofficial transcript PDF</p>
            </div>
          </div>
          <button className="transcript-close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        {step === 'upload' && (
          <>
            <div className="transcript-body">
              <div
                className={`transcript-dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files[0])} />
                {file ? (
                  <div className="dropzone-file-selected">
                    <FaCheckCircle className="dropzone-check" />
                    <span className="dropzone-filename">{file.name}</span>
                    <span className="dropzone-filesize">({(file.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ) : (
                  <>
                    <FaFileUpload className="dropzone-icon" />
                    <p className="dropzone-main">Drop your transcript PDF here</p>
                    <p className="dropzone-sub">or click to browse</p>
                    <p className="dropzone-note">Download from Minerva → Student Records → Unofficial Transcript</p>
                  </>
                )}
              </div>
              {errorMsg && <div className="transcript-error-msg"><FaExclamationTriangle /> {errorMsg}</div>}
            </div>
            <div className="transcript-footer">
              <button className="btn-transcript-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-transcript-primary" onClick={handleParse} disabled={!file}>Parse Transcript</button>
            </div>
          </>
        )}

        {step === 'parsing' && (
          <div className="transcript-body transcript-loading">
            <FaSpinner className="transcript-spinner" />
            <p className="loading-title">Analyzing your transcript…</p>
            <p className="loading-sub">Claude is reading your courses, grades, and program info</p>
          </div>
        )}

        {step === 'preview' && (
          <>
            <div className="transcript-body">
              {(studentInfo.major || studentInfo.cum_gpa || studentInfo.year) && (
                <div className="preview-section">
                  <h3 className="preview-section-title">📋 Profile Info Detected</h3>
                  <div className="preview-info-grid">
                    {studentInfo.major && <div className="preview-info-item"><span className="info-label">Major</span><span className="info-value">{studentInfo.major}</span></div>}
                    {studentInfo.minor && <div className="preview-info-item"><span className="info-label">Minor</span><span className="info-value">{studentInfo.minor}</span></div>}
                    {studentInfo.faculty && <div className="preview-info-item"><span className="info-label">Faculty</span><span className="info-value">{studentInfo.faculty}</span></div>}
                    {studentInfo.year && <div className="preview-info-item"><span className="info-label">Year</span><span className="info-value">Year {studentInfo.year}</span></div>}
                    {studentInfo.cum_gpa && <div className="preview-info-item"><span className="info-label">Cumulative GPA</span><span className="info-value gpa-value">{studentInfo.cum_gpa}</span></div>}
                  </div>
                </div>
              )}
              {advancedStanding.length > 0 && (
                <div className="preview-section">
                  <h3 className="preview-section-title">🏆 Advanced Standing / AP Credits ({advancedStanding.length})</h3>
                  <div className="preview-course-list">
                    {advancedStanding.map((c, i) => (
                      <div key={i} className="preview-course-item preview-course-item--ap">
                        <span className="course-code">{c.course_code}</span>
                        <span className="course-title">{c.course_title || ''}</span>
                        <span className="course-credits">{c.credits || 3} cr</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {completedCourses.length > 0 && (
                <div className="preview-section">
                  <h3 className="preview-section-title">✅ Completed Courses ({completedCourses.length})</h3>
                  <div className="preview-course-list">
                    {completedCourses.map((c, i) => (
                      <div key={i} className="preview-course-item">
                        <span className="course-code">{c.course_code}</span>
                        <span className="course-title">{c.course_title}</span>
                        <span className="course-term">{c.term} {c.year}</span>
                        {c.grade && <span className={`course-grade grade-${c.grade.replace('+', 'plus').replace('-', 'minus')}`}>{c.grade}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {currentCourses.length > 0 && (
                <div className="preview-section">
                  <h3 className="preview-section-title"><FaBook style={{ display: 'inline', marginRight: 6 }} />Current Courses ({currentCourses.length})</h3>
                  <div className="preview-course-list">
                    {currentCourses.map((c, i) => (
                      <div key={i} className="preview-course-item preview-course-item--current">
                        <span className="course-code">{c.course_code}</span>
                        <span className="course-title">{c.course_title}</span>
                        <span className="course-badge-current">In Progress</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="transcript-footer">
              <button className="btn-transcript-secondary" onClick={() => setStep('upload')}>← Back</button>
              <button className="btn-transcript-primary" onClick={handleImport}>
                Replace & Import {completedCourses.length + currentCourses.length} Courses
              </button>
            </div>
          </>
        )}

        {step === 'importing' && (
          <div className="transcript-body transcript-loading">
            <FaSpinner className="transcript-spinner" />
            <p className="loading-title">Importing your courses…</p>
            <p className="loading-sub">Saving to your profile</p>
          </div>
        )}

        {step === 'done' && results && (
          <div className="transcript-body transcript-done">
            <FaCheckCircle className="done-icon" />
            <h3 className="done-title">Import Complete!</h3>
            <div className="done-stats">
              <div className="done-stat"><span className="done-stat-num">{results.completed_added}</span><span className="done-stat-label">Completed courses added</span></div>
              <div className="done-stat"><span className="done-stat-num">{results.current_added}</span><span className="done-stat-label">Current courses added</span></div>
              {results.profile_updated && <div className="done-stat done-stat--green"><span className="done-stat-num">✓</span><span className="done-stat-label">Profile updated</span></div>}
              {(results.completed_skipped + results.current_skipped) > 0 && (
                <div className="done-stat done-stat--gray">
                  <span className="done-stat-num">{results.completed_skipped + results.current_skipped}</span>
                  <span className="done-stat-label">Already in profile (skipped)</span>
                </div>
              )}
            </div>
            <button className="btn-transcript-primary" onClick={onClose}>Done</button>
          </div>
        )}

        {step === 'error' && (
          <>
            <div className="transcript-body transcript-error-state">
              <FaExclamationTriangle className="error-state-icon" />
              <h3 className="error-state-title">Something went wrong</h3>
              <p className="error-state-msg">{errorMsg}</p>
            </div>
            <div className="transcript-footer">
              <button className="btn-transcript-secondary" onClick={() => { setStep('upload'); setErrorMsg('') }}>Try Again</button>
              <button className="btn-transcript-secondary" onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
