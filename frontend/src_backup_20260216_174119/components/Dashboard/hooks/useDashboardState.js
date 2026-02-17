import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { chatAPI } from '../../../lib/api'
import coursesAPI from '../../../lib/professorsAPI'
import favoritesAPI from '../../../lib/favoritesAPI'
import completedCoursesAPI from '../../../lib/completedCoursesAPI'
import { getCourseCredits } from '../../../utils/courseCredits'

export default function useDashboardState() {
  const { user, profile, signOut, updateProfile } = useAuth()

  // ── Navigation ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

  // ── Profile image ───────────────────────────────────────────
  const [profileImage, setProfileImage] = useState(profile?.profile_image || null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

  // ── Chat tabs ───────────────────────────────────────────────
  const [chatTabs, setChatTabs] = useState([
    { id: 1, title: 'New Chat', messages: [], sessionId: null },
  ])
  const [activeChatTab, setActiveChatTab] = useState(1)
  const [nextChatTabId, setNextChatTabId] = useState(2)
  const [chatHistory, setChatHistory] = useState([])

  // ── Chat input ──────────────────────────────────────────────
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [chatError, setChatError] = useState(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef(null)

  // ── Course search ───────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isLoadingCourse, setIsLoadingCourse] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')

  // ── Favorites ───────────────────────────────────────────────
  const [favorites, setFavorites] = useState([])
  const [favoritesMap, setFavoritesMap] = useState(new Set())
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)

  // ── Completed courses ───────────────────────────────────────
  const [completedCourses, setCompletedCourses] = useState([])
  const [completedCoursesMap, setCompletedCoursesMap] = useState(new Set())
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false)

  // ── Draggable sidebar toggles ───────────────────────────────
  const [leftToggleY, setLeftToggleY] = useState(20)
  const [rightToggleY, setRightToggleY] = useState(20)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartPos, setDragStartPos] = useState(0)

  // ── Notification banner ─────────────────────────────────────
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // ═══════════════════════════════════════════════════════════
  //  CHAT HELPERS
  // ═══════════════════════════════════════════════════════════

  const getCurrentChatMessages = () => {
    const tab = chatTabs.find((t) => t.id === activeChatTab)
    return tab ? tab.messages : []
  }

  const getCurrentChatTab = () => chatTabs.find((t) => t.id === activeChatTab)

  const updateCurrentChatMessages = (messages) => {
    setChatTabs((prev) =>
      prev.map((t) => (t.id === activeChatTab ? { ...t, messages } : t))
    )
  }

  const updateCurrentChatSessionId = (sessionId) => {
    setChatTabs((prev) =>
      prev.map((t) => (t.id === activeChatTab ? { ...t, sessionId } : t))
    )
  }

  const handleNewChatTab = () => {
    const newTab = { id: nextChatTabId, title: 'New Chat', messages: [], sessionId: null }
    setChatTabs([...chatTabs, newTab])
    setActiveChatTab(nextChatTabId)
    setNextChatTabId(nextChatTabId + 1)
  }

  const handleCloseChatTab = (tabId, e) => {
    e.stopPropagation()
    if (chatTabs.length === 1) {
      setChatTabs([{ id: 1, title: 'New Chat', messages: [], sessionId: null }])
      setActiveChatTab(1)
      return
    }
    const tabIndex = chatTabs.findIndex((t) => t.id === tabId)
    const newTabs = chatTabs.filter((t) => t.id !== tabId)
    setChatTabs(newTabs)
    if (tabId === activeChatTab) {
      const idx = Math.min(tabIndex, newTabs.length - 1)
      setActiveChatTab(newTabs[idx].id)
    }
  }

  // Tab drag-and-drop reorder
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
    const from = chatTabs.findIndex((t) => t.id === draggedTab)
    const to = chatTabs.findIndex((t) => t.id === targetTabId)
    const next = [...chatTabs]
    const [removed] = next.splice(from, 1)
    next.splice(to, 0, removed)
    setChatTabs(next)
    setDraggedTab(null)
  }
  const handleDragEnd = () => setDraggedTab(null)

  // ═══════════════════════════════════════════════════════════
  //  UTILITY / CONVERSION
  // ═══════════════════════════════════════════════════════════

  const gpaToLetterGrade = (gpa) => {
    if (!gpa) return ''
    const n = parseFloat(gpa)
    if (n >= 3.85) return 'A'
    if (n >= 3.7) return 'A-'
    if (n >= 3.3) return 'B+'
    if (n >= 3.0) return 'B'
    if (n >= 2.7) return 'B-'
    if (n >= 2.3) return 'C+'
    if (n >= 2.0) return 'C'
    if (n >= 1.0) return 'D'
    return 'F'
  }

  const sortCourses = (courses, sortType) => {
    const sorted = [...courses]
    switch (sortType) {
      case 'rating-high':
        return sorted.sort((a, b) => (b.rmp_rating || 0) - (a.rmp_rating || 0))
      case 'rating-low':
        return sorted.sort((a, b) => (a.rmp_rating || 0) - (b.rmp_rating || 0))
      case 'name-az':
        return sorted.sort((a, b) =>
          `${a.subject} ${a.catalog}`.localeCompare(`${b.subject} ${b.catalog}`)
        )
      case 'name-za':
        return sorted.sort((a, b) =>
          `${b.subject} ${b.catalog}`.localeCompare(`${a.subject} ${a.catalog}`)
        )
      case 'instructor-az':
        return sorted.sort((a, b) =>
          (a.instructor || 'ZZZ').localeCompare(b.instructor || 'ZZZ')
        )
      case 'instructor-za':
        return sorted.sort((a, b) =>
          (b.instructor || '').localeCompare(a.instructor || '')
        )
      default:
        return sorted
    }
  }

  const isFavorited = (subject, catalog) => favoritesMap.has(`${subject}${catalog}`)
  const isCompleted = (subject, catalog) => completedCoursesMap.has(`${subject} ${catalog}`)

  // ═══════════════════════════════════════════════════════════
  //  SIDEBAR DRAG HANDLERS
  // ═══════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════
  //  API HANDLERS
  // ═══════════════════════════════════════════════════════════

  const loadChatSessions = async () => {
    if (!user?.id) return
    try {
      setIsLoadingHistory(true)
      const data = await chatAPI.getSessions(user.id)
      setChatHistory(data.sessions && Array.isArray(data.sessions) ? data.sessions : [])
    } catch (error) {
      console.error('Error loading chat sessions:', error)
      setChatHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const loadHistoricalChat = async (sessionId) => {
    try {
      const data = await chatAPI.getHistory(user.id, sessionId)
      const messages = data.messages || []
      const firstUserMsg = messages.find((m) => m.role === 'user')
      const title = firstUserMsg
        ? firstUserMsg.content.substring(0, 30) + '...'
        : 'Chat Session'

      const newTab = { id: nextChatTabId, title, messages, sessionId }
      setChatTabs([...chatTabs, newTab])
      setActiveChatTab(nextChatTabId)
      setNextChatTabId(nextChatTabId + 1)
      setRightSidebarOpen(false)
    } catch (error) {
      console.error('Error loading historical chat:', error)
      showNotification('Failed to load chat history', 'error')
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedCourse(null)
    setSearchResults([])
    setSearchError(null)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

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
      const currentTab = chatTabs.find((t) => t.id === activeChatTab)
      const response = await chatAPI.sendMessage(user.id, userMessage, currentTab.sessionId)

      updateCurrentChatMessages([
        ...newMessages,
        { role: 'assistant', content: response.response },
      ])

      if (!currentTab.sessionId && response.session_id) {
        updateCurrentChatSessionId(response.session_id)
        if (currentMessages.length === 0) {
          const title = userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '')
          setChatTabs((prev) =>
            prev.map((t) => (t.id === activeChatTab ? { ...t, title } : t))
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

  const handleCourseSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim() || isSearching) return

    setIsSearching(true)
    setSearchError(null)
    setSelectedCourse(null)

    try {
      const data = await coursesAPI.search(searchQuery, null, 50)
      const courses = data.courses || data || []
      setSearchResults(Array.isArray(courses) ? courses : [])
      if (courses.length === 0) setSearchError('No courses found matching your search.')
    } catch (error) {
      console.error('Error searching courses:', error)
      setSearchError('Failed to search courses. Please try again.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleCourseClick = async (course) => {
    setIsLoadingCourse(true)
    try {
      const data = await coursesAPI.getDetails(course.subject, course.catalog)
      setSelectedCourse(data.course || data)
    } catch (error) {
      console.error('Error loading course details:', error)
      setSearchError('Failed to load course details.')
    } finally {
      setIsLoadingCourse(false)
    }
  }

  const handleToggleFavorite = async (course) => {
    if (!user?.id) return
    const courseCode = `${course.subject}${course.catalog}`
    const isFav = favoritesMap.has(courseCode)

    try {
      if (isFav) {
        await favoritesAPI.removeFavorite(user.id, courseCode)
        setFavorites((prev) => prev.filter((f) => f.course_code !== courseCode))
        setFavoritesMap((prev) => {
          const s = new Set(prev)
          s.delete(courseCode)
          return s
        })
      } else {
        await favoritesAPI.addFavorite(user.id, {
          course_code: courseCode,
          course_title: course.title,
          subject: course.subject,
          catalog: course.catalog,
        })
        setFavorites((prev) => [
          { course_code: courseCode, course_title: course.title, subject: course.subject, catalog: course.catalog },
          ...prev,
        ])
        setFavoritesMap((prev) => new Set([...prev, courseCode]))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      showNotification(error.message || 'Failed to update favorites', 'error')
    }
  }

  const handleToggleCompleted = async (course) => {
    if (!user?.id) return
    const courseCode = `${course.subject} ${course.catalog}`
    const isComp = completedCoursesMap.has(courseCode)

    try {
      if (isComp) {
        await completedCoursesAPI.removeCompleted(user.id, courseCode)
        setCompletedCourses((prev) => prev.filter((c) => c.course_code !== courseCode))
        setCompletedCoursesMap((prev) => {
          const s = new Set(prev)
          s.delete(courseCode)
          return s
        })
      } else {
        const credits = getCourseCredits(course.subject, course.catalog)
        const currentYear = new Date().getFullYear()

        const term = prompt('What term? (Fall/Winter/Summer):', 'Fall')
        if (term === null) return
        const year = prompt(`What year? (e.g., ${currentYear}):`, currentYear)
        if (year === null) return
        const grade = prompt('What grade? (A, A-, B+, B, etc. - or leave blank):', '')
        if (grade === null) return

        let finalCredits = credits
        const confirmCredits = prompt(
          `This course is ${credits} credit${credits !== 1 ? 's' : ''}. Is this correct? (Enter different number or press OK):`,
          credits
        )
        if (confirmCredits === null) return
        if (confirmCredits && !isNaN(confirmCredits)) finalCredits = parseInt(confirmCredits)

        const courseData = {
          course_code: courseCode,
          course_title: course.title || course.course_title,
          subject: course.subject,
          catalog: String(course.catalog),
          term: term.trim() || 'Fall',
          year: parseInt(year) || currentYear,
          grade: grade.trim().toUpperCase() || null,
          credits: finalCredits,
        }

        await completedCoursesAPI.addCompleted(user.id, courseData)
        setCompletedCourses((prev) => [courseData, ...prev])
        setCompletedCoursesMap((prev) => new Set([...prev, courseCode]))
        showNotification(`✓ ${courseCode} marked as completed (${finalCredits} credits)`)
      }
    } catch (error) {
      console.error('Error toggling completed:', error)
      showNotification(error.message || 'Failed to update completed courses', 'error')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const PROFILE_IMAGE_MAX_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > PROFILE_IMAGE_MAX_SIZE) {
      showNotification('Image size must be less than 5MB', 'error')
      return
    }
    if (!file.type.startsWith('image/')) {
      showNotification('Please upload an image file', 'error')
      return
    }

    setIsUploadingImage(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Image = reader.result
        setProfileImage(base64Image)
        await updateProfile({ profile_image: base64Image })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      showNotification('Failed to upload image', 'error')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleAvatarClick = () => fileInputRef.current?.click()

  const loadFavorites = async () => {
    if (!user?.id) return
    try {
      setIsLoadingFavorites(true)
      const data = await favoritesAPI.getFavorites(user.id)
      setFavorites(data.favorites || [])
      setFavoritesMap(new Set((data.favorites || []).map((f) => f.course_code)))
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsLoadingFavorites(false)
    }
  }

  const loadCompletedCourses = async () => {
    if (!user?.id) return
    try {
      setIsLoadingCompleted(true)
      const data = await completedCoursesAPI.getCompleted(user.id)
      setCompletedCourses(data.completed_courses || [])
      setCompletedCoursesMap(
        new Set((data.completed_courses || []).map((c) => c.course_code))
      )
    } catch (error) {
      console.error('Error loading completed courses:', error)
      setCompletedCourses([])
      setCompletedCoursesMap(new Set())
    } finally {
      setIsLoadingCompleted(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  EFFECTS
  // ═══════════════════════════════════════════════════════════

  // Auto-scroll chat
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

  // Sync profile image
  useEffect(() => {
    if (profile?.profile_image) setProfileImage(profile.profile_image)
    else setProfileImage(null)
  }, [profile?.profile_image])

  // Mouse drag for sidebar toggles
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft) {
        const newY = Math.max(0, Math.min(window.innerHeight - 50, dragStartPos + (e.clientY - dragStartY)))
        setLeftToggleY(newY)
      }
      if (isDraggingRight) {
        const newY = Math.max(0, Math.min(window.innerHeight - 50, dragStartPos + (e.clientY - dragStartY)))
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

  // Touch drag for sidebar toggles
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (isDraggingLeft) {
        const newY = Math.max(0, Math.min(window.innerHeight - 50, dragStartPos + (e.touches[0].clientY - dragStartY)))
        setLeftToggleY(newY)
      }
      if (isDraggingRight) {
        const newY = Math.max(0, Math.min(window.innerHeight - 50, dragStartPos + (e.touches[0].clientY - dragStartY)))
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

  // ═══════════════════════════════════════════════════════════
  //  RETURN
  // ═══════════════════════════════════════════════════════════

  return {
    // Auth
    user, profile, signOut, updateProfile,

    // Navigation
    activeTab, setActiveTab, handleTabChange,
    sidebarOpen, setSidebarOpen,
    rightSidebarOpen, setRightSidebarOpen,

    // Profile image
    profileImage, isUploadingImage, fileInputRef,
    handleImageUpload, handleAvatarClick,

    // Chat tabs
    chatTabs, activeChatTab, setActiveChatTab,
    draggedTab, handleNewChatTab, handleCloseChatTab,
    handleDragStart, handleDragOver, handleDrop, handleDragEnd,
    getCurrentChatMessages, getCurrentChatTab,

    // Chat input
    chatInput, setChatInput, isSending, chatError, setChatError,
    isLoadingHistory, messagesEndRef, handleSendMessage,

    // Chat history (right sidebar)
    chatHistory, loadHistoricalChat,

    // Course search
    searchQuery, setSearchQuery, searchResults, setSearchResults,
    isSearching, searchError, selectedCourse, setSelectedCourse,
    isLoadingCourse, sortBy, setSortBy,
    handleCourseSearch, handleCourseClick, sortCourses,

    // Favorites
    favorites, favoritesMap, isLoadingFavorites,
    isFavorited, handleToggleFavorite, loadFavorites,

    // Completed
    completedCourses, completedCoursesMap, isLoadingCompleted,
    isCompleted, handleToggleCompleted, loadCompletedCourses,

    // Utility
    gpaToLetterGrade, handleSignOut,

    // Sidebar drag
    leftToggleY, rightToggleY,
    isDraggingLeft, isDraggingRight,
    handleLeftToggleMouseDown, handleLeftToggleTouchStart,
    handleRightToggleMouseDown, handleRightToggleTouchStart,

    // Notifications
    notification, showNotification,
  }
}