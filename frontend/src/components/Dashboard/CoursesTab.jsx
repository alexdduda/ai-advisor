import { FaHeart, FaRegHeart, FaCheckCircle } from 'react-icons/fa'
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
  return (
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

      {searchError && <div className="error-banner">{searchError}</div>}

      {/* Search Results List */}
      {searchResults.length > 0 && !selectedCourse && (
        <div className="search-results">
          <div className="results-header-bar">
            <h3 className="results-header">
              Found {searchResults.length} course{searchResults.length !== 1 ? 's' : ''}
            </h3>
            <div className="sort-controls">
              <label htmlFor="sort-select" className="sort-label">Sort by:</label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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

                  {/* REMOVED: Section count display */}
                </div>

                <div className="course-card-actions">
                  <button
                    className={`favorite-btn ${isFavorited(course.subject, course.catalog) ? 'favorited' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(course) }}
                    title={isFavorited(course.subject, course.catalog) ? 'Remove from favorites' : 'Add to favorites'}
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
                    title={isCompleted(course.subject, course.catalog) ? 'Mark as not completed' : 'Mark as completed'}
                  >
                    <FaCheckCircle className="completed-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-back" onClick={() => { setSearchResults([]); setSearchQuery('') }}>
            ← New Search
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoadingCourse && (
        <div className="loading-container">
          <div className="loading-spinner">Loading course details...</div>
        </div>
      )}

      {/* Course Detail */}
      {selectedCourse && !isLoadingCourse && (
        <div className="course-details">
          <button className="btn-back" onClick={() => setSelectedCourse(null)}>
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

            {/* Professor Rating - Only at top */}
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

          {/* Condensed Sections - No RMP ratings */}
          {selectedCourse.sections && selectedCourse.sections.length > 0 && (
            <div className="course-sections">
              <h3 className="sections-header">Sections ({selectedCourse.sections.length})</h3>
              <div className="sections-grid">
                {selectedCourse.sections.map((section, idx) => (
                  <div key={idx} className="section-card-compact">
                    <div className="section-compact-header">
                      <span className="section-term">{section.term || 'N/A'}</span>
                      {section.average && (
                        <span className="section-average">
                          {section.average} ({gpaToLetterGrade(section.average)})
                        </span>
                      )}
                    </div>
                    {section.instructor && section.instructor !== 'TBA' && (
                      <div className="section-instructor-compact">
                        {section.instructor}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {searchResults.length === 0 && !selectedCourse && !searchError && !isSearching && (
        <div className="placeholder-content">
          <div className="placeholder-icon">📚</div>
          <h3>Course Explorer with Professor Ratings</h3>
          <p>Search through McGill courses with historical grade data and live RateMyProfessor ratings.</p>
        </div>
      )}
    </div>
  )
}