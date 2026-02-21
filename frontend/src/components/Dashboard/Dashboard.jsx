import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { chatAPI } from '../../lib/api'
import coursesAPI from '../../lib/professorsAPI'
import favoritesAPI from '../../lib/favoritesAPI'
import completedCoursesAPI from '../../lib/completedCoursesAPI'
import currentCoursesAPI from '../../lib/currentCoursesAPI'
import { getCourseCredits } from '../../utils/courseCredits'
import { useLanguage } from '../../contexts/LanguageContext'

import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'
import ChatTabsBar from './ChatTabsBar'
import ChatTab from './ChatTab'
import CoursesTab from './CoursesTab'
import ProfileTab from './ProfileTab'
import SavedCoursesView from './SavedCoursesView'
import Forum from '../Forum/Forum'
import MarkCompleteModal from './MarkCompleteModal'
import CalendarTab from './CalendarTab'

import './Dashboard.css'

export default function Dashboard() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const { t } = useLanguage()

  // ── Layout state ───────────────────────────────────────
  const [activeTab, setActiveTab] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [profileImage, setProfileImage] = useState(profile?.profile_image || null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

  // ── Chat tabs state ────────────────────────────────────
  const [chatTabs, setChatTabs] = useState([
    { id: 1, title: 'chat.newChat', messages: [], sessionId: null },
  ])
  const [activeChatTab, setActiveChatTab] = useState(1)
  const [nextChatTabId, setNextChatTabId] = useState(2)
  const [chatHistory, setChatHistory] = useState([])

  // ── Chat input state ───────────────────────────────────
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [chatError, setChatError] = useState(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // ── Course search state ────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isLoadingCourse, setIsLoadingCourse] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [openFlagCourse, setOpenFlagCourse] = useState(null)

  // ── Favorites & completed ──────────────────────────────
  const [favorites, setFavorites] = useState([])
  const [favoritesMap, setFavoritesMap] = useState(new Set())
  const [completedCourses, setCompletedCourses] = useState([])
  const [completedCoursesMap, setCompletedCoursesMap] = useState(new Set())
  const [currentCourses, setCurrentCourses] = useState([])
  const [currentCoursesMap, setCurrentCoursesMap] = useState(new Set())

  // ── Mark Complete Modal state ──────────────────────────
  const [showCompleteCourseModal, setShowCompleteCourseModal] = useState(false)
  const [courseToComplete, setCourseToComplete] = useState(null)

  // ── Utility functions ──────────────────────────────────
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
  const isCurrent = (subject, catalog) => currentCoursesMap.has(`${subject} ${catalog}`)

  // ── Helpers ────────────────────────────────────────────
  const getCurrentChatMessages = () => {
    const tab = chatTabs.find((t) => t.id === activeChatTab)
    return tab ? tab.messages : []
  }

  const updateCurrentChatMessages = (messages) => {
    setChatTabs((prev) =>
      prev.map((tab) => (tab.id === activeChatTab ? { ...tab, messages } : tab))
    )
  }

  const updateCurrentChatSessionId = (sessionId) => {
    setChatTabs((prev) =>
      prev.map((tab) => (tab.id === activeChatTab ? { ...tab, sessionId } : tab))
    )
  }

  // ── Chat tab management ────────────────────────────────
  const handleNewChatTab = () => {
    const newTab = { id: nextChatTabId, title: 'chat.newChat', messages: [], sessionId: null }
    setChatTabs([...chatTabs, newTab])
    setActiveChatTab(nextChatTabId)
    setNextChatTabId(nextChatTabId + 1)
  }

  const handleCloseChatTab = (tabId) => {
    if (chatTabs.length === 1) {
      setChatTabs([{ id: 1, title: 'chat.newChat', messages: [], sessionId: null }])
      setActiveChatTab(1)
      return
    }
    const tabIndex = chatTabs.findIndex((t) => t.id === tabId)
    const newTabs = chatTabs.filter((t) => t.id !== tabId)
    setChatTabs(newTabs)
    if (tabId === activeChatTab) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1)
      setActiveChatTab(newTabs[newActiveIndex].id)
    }
  }

  // ── Data loaders ───────────────────────────────────────
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

  const loadHistoricalChat = async (sessionId) => {
    try {
      const data = await chatAPI.getHistory(user.id, sessionId)
      const messages = data.messages || []
      const firstUserMessage = messages.find((m) => m.role === 'user')
      const title = firstUserMessage
        ? firstUserMessage.content.substring(0, 30) + '...'
        : 'Chat Session'

      const newTab = { id: nextChatTabId, title, messages, sessionId }
      setChatTabs([...chatTabs, newTab])
      setActiveChatTab(nextChatTabId)
      setNextChatTabId(nextChatTabId + 1)
      setRightSidebarOpen(false)
    } catch (error) {
      console.error('Error loading historical chat:', error)
      alert('Failed to load chat history')
    }
  }

  const loadFavorites = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await favoritesAPI.getFavorites(user.id)
      setFavorites(data.favorites || [])
      setFavoritesMap(new Set((data.favorites || []).map((f) => f.course_code)))
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }, [user?.id])

  const loadCompletedCourses = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await completedCoursesAPI.getCompleted(user.id)
      setCompletedCourses(data.completed_courses || [])
      setCompletedCoursesMap(new Set((data.completed_courses || []).map((c) => c.course_code)))
    } catch (error) {
      console.error('Error loading completed courses:', error)
      setCompletedCourses([])
      setCompletedCoursesMap(new Set())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const loadCurrentCourses = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await currentCoursesAPI.getCurrent(user.id)
      setCurrentCourses(data.current_courses || [])
      setCurrentCoursesMap(new Set((data.current_courses || []).map((c) => c.course_code)))
    } catch (error) {
      console.error('Error loading current courses:', error)
      setCurrentCourses([])
      setCurrentCoursesMap(new Set())
    }
  }, [user?.id])

  // ── Tab change ─────────────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedCourse(null)
    setSearchResults([])
    setSearchError(null)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  // ── Send message ───────────────────────────────────────
  const handleSendMessage = async (e, attachedFiles = []) => {
    e.preventDefault()
    if ((!chatInput.trim() && attachedFiles.length === 0) || isSending) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatError(null)

    const currentMessages = getCurrentChatMessages()
    
    // Add user message with files to UI
    const newUserMessage = {
      role: 'user',
      content: userMessage || '(Files attached)',
      files: attachedFiles.map(f => ({ name: f.name, size: f.size }))
    }
    
    const newMessages = [...currentMessages, newUserMessage]
    updateCurrentChatMessages(newMessages)

    setIsSending(true)
    try {
      const currentTab = chatTabs.find((t) => t.id === activeChatTab)
      
      // For now, send without files (backend integration needed)
      // TODO: Convert files to base64 and send to backend
      const response = await chatAPI.sendMessage(user.id, userMessage || '(Files attached)', currentTab.sessionId)

      updateCurrentChatMessages([
        ...newMessages,
        { role: 'assistant', content: response.response },
      ])

      if (!currentTab.sessionId && response.session_id) {
        updateCurrentChatSessionId(response.session_id)
        if (currentMessages.length === 0) {
          const title = userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '')
          setChatTabs((prev) =>
            prev.map((tab) => (tab.id === activeChatTab ? { ...tab, title } : tab))
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

  // ── Course search ──────────────────────────────────────
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

  // ── Toggle favorite ────────────────────────────────────
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
      alert(error.message || 'Failed to update favorites')
    }
  }

  // ── Toggle completed (with modal) ──────────────────────
  const handleToggleCompleted = async (course) => {
    if (!user?.id) return
    const courseCode = `${course.subject} ${course.catalog}`
    const isComp = completedCoursesMap.has(courseCode)

    try {
      if (isComp) {
        // Remove completed course
        await completedCoursesAPI.removeCompleted(user.id, courseCode)
        setCompletedCourses((prev) => prev.filter((c) => c.course_code !== courseCode))
        setCompletedCoursesMap((prev) => {
          const s = new Set(prev)
          s.delete(courseCode)
          return s
        })
      } else {
        // Open modal to add completed course
        const credits = getCourseCredits(course.subject, course.catalog)
        setCourseToComplete({
          code: courseCode,
          title: course.title || course.course_title,
          subject: course.subject,
          catalog: course.catalog,
          defaultCredits: credits
        })
        setShowCompleteCourseModal(true)
      }
    } catch (error) {
      console.error('Error toggling completed:', error)
      alert(error.message || 'Failed to update completed courses')
    }
  }

  // ── Handle modal confirmation ──────────────────────────
  const handleConfirmComplete = async (formData) => {
    try {
      const courseData = {
        course_code: courseToComplete.code,
        course_title: courseToComplete.title,
        subject: courseToComplete.subject,
        catalog: courseToComplete.catalog,
        term: formData.term,
        year: parseInt(formData.year),
        grade: formData.grade || null,
        credits: formData.credits,
      }

      await completedCoursesAPI.addCompleted(user.id, courseData)
      setCompletedCourses((prev) => [courseData, ...prev])
      setCompletedCoursesMap((prev) => new Set([...prev, courseToComplete.code]))
      
      // Close modal
      setShowCompleteCourseModal(false)
      setCourseToComplete(null)
    } catch (error) {
      console.error('Error marking completed:', error)
      alert(error.message || 'Failed to mark course as completed')
    }
  }

  // ── Toggle current courses ──────────────────────────────
  const handleToggleCurrent = async (course) => {
    if (!user?.id) return
    const courseCode = `${course.subject} ${course.catalog}`
    const isCurrentlyEnrolled = currentCoursesMap.has(courseCode)

    try {
      if (isCurrentlyEnrolled) {
        await currentCoursesAPI.removeCurrent(user.id, courseCode)
        setCurrentCourses((prev) => prev.filter((c) => c.course_code !== courseCode))
        setCurrentCoursesMap((prev) => { const s = new Set(prev); s.delete(courseCode); return s })
      } else {
        const courseData = {
          course_code: courseCode,
          course_title: course.title || course.course_title || '',
          subject: course.subject,
          catalog: course.catalog,
          credits: course.credits || 3,
        }
        await currentCoursesAPI.addCurrent(user.id, courseData)
        setCurrentCourses((prev) => [courseData, ...prev])
        setCurrentCoursesMap((prev) => new Set([...prev, courseCode]))
      }
    } catch (error) {
      console.error('Error toggling current course:', error)
      alert(error.message || 'Failed to update current courses')
    }
  }

  // ── Sign out ───────────────────────────────────────────
  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // ── Profile image upload ───────────────────────────────
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setIsUploadingImage(true)

    try {
      // Create a FileReader to convert to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Image = reader.result
        
        // Update profile with new image
        await updateProfile({ profile_image: base64Image })
        setProfileImage(base64Image)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // ── Effects ────────────────────────────────────────────
  useEffect(() => {
    if (user?.id) {
      loadChatSessions()
      loadFavorites()
      loadCompletedCourses()
      loadCurrentCourses()
    }
  }, [user?.id, loadChatSessions, loadFavorites, loadCompletedCourses, loadCurrentCourses])

  useEffect(() => {
    if (profile?.profile_image) {
      setProfileImage(profile.profile_image)
    } else {
      setProfileImage(null)
    }
  }, [profile?.profile_image])

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="dashboard">
      {/* Left Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        favorites={favorites}
        profileImage={profileImage}
        user={user}
        profile={profile}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Mobile Menu */}
        <button
          className="mobile-menu-btn-overlay"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>

        {/* Chat Tabs Bar */}
        {activeTab === 'chat' && (
          <ChatTabsBar
            chatTabs={chatTabs}
            activeChatTab={activeChatTab}
            onSelectTab={setActiveChatTab}
            onCloseTab={handleCloseChatTab}
            onNewTab={handleNewChatTab}
            onReorder={setChatTabs}
          />
        )}

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'chat' && (
            <ChatTab
              messages={getCurrentChatMessages()}
              isLoadingHistory={isLoadingHistory}
              isSending={isSending}
              chatInput={chatInput}
              setChatInput={setChatInput}
              chatError={chatError}
              onSendMessage={handleSendMessage}
              userEmail={user?.email}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              setSearchResults={setSearchResults}
              isSearching={isSearching}
              searchError={searchError}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              isLoadingCourse={isLoadingCourse}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortCourses={sortCourses}
              isFavorited={isFavorited}
              isCompleted={isCompleted}
              handleCourseSearch={handleCourseSearch}
              handleCourseClick={handleCourseClick}
              handleToggleFavorite={handleToggleFavorite}
              handleToggleCompleted={handleToggleCompleted}
              handleToggleCurrent={handleToggleCurrent}
              isCurrent={isCurrent}
              gpaToLetterGrade={gpaToLetterGrade}
            />
          )}

          {activeTab === 'favorites' && (
            <SavedCoursesView
              favorites={favorites}
              completedCourses={completedCourses}
              completedCoursesMap={completedCoursesMap}
              favoritesMap={favoritesMap}
              user={user}
              onToggleFavorite={handleToggleFavorite}
              onToggleCompleted={handleToggleCompleted}
              onToggleCurrent={handleToggleCurrent}
              currentCourses={currentCourses}
              currentCoursesMap={currentCoursesMap}
              onCourseClick={async (course) => {
                setActiveTab('courses')
                setTimeout(async () => {
                  await handleCourseClick({
                    subject: course.subject,
                    catalog: course.catalog,
                    title: course.course_title,
                  })
                }, 100)
              }}
              onRefresh={() => {
                loadFavorites()
                loadCompletedCourses()
                loadCurrentCourses()
              }}
            />
          )}

          {activeTab === 'forum' && <Forum />}

          {activeTab === 'calendar' && (
            <CalendarTab user={user} />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              user={user}
              profile={profile}
              updateProfile={updateProfile}
              signOut={handleSignOut}
              profileImage={profileImage}
              isUploadingImage={isUploadingImage}
              fileInputRef={fileInputRef}
              handleImageUpload={handleImageUpload}
              handleAvatarClick={handleAvatarClick}
              completedCourses={completedCourses}
              favorites={favorites}
              chatHistory={chatHistory}
            />
          )}
        </div>
      </main>

      {/* Right Sidebar — Chat History */}
      {activeTab === 'chat' && (
        <RightSidebar
          isOpen={rightSidebarOpen}
          setIsOpen={setRightSidebarOpen}
          chatHistory={chatHistory}
          onLoadChat={loadHistoricalChat}
        />
      )}

      {/* Mark Complete Modal */}
      {showCompleteCourseModal && courseToComplete && (
        <MarkCompleteModal
          course={courseToComplete}
          onConfirm={handleConfirmComplete}
          onCancel={() => {
            setShowCompleteCourseModal(false)
            setCourseToComplete(null)
          }}
        />
      )}
    </div>
  )
}

