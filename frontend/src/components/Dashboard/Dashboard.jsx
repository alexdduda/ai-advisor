import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { coursesAPI, usersAPI } from '../../lib/api'
import favoritesAPI from '../../lib/favoritesAPI'
import completedCoursesAPI from '../../lib/completedCoursesAPI'
import currentCoursesAPI from '../../lib/currentCoursesAPI'
import { getCourseCredits as _getCourseCredits } from '../../utils/courseCredits'
import { normalizeQuery, buildCorrectionCandidates } from '../../utils/fuzzySearch'
import { useLanguage } from '../../contexts/PreferencesContext'
import cardsAPI from '../../lib/cardsAPI'
import { useState, useEffect, lazy, Suspense } from 'react'
import { DashboardDataProvider, useDashboardData } from '../../contexts/DashboardDataContext'
import AdvisorCards from './chat/AdvisorCards'
import HomeTab from './HomeTab'
import RightSidebar from './RightSidebar'
import CoursesView from './CoursesView'

import Sidebar from './Sidebar'

// Code-split everything that isn't on the default landing screen. Home is
// the default tab and ships in the main bundle (Brief/Chat stays static too
// since Home links straight into it); secondary tabs and modals only
// download when the user navigates to them.
const ClubsTab          = lazy(() => import('./ClubsTab'))
const ProfileTab        = lazy(() => import('./ProfileTab'))
const DegreePlanningView = lazy(() => import('./DegreePlanningView'))
const Forum             = lazy(() => import('../Forum/Forum'))
const CalendarTab       = lazy(() => import('./CalendarTab'))
const TranscriptUpload  = lazy(() => import('./TranscriptUpload'))
const FeedbackModal     = lazy(() => import('./FeedbackModal'))
const MarkCompleteModal = lazy(() => import('./MarkCompleteModal'))
const OnboardingTutorial = lazy(() => import('./OnboardingTutorial'))

import { CourseDetailProvider } from '../../contexts/CourseDetailContext'
import CourseDetailModal from '../shared/CourseDetailModal'
import './Dashboard.css'

// Tiny inline spinner used as Suspense fallback for lazy tabs
function TabLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '40vh', color: 'var(--text-secondary)',
    }}>
      <div style={{
        width: 28, height: 28, border: '3px solid var(--border-color)',
        borderTopColor: 'var(--accent-primary, #ed1b2f)', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )
}

/**
 * Desktop dashboard view.
 *
 * Owns only what is specific to *this* shell: the collapsible left sidebar,
 * the pinned-card right sidebar, and the desktop onboarding tour (which
 * anchors its tour stops to Sidebar nav buttons via data-tour attributes —
 * mobile ships its own tutorial rather than reusing these anchors).
 *
 * All data and business logic comes from DashboardDataContext.
 */
function DesktopDashboard() {
  const {
    user, profile, authFlags, updateProfile,
    activeTab, setActiveTab, handleTabChange: onTabChange,
    coursesDeepLink, setCoursesDeepLink,
    briefOpenCardId, setBriefOpenCardId,

    advisorCards, cardsLoading, cardsGenerating, cardsGeneratedAt,
    freeformInput, setFreeformInput, isAsking,
    refreshAdvisorCards, handleCardSaveToggle, handleCardsReorder,
    handleCardChipClick, handleDeleteCard, handleFreeformSubmit,

    searchQuery, setSearchQuery, searchResults, isSearching, searchError,
    searchCorrection, hasSearched, sortBy, setSortBy, searchTerm, setSearchTerm,
    availableTerms, handleCourseSearch, sortCourses,

    favorites, favoritesMap,
    completedCourses, completedCoursesMap,
    currentCourses, currentCoursesMap,
    isFavorited, isCompleted, isCurrent,
    handleToggleFavorite, handleToggleCompleted, handleToggleCurrent,

    upcomingEvents, upcomingEventsLoading, upcomingUrgentCount, hasUpcomingCourseEvents,

    clubCalendarEvents, setClubCalendarEvents, managedClubs,

    showCompleteCourseModal, courseToComplete, handleConfirmComplete, cancelCompleteCourse,

    showTranscriptUpload, transcriptUploadTab, setShowTranscriptUpload,
    openTranscriptUpload, openSyllabusUpload, handleTranscriptImportComplete,

    profileImage, isUploadingImage, fileInputRef, handleImageUpload, handleAvatarClick,

    gpaToLetterGrade, handleSignOut,
  } = useDashboardData()

  // ── Layout ─────────────────────────────────────────────
  // Sidebar open/closed state — persisted across reloads but defaults to OPEN
  // on first visit so new users see the navigation rail.
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('sidebar_open')
      if (stored === null) return true   // first visit → open
      return stored === 'true'
    } catch {
      return true
    }
  })
  useEffect(() => {
    try { localStorage.setItem('sidebar_open', String(sidebarOpen)) } catch { /* ignore */ }
  }, [sidebarOpen])

  // Desktop-only side effect on tab change: collapse the sidebar on narrow
  // viewports so the content isn't hidden behind it.
  const handleTabChange = (tab) => {
    onTabChange(tab)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  // Deep links from Home. These route through the local handleTabChange (not
  // the context's) so they collapse the sidebar exactly as before.
  const handleOpenBriefCard = (cardId) => {
    setBriefOpenCardId(cardId)
    handleTabChange('chat')
  }

  const openCurrentCourses = () => {
    setCoursesDeepLink({ subTab: 'my_courses', savedTab: 'current' })
    handleTabChange('courses')
  }

  const tourKey = `symbolos_tour_done_${user?.id}`
  // Only auto-show the walkthrough for genuinely new accounts (≤3 days old and
  // not yet completed) or returning users who've been away ≥30 days — never on
  // every login.
  const [showTutorial, setShowTutorial] = useState(() => {
    if (!user?.id) return false
    const DAY = 86400000, now = Date.now()
    const firstSeenKey = `symbolos_first_seen_${user.id}`
    if (!localStorage.getItem(firstSeenKey)) localStorage.setItem(firstSeenKey, String(now))
    const created = profile?.created_at ? new Date(profile.created_at).getTime() : NaN
    const createdMs = Number.isNaN(created) ? Number(localStorage.getItem(firstSeenKey)) : created
    const lastSeen = Number(localStorage.getItem(`symbolos_last_seen_${user.id}`)) || 0
    const done = !!localStorage.getItem(`symbolos_tour_done_${user.id}`)
    const accountAgeDays = (now - createdMs) / DAY
    const daysSinceSeen = lastSeen ? (now - lastSeen) / DAY : 0
    return (accountAgeDays <= 3 && !done) || (lastSeen > 0 && daysSinceSeen >= 30)
  })
  // Record this visit so we can detect a ≥30-day gap next time.
  useEffect(() => {
    if (user?.id) localStorage.setItem(`symbolos_last_seen_${user.id}`, String(Date.now()))
  }, [user?.id])
  // Keep sidebar expanded so data-tour targets are in the DOM during the walkthrough
  useEffect(() => {
    if (showTutorial) setSidebarOpen(true)
  }, [showTutorial])

  // Listen for `restart-tour` (fired by the "Replay tour" button in Settings)
  // — clear the completion flag and start the walkthrough over from Home.
  useEffect(() => {
    const handler = () => {
      try { localStorage.removeItem(tourKey) } catch { /* ignore */ }
      setActiveTab('home')
      setShowTutorial(true)
    }
    window.addEventListener('restart-tour', handler)
    return () => window.removeEventListener('restart-tour', handler)
  }, [tourKey, setActiveTab])
  }, [tourKey])
  const [profileImage, setProfileImage] = useState(profile?.profile_image || null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  // ── Right sidebar / pinned chat ─────────────────────────
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [pinnedCard, setPinnedCard] = useState(null)
  const [pinnedThread, setPinnedThread] = useState([])
  const [pinnedIsThinking, setPinnedIsThinking] = useState(false)

  // ── Sync right sidebar width as CSS var ──────────────────
  // On phones the right sidebar overlays the content as a drawer
  // (see RightSidebar.css mobile rules), so it doesn't push layout
  // and --rsb-width should stay 0 — otherwise the FeedbackModal
  // trigger button hides off-screen.
  useEffect(() => {
    const apply = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches
      const visible = rightSidebarOpen && activeTab !== 'chat' && !isMobile
      document.body.style.setProperty('--rsb-width', visible ? '320px' : '0px')
    }
    apply()
    window.addEventListener('resize', apply)
    return () => {
      window.removeEventListener('resize', apply)
      document.body.style.setProperty('--rsb-width', '0px')
    }
  }, [rightSidebarOpen, activeTab])

  // ── Pinned card handler ───────────────────────────────────
  const handlePinToggle = (card, thread) => {
    if (!card) {
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
  // Each loader updates state AND writes to the userDataCache so subsequent
  // visits paint from cache before the network call returns.
  const loadFavorites = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await favoritesAPI.getFavorites(user.id)
      const list = data.favorites || []
      setFavorites(list)
      // FIX: normalize stored course_code to "SUBJ CAT" format for consistent lookup
      setFavoritesMap(new Set(list.map(f => {
        const code = f.course_code || ''
        // If stored without space (e.g. "COMP202"), insert it
        return code.replace(/^([A-Za-z]+)(\d)/, '$1 $2')
      })))
      writeCache('favorites', user.id, list)
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }, [user?.id])

  const loadCompletedCourses = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await completedCoursesAPI.getCompleted(user.id)
      const list = data.completed_courses || []
      setCompletedCourses(list)
      setCompletedCoursesMap(new Set(list.map(c => c.course_code)))
      writeCache('completed', user.id, list)
    } catch (error) {
      console.error('Error loading completed courses:', error)
      setCompletedCourses([])
      setCompletedCoursesMap(new Set())
    }
  }, [user?.id])

  const loadCurrentCourses = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await currentCoursesAPI.getCurrent(user.id)
      const list = data.current_courses || []
      setCurrentCourses(list)
      setCurrentCoursesMap(new Set(list.map(c => c.course_code)))
      writeCache('current', user.id, list)
    } catch (error) {
      console.error('Error loading current courses:', error)
      setCurrentCourses([])
      setCurrentCoursesMap(new Set())
    }
  }, [user?.id])

  // ── Tab change ─────────────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchResults([])
    setSearchError(null)
    setSearchCorrection(null)
    setHasSearched(false)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  // ── Course search ──────────────────────────────────────
  const handleCourseSearch = async (e, overrideQuery) => {
    if (e?.preventDefault) e.preventDefault()
    const rawQuery = overrideQuery || searchQuery
    if (!rawQuery.trim() || isSearching) return
    setIsSearching(true)
    setSearchError(null)
    setSearchCorrection(null)
    setHasSearched(true)
    try {
      const normalized = normalizeQuery(rawQuery)

      // If normalized looks like "COMP 202", split into subject + catalog params
      // so the RPC receives them separately instead of as a full-text query
      const codeMatch = normalized.match(/^([A-Z]{2,6})\s+(\d{3}[A-Z]?)$/)
      let searchSubject = null
      let searchQuery   = normalized
      if (codeMatch) {
        searchSubject = codeMatch[1]
        searchQuery   = codeMatch[2]
      }

      const data = await coursesAPI.search(searchQuery, searchSubject, 50, searchTerm || null)
      let courses = data.courses || data || []
      if (!Array.isArray(courses)) courses = []

      // Zero results — try fuzzy correction
      if (courses.length === 0) {
        const candidates = buildCorrectionCandidates(rawQuery)
        for (const candidate of candidates) {
          const corrCode = candidate.query.match(/^([A-Z]{2,6})\s+(\d{3}[A-Z]?)$/)
          const retrySub = corrCode ? corrCode[1] : null
          const retryQ   = corrCode ? corrCode[2] : candidate.query
          const retry = await coursesAPI.search(retryQ, retrySub, 50, searchTerm || null)
          const retryList = retry.courses || retry || []
          if (Array.isArray(retryList) && retryList.length > 0) {
            setSearchCorrection({ original: rawQuery, corrected: candidate.note })
            setSearchResults(retryList)
            return
          }
        }
      }

      setSearchResults(courses)
      if (courses.length === 0) setSearchError(null) // CoursesTab shows its own empty state
    } catch (error) {
      console.error('Error searching courses:', error)
      setSearchError('Failed to search courses. Please try again.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Load the list of semesters we have section data for (for the filter).
  useEffect(() => {
    coursesAPI.getTerms().then(d => setAvailableTerms(d?.terms || [])).catch(() => {})
  }, [])

  // Re-run the current search whenever the semester filter changes.
  useEffect(() => {
    if (hasSearched && searchQuery.trim()) handleCourseSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  // ── Toggle favorite ────────────────────────────────────
  const handleToggleFavorite = async (course) => {
    if (!user?.id) return
    // FIX: use space-separated key to match isFavorited and favoritesMap
    const courseCode = `${course.subject} ${course.catalog}`
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
        setCourseToComplete(course)
        setShowCompleteCourseModal(true)
      }
    } catch (error) {
      console.error('Error toggling completed course:', error)
      alert(error.message || 'Failed to update completed courses')
    }
  }

  const handleConfirmComplete = async (courseData) => {
    if (!user?.id) return
    try {
      await completedCoursesAPI.addCompleted(user.id, courseData)
      setCompletedCourses(prev => [courseData, ...prev])
      setCompletedCoursesMap(prev => new Set([...prev, courseData.course_code]))

      // Auto-remove from current if enrolled
      if (currentCoursesMap.has(courseData.course_code)) {
        try {
          await currentCoursesAPI.removeCurrent(user.id, courseData.course_code)
          setCurrentCourses(prev => prev.filter(c => c.course_code !== courseData.course_code))
          setCurrentCoursesMap(prev => { const s = new Set(prev); s.delete(courseData.course_code); return s })
        } catch (e) {
          console.warn('Could not auto-remove from current:', e)
        }
      }
    } catch (error) {
      console.error('Error adding completed course:', error)
      alert(error.message || 'Failed to add completed course')
    } finally {
      setShowCompleteCourseModal(false)
      setCourseToComplete(null)
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

        // Auto-remove from completed if previously marked done
        if (completedCoursesMap.has(courseCode)) {
          try {
            await completedCoursesAPI.removeCompleted(user.id, courseCode)
            setCompletedCourses(prev => prev.filter(c => c.course_code !== courseCode))
            setCompletedCoursesMap(prev => { const s = new Set(prev); s.delete(courseCode); return s })
          } catch (e) {
            console.warn('Could not auto-remove from completed:', e)
          }
        }
      }
    } catch (error) {
      console.error('Error toggling current course:', error)
      alert(error.message || 'Failed to update current courses')
    }
  }

  // ── Sign out ───────────────────────────────────────────
  const handleSignOut = async () => {
    try {
      // Clear cached user data so the next user doesn't see this user's info
      if (user?.id) clearAllForUser(user.id)
      await signOut()
    }
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
      // Upload to Storage first — profile_image only accepts an https://
      // URL in our own bucket, never a raw base64 data: URI.
      const { profile_image } = await usersAPI.uploadProfileImage(user.id, file)
      const { error } = await updateProfile({ profile_image })
      if (error) throw error
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Transcript import complete ─────────────────────────
  const handleTranscriptImportComplete = () => {
    setShowTranscriptUpload(false)
    loadCompletedCourses()
    loadCurrentCourses()
    refreshProfile()
    refreshAdvisorCards(true, null, true) // skip rate limit after transcript import
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
    <>
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
        badges={{ calendar: upcomingUrgentCount > 0 ? upcomingUrgentCount : null }}
        onOpenFeedback={() => setFeedbackOpen(true)}
      />

      <main className="main-content">
        <button
          className="mobile-menu-btn-overlay"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >☰</button>

        <div className="content-area">

          {activeTab === 'home' && (
            <HomeTab
              user={user}
              profile={profile}
              advisorCards={advisorCards}
              cardsLoading={cardsLoading}
              cardsGenerating={cardsGenerating}
              currentCourses={currentCourses}
              completedCourses={completedCourses}
              events={upcomingEvents}
              eventsLoading={upcomingEventsLoading}
              hasCourseEvents={hasUpcomingCourseEvents}
              onTabChange={handleTabChange}
              onViewCurrentCourses={openCurrentCourses}
              onOpenBriefCard={handleOpenBriefCard}
              onImportTranscript={openTranscriptUpload}
              onImportSyllabus={openSyllabusUpload}
            />
          )}

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
              onDeleteCard={handleDeleteCard}
              freeformInput={freeformInput}
              setFreeformInput={setFreeformInput}
              onFreeformSubmit={handleFreeformSubmit}
              openCardId={briefOpenCardId}
              onOpenedCard={() => setBriefOpenCardId(null)}
            />
          )}

          {activeTab === 'clubs' && (
            <Suspense fallback={<TabLoader />}>
              <ClubsTab
                key="clubs-tab-v2"
                user={user}
                profile={profile}
                authFlags={authFlags}
                onClubEventsChange={setClubCalendarEvents}
              />
            </Suspense>
          )}

          {activeTab === 'courses' && (
            <CoursesView
              defaultSubTab={coursesDeepLink?.subTab ?? 'course_search'}
              defaultSavedTab={coursesDeepLink?.savedTab ?? 'saved'}
              favorites={favorites}
              completedCourses={completedCourses}
              completedCoursesMap={completedCoursesMap}
              currentCourses={currentCourses}
              currentCoursesMap={currentCoursesMap}
              favoritesMap={favoritesMap}
              onToggleFavorite={handleToggleFavorite}
              onToggleCompleted={handleToggleCompleted}
              onToggleCurrent={handleToggleCurrent}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              isSearching={isSearching}
              searchError={searchError}
              searchCorrection={searchCorrection}
              hasSearched={hasSearched}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortCourses={sortCourses}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              availableTerms={availableTerms}
              isFavorited={isFavorited}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              handleCourseSearch={handleCourseSearch}
              handleToggleFavorite={handleToggleFavorite}
              handleToggleCompleted={handleToggleCompleted}
              handleToggleCurrent={handleToggleCurrent}
              gpaToLetterGrade={gpaToLetterGrade}
            />
          )}

          {activeTab === 'favorites' && (
            <Suspense fallback={<TabLoader />}>
              <DegreePlanningView
                favorites={favorites}
                completedCourses={completedCourses}
                completedCoursesMap={completedCoursesMap}
                currentCourses={currentCourses}
                currentCoursesMap={currentCoursesMap}
                favoritesMap={favoritesMap}
                profile={profile}
                authFlags={authFlags}
                onToggleFavorite={handleToggleFavorite}
                onToggleCompleted={handleToggleCompleted}
                onToggleCurrent={handleToggleCurrent}
                onImportTranscript={openTranscriptUpload}
                onImportSyllabus={openSyllabusUpload}
                onCourseClick={undefined}
              />
            </Suspense>
          )}

          {activeTab === 'forum' && (
            <Suspense fallback={<TabLoader />}>
              <Forum />
            </Suspense>
          )}

          {activeTab === 'calendar' && (
            <Suspense fallback={<TabLoader />}>
              <CalendarTab user={user} authFlags={authFlags} clubEvents={clubCalendarEvents} managedClubs={managedClubs} />
            </Suspense>
          )}

          {activeTab === 'profile' && (
            <Suspense fallback={<TabLoader />}>
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
                onImportTranscript={openTranscriptUpload}
              />
            </Suspense>
          )}
        </div>
      </main>

      {showCompleteCourseModal && courseToComplete && (
        <Suspense fallback={null}>
          <MarkCompleteModal
            course={courseToComplete}
            onConfirm={handleConfirmComplete}
            onCancel={cancelCompleteCourse}
          />
        </Suspense>
      )}

      {showTranscriptUpload && (
        <Suspense fallback={null}>
          <TranscriptUpload
            userId={user?.id}
            defaultTab={transcriptUploadTab}
            onClose={() => setShowTranscriptUpload(false)}
            onImportComplete={handleTranscriptImportComplete}
          />
        </Suspense>
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

      <Suspense fallback={null}>
        <FeedbackModal userId={user?.id} userEmail={user?.email} open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      </Suspense>

      {showTutorial && (
        <Suspense fallback={null}>
          <OnboardingTutorial
            onTabChange={setActiveTab}
            onComplete={() => {
              localStorage.setItem(tourKey, '1')
              setShowTutorial(false)
            }}
          />
        </Suspense>
      )}
    </div>

    <CourseDetailModal
      isFavorited={isFavorited}
      isCompleted={isCompleted}
      isCurrent={isCurrent}
      onToggleFavorite={handleToggleFavorite}
      onToggleCompleted={handleToggleCompleted}
      onToggleCurrent={handleToggleCurrent}
    />
    </>
  )
}

/**
 * Composition root. Providers wrap the view so that a future <MobileLayout>
 * can be selected here, consuming the exact same data layer.
 */
export default function Dashboard() {
  return (
    <DashboardDataProvider>
      <CourseDetailProvider>
        <DesktopDashboard />
      </CourseDetailProvider>
    </DashboardDataProvider>
  )
}
