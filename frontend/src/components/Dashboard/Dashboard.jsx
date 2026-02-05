import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { chatAPI } from '../../lib/api'
import coursesAPI from '../../lib/professorsAPI'
import favoritesAPI from '../../lib/favoritesAPI'
import completedCoursesAPI from '../../lib/completedCoursesAPI'
import ProfessorRating, { ProfessorRatingCompact } from '../ProfessorRating/ProfessorRating'
import Forum from '../Forum/Forum'
import EnhancedProfileForm from './EnhancedProfileForm'
import BadgesDisplay from './BadgesDisplay'
import DegreeProgressTracker from './DegreeProgressTracker'
import PersonalizedInsights from './PersonalizedInsights'
import PersonalInfoCard from './PersonalInfoCard'
import SavedCoursesView from './SavedCoursesView'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaCheckCircle, FaCamera } from 'react-icons/fa';
import './Dashboard.css'


// Course credits lookup - McGill specific
const COURSE_CREDITS = {
  'MATH 140': 4, 'MATH 141': 4, 'MATH 150': 4, 'MATH 151': 4,
  'PHYS 131': 4, 'PHYS 142': 4,
  'CHEM 110': 4, 'CHEM 120': 4,
  'BIOL 111': 4, 'BIOL 112': 4,
  'CHEM 181': 1, 'PHYS 181': 1, 'BIOL 181': 1,
}

function getCourseCredits(subject, catalog) {
  const courseCode = `${subject} ${catalog}`.toUpperCase()
  return COURSE_CREDITS[courseCode] || 3
}

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
  const [profileImage, setProfileImage] = useState(profile?.profile_image || null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

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
  const [sortBy, setSortBy] = useState('relevance')

  // Favorites states
  const [favorites, setFavorites] = useState([])
  const [favoritesMap, setFavoritesMap] = useState(new Set())
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)

  // Completed courses state
  const [completedCourses, setCompletedCourses] = useState([])
  const [completedCoursesMap, setCompletedCoursesMap] = useState(new Set())
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false)

  // Drag-able Sidebar
  const [leftToggleY, setLeftToggleY] = useState(20)
  const [rightToggleY, setRightToggleY] = useState(20)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartPos, setDragStartPos] = useState(0)

  // Get current chat tab's messages
  const getCurrentChatMessages = () => {
    const currentTab = chatTabs.find(tab => tab.id === activeChatTab)
    return currentTab ? currentTab.messages : []
  }

  const getCurrentChatTab = () => {
    return chatTabs.find(tab => tab.id === activeChatTab)
  }

  const updateCurrentChatMessages = (messages) => {
    setChatTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeChatTab ? { ...tab, messages } : tab
      )
    )
  }

  const updateCurrentChatSessionId = (sessionId) => {
    setChatTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeChatTab ? { ...tab, sessionId } : tab
      )
    )
  }

  // Handle creating a new chat tab
  const handleNewChatTab = () => {
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

  // Handle closing a chat tab
  const handleCloseChatTab = (tabId, e) => {
    e.stopPropagation()
    
    if (chatTabs.length === 1) {
      setChatTabs([{ id: 1, title: 'New Chat', messages: [], sessionId: null }])
      setActiveChatTab(1)
      return
    }

    const tabIndex = chatTabs.findIndex(tab => tab.id === tabId)
    const newTabs = chatTabs.filter(tab => tab.id !== tabId)
    setChatTabs(newTabs)

    if (tabId === activeChatTab) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1)
      setActiveChatTab(newTabs[newActiveIndex].id)
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

  // GPA to letter grade conversion
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

  // Sort courses
  const sortCourses = (courses, sortType) => {
    const sorted = [...courses]
    
    switch(sortType) {
      case 'rating-high':
        return sorted.sort((a, b) => {
          const ratingA = a.rmp_rating || 0
          const ratingB = b.rmp_rating || 0
          return ratingB - ratingA
        })
      
      case 'rating-low':
        return sorted.sort((a, b) => {
          const ratingA = a.rmp_rating || 0
          const ratingB = b.rmp_rating || 0
          return ratingA - ratingB
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
        return sorted
    }
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  // Check if favorited
  const isFavorited = (subject, catalog) => {
    const courseCode = `${subject}${catalog}`
    return favoritesMap.has(courseCode)
  }

  // Check if completed
  const isCompleted = (subject, catalog) => {
    const courseCode = `${subject} ${catalog}`
    return completedCoursesMap.has(courseCode)
  }

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

  // Load chat sessions from history
  const loadChatSessions = async () => {
    if (!user?.id) return
    
    try {
      setIsLoadingHistory(true)
      const data = await chatAPI.getSessions(user.id)
      console.log('Chat sessions response:', data)
      
      if (data.sessions && Array.isArray(data.sessions)) {
        setChatHistory(data.sessions)
      } else {
        setChatHistory([])
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error)
      setChatHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Load a historical chat into a new tab
  const loadHistoricalChat = async (sessionId) => {
    try {
      const data = await chatAPI.getHistory(user.id, sessionId)
      console.log('History response:', data)
      
      const messages = data.messages || []
      const firstUserMessage = messages.find(m => m.role === 'user')
      const title = firstUserMessage 
        ? firstUserMessage.content.substring(0, 30) + '...'
        : 'Chat Session'

      const newTab = {
        id: nextChatTabId,
        title,
        messages,
        sessionId
      }

      setChatTabs([...chatTabs, newTab])
      setActiveChatTab(nextChatTabId)
      setNextChatTabId(nextChatTabId + 1)
      setRightSidebarOpen(false)
    } catch (error) {
      console.error('Error loading historical chat:', error)
      alert('Failed to load chat history')
    }
  }

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedCourse(null)
    setSearchResults([])
    setSearchError(null)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || isSending) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatError(null)

    const currentMessages = getCurrentChatMessages()
    const newMessages = [...currentMessages, { role: 'user', content: userMessage }]
    updateCurrentChatMessages(newMessages)

    setIsSending(true)

    try {
      const currentTab = chatTabs.find(tab => tab.id === activeChatTab)
      const response = await chatAPI.sendMessage(
        user.id,
        userMessage,
        currentTab.sessionId
      )

      const updatedMessages = [
        ...newMessages,
        { role: 'assistant', content: response.response }
      ]
      updateCurrentChatMessages(updatedMessages)

      if (!currentTab.sessionId && response.session_id) {
        updateCurrentChatSessionId(response.session_id)
        
        if (currentMessages.length === 0) {
          const title = userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '')
          setChatTabs(prevTabs => 
            prevTabs.map(tab => 
              tab.id === activeChatTab ? { ...tab, title } : tab
            )
          )
        }

        loadChatSessions()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setChatError('Failed to send message. Please try again.')
      updateCurrentChatMessages(currentMessages)
    } finally {
      setIsSending(false)
    }
  }

  // Course search handler
  const handleCourseSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim() || isSearching) return

    setIsSearching(true)
    setSearchError(null)
    setSelectedCourse(null)

    try {
      const data = await coursesAPI.search(searchQuery, null, 50)
      console.log('Search response:', data)
      
      const courses = data.courses || data || []
      setSearchResults(Array.isArray(courses) ? courses : [])
      
      if (courses.length === 0) {
        setSearchError('No courses found matching your search.')
      }
    } catch (error) {
      console.error('Error searching courses:', error)
      setSearchError('Failed to search courses. Please try again.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Course detail handler
  const handleCourseClick = async (course) => {
    setIsLoadingCourse(true)
    try {
      const data = await coursesAPI.getDetails(course.subject, course.catalog)
      console.log('Course details:', data)
      
      setSelectedCourse(data.course || data)
    } catch (error) {
      console.error('Error loading course details:', error)
      setSearchError('Failed to load course details.')
    } finally {
      setIsLoadingCourse(false)
    }
  }

  // Toggle favorite
  const handleToggleFavorite = async (course) => {
    if (!user?.id) return
    
    const courseCode = `${course.subject}${course.catalog}`
    const isFav = favoritesMap.has(courseCode)
    
    try {
      if (isFav) {
        await favoritesAPI.removeFavorite(user.id, courseCode)
        setFavorites(prev => prev.filter(f => f.course_code !== courseCode))
        setFavoritesMap(prev => {
          const newSet = new Set(prev)
          newSet.delete(courseCode)
          return newSet
        })
      } else {
        await favoritesAPI.addFavorite(user.id, {
          course_code: courseCode,
          course_title: course.title,
          subject: course.subject,
          catalog: course.catalog
        })
        
        const newFavorite = {
          course_code: courseCode,
          course_title: course.title,
          subject: course.subject,
          catalog: course.catalog
        }
        
        setFavorites(prev => [newFavorite, ...prev])
        setFavoritesMap(prev => new Set([...prev, courseCode]))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert(error.message || 'Failed to update favorites')
    }
  }

  // Toggle completed - UPDATED WITH CREDITS FIX
const handleToggleCompleted = async (course) => {
    if (!user?.id) return
    
    const courseCode = `${course.subject} ${course.catalog}`
    const isComp = completedCoursesMap.has(courseCode)
    
    try {
      if (isComp) {
        // Remove completed course
        await completedCoursesAPI.removeCompleted(user.id, courseCode)
        setCompletedCourses(prev => prev.filter(c => c.course_code !== courseCode))
        setCompletedCoursesMap(prev => {
          const newSet = new Set(prev)
          newSet.delete(courseCode)
          return newSet
        })
      } else {
        // Add completed course
        
        // Get correct credits for this course
        const credits = getCourseCredits(course.subject, course.catalog)
        
        // Ask user for details
        const currentYear = new Date().getFullYear()
        const term = prompt('What term? (Fall/Winter/Summer):', 'Fall')
        if (term === null) return // User cancelled
        
        const year = prompt(`What year? (e.g., ${currentYear}):`, currentYear)
        if (year === null) return // User cancelled
        
        const grade = prompt('What grade? (A, A-, B+, B, etc. - or leave blank):', '')
        if (grade === null) return // User cancelled
        
        // Validate and ask about credits
        let finalCredits = credits
        const confirmCredits = prompt(
          `This course is ${credits} credit${credits !== 1 ? 's' : ''}. Is this correct? (Enter different number or press OK):`,
          credits
        )
        if (confirmCredits === null) return // User cancelled
        if (confirmCredits && !isNaN(confirmCredits)) {
          finalCredits = parseInt(confirmCredits)
        }
        
        const courseData = {
          course_code: courseCode,
          course_title: course.title || course.course_title,
          subject: course.subject,
          catalog: String(course.catalog),
          term: term.trim() || 'Fall',
          year: parseInt(year) || currentYear,
          grade: grade.trim().toUpperCase() || null,
          credits: finalCredits
        }
        
        console.log('Adding completed course:', courseData)
        await completedCoursesAPI.addCompleted(user.id, courseData)
        
        setCompletedCourses(prev => [courseData, ...prev])
        setCompletedCoursesMap(prev => new Set([...prev, courseCode]))
        
        // Show confirmation
        alert(`✓ ${courseCode} marked as completed (${finalCredits} credits)`)
      }
    } catch (error) {
      console.error('Error toggling completed:', error)
      alert(error.message || 'Failed to update completed courses')
    }
  }

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setIsUploadingImage(true)

    try {
      // Convert to base64 for preview and storage
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Image = reader.result
        setProfileImage(base64Image)
        
        // Save to profile
        await updateProfile({ profile_image: base64Image })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }


  // Load favorites
  const loadFavorites = async () => {
    if (!user?.id) return
    
    try {
      setIsLoadingFavorites(true)
      const data = await favoritesAPI.getFavorites(user.id)
      setFavorites(data.favorites || [])
      
      const favSet = new Set(
        (data.favorites || []).map(f => f.course_code)
      )
      setFavoritesMap(favSet)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsLoadingFavorites(false)
    }
  }

  // Load completed courses
  const loadCompletedCourses = async () => {
    if (!user?.id) return
    
    try {
      setIsLoadingCompleted(true)
      const data = await completedCoursesAPI.getCompleted(user.id)
      setCompletedCourses(data.completed_courses || [])
      
      const compSet = new Set(
        (data.completed_courses || []).map(c => c.course_code)
      )
      setCompletedCoursesMap(compSet)
    } catch (error) {
      console.error('Error loading completed courses:', error)
      setCompletedCourses([])
      setCompletedCoursesMap(new Set())
    } finally {
      setIsLoadingCompleted(false)
    }
  }

  // Sign out handler
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

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatTabs, activeChatTab])

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadChatSessions()
      loadFavorites()
      loadCompletedCourses()
    }
  }, [user?.id])

  // Update profile form when profile changes
  useEffect(() => {
    if (profile) {
      setProfileForm({
        major: profile.major || '',
        year: profile.year || '',
        interests: profile.interests || '',
        current_gpa: profile.current_gpa || ''
      })
    }
  }, [profile])

  // Handle window resize for mouse drag
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft) {
        const deltaY = e.clientY - dragStartY
        const newY = Math.max(0, Math.min(window.innerHeight - 50, dragStartPos + deltaY))
        setLeftToggleY(newY)
      }
      if (isDraggingRight) {
        const deltaY = e.clientY - dragStartY
        const newY = Math.max(0, Math.min(window.innerHeight - 50, dragStartPos + deltaY))
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
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDraggingLeft, isDraggingRight, dragStartY, dragStartPos])

  // Handle touch drag
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (isDraggingLeft) {
        const deltaY = e.touches[0].clientY - dragStartY
        const newY = Math.max(0, Math.min(window.innerHeight - 50, dragStartPos + deltaY))
        setLeftToggleY(newY)
      }
      if (isDraggingRight) {
        const deltaY = e.touches[0].clientY - dragStartY
        const newY = Math.max(0, Math.min(window.innerHeight - 50, dragStartPos + deltaY))
        setRightToggleY(newY)
      }
    }

    const handleTouchEnd = () => {
      setIsDraggingLeft(false)
      setIsDraggingRight(false)
    }

    if (isDraggingLeft || isDraggingRight) {
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleTouchEnd)
      return () => {
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDraggingLeft, isDraggingRight, dragStartY, dragStartPos])

  return (
    <div className="dashboard">
      {/* Left Sidebar */}
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
                className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => handleTabChange('favorites')}
              >
                <span className="nav-icon">⭐</span>
                <span className="nav-label">Saved</span>
                {favorites.length > 0 && (
                  <span className="nav-badge">{favorites.length}</span>
                )}
              </button>
              
              <button 
                className={`nav-item ${activeTab === 'forum' ? 'active' : ''}`}
                onClick={() => handleTabChange('forum')}
              >
                <span className="nav-icon">💬</span>
                <span className="nav-label">Forum</span>
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
        {/* Chat Tabs Bar - WITH DRAG AND DROP */}
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
                    onClick={(e) => handleCloseChatTab(tab.id, e)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button className="chat-tab-new" onClick={handleNewChatTab}>
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
              {activeTab === 'favorites' && '⭐ Saved Courses'}
              {activeTab === 'forum' && '💬 Community Forum'}
              {activeTab === 'profile' && '👤 Your Profile'}
            </h1>
          </header>
        )}

        {/* Content Area */}
        <div className="content-area">
          {/* CHAT TAB */}
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
                ) : getCurrentChatMessages().length === 0 ? (
                  <div className="message assistant">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                      <div className="message-text">
                        Hello! I'm your McGill AI Academic Advisor. How can I help you plan your courses today?
                      </div>
                    </div>
                  </div>
                ) : (
                  getCurrentChatMessages().map((message, idx) => (
                    <div key={idx} className={`message ${message.role}`}>
                      <div className="message-avatar">
                        {message.role === 'assistant' ? '🤖' : user?.email?.[0].toUpperCase()}
                      </div>
                      <div className="message-content">
                        <div className="message-text">{message.content}</div>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
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

          {/* COURSES TAB - ORIGINAL WITH RMP + MARK AS COMPLETED */}
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
                      >
                        <div className="course-card-content" onClick={() => handleCourseClick(course)}>
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
                        
                        <div className="course-card-actions">
                          {/* Favorite Button - bottom left */}
                          <button
                            className={`favorite-btn ${isFavorited(course.subject, course.catalog) ? 'favorited' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleFavorite(course)
                            }}
                            title={isFavorited(course.subject, course.catalog) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {isFavorited(course.subject, course.catalog) ? (
                              <FaHeart className="favorite-icon" />
                            ) : (
                              <FaRegHeart className="favorite-icon" />
                            )}
                          </button>
                          
                          {/* Mark as Completed Button - to the right of favorite */}
                          <button
                            className={`completed-btn ${isCompleted(course.subject, course.catalog) ? 'completed' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleCompleted(course)
                            }}
                            title={isCompleted(course.subject, course.catalog) ? 'Mark as not completed' : 'Mark as completed'}
                          >
                            <FaCheckCircle className="completed-icon" />
                          </button>
                        </div>
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

                  {selectedCourse.sections && selectedCourse.sections.length > 0 && (
                    <div className="course-sections">
                      <h3 className="sections-header">
                        Sections ({selectedCourse.sections.length})
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
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

          {/* SAVED/FAVORITES TAB */}
          {activeTab === 'favorites' && (
            <SavedCoursesView
              favorites={favorites}
              completedCourses={completedCourses}
              completedCoursesMap={completedCoursesMap}
              favoritesMap={favoritesMap}
              user={user}
              onToggleFavorite={handleToggleFavorite}
              onToggleCompleted={handleToggleCompleted}
              onCourseClick={async (course) => {
                setActiveTab('courses')
                setTimeout(async () => {
                  await handleCourseClick({
                    subject: course.subject,
                    catalog: course.catalog,
                    title: course.course_title
                  })
                }, 100)
              }}
              onRefresh={() => {
                loadFavorites()
                loadCompletedCourses()
              }}
            />
          )}

          {/* FORUM TAB */}
          {activeTab === 'forum' && <Forum />}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="profile-page">
              <div className="profile-page-header">
                <div className="profile-hero">
                  <div className="profile-avatar-section">
                    <div className="profile-avatar-xl-wrapper" onClick={handleAvatarClick}>
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="profile-avatar-xl-image" />
                      ) : (
                        <div className="profile-avatar-xl">
                          {user?.email?.[0].toUpperCase()}
                        </div>
                      )}
                      <div className="avatar-xl-overlay">
                        <FaCamera className="camera-xl-icon" />
                        <span className="overlay-xl-text">Change Photo</span>
                      </div>
                      {isUploadingImage && (
                        <div className="avatar-xl-loading">
                          <div className="spinner-xl"></div>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
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
                  
                 
                
               
              
             
            
           
          
         
        
       
      
     
    
   
  
 





{/* Personal Information Card - REDESIGNED */}
                  <PersonalInfoCard
                    profile={profile}
                    user={user}
                    onUpdateProfile={updateProfile}
                  />













































































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
                      <div className="performance-tips">
                        <div className="tip-item">
                          <span className="tip-icon">💡</span>
                          <p className="tip-text">Keep your GPA updated for better course recommendations</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Degree Progress */}
                  <div className="profile-section-card card-full-width">
                    <div className="card-header">
                      <div className="card-title-group">
                        <span className="card-icon">🎯</span>
                        <h2 className="card-title">Degree Progress</h2>
                      </div>
                    </div>
                    <div className="card-content">
                      <DegreeProgressTracker 
                        completedCourses={completedCourses}
                        profile={profile}
                      />
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
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="profile-section-card card-full-width">
                    <div className="card-header">
                      <div className="card-title-group">
                        <span className="card-icon">🏆</span>
                        <h2 className="card-title">Achievements</h2>
                      </div>
                    </div>
                    <div className="card-content">
                      <BadgesDisplay 
                        userData={{
                          profile,
                          completedCourses,
                          savedCourses: favorites,
                          chatCount: Array.isArray(chatHistory) ? chatHistory.length : 0
                        }}
                      />
                    </div>
                  </div>

                  {/* Personalized Insights */}
                  <div className="profile-section-card card-full-width">
                    <div className="card-header">
                      <div className="card-title-group">
                        <span className="card-icon">💡</span>
                        <h2 className="card-title">Personalized Insights</h2>
                      </div>
                    </div>
                    <div className="card-content">
                      <PersonalizedInsights
                        userData={{
                          profile,
                          completedCourses,
                          savedCourses: favorites,
                          chatHistory: Array.isArray(chatHistory) ? chatHistory : []
                        }}
                      />
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
                            <p className="setting-description">Your account is active</p>
                          </div>
                          <span className="status-badge status-active">Active</span>
                        </div>
                        <div className="setting-item">
                          <div className="setting-info">
                            <h3 className="setting-title">Sign Out</h3>
                            <p className="setting-description">Sign out of your McGill AI account</p>
                          </div>
                          <button className="btn btn-secondary" onClick={signOut}>
                            Sign Out
                          </button>
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
                  chatHistory.map(session => (
                    <div 
                      key={session.session_id} 
                      className="history-item"
                      onClick={() => loadHistoricalChat(session.session_id)}
                    >
                      <div className="history-title">
                        {session.last_message?.substring(0, 50) || 'Chat Session'}
                        {session.last_message && session.last_message.length > 50 && '...'}
                      </div>
                      <div className="history-meta">
                        {new Date(session.last_updated).toLocaleDateString()}
                      </div>
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
