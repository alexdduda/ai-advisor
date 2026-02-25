import { useState, useRef } from 'react'
import { FaFileUpload, FaTimes, FaCheckCircle, FaSpinner, FaGraduationCap, FaBook, FaExclamationTriangle } from 'react-icons/fa'
import { BASE_URL } from '../../lib/apiConfig'
import './TranscriptUpload.css'

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
      onImportComplete?.()
    } catch (e) {
      setErrorMsg(e.message)
      setStep('error')
    }
  }

  const handleReset = () => {
    setStep('upload')
    setFile(null)
    setParsed(null)
    setResults(null)
    setErrorMsg('')
  }

  return (
    <div className="transcript-overlay">
      <div className="transcript-modal">
        <button className="transcript-close" onClick={onClose}><FaTimes /></button>

        {step === 'upload' && (
          <div className="transcript-step">
            <h2><FaGraduationCap /> Import Transcript</h2>
            <p className="transcript-desc">Upload your unofficial McGill transcript PDF to auto-import your courses and grades.</p>

            <div
              className={`transcript-dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files[0])} hidden />
              {file ? (
                <div className="transcript-file-info">
                  <FaBook size={24} />
                  <span>{file.name}</span>
                  <span className="file-size">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
              ) : (
                <>
                  <FaFileUpload size={32} />
                  <p>Drop your transcript PDF here, or click to browse</p>
                </>
              )}
            </div>

            {errorMsg && <p className="transcript-error"><FaExclamationTriangle /> {errorMsg}</p>}

            <button className="transcript-btn primary" onClick={handleParse} disabled={!file}>
              Parse Transcript
            </button>
          </div>
        )}

        {step === 'parsing' && (
          <div className="transcript-step center">
            <FaSpinner className="spin" size={32} />
            <p>Parsing your transcript with AI...</p>
            <p className="transcript-desc">This may take 10–20 seconds.</p>
          </div>
        )}

        {step === 'preview' && parsed && (
          <div className="transcript-step">
            <h2><FaCheckCircle color="#16a34a" /> Parsed Successfully</h2>

            {parsed.student_info && (
              <div className="transcript-section">
                <h3>Student Info</h3>
                <div className="transcript-info-grid">
                  {parsed.student_info.major && <div><strong>Major:</strong> {parsed.student_info.major}</div>}
                  {parsed.student_info.minor && <div><strong>Minor:</strong> {parsed.student_info.minor}</div>}
                  {parsed.student_info.faculty && <div><strong>Faculty:</strong> {parsed.student_info.faculty}</div>}
                  {parsed.student_info.year && <div><strong>Year:</strong> U{parsed.student_info.year}</div>}
                  {parsed.student_info.cum_gpa && <div><strong>Cumulative GPA:</strong> {parsed.student_info.cum_gpa}</div>}
                </div>
              </div>
            )}

            <div className="transcript-section">
              <h3>Completed Courses ({parsed.completed_courses?.length || 0})</h3>
              <div className="transcript-course-list">
                {(parsed.completed_courses || []).slice(0, 10).map((c, i) => (
                  <div key={i} className="transcript-course-item">
                    <span className="course-code">{c.course_code}</span>
                    <span className="course-title">{c.course_title}</span>
                    <span className="course-grade">{c.grade || '—'}</span>
                  </div>
                ))}
                {(parsed.completed_courses?.length || 0) > 10 && (
                  <p className="transcript-more">... and {parsed.completed_courses.length - 10} more</p>
                )}
              </div>
            </div>

            {(parsed.current_courses?.length || 0) > 0 && (
              <div className="transcript-section">
                <h3>Current Courses ({parsed.current_courses.length})</h3>
                <div className="transcript-course-list">
                  {parsed.current_courses.map((c, i) => (
                    <div key={i} className="transcript-course-item">
                      <span className="course-code">{c.course_code}</span>
                      <span className="course-title">{c.course_title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="transcript-actions">
              <button className="transcript-btn secondary" onClick={handleReset}>Re-upload</button>
              <button className="transcript-btn primary" onClick={handleImport}>Import All</button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="transcript-step center">
            <FaSpinner className="spin" size={32} />
            <p>Importing courses into your profile...</p>
          </div>
        )}

        {step === 'done' && (
          <div className="transcript-step center">
            <FaCheckCircle color="#16a34a" size={40} />
            <h2>Import Complete!</h2>
            {results && (
              <div className="transcript-results">
                <p>{results.completed_added} completed courses added</p>
                {results.completed_skipped > 0 && <p>{results.completed_skipped} already existed (skipped)</p>}
                <p>{results.current_added} current courses added</p>
                {results.profile_updated && <p>Profile info updated</p>}
              </div>
            )}
            <button className="transcript-btn primary" onClick={onClose}>Done</button>
          </div>
        )}

        {step === 'error' && (
          <div className="transcript-step center">
            <FaExclamationTriangle color="#dc2626" size={32} />
            <h2>Something went wrong</h2>
            <p className="transcript-error">{errorMsg}</p>
            <button className="transcript-btn secondary" onClick={handleReset}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  )
}