import { useState, useRef } from 'react'
import {
  FaFileUpload, FaTimes, FaCheckCircle, FaSpinner,
  FaGraduationCap, FaBook, FaExclamationTriangle,
  FaCloudUploadAlt, FaFilePdf, FaTrash, FaCalendarAlt
} from 'react-icons/fa'
import { BASE_URL } from '../../lib/apiConfig'
import './TranscriptUpload.css'

export default function TranscriptUpload({ userId, onImportComplete, onClose, defaultTab = 'transcript' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  // ── Transcript state ───────────────────────────────────
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
    } catch (e) { setErrorMsg(e.message); setStep('error') }
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
      onImportComplete?.()
    } catch (e) { setErrorMsg(e.message); setStep('error') }
  }

  const handleReset = () => {
    setStep('upload'); setFile(null); setParsed(null); setResults(null); setErrorMsg('')
  }

  // ── Syllabus state ─────────────────────────────────────
  const [sylFiles, setSylFiles] = useState([])
  const [sylDragOver, setSylDragOver] = useState(false)
  const [sylStep, setSylStep] = useState('idle')
  const [sylResults, setSylResults] = useState(null)
  const [sylError, setSylError] = useState('')
  const sylFileRef = useRef(null)

  const addSylFiles = (fileList) => {
    const valid = []
    for (const f of fileList) {
      if (!f.name.toLowerCase().endsWith('.pdf')) continue
      if (f.size > 15 * 1024 * 1024) continue
      valid.push(f)
    }
    if (!valid.length) { setSylError('PDF files only, max 15 MB each.'); return }
    setSylError('')
    setSylFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...valid.filter(f => !existing.has(f.name))]
    })
  }

  const handleSylUpload = async () => {
    if (!sylFiles.length) return
    setSylStep('uploading'); setSylError('')
    try {
      const form = new FormData()
      sylFiles.forEach(f => form.append('files', f))
      form.append('dry_run', 'false')
      const res = await fetch(`${BASE_URL}/api/syllabus/parse/${userId}`, { method: 'POST', body: form })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || 'Upload failed') }
      const data = await res.json()
      setSylResults(data); setSylStep('done'); onImportComplete?.()
    } catch (e) { setSylError(e.message); setSylStep('error') }
  }

  return (
    <div className="tu-overlay">
      <div className="tu-modal">

        {/* ── Header ── */}
        <div className="tu-header">
          <div className="tu-header-left">
            <div className="tu-header-icon">
              {activeTab === 'transcript' ? <FaGraduationCap /> : <FaCalendarAlt />}
            </div>
            <div>
              <h2 className="tu-title">Import Academic Data</h2>
              <p className="tu-subtitle">Transcript &amp; syllabus import</p>
            </div>
          </div>
          <button className="tu-close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        {/* ── Tab bar ── */}
        <div className="tu-tab-bar">
          <button
            className={`tu-tab-btn ${activeTab === 'transcript' ? 'tu-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('transcript')}
          >
            <FaGraduationCap /> Transcript
          </button>
          <button
            className={`tu-tab-btn ${activeTab === 'syllabus' ? 'tu-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('syllabus')}
          >
            <FaBook /> Syllabuses
          </button>
        </div>

        {/* ══════════════ TRANSCRIPT TAB ══════════════ */}
        {activeTab === 'transcript' && (
          <div className="tu-body">

            {step === 'upload' && (
              <div className="tu-step">
                <p className="tu-desc">Upload your unofficial McGill transcript PDF to auto-import your courses, grades, and GPA.</p>
                <div
                  className={`tu-dropzone ${dragOver ? 'tu-dropzone--over' : ''} ${file ? 'tu-dropzone--has-file' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf" hidden onChange={e => handleFile(e.target.files[0])} />
                  {file ? (
                    <div className="tu-dropzone-selected">
                      <FaCheckCircle className="tu-dropzone-check" />
                      <div>
                        <p className="tu-dropzone-filename">{file.name}</p>
                        <p className="tu-dropzone-size">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                      <button className="tu-dropzone-clear" onClick={e => { e.stopPropagation(); setFile(null) }}>
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FaCloudUploadAlt className="tu-dropzone-icon" />
                      <p className="tu-dropzone-main">Drop your transcript PDF here</p>
                      <p className="tu-dropzone-sub">or click to browse · PDF only · max 10 MB</p>
                    </>
                  )}
                </div>
                {errorMsg && <div className="tu-error-msg"><FaExclamationTriangle /> {errorMsg}</div>}
                <div className="tu-actions">
                  <button className="tu-btn tu-btn--primary" onClick={handleParse} disabled={!file}>
                    Parse Transcript
                  </button>
                </div>
              </div>
            )}

            {step === 'parsing' && (
              <div className="tu-step tu-step--center">
                <FaSpinner className="tu-spinner" />
                <p className="tu-state-title">Parsing transcript…</p>
                <p className="tu-state-sub">Claude is reading your academic history. This may take 10–20 seconds.</p>
              </div>
            )}

            {step === 'preview' && parsed && (
              <div className="tu-step">
                <div className="tu-success-bar">
                  <FaCheckCircle /> Parsed successfully — review before importing
                </div>

                {parsed.student_info && (
                  <div className="tu-section">
                    <h3 className="tu-section-title">Student Info</h3>
                    <div className="tu-info-grid">
                      {parsed.student_info.major   && <div className="tu-info-cell"><span className="tu-info-label">Major</span><span className="tu-info-val">{parsed.student_info.major}</span></div>}
                      {parsed.student_info.minor   && <div className="tu-info-cell"><span className="tu-info-label">Minor</span><span className="tu-info-val">{parsed.student_info.minor}</span></div>}
                      {parsed.student_info.faculty && <div className="tu-info-cell"><span className="tu-info-label">Faculty</span><span className="tu-info-val">{parsed.student_info.faculty}</span></div>}
                      {parsed.student_info.year    && <div className="tu-info-cell"><span className="tu-info-label">Year</span><span className="tu-info-val">U{parsed.student_info.year}</span></div>}
                      {parsed.student_info.cum_gpa && <div className="tu-info-cell"><span className="tu-info-label">GPA</span><span className="tu-info-val tu-info-val--accent">{parsed.student_info.cum_gpa}</span></div>}
                    </div>
                  </div>
                )}

                <div className="tu-section">
                  <h3 className="tu-section-title">Completed Courses ({parsed.completed_courses?.length || 0})</h3>
                  <div className="tu-course-list">
                    {(parsed.completed_courses || []).slice(0, 10).map((c, i) => (
                      <div key={i} className="tu-course-row">
                        <span className="tu-course-code">{c.course_code}</span>
                        <span className="tu-course-name">{c.course_title}</span>
                        {c.grade && <span className="tu-course-grade">{c.grade}</span>}
                      </div>
                    ))}
                    {(parsed.completed_courses?.length || 0) > 10 && (
                      <p className="tu-course-more">+{parsed.completed_courses.length - 10} more courses</p>
                    )}
                  </div>
                </div>

                {(parsed.current_courses?.length || 0) > 0 && (
                  <div className="tu-section">
                    <h3 className="tu-section-title">Current Courses ({parsed.current_courses.length})</h3>
                    <div className="tu-course-list">
                      {parsed.current_courses.map((c, i) => (
                        <div key={i} className="tu-course-row tu-course-row--current">
                          <span className="tu-course-code">{c.course_code}</span>
                          <span className="tu-course-name">{c.course_title}</span>
                          <span className="tu-course-tag">current</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="tu-actions">
                  <button className="tu-btn tu-btn--secondary" onClick={handleReset}>Re-upload</button>
                  <button className="tu-btn tu-btn--primary" onClick={handleImport}>Import All</button>
                </div>
              </div>
            )}

            {step === 'importing' && (
              <div className="tu-step tu-step--center">
                <FaSpinner className="tu-spinner" />
                <p className="tu-state-title">Importing courses…</p>
                <p className="tu-state-sub">Adding everything to your profile.</p>
              </div>
            )}

            {step === 'done' && (
              <div className="tu-step tu-step--center">
                <FaCheckCircle className="tu-done-icon" />
                <h3 className="tu-state-title">Import Complete!</h3>
                {results && (
                  <div className="tu-done-stats">
                    <div className="tu-done-stat tu-done-stat--green">
                      <span className="tu-done-num">{results.completed_added}</span>
                      <span className="tu-done-label">completed added</span>
                    </div>
                    <div className="tu-done-stat">
                      <span className="tu-done-num">{results.current_added}</span>
                      <span className="tu-done-label">current added</span>
                    </div>
                    {results.completed_skipped > 0 && (
                      <div className="tu-done-stat tu-done-stat--gray">
                        <span className="tu-done-num">{results.completed_skipped}</span>
                        <span className="tu-done-label">skipped</span>
                      </div>
                    )}
                    {results.profile_updated && (
                      <div className="tu-done-stat tu-done-stat--blue">
                        <span className="tu-done-num">✓</span>
                        <span className="tu-done-label">profile updated</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="tu-actions tu-actions--center">
                  <button className="tu-btn tu-btn--primary" onClick={onClose}>Done</button>
                </div>
              </div>
            )}

            {step === 'error' && (
              <div className="tu-step tu-step--center">
                <FaExclamationTriangle className="tu-error-icon" />
                <p className="tu-state-title">Something went wrong</p>
                <p className="tu-state-sub">{errorMsg}</p>
                <div className="tu-actions tu-actions--center">
                  <button className="tu-btn tu-btn--secondary" onClick={handleReset}>Try Again</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ SYLLABUS TAB ══════════════ */}
        {activeTab === 'syllabus' && (
          <div className="tu-body">

            {sylStep === 'uploading' && (
              <div className="tu-step tu-step--center">
                <FaSpinner className="tu-spinner" />
                <p className="tu-state-title">Importing syllabuses…</p>
                <p className="tu-state-sub">Claude is extracting schedules, assessments, and deadlines.</p>
              </div>
            )}

            {sylStep === 'done' && (
              <div className="tu-step tu-step--center">
                <FaCheckCircle className="tu-done-icon" />
                <h3 className="tu-state-title">Syllabuses Imported!</h3>
                <div className="tu-syl-results">
                  {(sylResults?.results || []).map((r, i) => (
                    <div key={i} className={`tu-syl-result ${r.success ? 'tu-syl-result--ok' : 'tu-syl-result--err'}`}>
                      <span className="tu-syl-result-name">{r.filename}</span>
                      <span className="tu-syl-result-status">
                        {r.success ? `✓ ${r.calendar_events_added || 0} events added` : `✗ ${r.error || 'Failed'}`}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="tu-actions tu-actions--center">
                  <button className="tu-btn tu-btn--primary" onClick={onClose}>Done</button>
                </div>
              </div>
            )}

            {(sylStep === 'idle' || sylStep === 'error') && (
              <div className="tu-step">
                <p className="tu-desc">
                  Upload your course syllabuses to automatically add lecture schedules, exams, and assignment deadlines to your calendar.
                </p>
                <div
                  className={`tu-dropzone ${sylDragOver ? 'tu-dropzone--over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setSylDragOver(true) }}
                  onDragLeave={() => setSylDragOver(false)}
                  onDrop={e => { e.preventDefault(); setSylDragOver(false); addSylFiles(Array.from(e.dataTransfer.files)) }}
                  onClick={() => sylFileRef.current?.click()}
                >
                  <input ref={sylFileRef} type="file" accept=".pdf" multiple hidden
                    onChange={e => addSylFiles(Array.from(e.target.files))} />
                  <FaCloudUploadAlt className="tu-dropzone-icon" />
                  <p className="tu-dropzone-main">Drop syllabus PDFs here</p>
                  <p className="tu-dropzone-sub">Multiple files · PDF only · max 15 MB each</p>
                </div>

                {sylFiles.length > 0 && (
                  <div className="tu-file-list">
                    {sylFiles.map(f => (
                      <div key={f.name} className="tu-file-row">
                        <FaFilePdf className="tu-file-pdf-icon" />
                        <span className="tu-file-name">{f.name}</span>
                        <span className="tu-file-size">{(f.size / 1024).toFixed(0)} KB</span>
                        <button className="tu-file-remove"
                          onClick={() => setSylFiles(prev => prev.filter(x => x.name !== f.name))}>
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {(sylError || sylStep === 'error') && (
                  <div className="tu-error-msg"><FaExclamationTriangle /> {sylError}</div>
                )}

                <div className="tu-actions">
                  <button className="tu-btn tu-btn--primary" onClick={handleSylUpload} disabled={!sylFiles.length}>
                    Import {sylFiles.length > 0 ? `${sylFiles.length} Syllabus${sylFiles.length !== 1 ? 'es' : ''}` : 'Syllabuses'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}