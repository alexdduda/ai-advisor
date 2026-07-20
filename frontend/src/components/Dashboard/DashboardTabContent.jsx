import { lazy, Suspense } from 'react'
import { useDashboardData } from '../../contexts/DashboardDataContext'
import AdvisorCards from './chat/AdvisorCards'
import HomeTab from './HomeTab'
import CoursesView from './CoursesView'

// Code-split everything that isn't on the default landing screen. Home is
// the default tab and ships in the main bundle (Brief/Chat stays static too
// since Home links straight into it); secondary tabs and modals only
// download when the user navigates to them.
const ClubsTab           = lazy(() => import('./ClubsTab'))
const ProfileTab         = lazy(() => import('./ProfileTab'))
const DegreePlanningView = lazy(() => import('./DegreePlanningView'))
const Forum              = lazy(() => import('../Forum/Forum'))
const CalendarTab        = lazy(() => import('./CalendarTab'))

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
 * The eight dashboard screens, shared by both layout shells.
 *
 * Data comes from DashboardDataContext. Anything shell-specific is passed in:
 * the desktop shell collapses its sidebar on tab change and supports pinning a
 * card to its right sidebar; the mobile shell does neither.
 */
export default function DashboardTabContent({
  onTabChange,
  onOpenBriefCard,
  onViewCurrentCourses,
  onPinToggle,
  pinnedCardId = null,
}) {
  const {
    user, profile, authFlags, updateProfile,
    activeTab, coursesDeepLink, briefOpenCardId, setBriefOpenCardId,

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

    upcomingEvents, upcomingEventsLoading, hasUpcomingCourseEvents,

    clubCalendarEvents, setClubCalendarEvents, managedClubs,

    openTranscriptUpload, openSyllabusUpload,

    profileImage, isUploadingImage, fileInputRef, handleImageUpload, handleAvatarClick,

    gpaToLetterGrade, handleSignOut,
  } = useDashboardData()

  return (
    <>
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
          onTabChange={onTabChange}
          onViewCurrentCourses={onViewCurrentCourses}
          onOpenBriefCard={onOpenBriefCard}
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
          onPinToggle={onPinToggle}
          pinnedCardId={pinnedCardId}
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
          <CalendarTab
            user={user}
            authFlags={authFlags}
            clubEvents={clubCalendarEvents}
            managedClubs={managedClubs}
          />
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
    </>
  )
}
