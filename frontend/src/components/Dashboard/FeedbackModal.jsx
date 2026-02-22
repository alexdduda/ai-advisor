/**
 * FeedbackModal.jsx
 *
 * A feedback button + modal styled to match the existing ProfSuggestionPopover.
 * Two modes:
 *   - General feedback (free text, submitted to your backend or mailto)
 *   - Missing course (course code + optional note)
 *
 * USAGE — add to Dashboard.jsx:
 *
 *   import FeedbackModal from './FeedbackModal'
 *
 *   // In the return, just before the closing </div> of .dashboard:
 *   <FeedbackModal userId={user?.id} userEmail={user?.email} />
 */

import { useState, useRef, useEffect } from 'react'
import { FaFlag, FaCheck, FaTimes, FaCommentAlt, FaSearch } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import './FeedbackModal.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const normalizeUrl = (url) => {
  let n = url.replace(/\/$/, '')
  if (n.endsWith('/api')) n = n.slice(0, -4)
  return n
}
const BASE_URL = normalizeUrl(API_URL)

export default function FeedbackModal() {
  const { user } = useAuth()
  const [open, setOpen]     = useState(false)
  const [mode, setMode]     = useState(null) // null | 'general' | 'missing-course'
  const [text, setText]     = useState('')
  const [course, setCourse] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success | error | duplicate
  const modalRef = useRef(null)
  const inputRef = useRef(null)

  // Focus first input when mode is selected
  useEffect(() => {
    if (mode) setTimeout(() => inputRef.current?.focus(), 50)
  }, [mode])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handle = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) close()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  const close = () => {
    setOpen(false)
    setMode(null)
    setText('')
    setCourse('')
    setStatus('idle')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = mode === 'missing-course'
      ? { type: 'missing_course', course_code: course.trim(), note: text.trim(), user_id: user?.id }
      : { type: 'general', message: text.trim(), user_id: user?.id }

    if (!payload.course_code && !payload.message) return

    setStatus('submitting')

    try {
      // Try to POST to your feedback endpoint.
      // If you don't have one yet, it falls through to the mailto fallback.
      const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.status === 409) { setStatus('duplicate'); return }
      if (!res.ok) throw new Error('not ok')

      setStatus('success')
      setTimeout(() => close(), 2000)
    } catch {
      // Fallback: open mailto so feedback is never lost
      const subject = encodeURIComponent(
        mode === 'missing-course'
          ? `[Symboulos] Missing Course: ${course.trim()}`
          : '[Symboulos] Feedback'
      )
      const body = encodeURIComponent(
        mode === 'missing-course'
          ? `Missing course: ${course.trim()}\nNote: ${text.trim()}\nUser: ${user?.email || 'anonymous'}`
          : `${text.trim()}\n\nUser: ${user?.email || 'anonymous'}`
      )
      window.open(`mailto:feedback@symboulos.ca?subject=${subject}&body=${body}`)
      setStatus('success')
      setTimeout(() => close(), 2000)
    }
  }

  return (
    <>
      {/* Trigger button — bottom right corner */}
      <button className="feedback-trigger-btn" onClick={() => setOpen(true)} title="Send feedback">
        <FaCommentAlt />
        <span>Feedback</span>
      </button>

      {/* Overlay + Modal */}
      {open && (
        <div className="feedback-overlay">
          <div className="feedback-modal" ref={modalRef}>

            {/* Header */}
            <div className="feedback-modal-header">
              <FaFlag className="feedback-modal-flag" />
              <span>Send Feedback</span>
              <button className="feedback-modal-close" onClick={close}>
                <FaTimes />
              </button>
            </div>

            {/* Mode selection */}
            {!mode && status === 'idle' && (
              <div className="feedback-mode-select">
                <p className="feedback-modal-desc">What would you like to tell us?</p>
                <button className="feedback-mode-btn" onClick={() => setMode('general')}>
                  <FaCommentAlt className="feedback-mode-icon" />
                  <div>
                    <strong>General Feedback</strong>
                    <span>Bug reports, suggestions, anything else</span>
                  </div>
                </button>
                <button className="feedback-mode-btn" onClick={() => setMode('missing-course')}>
                  <FaSearch className="feedback-mode-icon" />
                  <div>
                    <strong>Missing Course</strong>
                    <span>Can't find a course you're looking for?</span>
                  </div>
                </button>
              </div>
            )}

            {/* General feedback form */}
            {mode === 'general' && status === 'idle' && (
              <form className="feedback-form" onSubmit={handleSubmit}>
                <p className="feedback-modal-desc">
                  Tell us what's working, what's broken, or what you'd like to see.
                </p>
                <textarea
                  ref={inputRef}
                  className="feedback-textarea"
                  placeholder="Your feedback..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  disabled={status === 'submitting'}
                />
                <div className="feedback-form-actions">
                  <button type="button" className="feedback-cancel-btn" onClick={() => setMode(null)}>← Back</button>
                  <button
                    type="submit"
                    className="feedback-submit-btn"
                    disabled={!text.trim() || status === 'submitting'}
                  >
                    {status === 'submitting' ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </form>
            )}

            {/* Missing course form */}
            {mode === 'missing-course' && status === 'idle' && (
              <form className="feedback-form" onSubmit={handleSubmit}>
                <p className="feedback-modal-desc">
                  Tell us which course you couldn't find and we'll work on adding it.
                </p>
                <input
                  ref={inputRef}
                  className="feedback-input"
                  type="text"
                  placeholder="Course code, e.g. POLS 340"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  maxLength={50}
                  disabled={status === 'submitting'}
                />
                <textarea
                  className="feedback-textarea feedback-textarea--short"
                  placeholder="Any extra context? (optional)"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  maxLength={300}
                  rows={2}
                  disabled={status === 'submitting'}
                />
                <div className="feedback-form-actions">
                  <button type="button" className="feedback-cancel-btn" onClick={() => setMode(null)}>← Back</button>
                  <button
                    type="submit"
                    className="feedback-submit-btn"
                    disabled={!course.trim() || status === 'submitting'}
                  >
                    {status === 'submitting' ? 'Sending…' : 'Submit'}
                  </button>
                </div>
              </form>
            )}

            {/* Success */}
            {status === 'success' && (
              <div className="feedback-success">
                <FaCheck /> Thanks! We got your feedback.
              </div>
            )}

            {/* Duplicate */}
            {status === 'duplicate' && (
              <div className="feedback-duplicate">
                Looks like you already submitted this recently.
                <button className="feedback-cancel-btn" onClick={close}>Close</button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}