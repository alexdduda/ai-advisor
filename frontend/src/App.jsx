import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { TimezoneProvider } from './contexts/TimezoneContext'
import Login from './components/Auth/Login'
import Dashboard from './components/Dashboard/Dashboard'
import ProfileSetup from './components/ProfileSetup/ProfileSetup'
import Loading from './components/Loading/Loading'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import './theme.css'
import './App.css'
import AdminSuggestions from './components/Admin/AdminSuggestions'

function AppContent() {
  const { user, profile, loading, error, needsOnboarding } = useAuth()

  // Enforce 2-second minimum loading screen
  const [minLoadDone, setMinLoadDone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMinLoadDone(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // Wait for both the minimum loading time AND auth state to resolve before
  // rendering anything — including the admin route. This ensures the session
  // is evaluated before the admin panel (or any other route) is displayed.
  if (loading || !minLoadDone) return <Loading />

  if (error?.type === 'AUTH_INIT_FAILED') {
    return (
      <div className="error-screen">
        <h2>Unable to initialize authentication</h2>
        <p>Please refresh the page or check your internet connection.</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    )
  }

  // Admin panel — only rendered after auth has resolved and user is logged in.
  // The server-side /api/admin/verify endpoint enforces the actual credential
  // check; this guard simply prevents the login form from loading before the
  // session is known.
  if (user && window.location.pathname === '/admin') return <AdminSuggestions />

  // New signup — show onboarding flow
  if (user && needsOnboarding) return <ProfileSetup />

  // Returning user with loaded profile
  if (user && profile) return <Dashboard />

  // Profile is being fetched
  if (user && !profile && !error) return <Loading />

  // Unauthenticated (also catches unauthenticated /admin attempts)
  return <Login />
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <TimezoneProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </TimezoneProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
