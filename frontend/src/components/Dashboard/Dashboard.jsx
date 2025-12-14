import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { chatAPI } from '../../lib/api'
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

  // Chat states
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [chatError, setChatError] = useState(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user?.id) return
      
      try {
        setIsLoadingHistory(true)
        const data = await chatAPI.getHistory(user.id, 50)
        
        if (data.messages && data.messages.length > 0) {
          setChatMessages(data.messages)
        } else {
          // If no history, show welcome message
          setChatMessages([
            {
              role: 'assistant',
              content: 'Hello! I\'m your McGill AI Academic Advisor. How can I help you plan your courses today?'
            }
          ])
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
        // Show welcome message even if history fails to load
        setChatMessages([
          {
            role: 'assistant',
            content: 'Hello! I\'m your McGill AI Academic Advisor. How can I help you plan your courses today?'
          }
        ])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    if (activeTab === 'chat') {
      loadChatHistory()
    }
  }, [user?.id, activeTab])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    
    try {
      // Build update object - only include non-empty fields
      const updates = {}
      
      if (profileForm.major && profileForm.major.trim()) {
        updates.major = profileForm.major.trim()
      }
      
      if (profileForm.year) {
        updates.year = parseInt(profileForm.year)
      }
      
      if (profileForm.interests && profileForm.interests.trim()) {
        updates.interests = profileForm.interests.trim()
      }
      
      if (profileForm.current_gpa) {
        const gpa = parseFloat(profileForm.current_gpa)
        if (!isNaN(gpa) && gpa >= 0 && gpa <= 4) {
          updates.current_gpa = gpa
        }
      }
      
      // Only send update if there's something to update
      if (Object.keys(updates).length > 0) {
        await updateProfile(updates)
        setEditingProfile(false)
      } else {
        // No changes, just close edit mode
        setEditingProfile(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || isSending || !user?.id) return
    
    const userMessage = chatInput.trim()
    setChatInput('')
    setChatError(null)
    
    // Add user message immediately
    const newUserMessage = { role: 'user', content: userMessage }
    setChatMessages(prev => [...prev, newUserMessage])
    
    setIsSending(true)
    
    try {
      // Call the actual API
      const response = await chatAPI.sendMessage(user.id, userMessage)
      
      // Add AI response
      const assistantMessage = {
        role: 'assistant',
        content: response.response
      }
      
      setChatMessages(prev => [...prev, assistantMessage])
      
    } catch (error) {
      console.error('Error sending message:', error)
      setChatError('Failed to get response. Please try again.')
      
      // Add error message to chat
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again or contact support if the issue persists.'
      }])
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
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
                {isLoadingHistory ? (
                  <div className="message assistant">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                      <div className="message-text">Loading chat history...</div>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                      <div className="message-avatar">
                        {msg.role === 'user' ? user?.email?.[0].toUpperCase() : '🤖'}
                      </div>
                      <div className="message-content">
                        <div className="message-text">{msg.content}</div>
                      </div>
                    </div>
                  ))
                )}
                
                {isSending && (
                  <div className="message assistant">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                      <div className="message-text">
                        <span className="typing-indicator">●●●</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {chatError && (
                <div style={{
                  padding: '1rem',
                  background: '#fee',
                  color: '#c33',
                  borderTop: '1px solid #e99',
                  textAlign: 'center'
                }}>
                  {chatError}
                </div>
              )}

              <form className="chat-input-container" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask me anything about courses, planning, or McGill academics..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSending}
                />
                <button 
                  type="submit" 
                  className="btn btn-send"
                  disabled={isSending || !chatInput.trim()}
                >
                  {isSending ? 'Sending...' : 'Send'}
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
  <div className="profile-page">
    <div className="profile-page-header">
      <div className="profile-hero">
        <div className="profile-avatar-section">
          <div className="profile-avatar-xl">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="profile-hero-info">
            <h1 className="profile-display-name">{profile?.username || 'McGill Student'}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-badges">
              <span className="badge badge-year">
                {profile?.year ? `Year ${profile.year}` : 'Year not set'}
              </span>
              {profile?.major && (
                <span className="badge badge-major">
                  {profile.major}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="profile-content">
      <div className="profile-grid">
        {/* Personal Information Card */}
        <div className="profile-section-card">
          <div className="card-header">
            <div className="card-title-group">
              <span className="card-icon">👤</span>
              <h2 className="card-title">Personal Information</h2>
            </div>
            {!editingProfile && (
              <button 
              className="btn-icon-edit"
              onClick={() => {
                setProfileForm({
                  major: profile?.major || '',
                  year: profile?.year || '',
                  interests: profile?.interests || '',
                  current_gpa: profile?.current_gpa || ''
                })
                setEditingProfile(true)
              }}
              title="Edit Profile"
            >
              ✏️
            </button>
            )}
          </div>
          <div className="card-content">
            {!editingProfile ? (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-icon">🎓</span>
                  <div className="info-details">
                    <span className="info-label">Major</span>
                    <span className="info-value">{profile?.major || 'Not specified'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">📅</span>
                  <div className="info-details">
                    <span className="info-label">Academic Year</span>
                    <span className="info-value">
                      {profile?.year ? `U${profile.year}` : 'Not specified'}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">📧</span>
                  <div className="info-details">
                    <span className="info-label">Email</span>
                    <span className="info-value">{user?.email}</span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">👤</span>
                  <div className="info-details">
                    <span className="info-label">Username</span>
                    <span className="info-value">{profile?.username || 'Not set'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form className="edit-form" onSubmit={handleProfileUpdate}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Major</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Computer Science"
                      value={profileForm.major}
                      onChange={(e) => setProfileForm({...profileForm, major: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <select
                      className="form-input"
                      value={profileForm.year}
                      onChange={(e) => setProfileForm({...profileForm, year: e.target.value})}
                    >
                      <option value="">Select year</option>
                      <option value="1">U1</option>
                      <option value="2">U2</option>
                      <option value="3">U3</option>
                      <option value="4">U4</option>
                      <option value="5">U5+</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions-inline">
                  <button type="submit" className="btn btn-primary-sm">
                    💾 Save Changes
                  </button>
                  <button 
                    type="button"
                    className="btn btn-secondary-sm"
                    onClick={() => setEditingProfile(false)}
                  >
                    ✕ Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Academic Performance Card */}
        <div className="profile-section-card">
          <div className="card-header">
            <div className="card-title-group">
              <span className="card-icon">📊</span>
              <h2 className="card-title">Academic Performance</h2>
            </div>
          </div>
          <div className="card-content">
            <div className="stat-showcase">
              <div className="stat-item">
                <div className="stat-value-large">
                  {profile?.current_gpa || '--'}
                </div>
                <div className="stat-label">Current GPA</div>
              </div>
            </div>
            {editingProfile && (
              <div className="form-group" style={{marginTop: '1rem'}}>
                <label className="form-label">Update GPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  className="form-input"
                  placeholder="e.g., 3.75"
                  value={profileForm.current_gpa}
                  onChange={(e) => setProfileForm({...profileForm, current_gpa: e.target.value})}
                />
              </div>
            )}
            <div className="performance-tips">
              <div className="tip-item">
                <span className="tip-icon">💡</span>
                <p className="tip-text">Keep your GPA updated for better course recommendations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interests & Preferences Card */}
        <div className="profile-section-card card-full-width">
          <div className="card-header">
            <div className="card-title-group">
              <span className="card-icon">✨</span>
              <h2 className="card-title">Interests & Preferences</h2>
            </div>
          </div>
          <div className="card-content">
            {!editingProfile ? (
              <div className="interests-display">
                {profile?.interests ? (
                  <div className="interests-tags">
                    {profile.interests.split(',').map((interest, idx) => (
                      <span key={idx} className="interest-tag">
                        {interest.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">
                    <span className="empty-icon">🎯</span>
                    <span>No interests added yet. Add your academic interests to get personalized recommendations!</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Your Interests</label>
                <textarea
                  className="form-input"
                  placeholder="e.g., Machine Learning, Web Development, Data Science, Finance (comma-separated)"
                  rows="4"
                  value={profileForm.interests}
                  onChange={(e) => setProfileForm({...profileForm, interests: e.target.value})}
                />
                <p className="form-hint">Separate multiple interests with commas</p>
              </div>
            )}
          </div>
        </div>

        {/* Account Settings Card */}
        <div className="profile-section-card card-full-width">
          <div className="card-header">
            <div className="card-title-group">
              <span className="card-icon">⚙️</span>
              <h2 className="card-title">Account Settings</h2>
            </div>
          </div>
          <div className="card-content">
            <div className="settings-grid">
              <div className="setting-item">
                <div className="setting-info">
                  <h3 className="setting-title">Account Status</h3>
                  <p className="setting-description">Your account is active and verified</p>
                </div>
                <span className="status-badge status-active">Active</span>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h3 className="setting-title">Member Since</h3>
                  <p className="setting-description">
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'Recently joined'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
        </div>
      </main>
    </div>
  )
}