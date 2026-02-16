import { FaHeart, FaRegHeart, FaCheckCircle } from 'react-icons/fa'
import { useLanguage } from '../../contexts/LanguageContext'
import './CoursesTab.css'

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
  isLoadingCourse,
  handleCourseClick,
  // Sort
  sortBy,
  setSortBy,
  sortCourses,
  // Favorites / Completed
  isFavorited,
  isCompleted,
  handleToggleFavorite,
  handleToggleCompleted,
  // Utility
  gpaToLetterGrade,
}) {
  const { t } = useLanguage()
  
  return (
    <div className="courses-container">
      <form className="search-section" onSubmit={handleCourseSearch}>
        <input
          type="text"
          className="search-input"
          placeholder={t('courses.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isSearching}
        />
        <button
          type="submit"
          className="btn btn-search"
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? t('courses.searching') : t('courses.search')}
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
            </h3>
            <div className="sort-controls">
              <label htmlFor="sort-select" className="sort-label">{t('courses.sortBy')}</label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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
            {sortCourses(searchResults, sortBy).map((course) => (
              <div key={`${course.subject}-${course.catalog}`} className="course-card">
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
                      <div className="instructor-name">👤 {course.instructor}</div>
                      {course.rmp_rating && (
                        <div className="rmp-compact">
                          <div className="rmp-stat">
                            <span className="rmp-label">⭐ {t('courses.rating')}:</span>
                            <span className="rmp-value">{course.rmp_rating.toFixed(1)}/5.0</span>
                          </div>
                          <div className="rmp-stat">
                            <span className="rmp-label">📊 {t('courses.difficulty')}:</span>
                            <span className="rmp-value">{course.rmp_difficulty?.toFixed(1) || t('common.na')}/5.0</span>
                          </div>
                          {course.rmp_num_ratings && (
                            <div className="rmp-stat">
                              <span className="rmp-label">📝 {t('courses.reviews')}:</span>
                              <span className="rmp-value">{Math.round(course.rmp_num_ratings)}</span>
                            </div>
                          )}
                          {course.rmp_would_take_again && (
                            <div className="rmp-stat">
                              <span className="rmp-label">🔄 {t('courses.wouldRetake')}:</span>
                              <span className="rmp-value">{Math.round(course.rmp_would_take_again)}%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {course.num_sections && (
                    <div className="course-meta">
                      📊 {course.num_sections === 1 
                        ? t('courses.sectionsAvailable').replace('{count}', course.num_sections)
                        : t('courses.sectionsAvailablePlural').replace('{count}', course.num_sections)
                      }
                    </div>
                  )}
                </div>

                <div className="course-card-actions">
                  <button
                    className={`favorite-btn ${isFavorited(course.subject, course.catalog) ? 'favorited' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(course) }}
                    title={isFavorited(course.subject, course.catalog) ? t('courses.removeFromSaved') : t('courses.addToSaved')}
                  >
                    {isFavorited(course.subject, course.catalog) ? (
                      <FaHeart className="favorite-icon" />
                    ) : (
                      <FaRegHeart className="favorite-icon" />
                    )}
                  </button>
                  <button
                    className={`completed-btn ${isCompleted(course.subject, course.catalog) ? 'completed' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleToggleCompleted(course) }}
                    title={isCompleted(course.subject, course.catalog) ? t('courses.markNotCompleted') : t('courses.markCompleted')}
                  >
                    <FaCheckCircle className="completed-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-back" onClick={() => { setSearchResults([]); setSearchQuery('') }}>
            ← {t('courses.newSearch')}
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoadingCourse && (
        <div className="loading-container">
          <div className="loading-spinner">{t('courses.loadingDetails')}</div>
        </div>
      )}

      {/* Course Detail */}
      {selectedCourse && !isLoadingCourse && (
        <div className="course-details">
          <button className="btn-back" onClick={() => setSelectedCourse(null)}>
            ← {t('courses.backToResults')}
          </button>

          <div className="course-details-header">
            <h2 className="course-details-title">
              {selectedCourse.subject} {selectedCourse.catalog}: {selectedCourse.title}
            </h2>
            {selectedCourse.average_grade && (
              <div className="course-stat-badge">
                {t('courses.average')}: {selectedCourse.average_grade} GPA ({gpaToLetterGrade(selectedCourse.average_grade)})
              </div>
            )}

            {selectedCourse.professor_rating && (
              <div className="course-professor-rating">
                <h3>📊 {t('courses.professorRating')}: {selectedCourse.professor_rating.instructor}</h3>
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
              {selectedCourse.sections.map((section, idx) => (
                <div key={idx} className="section-card">
                  <div className="section-info">
                    <div className="section-header">
                      <span className="section-term">{section.term || t('common.na')}</span>
                      {section.average && (
                        <span className="section-average">
                          {t('courses.average')}: {section.average} GPA ({gpaToLetterGrade(section.average)})
                        </span>
                      )}
                    </div>
                    {section.instructor && section.instructor !== 'TBA' && (
                      <div className="section-instructor">
                        <strong>{t('courses.instructor')}:</strong> {section.instructor}
                      </div>
                    )}
                    {section.rmp_rating && (
                      <div className="section-rmp">
                        <div className="rmp-inline">
                          <span className="rmp-badge">⭐ {section.rmp_rating.toFixed(1)}</span>
                          <span className="rmp-badge">📊 {t('courses.difficulty')}: {section.rmp_difficulty?.toFixed(1) || t('common.na')}</span>
                          {section.rmp_num_ratings && (
                            <span className="rmp-badge">📝 {Math.round(section.rmp_num_ratings)} {t('courses.reviews').toLowerCase()}</span>
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

      {/* Empty state */}
      {searchResults.length === 0 && !selectedCourse && !searchError && !isSearching && (
        <div className="placeholder-content">
          <div className="placeholder-icon">📚</div>
          <h3>{t('courses.explorerTitle')}</h3>
          <p>{t('courses.explorerDesc')}</p>
        </div>
      )}
    </div>
  )
}
