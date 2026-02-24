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

  if (window.location.pathname === '/admin') return <AdminSuggestions />

  if (loading) return <Loading message="Setting up your session..." />

  if (error?.type === 'AUTH_INIT_FAILED') {
    return (
      <div className="error-screen">
        <h2>Unable to initialize authentication</h2>
        <p>Please refresh the page or check your internet connection.</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    )
  }

  // New signup — show onboarding flow regardless of profile state
  if (user && needsOnboarding) return <ProfileSetup />

  // Returning user with loaded profile
  if (user && profile) return <Dashboard />

  // Profile is being fetched
  if (user && !profile && !error) return <Loading message="Loading your profile..." />

  // Unauthenticated
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