import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '../../utils/validation'
import './Auth.css'

function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [animating, setAnimating] = useState(false)

  const { signIn, signUp, error: authError, clearError } = useAuth()

  const isLogin = mode === 'login'
  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot'

  // Clear stale errors when the user switches between Sign In / Sign Up / Forgot.
  // clearError is now stable (useCallback in AuthContext), so this effect only
  // fires when `mode` genuinely changes — not on every render.
  useEffect(() => {
    clearError()
    setErrors({})
    setMessage('')
  }, [mode, clearError])

  const switchMode = (newMode) => {
    if (newMode === mode) return
    setAnimating(true)
    setTimeout(() => {
      setMode(newMode)
      setAnimating(false)
    }, 180)
  }

  const validateForm = () => {
    const newErrors = {}

    const emailError = validateEmail(email)
    if (emailError) newErrors.email = emailError

    if (!isForgot) {
      const passwordError = validatePassword(password, isSignup)
      if (passwordError) newErrors.password = passwordError
    }

    if (isSignup) {
      const usernameError = validateUsername(username)
      if (usernameError) newErrors.username = usernameError
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Clear previous submission errors (but not clearError — we don't want to
    // wipe the context error that might still be rendering while we validate).
    setMessage('')
    setErrors({})

    if (!validateForm()) return

    setLoading(true)

    try {
      if (isForgot) {
        // TODO: wire up supabase.auth.resetPasswordForEmail
        setMessage('If an account exists with this email, a reset link has been sent.')
        return
      }

      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          setErrors({ form: error.message })
        }
      } else {
        const { error } = await signUp(email, password, username.trim())
        if (error) {
          setErrors({ form: error.message })
        } else {
          setMessage('Account created! Redirecting...')
        }
      }
    } catch (err) {
      setErrors({ form: err.message || 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = (pw) => {
    if (!pw) return { level: 0, label: '', color: '' }
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[a-z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 2) return { level: score, label: 'Weak', color: 'var(--error-primary)' }
    if (score <= 3) return { level: score, label: 'Fair', color: 'var(--warning-primary)' }
    if (score <= 4) return { level: score, label: 'Good', color: 'var(--success-primary)' }
    return { level: score, label: 'Strong', color: 'var(--success-hover)' }
  }

  const strength = isSignup ? passwordStrength(password) : null

  // The form-level error: prefer the inline error set during submission,
  // fall back to the context error (e.g. set by a background auth event).
  const formError = errors.form || authError?.message

  return (
    <div className="auth-page">
      {/* ── Left branding panel ── */}
      <aside className="auth-branding">
        <div className="auth-branding-inner">
          <div className="auth-logo">
            <div className="auth-logo-mark">
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="5" fill="white" opacity="0.95"/>
                <circle cx="14" cy="14" r="11" stroke="white" strokeWidth="1.5" opacity="0.35"/>
                <circle cx="14" cy="14" r="7" stroke="white" strokeWidth="1" opacity="0.6"/>
              </svg>
            </div>
            <span className="auth-logo-name">Symbolos</span>
          </div>

          <div className="auth-branding-copy">
            <h1 className="auth-branding-headline">
              Your AI academic advisor.
            </h1>
            <p className="auth-branding-sub">
              Personalized course planning, historical grade data, and intelligent guidance — all in one place.
            </p>
          </div>

          <ul className="auth-feature-list">
            {[
              'AI-powered course recommendations',
              'Historical grade data across 10,000+ sections',
              'Degree planning tailored to your major & goals',
              '24/7 academic support via chat',
            ].map((text) => (
              <li key={text} className="auth-feature-item">
                <span className="auth-feature-dot" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="auth-form-panel">
        <div className={`auth-card ${animating ? 'auth-card--out' : 'auth-card--in'}`}>

          {/* Mode tabs */}
          {!isForgot && (
            <div className="auth-tabs" role="tablist">
              <button
                role="tab"
                aria-selected={isLogin}
                className={`auth-tab ${isLogin ? 'auth-tab--active' : ''}`}
                onClick={() => switchMode('login')}
                disabled={loading}
              >
                Sign In
              </button>
              <button
                role="tab"
                aria-selected={isSignup}
                className={`auth-tab ${isSignup ? 'auth-tab--active' : ''}`}
                onClick={() => switchMode('signup')}
                disabled={loading}
              >
                Create Account
              </button>
              <div className={`auth-tab-slider ${isSignup ? 'auth-tab-slider--right' : ''}`} />
            </div>
          )}

          {/* Heading */}
          <div className="auth-card-header">
            <h2 className="auth-card-title">
              {isForgot ? 'Reset password' : isLogin ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="auth-card-subtitle">
              {isForgot
                ? "We'll send a reset link to your email."
                : isLogin
                ? 'Sign in to continue your academic journey.'
                : 'Create your free Symboulos account.'}
            </p>
          </div>

          {/* Error alert */}
          {formError && (
            <div className="auth-alert auth-alert--error" role="alert">
              <span className="auth-alert-icon">!</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Success alert */}
          {message && (
            <div className="auth-alert auth-alert--success" role="alert">
              <span className="auth-alert-icon">✓</span>
              <span>{message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            {isSignup && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  className={`auth-input ${errors.username ? 'auth-input--error' : ''}`}
                  placeholder="e.g. john_doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={loading}
                />
                {errors.username && <p className="auth-error-msg">{errors.username}</p>}
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className={`auth-input ${errors.email ? 'auth-input--error' : ''}`}
                placeholder="you@mail.mcgill.ca"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
              {errors.email && <p className="auth-error-msg">{errors.email}</p>}
            </div>

            {!isForgot && (
              <div className="auth-field">
                <div className="auth-label-row">
                  <label className="auth-label" htmlFor="password">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      className="auth-forgot-btn"
                      onClick={() => switchMode('forgot')}
                      disabled={loading}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="auth-input-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-input auth-input--has-icon ${errors.password ? 'auth-input--error' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="auth-error-msg">{errors.password}</p>}
                {isSignup && !errors.password && (
                  <p className="auth-hint">At least 8 characters with uppercase, lowercase, and numbers</p>
                )}

                {isSignup && password && (
                  <div className="auth-strength">
                    <div className="auth-strength-bar">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="auth-strength-seg"
                          style={{ background: i <= strength.level ? strength.color : 'var(--border-primary)' }}
                        />
                      ))}
                    </div>
                    <span className="auth-strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  {isForgot ? 'Sending...' : isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                isForgot ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            {isForgot ? (
              <button className="auth-back-btn" onClick={() => switchMode('login')}>
                ← Back to Sign In
              </button>
            ) : (
              <p className="auth-toggle">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                {' '}
                <button
                  type="button"
                  className="auth-toggle-btn"
                  onClick={() => switchMode(isLogin ? 'signup' : 'login')}
                  disabled={loading}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

export default Login