import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { TimezoneProvider } from './contexts/TimezoneContext'
import Login from './components/Auth/Login'
import { supabase } from './lib/supabase'
import Dashboard from './components/Dashboard/Dashboard'
import ProfileSetup from './components/ProfileSetup/ProfileSetup'
import Loading from './components/Loading/Loading'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import './theme.css'
import './App.css'
import AdminSuggestions from './components/Admin/AdminSuggestions'

function AppContent() {
  const { user, profile, loading, error } = useAuth()
  if (window.location.pathname === '/admin') return <AdminSuggestions />
  
  if (loading) {
    return <Loading message="Setting up your session..." />
  }

  if (error?.type === 'AUTH_INIT_FAILED') {
    return (
      <div className="error-screen">
        <h2>Unable to initialize authentication</h2>
        <p>Please refresh the page or check your internet connection.</p>
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    )
  }

  // User is authenticated but profile doesn't exist (rare edge case)
  if (user && error?.type === 'PROFILE_NOT_FOUND') {
    return (
      <div className="error-screen">
        <h2>Profile Setup Issue</h2>
        <p>There was an issue setting up your profile. Please sign out and try again.</p>
        <button onClick={async () => {
          await supabase.auth.signOut()
          window.location.reload()
        }}>
          Sign Out
        </button>
      </div>
    )
  }

  // User is authenticated and has profile
  if (user && profile) {
    return <Dashboard />
  }

  // User is authenticated but profile is still loading
  if (user && !profile && !error) {
    return <Loading message="Loading your profile..." />
  }

  // No user - show login
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
