import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './Dashboard.css'

export default function Dashboard() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    major: '',
    year: '',
    interests: '',
    current_gpa: ''
  })

  // Placeholder states for chat and courses
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your McGill AI Academic Advisor. How can I help you plan your courses today?'
    }
  ])
  const [chatInput, setChatInput] = useState('')

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(profileForm)
      setEditingProfile(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    
    // Add user message
    setChatMessages([...chatMessages, { role: 'user', content: chatInput }])
    setChatInput('')
    
    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'This is a placeholder response. The chat functionality will be connected to the backend API soon!'
      }])
    }, 1000)
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">M</div>
            <span className="logo-name">McGill AI</span>
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-label">AI Chat</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <span className="nav-icon">📚</span>
            <span className="nav-label">Courses</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-label">Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{profile?.username || 'User'}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-signout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <button 
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h1 className="page-title">
            {activeTab === 'chat' && '💬 AI Academic Advisor'}
            {activeTab === 'courses' && '📚 Course Explorer'}
            {activeTab === 'profile' && '👤 Your Profile'}
          </h1>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.role}`}>
                    <div className="message-avatar">
                      {msg.role === 'user' ? user?.email?.[0].toUpperCase() : '🤖'}
                    </div>
                    <div className="message-content">
                      <div className="message-text">{msg.content}</div>
                    </div>
                  </div>
                ))}
              </div>

              <form className="chat-input-container" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask me anything about courses, planning, or McGill academics..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="btn btn-send">
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="courses-container">
              <div className="search-section">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search for courses (e.g., COMP 202, Introduction to Programming)..."
                />
                <button className="btn btn-search">Search</button>
              </div>

              <div className="placeholder-content">
                <div className="placeholder-icon">📚</div>
                <h3>Course Explorer Coming Soon</h3>
                <p>Search through 11,000+ McGill courses with historical grade data, instructor ratings, and AI-powered recommendations.</p>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-container">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar-large">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <h2>{profile?.username || 'User'}</h2>
                  <p>{user?.email}</p>
                </div>

                {!editingProfile ? (
                  <div className="profile-info">
                    <div className="info-row">
                      <span className="info-label">Major:</span>
                      <span className="info-value">{profile?.major || 'Not set'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Year:</span>
                      <span className="info-value">{profile?.year || 'Not set'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Interests:</span>
                      <span className="info-value">{profile?.interests || 'Not set'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Current GPA:</span>
                      <span className="info-value">{profile?.current_gpa || 'Not set'}</span>
                    </div>

                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        setProfileForm({
                          major: profile?.major || '',
                          year: profile?.year || '',
                          interests: profile?.interests || '',
                          current_gpa: profile?.current_gpa || ''
                        })
                        setEditingProfile(true)
                      }}
                    >
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <form className="profile-form" onSubmit={handleProfileUpdate}>
                    <div className="form-group">
                      <label>Major</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Computer Science"
                        value={profileForm.major}
                        onChange={(e) => setProfileForm({...profileForm, major: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label>Year</label>
                      <select
                        className="form-input"
                        value={profileForm.year}
                        onChange={(e) => setProfileForm({...profileForm, year: e.target.value})}
                      >
                        <option value="">Select year</option>
                        <option value="1">U0/U1</option>
                        <option value="2">U2</option>
                        <option value="3">U3</option>
                        <option value="4">U4+</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Interests</label>
                      <textarea
                        className="form-input"
                        placeholder="e.g., Machine Learning, Web Development, Data Science"
                        rows="3"
                        value={profileForm.interests}
                        onChange={(e) => setProfileForm({...profileForm, interests: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label>Current GPA</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        className="form-input"
                        placeholder="e.g., 3.5"
                        value={profileForm.current_gpa}
                        onChange={(e) => setProfileForm({...profileForm, current_gpa: e.target.value})}
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        Save Changes
                      </button>
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditingProfile(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}