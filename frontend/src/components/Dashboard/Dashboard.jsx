import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { chatAPI } from '../../lib/api'
import coursesAPI from '../../lib/professorsAPI'
import ProfessorRating, { ProfessorRatingCompact } from '../ProfessorRating/ProfessorRating'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Dashboard.css'

export default function Dashboard() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    major: '',
    year: '',
    interests: '',
    current_gpa: ''
  })

  // Chat tabs state
  const [chatTabs, setChatTabs] = useState([{ id: 1, title: 'New Chat', messages: [], sessionId: null }])
  const [activeChatTab, setActiveChatTab] = useState(1)
  const [nextChatTabId, setNextChatTabId] = useState(2)
  const [chatHistory, setChatHistory] = useState([])

  // Chat states
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [chatError, setChatError] = useState(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef(null)

  // Course search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isLoadingCourse, setIsLoadingCourse] = useState(false)
  const [sortBy, setSortBy] = useState('relevance') // New sort state

  // Get current chat tab's messages
  const getCurrentChatMessages = () => {
    const currentTab = chatTabs.find(tab => tab.id === activeChatTab)
    return currentTab ? currentTab.messages : []
  }

  // Drag-able Sidebar
  const [leftToggleY, setLeftToggleY] = useState(20)
  const [rightToggleY, setRightToggleY] = useState(20)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartPos, setDragStartPos] = useState(0)

  // Left sidebar toggle drag handlers
  const handleLeftToggleMouseDown = (e) => {
    if (sidebarOpen) return
    setIsDraggingLeft(true)
    setDragStartY(e.clientY)
    setDragStartPos(leftToggleY)
    e.preventDefault()
  }

  const handleLeftToggleTouchStart = (e) => {
    if (sidebarOpen) return
    setIsDraggingLeft(true)
    setDragStartY(e.touches[0].clientY)
    setDragStartPos(leftToggleY)
    e.preventDefault()
  }

  // Right sidebar toggle drag handlers
  const handleRightToggleMouseDown = (e) => {
    if (rightSidebarOpen) return
    setIsDraggingRight(true)
    setDragStartY(e.clientY)
    setDragStartPos(rightToggleY)
    e.preventDefault()
  }

  const handleRightToggleTouchStart = (e) => {
    if (rightSidebarOpen) return
    setIsDraggingRight(true)
    setDragStartY(e.touches[0].clientY)
    setDragStartPos(rightToggleY)
    e.preventDefault()
  }

  // Update current chat tab's messages
  const updateCurrentChatMessages = (newMessages) => {
    setChatTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === activeChatTab
          ? { ...tab, messages: newMessages }
          : tab
      )
    )
  }

  // Get current chat tab
  const getCurrentChatTab = () => {
    return chatTabs.find(tab => tab.id === activeChatTab)
  }

  // Update current chat tab's session ID
  const updateCurrentChatSessionId = (sessionId) => {
    setChatTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === activeChatTab
          ? { ...tab, sessionId: sessionId }
          : tab
      )
    )
  }

  // Create new chat tab
  const createNewChatTab = () => {
    const newTab = {
      id: nextChatTabId,
      title: 'New Chat',
      messages: [],
      sessionId: null
    }
    setChatTabs([...chatTabs, newTab])
    setActiveChatTab(nextChatTabId)
    setNextChatTabId(nextChatTabId + 1)
  }

  // Close chat tab
  const closeChatTab = (tabId, e) => {
    e.stopPropagation()
    if (chatTabs.length === 1) {
      setChatTabs([{ id: nextChatTabId, title: 'New Chat', messages: [], sessionId: null }])
      setActiveChatTab(nextChatTabId)
      setNextChatTabId(nextChatTabId + 1)
      return
    }

    const newTabs = chatTabs.filter(tab => tab.id !== tabId)
    setChatTabs(newTabs)

    if (activeChatTab === tabId) {
      setActiveChatTab(newTabs[newTabs.length - 1].id)
    }
  }

  // Handle drag and drop for tab reordering
  const [draggedTab, setDraggedTab] = useState(null)

  const handleDragStart = (e, tabId) => {
    setDraggedTab(tabId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetTabId) => {
    e.preventDefault()
    
    if (draggedTab === targetTabId) return
    
    const draggedIndex = chatTabs.findIndex(tab => tab.id === draggedTab)
    const targetIndex = chatTabs.findIndex(tab => tab.id === targetTabId)
    
    const newTabs = [...chatTabs]
    const [removed] = newTabs.splice(draggedIndex, 1)
    newTabs.splice(targetIndex, 0, removed)
    
    setChatTabs(newTabs)
    setDraggedTab(null)
  }

  const handleDragEnd = () => {
    setDraggedTab(null)
  }

  // Load historical chat session into new tab
  const loadHistoricalChat = async (sessionId) => {
    try {
      setIsLoadingHistory(true)
      setRightSidebarOpen(false)
      
      const existingTab = chatTabs.find(tab => tab.sessionId === sessionId)
      if (existingTab) {
        setActiveChatTab(existingTab.id)
        setIsLoadingHistory(false)
        return
      }
      
      const data = await chatAPI.getHistory(user.id, sessionId, 200)
      
      if (data.messages && data.messages.length > 0) {
        const firstUserMessage = data.messages.find(m => m.role === 'user')
        const title = firstUserMessage 
          ? (firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : ''))
          : 'Previous Chat'

        const newTab = {
          id: nextChatTabId,
          title: title,
          messages: data.messages,
          sessionId: sessionId
        }
        
        setChatTabs([...chatTabs, newTab])
        setActiveChatTab(nextChatTabId)
        setNextChatTabId(nextChatTabId + 1)
      }
    } catch (error) {
      console.error('Error loading historical chat:', error)
      setChatError('Failed to load chat history')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Load available sessions from backend
  const loadChatSessions = async () => {
    try {
      const data = await chatAPI.getSessions(user.id, 20)
      
      if (data.sessions && data.sessions.length > 0) {
        const history = data.sessions.map(session => ({
          id: session.session_id,
          title: session.last_message || 'Previous Chat',
          messageCount: session.message_count || 0,
          lastUpdated: session.last_updated
        }))
        setChatHistory(history)
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error)
    }
  }

  // Helper function to convert GPA to letter grade
  const gpaToLetterGrade = (gpa) => {
    if (!gpa) return '';
    const numGpa = parseFloat(gpa);
    if (numGpa >= 3.85) return 'A';
    if (numGpa >= 3.7) return 'A-';
    if (numGpa >= 3.3) return 'B+';
    if (numGpa >= 3.0) return 'B';
    if (numGpa >= 2.7) return 'B-';
    if (numGpa >= 2.3) return 'C+';
    if (numGpa >= 2.0) return 'C';
    if (numGpa >= 1.0) return 'D';
    return 'F';
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatTabs, activeChatTab])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft) {
        const deltaY = e.clientY - dragStartY
        const newY = Math.max(20, Math.min(window.innerHeight - 56, dragStartPos + deltaY))
        setLeftToggleY(newY)
      }
      if (isDraggingRight) {
        const deltaY = e.clientY - dragStartY
        const newY = Math.max(20, Math.min(window.innerHeight - 56, dragStartPos + deltaY))
        setRightToggleY(newY)
      }
    }

    const handleTouchMove = (e) => {
      if (isDraggingLeft) {
        const deltaY = e.touches[0].clientY - dragStartY
        const newY = Math.max(20, Math.min(window.innerHeight - 56, dragStartPos + deltaY))
        setLeftToggleY(newY)
      }
      if (isDraggingRight) {
        const deltaY = e.touches[0].clientY - dragStartY
        const newY = Math.max(20, Math.min(window.innerHeight - 56, dragStartPos + deltaY))
        setRightToggleY(newY)
      }
    }

    const handleMouseUp = () => {
      setIsDraggingLeft(false)
      setIsDraggingRight(false)
    }

    if (isDraggingLeft || isDraggingRight) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [isDraggingLeft, isDraggingRight, dragStartY, dragStartPos, leftToggleY, rightToggleY])

  // Initialize chat on mount
  useEffect(() => {
    const initializeChat = async () => {
      if (!user?.id) return
      
      try {
        setIsLoadingHistory(true)
        
        await loadChatSessions()
        
        if (chatTabs.length === 1 && chatTabs[0].messages.length === 0) {
          setChatTabs([{
            id: 1,
            title: 'New Chat',
            messages: [{
              role: 'assistant',
              content: 'Hello! I\'m your McGill AI Academic Advisor. How can I help you plan your courses today?'
            }],
            sessionId: null
          }])
        }
        
      } catch (error) {
        console.error('Error initializing chat:', error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    if (activeTab === 'chat') {
      initializeChat()
    }
  }, [user?.id, activeTab])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    
    try {
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
      
      if (Object.keys(updates).length > 0) {
        await updateProfile(updates)
        setEditingProfile(false)
      } else {
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
    const currentMessages = getCurrentChatMessages()
    const currentTab = getCurrentChatTab()
    const currentSessionId = currentTab?.sessionId
    
    setChatInput('')
    setChatError(null)
    
    const newUserMessage = { role: 'user', content: userMessage }
    
    if (currentMessages.length === 0 || (currentMessages.length === 1 && currentMessages[0].role === 'assistant')) {
      const newTitle = userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage
      setChatTabs(prevTabs =>
        prevTabs.map(tab =>
          tab.id === activeChatTab ? { ...tab, title: newTitle } : tab
        )
      )
    }
    
    updateCurrentChatMessages([...currentMessages, newUserMessage])
    
    setIsSending(true)
    
    try {
      const response = await chatAPI.sendMessage(user.id, userMessage, currentSessionId)
      
      const assistantMessage = {
        role: 'assistant',
        content: response.response
      }
      
      if (!currentSessionId && response.session_id) {
        updateCurrentChatSessionId(response.session_id)
        console.log('New session created:', response.session_id)
      }
      
      updateCurrentChatMessages([...currentMessages, newUserMessage, assistantMessage])
      
      await loadChatSessions()
      
    } catch (error) {
      console.error('Error sending message:', error)
      setChatError('Failed to get response. Please try again.')
      
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again or contact support if the issue persists.'
      }
      updateCurrentChatMessages([...currentMessages, newUserMessage, errorMessage])
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

  // Sort function for course results
  const sortCourses = (courses, sortType) => {
    const sorted = [...courses]
    
    switch(sortType) {
      case 'rating-high':
        return sorted.sort((a, b) => {
          const ratingA = a.rmp_rating || 0
          const ratingB = b.rmp_rating || 0
          return ratingB - ratingA // Highest first
        })
      
      case 'rating-low':
        return sorted.sort((a, b) => {
          const ratingA = a.rmp_rating || 0
          const ratingB = b.rmp_rating || 0
          return ratingA - ratingB // Lowest first
        })
      
      case 'name-az':
        return sorted.sort((a, b) => {
          const nameA = `${a.subject} ${a.catalog}`
          const nameB = `${b.subject} ${b.catalog}`
          return nameA.localeCompare(nameB)
        })
      
      case 'name-za':
        return sorted.sort((a, b) => {
          const nameA = `${a.subject} ${a.catalog}`
          const nameB = `${b.subject} ${b.catalog}`
          return nameB.localeCompare(nameA)
        })
      
      case 'instructor-az':
        return sorted.sort((a, b) => {
          const instrA = a.instructor || 'ZZZ'
          const instrB = b.instructor || 'ZZZ'
          return instrA.localeCompare(instrB)
        })
      
      case 'instructor-za':
        return sorted.sort((a, b) => {
          const instrA = a.instructor || ''
          const instrB = b.instructor || ''
          return instrB.localeCompare(instrA)
        })
      
      case 'relevance':
      default:
        return sorted // Already sorted by backend
    }
  }

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  // OPTIMIZED Course search handler - reduced limit and better grouping
  const handleCourseSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchError(null)
    setSelectedCourse(null)
    setSortBy('relevance') // Reset sort on new search

    try {
      // Reduced limit from 100 to 50 for faster response
      const data = await coursesAPI.search(searchQuery, null, 50)
      
      console.log('Search response:', data) // Debug log
      
      // Backend already groups courses, just use them directly
      const courses = data.courses || []
      
      setSearchResults(courses)
      
      if (courses.length === 0) {
        setSearchError('No courses found matching your search.')
      }
    } catch (error) {
      console.error('Course search error:', error)
      setSearchError('Failed to search courses. Please try again.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Load course details
  const handleCourseClick = async (course) => {
    setIsLoadingCourse(true)
    setSelectedCourse(null)

    try {
      const data = await coursesAPI.getDetails(course.subject, course.catalog)
      console.log('Course details:', data) // Debug log
      setSelectedCourse(data.course)
    } catch (error) {
      console.error('Error loading course details:', error)
      setSearchError('Failed to load course details.')
    } finally {
      setIsLoadingCourse(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && (
            <>
              <div className="logo-container">
                <div className="logo-icon">M</div>
                <span className="logo-name">McGill AI</span>
              </div>
              <button 
                className="sidebar-toggle-btn"
                onClick={() => setSidebarOpen(false)}
                aria-label="Collapse sidebar"
              >
                <FaChevronLeft size={20} />
              </button>
            </>
          )}
          {!sidebarOpen && (
            <button 
              className={`sidebar-toggle-btn-collapsed ${isDraggingLeft ? 'dragging' : ''}`}
              onClick={() => setSidebarOpen(true)}
              onMouseDown={handleLeftToggleMouseDown}
              onTouchStart={handleLeftToggleTouchStart}
              style={{ 
                top: `${leftToggleY}px`,
                cursor: isDraggingLeft ? 'grabbing' : 'grab'
              }}
              aria-label="Expand sidebar"
            >
              <FaChevronRight size={20} />
            </button>
          )}
        </div>

        {sidebarOpen && (
          <>
            <nav className="sidebar-nav">
              <button 
                className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => handleTabChange('chat')}
              >
                <span className="nav-icon">💬</span>
                <span className="nav-label">AI Chat</span>
              </button>
              
              <button 
                className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => handleTabChange('courses')}
              >
                <span className="nav-icon">📚</span>
                <span className="nav-label">Courses</span>
              </button>
              
              <button 
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => handleTabChange('profile')}
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
          </>
        )}
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Chat Tabs Bar */}
        {activeTab === 'chat' && (
          <div className="chat-tabs-bar">
            <div className="chat-tabs-container">
              {chatTabs.map(tab => (
                <div
                  key={tab.id}
                  className={`chat-tab ${activeChatTab === tab.id ? 'active' : ''} ${draggedTab === tab.id ? 'dragging' : ''}`}
                  onClick={() => setActiveChatTab(tab.id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tab.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, tab.id)}
                  onDragEnd={handleDragEnd}
                >
                  <span className="chat-tab-title">{tab.title}</span>
                  <button
                    className="chat-tab-close"
                    onClick={(e) => closeChatTab(tab.id, e)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button className="chat-tab-new" onClick={createNewChatTab}>
                +
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        {activeTab !== 'chat' && (
          <header className="dashboard-header">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <h1 className="page-title">
              {activeTab === 'courses' && '📚 Course Explorer'}
              {activeTab === 'profile' && '👤 Your Profile'}
            </h1>
          </header>
        )}

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
                  getCurrentChatMessages().map((msg, idx) => (
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
                <div className="error-banner">
                  {chatError}
                </div>
              )}

              <form className="chat-input-container" onSubmit={handleSendMessage}>
                <textarea
                  className="chat-input"
                  placeholder="Ask me anything about courses, planning, or McGill academics..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isSending}
                  rows={1}
                  style={{ resize: 'none', overflow: 'hidden' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
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
              <form className="search-section" onSubmit={handleCourseSearch}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search for courses (e.g., COMP 202, Introduction to Programming)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                />
                <button 
                  type="submit" 
                  className="btn btn-search"
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </form>

              {searchError && (
                <div className="error-banner">
                  {searchError}
                </div>
              )}

              {searchResults.length > 0 && !selectedCourse && (
                <div className="search-results">
                  <div className="results-header-bar">
                    <h3 className="results-header">
                      Found {searchResults.length} course{searchResults.length !== 1 ? 's' : ''}
                    </h3>
                    
                    {/* Sort Dropdown */}
                    <div className="sort-controls">
                      <label htmlFor="sort-select" className="sort-label">Sort by:</label>
                      <select 
                        id="sort-select"
                        className="sort-select"
                        value={sortBy}
                        onChange={handleSortChange}
                      >
                        <option value="relevance">Relevance</option>
                        <option value="rating-high">⭐ Rating (High to Low)</option>
                        <option value="rating-low">⭐ Rating (Low to High)</option>
                        <option value="name-az">📚 Course Name (A-Z)</option>
                        <option value="name-za">📚 Course Name (Z-A)</option>
                        <option value="instructor-az">👤 Professor (A-Z)</option>
                        <option value="instructor-za">👤 Professor (Z-A)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="course-list">
                    {sortCourses(searchResults, sortBy).map((course) => (
                      <div 
                        key={`${course.subject}-${course.catalog}`}
                        className="course-card"
                        onClick={() => handleCourseClick(course)}
                      >
                        <div className="course-header">
                          <div className="course-code">
                            {course.subject} {course.catalog}
                          </div>
                          {course.average && (
                            <div className="course-average">
                              {course.average.toFixed(1)} GPA ({gpaToLetterGrade(course.average)})
                            </div>
                          )}
                        </div>
                        <h4 className="course-title">{course.title}</h4>
                        
                        {/* Display instructor with RMP ratings */}
                        {course.instructor && (
                          <div className="course-instructor-section">
                            <div className="instructor-name">
                              👤 {course.instructor}
                            </div>
                            
                            {/* Show RMP ratings if available */}
                            {course.rmp_rating && (
                              <div className="rmp-compact">
                                <div className="rmp-stat">
                                  <span className="rmp-label">⭐ Rating:</span>
                                  <span className="rmp-value">{course.rmp_rating.toFixed(1)}/5.0</span>
                                </div>
                                <div className="rmp-stat">
                                  <span className="rmp-label">📊 Difficulty:</span>
                                  <span className="rmp-value">{course.rmp_difficulty?.toFixed(1) || 'N/A'}/5.0</span>
                                </div>
                                {course.rmp_num_ratings && (
                                  <div className="rmp-stat">
                                    <span className="rmp-label">📝 Reviews:</span>
                                    <span className="rmp-value">{Math.round(course.rmp_num_ratings)}</span>
                                  </div>
                                )}
                                {course.rmp_would_take_again && (
                                  <div className="rmp-stat">
                                    <span className="rmp-label">🔄 Would retake:</span>
                                    <span className="rmp-value">{Math.round(course.rmp_would_take_again)}%</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {course.num_sections && (
                          <div className="course-meta">
                            📊 {course.num_sections} section{course.num_sections !== 1 ? 's' : ''} available
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    className="btn-back"
                    onClick={() => {
                      setSearchResults([])
                      setSearchQuery('')
                    }}
                  >
                    ← New Search
                  </button>
                </div>
              )}

              {isLoadingCourse && (
                <div className="loading-container">
                  <div className="loading-spinner">Loading course details...</div>
                </div>
              )}

              {selectedCourse && !isLoadingCourse && (
                <div className="course-details">
                  <button 
                    className="btn-back"
                    onClick={() => setSelectedCourse(null)}
                  >
                    ← Back to Results
                  </button>

                  <div className="course-details-header">
                    <h2 className="course-details-title">
                      {selectedCourse.subject} {selectedCourse.catalog}: {selectedCourse.title}
                    </h2>
                    {selectedCourse.average_grade && (
                      <div className="course-stat-badge">
                        Average: {selectedCourse.average_grade} GPA ({gpaToLetterGrade(selectedCourse.average_grade)})
                      </div>
                    )}
                    
                    {/* Show professor rating for the course */}
                    {selectedCourse.professor_rating && (
                      <div className="course-professor-rating">
                        <h3>📊 Professor Rating: {selectedCourse.professor_rating.instructor}</h3>
                        <div className="rmp-stats-grid">
                          <div className="rmp-stat-card">
                            <div className="rmp-stat-value">{selectedCourse.professor_rating.rmp_rating?.toFixed(1) || 'N/A'}</div>
                            <div className="rmp-stat-label">Rating</div>
                          </div>
                          <div className="rmp-stat-card">
                            <div className="rmp-stat-value">{selectedCourse.professor_rating.rmp_difficulty?.toFixed(1) || 'N/A'}</div>
                            <div className="rmp-stat-label">Difficulty</div>
                          </div>
                          <div className="rmp-stat-card">
                            <div className="rmp-stat-value">{selectedCourse.professor_rating.rmp_num_ratings ? Math.round(selectedCourse.professor_rating.rmp_num_ratings) : 'N/A'}</div>
                            <div className="rmp-stat-label">Reviews</div>
                          </div>
                          <div className="rmp-stat-card">
                            <div className="rmp-stat-value">{selectedCourse.professor_rating.rmp_would_take_again ? Math.round(selectedCourse.professor_rating.rmp_would_take_again) + '%' : 'N/A'}</div>
                            <div className="rmp-stat-label">Would Retake</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="course-sections">
                    <h3 className="sections-header">
                      Sections ({selectedCourse.num_sections})
                    </h3>
                    {selectedCourse.sections.map((section, idx) => (
                      <div key={idx} className="section-card">
                        <div className="section-info">
                          <div className="section-header">
                            <span className="section-term">{section.term || 'N/A'}</span>
                            {section.average && (
                              <span className="section-average">
                                Average: {section.average} GPA ({gpaToLetterGrade(section.average)})
                              </span>
                            )}
                          </div>
                          {section.instructor && section.instructor !== 'TBA' && (
                            <div className="section-instructor">
                              <strong>Instructor:</strong> {section.instructor}
                            </div>
                          )}
                          
                          {/* Show section-specific RMP ratings */}
                          {section.rmp_rating && (
                            <div className="section-rmp">
                              <div className="rmp-inline">
                                <span className="rmp-badge">⭐ {section.rmp_rating.toFixed(1)}</span>
                                <span className="rmp-badge">📊 Difficulty: {section.rmp_difficulty?.toFixed(1) || 'N/A'}</span>
                                {section.rmp_num_ratings && (
                                  <span className="rmp-badge">📝 {Math.round(section.rmp_num_ratings)} reviews</span>
                                )}
                                {section.rmp_would_take_again && (
                                  <span className="rmp-badge">🔄 {Math.round(section.rmp_would_take_again)}% would retake</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.length === 0 && !selectedCourse && !searchError && !isSearching && (
                <div className="placeholder-content">
                  <div className="placeholder-icon">📚</div>
                  <h3>Course Explorer with Professor Ratings</h3>
                  <p>Search through McGill courses with historical grade data and live RateMyProfessor ratings.</p>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab - UNCHANGED FROM ORIGINAL */}
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
                            max="4.0"
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

      {/* Right Sidebar - Chat History */}
      {activeTab === 'chat' && (
        <aside className={`right-sidebar ${rightSidebarOpen ? 'open' : 'closed'}`}>
          {!rightSidebarOpen && (
            <div className="sidebar-header">
              <button 
                className={`right-sidebar-toggle-collapsed ${isDraggingRight ? 'dragging' : ''}`}
                onClick={() => setRightSidebarOpen(true)}
                onMouseDown={handleRightToggleMouseDown}
                onTouchStart={handleRightToggleTouchStart}
                style={{ 
                  top: `${rightToggleY}px`,
                  cursor: isDraggingRight ? 'grabbing' : 'grab'
                }}
                title="Show chat history"
              >
                <FaChevronLeft size={20} />
              </button>
            </div>
          )}
          {rightSidebarOpen && (
            <>
              <div className="right-sidebar-header">
                <h3>Chat History</h3>
                <button 
                  className="right-sidebar-close"
                  onClick={() => setRightSidebarOpen(false)}
                  aria-label="Close history"
                >
                  <FaChevronRight size={20} />
                </button>
              </div>
              <div className="right-sidebar-content">
                {chatHistory.length > 0 ? (
                  chatHistory.map(chat => (
                    <div 
                      key={chat.id} 
                      className="history-item"
                      onClick={() => loadHistoricalChat(chat.id)}
                    >
                      <div className="history-title">{chat.title}</div>
                      <div className="history-meta">{chat.messageCount} messages</div>
                    </div>
                  ))
                ) : (
                  <div className="history-empty">
                    <p>No previous chats</p>
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      )}
    </div>
  )
}