import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  validateEmail, 
  validatePassword, 
  validateUsername,
  getErrorMessage 
} from '../../utils/validation'
import './Auth.css'

function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const { signIn, signUp, error: authError, clearError } = useAuth()

  // Clear auth errors when switching modes
  useEffect(() => {
    clearError()
    setErrors({})
    setMessage('')
  }, [isLogin, clearError])

  const validateForm = () => {
    const newErrors = {}
    
    // Email validation
    const emailError = validateEmail(email)
    if (emailError) newErrors.email = emailError
    
    // Password validation
    const passwordError = validatePassword(password, !isLogin)
    if (passwordError) newErrors.password = passwordError
    
    // Username validation (signup only)
    if (!isLogin) {
      const usernameError = validateUsername(username)
      if (usernameError) newErrors.username = usernameError
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous messages
    setMessage('')
    setErrors({})
    clearError()
    
    // Validate form
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          setErrors({ form: getErrorMessage(error) })
        }
      } else {
        const { error } = await signUp(email, password, username.trim())
        if (error) {
          setErrors({ form: getErrorMessage(error) })
        } else {
          setMessage('Account created successfully! Redirecting...')
        }
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setErrors({ form: getErrorMessage(error) })
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setErrors({})
    setMessage('')
    clearError()
  }

  return (
    <div className="auth-page">
      {/* Left Side - Branding */}
      <div className="auth-branding">
        <div className="branding-content">
          <div className="mcgill-logo">
            <div className="logo-circle">
              <span className="logo-text">McGill</span>
            </div>
          </div>
          <h1 className="branding-title">AI Academic Advisor</h1>
          <p className="branding-subtitle">
            Your intelligent companion for course planning and academic success
          </p>
          
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span className="feature-text">AI-Powered Recommendations</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-text">Historical Grade Data</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span className="feature-text">Personalized Course Planning</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <span className="feature-text">24/7 Academic Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
            <p className="auth-description">
              {isLogin 
                ? 'Sign in to continue your academic journey'
                : 'Create your account to start planning'
              }
            </p>
          </div>

          {(errors.form || authError) && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {errors.form || getErrorMessage(authError)}
            </div>
          )}

          {message && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`form-input ${errors.username ? 'input-error' : ''}`}
                  autoComplete="username"
                  disabled={loading}
                />
                {errors.username && (
                  <p className="form-error">{errors.username}</p>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="john.doe@mail.mcgill.ca"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
                disabled={loading}
              />
              {errors.email && (
                <p className="form-error">{errors.email}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                autoComplete={isLogin ? "current-password" : "new-password"}
                disabled={loading}
              />
              {errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
              {!isLogin && !errors.password && (
                <p className="form-hint">
                  At least 8 characters with uppercase, lowercase, and numbers
                </p>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-toggle">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button 
                type="button"
                onClick={toggleMode}
                className="auth-toggle-btn"
                disabled={loading}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login