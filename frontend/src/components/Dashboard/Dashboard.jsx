import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import coursesAPI from '../../lib/professorsAPI'
import favoritesAPI from '../../lib/favoritesAPI'
import completedCoursesAPI from '../../lib/completedCoursesAPI'
import currentCoursesAPI from '../../lib/currentCoursesAPI'
import { getCourseCredits } from '../../utils/courseCredits'
import { useLanguage } from '../../contexts/LanguageContext'
import cardsAPI from '../../lib/cardsAPI'
import AdvisorCards from './chat/AdvisorCards'
import FeedbackModal from './FeedbackModal'
import RightSidebar from './RightSidebar'

import Sidebar from './Sidebar'
import CoursesTab from './CoursesTab'
import ProfileTab from './ProfileTab'
import DegreePlanningView from './DegreePlanningView'
import Forum from '../Forum/Forum'
import MarkCompleteModal from './MarkCompleteModal'
import CalendarTab from './CalendarTab'
import TranscriptUpload from './TranscriptUpload'

import './Dashboard.css'

export default function Dashboard() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const { t } = useLanguage()

  // ── Layout ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileImage, setProfileImage] = useState(profile?.profile_image || null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

  // ── Right sidebar / pinned chat ─────────────────────────
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [pinnedCard, setPinnedCard] = useState(null)
  const [pinnedThread, setPinnedThread] = useState([])
  const [pinnedIsThinking, setPinnedIsThinking] = useState(false)

  // ── Transcript upload ──────────────────────────────────
  const [showTranscriptUpload, setShowTranscriptUpload] = useState(false)

  // ── Advisor cards ──────────────────────────────────────
  const [advisorCards, setAdvisorCards] = useState([])
  const [cardsLoading, setCardsLoading] = useState(false)
  const [cardsGenerating, setCardsGenerating] = useState(false)
  const [cardsGeneratedAt, setCardsGeneratedAt] = useState(null)
  const [freeformInput, setFreeformInput] = useState('')
  const [isAsking, setIsAsking] = useState(false)

  // ── Course search ──────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isLoadingCourse, setIsLoadingCourse] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')

  // ── Favorites & completed ──────────────────────────────
  const [favorites, setFavorites] = useState([])
  const [favoritesMap, setFavoritesMap] = useState(new Set())
  const [completedCourses, setCompletedCourses] = useState([])
  const [completedCoursesMap, setCompletedCoursesMap] = useState(new Set())
  const [currentCourses, setCurrentCourses] = useState([])
  const [currentCoursesMap, setCurrentCoursesMap] = useState(new Set())

  // ── Mark Complete modal ────────────────────────────────
  const [showCompleteCourseModal, setShowCompleteCourseModal] = useState(false)
  const [courseToComplete, setCourseToComplete] = useState(null)

  // ── Utilities ──────────────────────────────────────────
  const gpaToLetterGrade = (gpa) => {
    if (!gpa) return ''
    const n = parseFloat(gpa)
    if (n >= 3.85) return 'A'
    if (n >= 3.7)  return 'A-'
    if (n >= 3.3)  return 'B+'
    if (n >= 3.0)  return 'B'
    if (n >= 2.7)  return 'B-'
    if (n >= 2.3)  return 'C+'
    if (n >= 2.0)  return 'C'
    if (n >= 1.0)  return 'D'
    return 'F'
  }

  const sortCourses = (courses, sortType) => {
    const sorted = [...courses]
    switch (sortType) {
      case 'rating-high':    return sorted.sort((a, b) => (b.rmp_rating || 0) - (a.rmp_rating || 0))
      case 'rating-low':     return sorted.sort((a, b) => (a.rmp_rating || 0) - (b.rmp_rating || 0))
      case 'name-az':        return sorted.sort((a, b) => `${a.subject} ${a.catalog}`.localeCompare(`${b.subject} ${b.catalog}`))
      case 'name-za':        return sorted.sort((a, b) => `${b.subject} ${b.catalog}`.localeCompare(`${a.subject} ${a.catalog}`))
      case 'instructor-az':  return sorted.sort((a, b) => (a.instructor || 'ZZZ').localeCompare(b.instructor || 'ZZZ'))
      case 'instructor-za':  return sorted.sort((a, b) => (b.instructor || '').localeCompare(a.instructor || ''))
      default: return sorted
    }
  }

  const isFavorited = (subject, catalog) => favoritesMap.has(`${subject}${catalog}`)
  const isCompleted = (subject, catalog) => completedCoursesMap.has(`${subject} ${catalog}`)
  const isCurrent   = (subject, catalog) => currentCoursesMap.has(`${subject} ${catalog}`)

  // ── Advisor card handlers ──────────────────────────────
  const loadAdvisorCards = useCallback(async () => {
    if (!user?.id) return
    try {
      setCardsLoading(true)
      const data = await cardsAPI.getCards(user.id)
      const cards = data.cards || []
      setAdvisorCards(cards)
      setCardsGeneratedAt(data.generated_at || null)
      if (!cards.length) {
        setCardsLoading(false)
        await refreshAdvisorCards(false)
      }
    } catch (error) {
      console.error('Error loading advisor cards:', error)
    } finally {
      setCardsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const refreshAdvisorCards = async (force = true) => {
    if (!user?.id) return
    try {
      setCardsGenerating(true)
      const data = await cardsAPI.generateCards(user.id, force)
      setAdvisorCards(data.cards || [])
      setCardsGeneratedAt(data.generated_at || null)
    } catch (error) {
      console.error('Error generating advisor cards:', error)
    } finally {
      setCardsGenerating(false)
    }
  }

  const handleCardChipClick = async (cardId, message, cardTitle, cardBody) => {
    if (!user?.id) return ''
    try {
      return await cardsAPI.sendThreadMessage(cardId, user.id, message, `${cardTitle}: ${cardBody}`)
    } catch (error) {
      console.error('Error in card thread:', error)
      return 'Something went wrong. Please try again.'
    }
  }

    // Toggle the saved/pinned state of a single card
  const handleCardSaveToggle = async (cardId, isSaved) => {
    if (!user?.id) return
    try {
      const updated = await cardsAPI.saveCard(cardId, isSaved)
      setAdvisorCards(prev =>
        prev.map(c => c.id === cardId ? { ...c, is_saved: updated.is_saved } : c)
      )
    } catch (error) {
      console.error('Error toggling card save:', error)
    }
  }

  // Persist drag-and-drop order sent up from AdvisorCards component
  const handleCardsReorder = async (order) => {
    if (!user?.id) return
    try {
      await cardsAPI.reorderCards(user.id, order)
      // Optimistic update already happened inside DraggableFeed;
      // re-sync sort_order field so future re-renders are stable
      setAdvisorCards(prev => {
        const orderMap = Object.fromEntries(order.map(o => [o.id, o.sort_order]))
        return [...prev]
          .map(c => orderMap[c.id] !== undefined ? { ...c, sort_order: orderMap[c.id] } : c)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      })
    } catch (error) {
      console.error('Error reordering cards:', error)
    }
  }

  const handleFreeformSubmit = async (e) => {
    e.preventDefault()
    if (!freeformInput.trim() || isAsking || !user?.id) return
    const question = freeformInput.trim()
    setFreeformInput('')
    setIsAsking(true)
    try {
      const data = await cardsAPI.askCard(user.id, question)
      if (data.card) {
        // Prepend the new user-asked card to the top of the feed
        setAdvisorCards(prev => [data.card, ...prev])
      }
    } catch (error) {
      console.error('Error asking card:', error)
    } finally {
      setIsAsking(false)
    }
  }

  // ── Sync right sidebar width as CSS var on body ──────────
  useEffect(() => {
    const visible = rightSidebarOpen && pinnedCard && activeTab !== 'chat'
    document.body.style.setProperty('--rsb-width', visible ? '320px' : '0px')
    return () => document.body.style.setProperty('--rsb-width', '0px')
  }, [rightSidebarOpen, pinnedCard, activeTab])

  // ── Pinned card handler ───────────────────────────────────
  const handlePinToggle = (card, thread) => {
    if (!card) {
      // unpin
      setPinnedCard(null)
      setPinnedThread([])
      setRightSidebarOpen(false)
    } else {
      setPinnedCard(card)
      setPinnedThread(thread || [])
      setRightSidebarOpen(true)
    }
  }

  const handlePinnedSend = async (message) => {
    if (!user?.id || !pinnedCard) return
    setPinnedThread(prev => [...prev, { role: 'user', content: message }])
    setPinnedIsThinking(true)
    try {
      const reply = await handleCardChipClick(pinnedCard.id, message, pinnedCard.title, pinnedCard.body)
      setPinnedThread(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setPinnedThread(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setPinnedIsThinking(false)
    }
  }

  // ── Data loaders ───────────────────────────────────────
  const loadFavorites = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await favoritesAPI.getFavorites(user.id)
      setFavorites(data.favorites || [])
      setFavoritesMap(new Set((data.favorites || []).map(f => f.course_code)))
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }, [user?.id])

  const loadCompletedCourses = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await completedCoursesAPI.getCompleted(user.id)
      setCompletedCourses(data.completed_courses || [])
      setCompletedCoursesMap(new Set((data.completed_courses || []).map(c => c.course_code)))
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
      setCurrentCoursesMap(new Set((data.current_courses || []).map(c => c.course_code)))
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
        setFavorites(prev => prev.filter(f => f.course_code !== courseCode))
        setFavoritesMap(prev => { const s = new Set(prev); s.delete(courseCode); return s })
      } else {
        await favoritesAPI.addFavorite(user.id, {
          course_code: courseCode,
          course_title: course.title,
          subject: course.subject,
          catalog: course.catalog,
        })
        setFavorites(prev => [
          { course_code: courseCode, course_title: course.title, subject: course.subject, catalog: course.catalog },
          ...prev,
        ])
        setFavoritesMap(prev => new Set([...prev, courseCode]))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert(error.message || 'Failed to update favorites')
    }
  }

  // ── Toggle completed ───────────────────────────────────
  const handleToggleCompleted = async (course) => {
    if (!user?.id) return
    const courseCode = `${course.subject} ${course.catalog}`
    const isComp = completedCoursesMap.has(courseCode)
    try {
      if (isComp) {
        await completedCoursesAPI.removeCompleted(user.id, courseCode)
        setCompletedCourses(prev => prev.filter(c => c.course_code !== courseCode))
        setCompletedCoursesMap(prev => { const s = new Set(prev); s.delete(courseCode); return s })
      } else {
        const credits = getCourseCredits(course.subject, course.catalog)
        setCourseToComplete({
          code: courseCode,
          title: course.title || course.course_title,
          subject: course.subject,
          catalog: course.catalog,
          defaultCredits: credits,
        })
        setShowCompleteCourseModal(true)
      }
    } catch (error) {
      console.error('Error toggling completed:', error)
      alert(error.message || 'Failed to update completed courses')
    }
  }

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
      setCompletedCourses(prev => [courseData, ...prev])
      setCompletedCoursesMap(prev => new Set([...prev, courseToComplete.code]))
      setShowCompleteCourseModal(false)
      setCourseToComplete(null)
    } catch (error) {
      console.error('Error marking completed:', error)
      alert(error.message || 'Failed to mark course as completed')
    }
  }

  // ── Toggle current ─────────────────────────────────────
  const handleToggleCurrent = async (course) => {
    if (!user?.id) return
    const courseCode = `${course.subject} ${course.catalog}`
    const enrolled = currentCoursesMap.has(courseCode)
    try {
      if (enrolled) {
        await currentCoursesAPI.removeCurrent(user.id, courseCode)
        setCurrentCourses(prev => prev.filter(c => c.course_code !== courseCode))
        setCurrentCoursesMap(prev => { const s = new Set(prev); s.delete(courseCode); return s })
      } else {
        const courseData = {
          course_code: courseCode,
          course_title: course.title || course.course_title || '',
          subject: course.subject,
          catalog: course.catalog,
          credits: course.credits || 3,
        }
        await currentCoursesAPI.addCurrent(user.id, courseData)
        setCurrentCourses(prev => [courseData, ...prev])
        setCurrentCoursesMap(prev => new Set([...prev, courseCode]))
      }
    } catch (error) {
      console.error('Error toggling current course:', error)
      alert(error.message || 'Failed to update current courses')
    }
  }

  // ── Sign out ───────────────────────────────────────────
  const handleSignOut = async () => {
    try { await signOut() }
    catch (error) { console.error('Error signing out:', error) }
  }

  // ── Profile image ──────────────────────────────────────
  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Image size must be less than 5MB'); return }
    setIsUploadingImage(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        await updateProfile({ profile_image: reader.result })
        setProfileImage(reader.result)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // ── Transcript import complete ─────────────────────────
  const handleTranscriptImportComplete = () => {
    setShowTranscriptUpload(false)
    loadCompletedCourses()
    loadCurrentCourses()
    refreshAdvisorCards(true)
  }

  // ── Effects ────────────────────────────────────────────
  useEffect(() => {
    if (user?.id) {
      loadFavorites()
      loadCompletedCourses()
      loadCurrentCourses()
      loadAdvisorCards()
    }
  }, [user?.id, loadFavorites, loadCompletedCourses, loadCurrentCourses, loadAdvisorCards])

  useEffect(() => {
    setProfileImage(profile?.profile_image || null)
  }, [profile?.profile_image])

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="dashboard">
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

      <main className="main-content">
        <button
          className="mobile-menu-btn-overlay"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >☰</button>

        <div className="content-area">

          {activeTab === 'chat' && (
            <AdvisorCards
              userId={user?.id}
              cards={advisorCards}
              isLoading={cardsLoading}
              isGenerating={cardsGenerating}
              isAsking={isAsking}
              generatedAt={cardsGeneratedAt}
              onRefresh={() => refreshAdvisorCards(true)}
              onSaveToggle={handleCardSaveToggle}
              onPinToggle={handlePinToggle}
              pinnedCardId={pinnedCard?.id || null}
              onReorder={handleCardsReorder}
              onChipClick={handleCardChipClick}
              onFollowUp={handleCardChipClick}
              onDeleteCard={async (cardId) => {
                // Optimistically remove from UI immediately
                setAdvisorCards(prev => prev.filter(c => c.id !== cardId))
                // Permanently delete from DB so it doesn't come back on refresh
                try { await cardsAPI.deleteCard(user.id, cardId) } catch (e) {
                  console.warn('Failed to delete card from DB:', e)
                }
              }}
              freeformInput={freeformInput}
              setFreeformInput={setFreeformInput}
              onFreeformSubmit={handleFreeformSubmit}
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
            <DegreePlanningView
              favorites={favorites}
              completedCourses={completedCourses}
              completedCoursesMap={completedCoursesMap}
              currentCourses={currentCourses}
              currentCoursesMap={currentCoursesMap}
              favoritesMap={favoritesMap}
              profile={profile}
              onToggleFavorite={handleToggleFavorite}
              onToggleCompleted={handleToggleCompleted}
              onToggleCurrent={handleToggleCurrent}
              onImportTranscript={() => setShowTranscriptUpload(true)}
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
            />
          )}

          {activeTab === 'forum' && <Forum />}
          {activeTab === 'clubs' && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: '#111827' }}>McGill Clubs</h2>
              <p style={{ fontSize: '15px' }}>Club directory coming soon.</p>
            </div>
          )}

          {activeTab === 'calendar' && <CalendarTab user={user} />}

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
              chatHistory={[]}
              onImportTranscript={() => setShowTranscriptUpload(true)}
            />
          )}
        </div>
      </main>

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
      {showTranscriptUpload && (
        <TranscriptUpload
          userId={user?.id}
          onClose={() => setShowTranscriptUpload(false)}
          onImportComplete={handleTranscriptImportComplete}
        />
      )}

      <RightSidebar
        isOpen={rightSidebarOpen}
        setIsOpen={setRightSidebarOpen}
        pinnedCard={pinnedCard}
        pinnedThread={pinnedThread}
        pinnedIsThinking={pinnedIsThinking}
        onSend={handlePinnedSend}
        onUnpin={() => handlePinToggle(null, [])}
        activeTab={activeTab}
      />

      <FeedbackModal userId={user?.id} userEmail={user?.email} />
    </div>
  )
}
