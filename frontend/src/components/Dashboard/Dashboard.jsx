import { useAuth } from '../../contexts/AuthContext'

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to McGill AI Advisor!</h1>
      <p>User: {user?.email}</p>
      {profile && (
        <div>
          <p>Major: {profile.major || 'Not set'}</p>
          <p>Year: {profile.year || 'Not set'}</p>
        </div>
      )}
      <button onClick={signOut}>Sign Out</button>
      <p style={{ marginTop: '20px', color: '#666' }}>
        Dashboard coming soon...
      </p>
    </div>
  )
}