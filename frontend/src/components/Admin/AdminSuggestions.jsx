import { useState, useEffect } from 'react'
import { FaCheck, FaTimes, FaFlag, FaClock } from 'react-icons/fa'
import { BASE_URL } from '../../lib/apiConfig'
import './AdminSuggestions.css'

// ── Guard: refuse to render if the env var is missing ──────────────────────
// In production builds, VITE_ADMIN_PASSWORD must always be set.
// We intentionally do NOT provide a fallback value — if this is undefined the
// component will show a hard error rather than silently accepting any guess.
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

const EnvMissing = () => (
  <div className="admin-login">
    <h2 style={{ color: '#dc2626' }}>⚠ Configuration Error</h2>
    <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.5 }}>
      <strong>VITE_ADMIN_PASSWORD</strong> is not set in the environment.
      <br /><br />
      Set it in your <code>.env</code> file (local) or in the Vercel environment
      variables (production) then redeploy.
    </p>
  </div>
)

export default function AdminSuggestions() {
  // Hard-stop: no password configured at all
  if (!ADMIN_PASSWORD) return <EnvMissing />

  return <AdminSuggestionsInner />
}

function AdminSuggestionsInner() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [adminSecret, setAdminSecret] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [filter, setFilter] = useState('pending') // pending | all
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)
  // Track consecutive failures to lock out brute-force attempts
  const [attempts, setAttempts] = useState(0)
  const LOCK_AFTER = 5

  const login = (e) => {
    e.preventDefault()

    if (attempts >= LOCK_AFTER) {
      setError(`Too many failed attempts. Refresh the page to try again.`)
      return
    }

    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      setAdminSecret(password)
      setAttempts(0)
    } else {
      const next = attempts + 1
      setAttempts(next)
      setError(
        next >= LOCK_AFTER
          ? 'Too many failed attempts. Refresh the page to try again.'
          : `Incorrect password. ${LOCK_AFTER - next} attempt${LOCK_AFTER - next === 1 ? '' : 's'} remaining.`
      )
    }
  }

  const fetchSuggestions = async () => {
    try {
      const endpoint =
        filter === 'pending'
          ? '/api/suggestions/admin/pending'
          : '/api/suggestions/admin/all'
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'X-Cron-Secret': adminSecret },
      })
      if (!res.ok) {
        if (res.status === 401) {
          setError('Authentication failed. Check your admin credentials.')
          return
        }
        throw new Error()
      }
      const data = await res.json()
      setSuggestions(data.suggestions || [])
    } catch {
      setError('Failed to load suggestions')
    }
  }

  useEffect(() => {
    if (authed) fetchSuggestions()
  }, [authed, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReview = async (id, status) => {
    setActionLoading(id)
    try {
      const res = await fetch(`${BASE_URL}/api/suggestions/admin/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Cron-Secret': adminSecret,
        },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      if (filter === 'pending') {
        setSuggestions((prev) => prev.filter((s) => s.id !== id))
      } else {
        setSuggestions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status } : s))
        )
      }
    } catch {
      setError('Failed to update suggestion')
    } finally {
      setActionLoading(null)
    }
  }

  if (!authed) {
    const locked = attempts >= LOCK_AFTER
    return (
      <div className="admin-login">
        <h2>
          <FaFlag /> Admin — Prof Suggestions
        </h2>
        <form onSubmit={login}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
            disabled={locked}
            autoComplete="current-password"
          />
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="admin-btn-primary" disabled={locked}>
            Enter
          </button>
        </form>
      </div>
    )
  }

  const statusBadge = (s) => {
    if (s === 'pending')
      return (
        <span className="badge badge-pending">
          <FaClock /> Pending
        </span>
      )
    if (s === 'approved')
      return (
        <span className="badge badge-approved">
          <FaCheck /> Approved
        </span>
      )
    return (
      <span className="badge badge-rejected">
        <FaTimes /> Rejected
      </span>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>
          <FaFlag /> Professor Suggestions
        </h2>
        <div className="admin-filter">
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      {suggestions.length === 0 ? (
        <div className="admin-empty">
          No {filter === 'pending' ? 'pending' : ''} suggestions found.
        </div>
      ) : (
        <div className="suggestions-list">
          {suggestions.map((s) => (
            <div key={s.id} className={`suggestion-card ${s.status}`}>
              <div>
                <div className="suggestion-course">{s.course_code}</div>
                <div className="suggestion-names">
                  <span className="name-chip suggested">
                    Suggested: {s.suggested_professor}
                  </span>
                  {s.current_professor && (
                    <span className="name-chip current">
                      Current: {s.current_professor}
                    </span>
                  )}
                </div>
                <div className="suggestion-meta">
                  {statusBadge(s.status)} &middot;{' '}
                  {new Date(s.created_at).toLocaleDateString()}
                </div>
              </div>
              {s.status === 'pending' && (
                <div className="suggestion-actions">
                  <button
                    className="action-btn approve"
                    onClick={() => handleReview(s.id, 'approved')}
                    disabled={actionLoading === s.id}
                  >
                    <FaCheck />
                  </button>
                  <button
                    className="action-btn reject"
                    onClick={() => handleReview(s.id, 'rejected')}
                    disabled={actionLoading === s.id}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}