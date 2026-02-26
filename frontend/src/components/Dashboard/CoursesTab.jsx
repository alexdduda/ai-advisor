import { useState } from 'react'
import { FaHeart, FaRegHeart, FaCheckCircle, FaStar, FaBook, FaUser, FaChartBar, FaFlag, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { GrPowerCycle } from 'react-icons/gr'
import { MdOutlineRateReview } from 'react-icons/md'
import { useLanguage } from '../../contexts/LanguageContext'
import './CoursesTab.css'
import ProfSuggestionPopover from '../ProfSuggestion/ProfSuggestionPopover'

const PAGE_SIZE = 10

export default function CoursesTab({
  // Search
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  isSearching,
  searchError,
  handleCourseSearch,
  // Detail
  selectedCourse,
  setSelectedCourse,
  handleCourseClick,
  // Sort
  sortBy,
  setSortBy,
  sortCourses,
  // Favorites / Completed / Current
  isFavorited,
  isCompleted,
  isCurrent,
  handleToggleFavorite,
  handleToggleCompleted,
  handleToggleCurrent,
  // Utility
  gpaToLetterGrade,
}) {
  const { t } = useLanguage()

  const [openFlagCard, setOpenFlagCard] = useState(null)
  const [openFlagDetail, setOpenFlagDetail] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const toggleFlagCard = (e, key) => {
    e.stopPropagation()
    setOpenFlagCard(prev => prev === key ? null : key)
  }

  // Reset to page 1 whenever sort changes
  const handleSortChange = (val) => {
    setSortBy(val)
    setCurrentPage(1)
  }

  // Wrap the parent search handler to also reset page
  const handleSearch = (e) => {
    setCurrentPage(1)
    handleCourseSearch(e)
  }

  // Paginate the sorted results
  const sortedResults = sortCourses(searchResults, sortBy)
  const totalPages    = Math.ceil(sortedResults.length / PAGE_SIZE)
  const pageStart     = (currentPage - 1) * PAGE_SIZE
  const pageEnd       = pageStart + PAGE_SIZE
  const pageResults   = sortedResults.slice(pageStart, pageEnd)

  const goToPage = (page) => {
    setCurrentPage(page)
    // Scroll the results back to top smoothly
    document.querySelector('.search-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="courses-container">
      <form className="search-section" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder={t('courses.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-search"
          disabled={isSearching || !searchQuery.trim()}
        >
          {t('courses.search')}
        </button>
      </form>

      {searchError && <div className="error-banner">{searchError}</div>}

      {/* Search Results List */}
      {searchResults.length > 0 && !selectedCourse && (
        <div className="search-results">
          <div className="results-header-bar">
            <h3 className="results-header">
              {searchResults.length === 1
                ? t('courses.foundResults').replace('{count}', searchResults.length)
                : t('courses.foundResultsPlural').replace('{count}', searchResults.length)
              }
              {totalPages > 1 && (
                <span className="results-page-info">
                  — page {currentPage} of {totalPages}
                </span>
              )}
            </h3>
            <div className="sort-controls">
              <label htmlFor="sort-select" className="sort-label">{t('courses.sortBy')}</label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="relevance">{t('courses.relevance')}</option>
                <option value="rating-high">{t('courses.sortRatingHigh')}</option>
                <option value="rating-low">{t('courses.sortRatingLow')}</option>
                <option value="name-az">{t('courses.sortNameAZ')}</option>
                <option value="name-za">{t('courses.sortNameZA')}</option>
                <option value="instructor-az">{t('courses.sortInstructorAZ')}</option>
                <option value="instructor-za">{t('courses.sortInstructorZA')}</option>
              </select>
            </div>
          </div>

          <div className="course-list">
            {pageResults.map((course) => {
              const cardKey   = `${course.subject}-${course.catalog}`
              const isFlagOpen = openFlagCard === cardKey

              return (
                <div key={cardKey} className="course-card">
                  <div className="course-card-content" onClick={() => handleCourseClick(course)}>
                    <div className="course-header">
                      <div className="course-code">{course.subject} {course.catalog}</div>
                      {course.average && (
                        <div className="course-average">
                          {course.average.toFixed(1)} GPA ({gpaToLetterGrade(course.average)})
                        </div>
                      )}
                    </div>
                    <h4 className="course-title">{course.title}</h4>

                    {course.instructor && (
                      <div className="course-instructor-section">
                        <div className="instructor-name"><FaUser /> {course.instructor}</div>
                        {course.rmp_rating && (
                          <div className="rmp-compact">
                            <div className="rmp-stat">
                              <span className="rmp-label"><FaStar /> {t('courses.rating')}:</span>
                              <span className="rmp-value">{course.rmp_rating.toFixed(1)}/5.0</span>
                            </div>
                            <div className="rmp-stat">
                              <span className="rmp-label"><FaChartBar /> {t('courses.difficulty')}:</span>
                              <span className="rmp-value">{course.rmp_difficulty?.toFixed(1) || t('common.na')}/5.0</span>
                            </div>
                            {course.rmp_num_ratings && (
                              <div className="rmp-stat">
                                <span className="rmp-label"><MdOutlineRateReview /> {t('courses.reviews')}:</span>
                                <span className="rmp-value">{Math.round(course.rmp_num_ratings)}</span>
                              </div>
                            )}
                            {course.rmp_would_take_again && (
                              <div className="rmp-stat">
                                <span className="rmp-label"><GrPowerCycle /> {t('courses.wouldRetake')}:</span>
                                <span className="rmp-value">{Math.round(course.rmp_would_take_again)}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {course.num_sections && (
                      <div className="course-meta">
                        <FaChartBar className="meta-icon" /> {course.num_sections === 1
                          ? t('courses.sectionsAvailable').replace('{count}', course.num_sections)
                          : t('courses.sectionsAvailablePlural').replace('{count}', course.num_sections)
                        }
                      </div>
                    )}
                  </div>

                  {/* Flag button */}
                  {course.instructor && (
                    <div className="prof-flag-wrapper">
                      <button
                        className={`prof-flag-btn ${isFlagOpen ? 'active' : ''}`}
                        onClick={(e) => toggleFlagCard(e, cardKey)}
                        data-tooltip="Wrong Professor? Flag it"
                      >
                        <FaFlag />
                      </button>
                      {isFlagOpen && (
                        <ProfSuggestionPopover
                          courseCode={`${course.subject} ${course.catalog}`}
                          currentInstructor={course.instructor}
                          onClose={() => setOpenFlagCard(null)}
                        />
                      )}
                    </div>
                  )}

                  <div className="course-card-actions">
                    <button
                      className={`favorite-btn ${isFavorited(course.subject, course.catalog) ? 'favorited' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(course) }}
                      data-tooltip={isFavorited(course.subject, course.catalog) ? "Remove saved" : "Save course"}
                    >
                      {isFavorited(course.subject, course.catalog)
                        ? <FaHeart className="favorite-icon" />
                        : <FaRegHeart className="favorite-icon" />}
                    </button>
                    <button
                      className={`completed-btn ${isCompleted(course.subject, course.catalog) ? 'completed' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleToggleCompleted(course) }}
                      data-tooltip={isCompleted(course.subject, course.catalog) ? "Mark incomplete" : "Mark complete"}
                    >
                      <FaCheckCircle className="completed-icon" />
                    </button>
                    <button
                      className={`current-btn ${isCurrent(course.subject, course.catalog) ? 'current' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleToggleCurrent(course) }}
                      data-tooltip={isCurrent(course.subject, course.catalog) ? "Remove from current" : "Add to current"}
                    >
                      <FaCheckCircle className="current-icon" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <FaChevronLeft />
              </button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Always show first, last, current, and neighbours; collapse the rest
                  const isNearCurrent = Math.abs(page - currentPage) <= 1
                  const isEdge        = page === 1 || page === totalPages

                  if (!isNearCurrent && !isEdge) {
                    // Show a single ellipsis between each gap
                    if (page === 2 || page === totalPages - 1) {
                      return <span key={page} className="pagination-ellipsis">…</span>
                    }
                    return null
                  }

                  return (
                    <button
                      key={page}
                      className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                className="pagination-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Course Detail */}
      {selectedCourse && (
        <div className="course-details">
          <button className="btn-back" onClick={() => { setSelectedCourse(null); setOpenFlagDetail(false) }}>
            ← {t('courses.backToResults')}
          </button>

          <div className="course-details-header">
            <h2 className="course-details-title">
              {selectedCourse.subject} {selectedCourse.catalog}: {selectedCourse.title}
            </h2>
            {(selectedCourse.last_year_average || selectedCourse.average_grade) && (
              <div className="course-stat-badge">
                {(selectedCourse.last_year_average || selectedCourse.average_grade)} GPA ({gpaToLetterGrade(selectedCourse.last_year_average || selectedCourse.average_grade)})
              </div>
            )}

            {selectedCourse.professor_rating && (
              <div className="course-professor-rating">
                <h3><FaChartBar /> {t('courses.professorRating')}: {selectedCourse.professor_rating.instructor}</h3>
                <div className="rmp-stats-grid">
                  <div className="rmp-stat-card">
                    <div className="rmp-stat-value">{selectedCourse.professor_rating.rmp_rating?.toFixed(1) || t('common.na')}</div>
                    <div className="rmp-stat-label">{t('courses.rating')}</div>
                  </div>
                  <div className="rmp-stat-card">
                    <div className="rmp-stat-value">{selectedCourse.professor_rating.rmp_difficulty?.toFixed(1) || t('common.na')}</div>
                    <div className="rmp-stat-label">{t('courses.difficulty')}</div>
                  </div>
                  <div className="rmp-stat-card">
                    <div className="rmp-stat-value">{selectedCourse.professor_rating.rmp_num_ratings ? Math.round(selectedCourse.professor_rating.rmp_num_ratings) : t('common.na')}</div>
                    <div className="rmp-stat-label">{t('courses.reviews')}</div>
                  </div>
                  <div className="rmp-stat-card">
                    <div className="rmp-stat-value">{selectedCourse.professor_rating.rmp_would_take_again ? Math.round(selectedCourse.professor_rating.rmp_would_take_again) + '%' : t('common.na')}</div>
                    <div className="rmp-stat-label">{t('courses.wouldRetake')}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedCourse.sections && selectedCourse.sections.length > 0 && (
            <div className="course-sections">
              <h3 className="sections-header">{t('courses.sections')} ({selectedCourse.sections.length})</h3>
              <div className="sections-grid">
                {selectedCourse.sections.map((section, idx) => (
                  <div key={idx} className="section-card-compact">
                    <div className="section-compact-header">
                      <span className="section-term">{section.term || t('common.na')}</span>
                      {section.average && (
                        <span className="section-average">
                          {parseFloat(section.average).toFixed(1)} ({gpaToLetterGrade(section.average)})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Placeholder */}
      {!searchResults.length && !selectedCourse && !searchError && !isSearching && (
        <div className="placeholder-content">
          <div className="placeholder-icon"><FaBook /></div>
          <h3>{t('courses.explorerTitle')}</h3>
          <p>{t('courses.explorerDesc')}</p>
        </div>
      )}
    </div>
  )
}
