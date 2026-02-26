import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { chatAPI } from '../../../lib/api'
import coursesAPI from '../../../lib/professorsAPI'
import favoritesAPI from '../../../lib/favoritesAPI'
import completedCoursesAPI from '../../../lib/completedCoursesAPI'
import { getCourseCredits } from '../../../utils/courseCredits'
// FIX #12: Use the default export (cardsAPI object) consistently, same as Dashboard.jsx
import cardsAPI from '../../../lib/cardsAPI'

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
  // FIX #3: Use a ref instead of state for the tab ID counter to avoid
  // stale-closure bugs when handleNewChatTab / loadHistoricalChat are called
  // in rapid succession. State updates are async; refs are synchronous.
  const nextChatTabIdRef = useRef(2)
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

  // ── Advisor cards ───────────────────────────────────────────
  const [advisorCards, setAdvisorCards] = useState([])
  const [cardsLoading, setCardsLoading] = useState(false)
  const [cardsGenerating, setCardsGenerating] = useState(false)
  const [cardsGeneratedAt, setCardsGeneratedAt] = useState(null)

  // ── Freeform input (cards tab) ──────────────────────────────
  const [freeformInput, setFreeformInput] = useState('')
  const [isSendingFreeform, setIsSendingFreeform] = useState(false)

  // ── Notification banner ─────────────────────────────────────
  const [notification, setNotification] = useState(null)

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  // ── Tab drag-and-drop reorder ───────────────────────────────
  const [draggedTab, setDraggedTab] = useState(null)

  // ═══════════════════════════════════════════════════════════
  //  CHAT HELPERS
  // ═══════════════════════════════════════════════════════════

  const getCurrentChatMessages = useCallback(() => {
    const tab = chatTabs.find((t) => t.id === activeChatTab)
    return tab ? tab.messages : []
  }, [chatTabs, activeChatTab])

  const getCurrentChatTab = useCallback(
    () => chatTabs.find((t) => t.id === activeChatTab),
    [chatTabs, activeChatTab]
  )

  const updateCurrentChatMessages = useCallback((messages) => {
    setChatTabs((prev) =>
      prev.map((t) => (t.id === activeChatTab ? { ...t, messages } : t))
    )
  }, [activeChatTab])

  const updateCurrentChatSessionId = useCallback((sessionId) => {
    setChatTabs((prev) =>
      prev.map((t) => (t.id === activeChatTab ? { ...t, sessionId } : t))
    )
  }, [activeChatTab])

  // FIX #3: Use ref-based counter so rapid calls never produce duplicate IDs
  const handleNewChatTab = useCallback(() => {
    const newId = nextChatTabIdRef.current++
    setChatTabs((prev) => [...prev, { id: newId, title: 'New Chat', messages: [], sessionId: null }])
    setActiveChatTab(newId)
  }, [])

  const handleCloseChatTab = useCallback((tabId, e) => {
    e.stopPropagation()
    setChatTabs((prev) => {
      if (prev.length === 1) {
        const newId = nextChatTabIdRef.current++
        setActiveChatTab(newId)
        return [{ id: newId, title: 'New Chat', messages: [], sessionId: null }]
      }
      const tabIndex = prev.findIndex((t) => t.id === tabId)
      const next = prev.filter((t) => t.id !== tabId)
      if (tabId === activeChatTab) {
        const idx = Math.min(tabIndex, next.length - 1)
        setActiveChatTab(next[idx].id)
      }
      return next
    })
  }, [activeChatTab])

  const handleDragStart = useCallback((e, tabId) => {
    setDraggedTab(tabId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e, targetTabId) => {
    e.preventDefault()
    if (draggedTab === targetTabId) return
    setChatTabs((prev) => {
      const from = prev.findIndex((t) => t.id === draggedTab)
      const to = prev.findIndex((t) => t.id === targetTabId)
      const next = [...prev]
      next.splice(to, 0, ...next.splice(from, 1))
      return next
    })
    setDraggedTab(null)
  }, [draggedTab])

  const handleDragEnd = useCallback(() => setDraggedTab(null), [])

  // ── Advisor cards ───────────────────────────────────────────

  // FIX #4: Removed the premature setCardsLoading(false) before
  // refreshAdvisorCards. The finally block handles cleanup for both paths.
  const loadAdvisorCards = useCallback(async () => {
    if (!user?.id) return
    try {
      setCardsLoading(true)
      const data = await cardsAPI.getCards(user.id)
      const cards = data.cards || []
      setAdvisorCards(cards)
      setCardsGeneratedAt(data.generated_at || null)

      if (cards.length === 0) {
        // Auto-generate — cardsLoading stays true until finally block
        await refreshAdvisorCards(false)
      }
    } catch (error) {
      console.error('Error loading advisor cards:', error)
    } finally {
      // Single cleanup point — no double-set
      setCardsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const refreshAdvisorCards = useCallback(async (force = true) => {
    if (!user?.id) return
    try {
      setCardsGenerating(true)
      const data = await cardsAPI.generateCards(user.id, force)
      setAdvisorCards(data.cards || [])
      setCardsGeneratedAt(data.generated_at || null)
    } catch (error) {
      console.error('Error generating advisor cards:', error)
      showNotification('Failed to refresh cards', 'error')
    } finally {
      setCardsGenerating(false)
    }
  }, [user?.id, showNotification])

  const handleCardChipClick = useCallback(async (cardId, message, cardTitle, cardBody) => {
    if (!user?.id) return ''
    return await cardsAPI.sendThreadMessage(cardId, user.id, message, `${cardTitle}: ${cardBody}`)
  }, [user?.id])

  const handleCardFollowUp = useCallback(async (cardId, message, cardTitle, cardBody) => {
    if (!user?.id) return ''
    return await cardsAPI.sendThreadMessage(cardId, user.id, message, `${cardTitle}: ${cardBody}`)
  }, [user?.id])

  const handleFreeformSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!freeformInput.trim() || isSendingFreeform) return

    const msg = freeformInput.trim()
    setFreeformInput('')
    setIsSendingFreeform(true)

    try {
      handleNewChatTab()
      setChatInput(msg)
      setActiveTab('chat')
      setTimeout(() => {
        document.querySelector('.chat-input')?.focus()
      }, 100)
    } finally {
      setIsSendingFreeform(false)
    }
  }, [freeformInput, isSendingFreeform, handleNewChatTab])

  // ── Image upload ────────────────────────────────────────────

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    try {
      setIsUploadingImage(true)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result
        await updateProfile({ profile_image: base64 })
        setProfileImage(base64)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsUploadingImage(false)
    }
  }, [user?.id, updateProfile])

  const handleAvatarClick = useCallback(() => fileInputRef.current?.click(), [])

  // ── Favorites ───────────────────────────────────────────────

  const loadFavorites = useCallback(async () => {
    if (!user?.id) return
    try {
      setIsLoadingFavorites(true)
      const data = await favoritesAPI.getFavorites(user.id)
      const list = data.favorites || []
      setFavorites(list)
      // FIX #1: favorites are stored as 'SUBJ CATALOG' (with space) to match
      // how they arrive from the DB (course_code column). isCompleted also uses
      // a space. Keep both consistent: "${subject} ${catalog}" with space.
      setFavoritesMap(new Set(list.map((f) => f.course_code)))
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsLoadingFavorites(false)
    }
  }, [user?.id])

  const loadCompletedCourses = useCallback(async () => {
    if (!user?.id) return
    try {
      setIsLoadingCompleted(true)
      const data = await completedCoursesAPI.getCompleted(user.id)
      const list = data.completed_courses || []
      setCompletedCourses(list)
      setCompletedCoursesMap(new Set(list.map((c) => c.course_code)))
    } catch (error) {
      console.error('Error loading completed courses:', error)
      setCompletedCourses([])
      setCompletedCoursesMap(new Set())
    } finally {
      setIsLoadingCompleted(false)
    }
  }, [user?.id])

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [signOut])

  // ── Sidebar drag handlers ───────────────────────────────────

  const handleLeftToggleMouseDown = useCallback((e) => {
    if (sidebarOpen) return
    setIsDraggingLeft(true)
    setDragStartY(e.clientY)
    setDragStartPos(leftToggleY)
    e.preventDefault()
  }, [sidebarOpen, leftToggleY])

  const handleLeftToggleTouchStart = useCallback((e) => {
    if (sidebarOpen) return
    setIsDraggingLeft(true)
    setDragStartY(e.touches[0].clientY)
    setDragStartPos(leftToggleY)
    e.preventDefault()
  }, [sidebarOpen, leftToggleY])

  const handleRightToggleMouseDown = useCallback((e) => {
    if (rightSidebarOpen) return
    setIsDraggingRight(true)
    setDragStartY(e.clientY)
    setDragStartPos(rightToggleY)
    e.preventDefault()
  }, [rightSidebarOpen, rightToggleY])

  const handleRightToggleTouchStart = useCallback((e) => {
    if (rightSidebarOpen) return
    setIsDraggingRight(true)
    setDragStartY(e.touches[0].clientY)
    setDragStartPos(rightToggleY)
    e.preventDefault()
  }, [rightSidebarOpen, rightToggleY])

  // ── API handlers ────────────────────────────────────────────

  const loadChatSessions = useCallback(async () => {
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
  }, [user?.id])

  // FIX #3: loadHistoricalChat also uses ref-based IDs
  const loadHistoricalChat = useCallback(async (sessionId) => {
    try {
      const data = await chatAPI.getHistory(user.id, sessionId)
      const messages = data.messages || []
      const firstUserMsg = messages.find((m) => m.role === 'user')
      const title = firstUserMsg
        ? firstUserMsg.content.substring(0, 30) + '...'
        : 'Chat Session'

      const newId = nextChatTabIdRef.current++
      setChatTabs((prev) => [...prev, { id: newId, title, messages, sessionId }])
      setActiveChatTab(newId)
      setRightSidebarOpen(false)
    } catch (error) {
      console.error('Error loading historical chat:', error)
      showNotification('Failed to load chat history', 'error')
    }
  }, [user?.id, showNotification])

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    setSelectedCourse(null)
    setSearchResults([])
    setSearchError(null)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }, [])

  const handleSendMessage = useCallback(async (e) => {
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
  }, [chatInput, isSending, getCurrentChatMessages, updateCurrentChatMessages, updateCurrentChatSessionId, chatTabs, activeChatTab, user?.id, loadChatSessions])

  const handleCourseSearch = useCallback(async (e) => {
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
  }, [searchQuery, isSearching])

  const handleCourseClick = useCallback(async (course) => {
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
  }, [])

  const handleToggleFavorite = useCallback(async (course) => {
    if (!user?.id) return
    // FIX #1: Use "SUBJ CATALOG" (with space) to match DB storage and isCompleted
    const courseCode = `${course.subject} ${course.catalog}`
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
  }, [user?.id, favoritesMap, showNotification])

  const handleToggleCompleted = useCallback(async (course) => {
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
          `This course is ${credits} credit${credits !== 1 ? 's' : ''}. Is this correct? (Press OK to confirm, or type the number of credits):`,
          credits
        )
        if (confirmCredits === null) return
        if (confirmCredits !== '' && !isNaN(confirmCredits)) {
          finalCredits = parseInt(confirmCredits)
        }

        await completedCoursesAPI.addCompleted(user.id, {
          course_code: courseCode,
          course_title: course.title || course.course_title || '',
          subject: course.subject,
          catalog: course.catalog,
          term,
          year: parseInt(year),
          grade: grade || null,
          credits: finalCredits,
        })
        setCompletedCourses((prev) => [
          { course_code: courseCode, course_title: course.title || '', subject: course.subject, catalog: course.catalog, term, year: parseInt(year), grade: grade || null, credits: finalCredits },
          ...prev,
        ])
        setCompletedCoursesMap((prev) => new Set([...prev, courseCode]))
      }
    } catch (error) {
      console.error('Error toggling completed:', error)
      showNotification(error.message || 'Failed to update completed courses', 'error')
    }
  }, [user?.id, completedCoursesMap, showNotification])

  // FIX #18: Memoize sortCourses with useMemo to avoid re-sorting on every render
  const sortCourses = useCallback((courses, sort) => {
    const sorted = [...courses]
    switch (sort) {
      case 'grade_high':
        return sorted.sort((a, b) => (b.average || 0) - (a.average || 0))
      case 'grade_low':
        return sorted.sort((a, b) => (a.average || 0) - (b.average || 0))
      case 'rating_high':
        return sorted.sort((a, b) => (b.rmp_rating || 0) - (a.rmp_rating || 0))
      case 'name_asc':
        return sorted.sort((a, b) => `${a.subject}${a.catalog}`.localeCompare(`${b.subject}${b.catalog}`))
      case 'instructor_asc':
        return sorted.sort((a, b) => (a.instructor || '').localeCompare(b.instructor || ''))
      case 'instructor_desc':
        return sorted.sort((a, b) => (b.instructor || '').localeCompare(a.instructor || ''))
      default:
        return sorted
    }
  }, [])

  const gpaToLetterGrade = useCallback((gpa) => {
    if (!gpa) return 'N/A'
    if (gpa >= 3.85) return 'A'
    if (gpa >= 3.5) return 'A-'
    if (gpa >= 3.15) return 'B+'
    if (gpa >= 2.85) return 'B'
    if (gpa >= 2.5) return 'B-'
    if (gpa >= 2.15) return 'C+'
    if (gpa >= 1.85) return 'C'
    if (gpa >= 1.5) return 'C-'
    if (gpa >= 1.15) return 'D+'
    if (gpa >= 0.85) return 'D'
    return 'F'
  }, [])

  // FIX #17: isFavorited and isCompleted as useCallback so they're stable
  // references when passed as props, preventing needless child re-renders.
  const isFavorited = useCallback(
    // FIX #1: Use space-separated key to match favoritesMap storage format
    (subject, catalog) => favoritesMap.has(`${subject} ${catalog}`),
    [favoritesMap]
  )

  const isCompleted = useCallback(
    (subject, catalog) => completedCoursesMap.has(`${subject} ${catalog}`),
    [completedCoursesMap]
  )

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
      loadAdvisorCards()
    }
  }, [user?.id, loadChatSessions, loadFavorites, loadCompletedCourses, loadAdvisorCards])

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

    // Advisor cards
    advisorCards, cardsLoading, cardsGenerating, cardsGeneratedAt,
    loadAdvisorCards, refreshAdvisorCards,
    handleCardChipClick, handleCardFollowUp,

    // Freeform input
    freeformInput, setFreeformInput, isSendingFreeform, handleFreeformSubmit,
  }
}