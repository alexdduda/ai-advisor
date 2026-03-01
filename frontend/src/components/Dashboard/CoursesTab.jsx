import { useState, useEffect, useRef } from 'react'
import { FaHeart, FaRegHeart, FaCheckCircle, FaStar, FaBook, FaUser, FaChartBar, FaFlag, FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from 'react-icons/fa'
import { GrPowerCycle } from 'react-icons/gr'
import { MdOutlineRateReview } from 'react-icons/md'
import { useLanguage } from '../../contexts/LanguageContext'
import professorsAPI, { rmpRatingClass, rmpSearchUrl } from '../../lib/professorsAPI'
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

  // Live RMP lookup cache: courseKey → { avg_rating, avg_difficulty, num_ratings, would_take_again_percent, rmp_url } | null
  const [rmpCache, setRmpCache] = useState({})
  const lookingUp = useRef(new Set())

  // Whenever searchResults change, kick off RMP lookups for any course
  // that has a _syllabusProf but no stored rmp_rating.
  useEffect(() => {
    const toFetch = searchResults.filter(c =>
      c._syllabusProf && !c.rmp_rating
    )
    if (!toFetch.length) return

    toFetch.forEach(async (course) => {
      const key = `${course.subject}${course.catalog}`
      if (rmpCache[key] !== undefined || lookingUp.current.has(key)) return
      lookingUp.current.add(key)

      try {
        const result = await professorsAPI.getRmpByName(course._syllabusProf, course.subject)
        setRmpCache(prev => ({
          ...prev,
          [key]: result?.found ? result.professor : null,
        }))
      } catch {
        setRmpCache(prev => ({ ...prev, [key]: null }))
      } finally {
        lookingUp.current.delete(key)
      }
    })
  }, [searchResults])

  // RMP data for each instructor in the currently selected course
  const [courseInstructorRmp, setCourseInstructorRmp] = useState({})
  const [rmpLoading, setRmpLoading] = useState(false)

  // When a course detail is selected, fetch RMP per-instructor data
  useEffect(() => {
    if (!selectedCourse?.instructors?.length) {
      setCourseInstructorRmp({})
      return
    }
    const { subject, catalog } = selectedCourse
    if (!subject || !catalog) return
    setRmpLoading(true)

    professorsAPI.getRmpByCourse(subject, catalog)
      .then(async data => {
        const byName = {}
        ;(data.professors || []).forEach(p => {
          if (p.name) byName[p.name] = p
        })

        // If the detail panel has a syllabus-sourced prof who isn't in the
        // by-course results (she may teach a new section not yet in DB),
        // do a name-based RMP lookup specifically for her.
        const sylProf = selectedCourse._syllabusProf
        if (sylProf && !byName[sylProf]) {
          try {
            const r = await professorsAPI.getRmpByName(sylProf, subject)
            if (r?.found && r.professor) {
              byName[sylProf] = {
                name:                     sylProf,
                avg_rating:               r.professor.avg_rating,
                avg_difficulty:           r.professor.avg_difficulty,
                num_ratings:              r.professor.num_ratings,
                would_take_again_percent: r.professor.would_take_again_percent,
                rmp_url:                  r.professor.rmp_url,
              }
            }
          } catch { /* silently skip */ }
        }

        setCourseInstructorRmp(byName)
      })
      .catch(() => setCourseInstructorRmp({}))
      .finally(() => setRmpLoading(false))
  }, [selectedCourse?.subject, selectedCourse?.catalog, selectedCourse?._syllabusProf])

  const toggleFlagCard = (e, key) => {
    e.stopPropagation()
    setOpenFlagCard(prev => prev === key ? null : key)
  }

  const handleSortChange = (val) => {
    setSortBy(val)
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    setCurrentPage(1)
    handleCourseSearch(e)
  }

  const sortedResults = sortCourses(searchResults, sortBy)
  const totalPages    = Math.ceil(sortedResults.length / PAGE_SIZE)
  const pageStart     = (currentPage - 1) * PAGE_SIZE
  const pageEnd       = pageStart + PAGE_SIZE
  const pageResults   = sortedResults.slice(pageStart, pageEnd)

  const goToPage = (page) => {
    setCurrentPage(page)
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
              const cardKey    = `${course.subject}-${course.catalog}`
              const isFlagOpen = openFlagCard === cardKey

              return (
                <div key={cardKey} className="course-card">
                  <div className="course-card-content" onClick={() => handleCourseClick(course)}>
                    <div className="course-header">
                      <div className="course-code">{course.subject} {course.catalog}</div>
                      {course.average && (
                        <div
                          className="course-average"
                          title={course.average_year ? `${course.average_year} class average` : 'Historical class average'}
                        >
                          {course.average.toFixed(1)} GPA ({gpaToLetterGrade(course.average)})
                        </div>
                      )}
                    </div>
                    <h4 className="course-title">{course.title}</h4>

                    {course.instructor && (
                      <div className="course-instructor-section">
                        <div className="instructor-name">
                          <FaUser /> {course.instructor}
                          {course._syllabusProf && (
                            <span className="instructor-badge-syllabus" title="Professor from your uploaded syllabus">
                              📄 Your prof
                            </span>
                          )}
                        </div>
                        {(() => {
                          // Prefer stored rmp_rating; fall back to live-fetched from _syllabusProf
                          const courseKey = `${course.subject}${course.catalog}`
                          const liveRmp = rmpCache[courseKey]
                          const rating    = course.rmp_rating    ?? liveRmp?.avg_rating
                          const diff      = course.rmp_difficulty ?? liveRmp?.avg_difficulty
                          const numR      = course.rmp_num_ratings ?? liveRmp?.num_ratings
                          const wta       = course.rmp_would_take_again ?? liveRmp?.would_take_again_percent
                          const rmpUrl    = liveRmp?.rmp_url

                          if (rating) {
                            return (
                              <div className="rmp-compact">
                                <div className="rmp-stat">
                                  <span className="rmp-label"><FaStar /> {t('courses.rating')}:</span>
                                  <span className="rmp-value">{parseFloat(rating).toFixed(1)}/5.0</span>
                                </div>
                                <div className="rmp-stat">
                                  <span className="rmp-label"><FaChartBar /> {t('courses.difficulty')}:</span>
                                  <span className="rmp-value">{diff ? parseFloat(diff).toFixed(1) : t('common.na')}/5.0</span>
                                </div>
                                {numR > 0 && (
                                  <div className="rmp-stat">
                                    <span className="rmp-label"><MdOutlineRateReview /> {t('courses.reviews')}:</span>
                                    <span className="rmp-value">{Math.round(numR)}</span>
                                  </div>
                                )}
                                {wta != null && (
                                  <div className="rmp-stat">
                                    <span className="rmp-label"><GrPowerCycle /> {t('courses.wouldRetake')}:</span>
                                    <span className="rmp-value">{Math.round(wta)}%</span>
                                  </div>
                                )}
                                {rmpUrl && (
                                  <a href={rmpUrl} target="_blank" rel="noopener noreferrer" className="rmp-stat rmp-link-inline">
                                    <FaExternalLinkAlt size={10} /> View on RMP
                                  </a>
                                )}
                              </div>
                            )
                          }

                          // No rating found — show a search link if we have the prof name
                          const profName = course._syllabusProf || course.instructor
                          const isLooking = course._syllabusProf && rmpCache[courseKey] === undefined
                          if (isLooking) {
                            return <div className="rmp-looking">Looking up RateMyProfessors…</div>
                          }
                          if (course._syllabusProf) {
                            return (
                              <a
                                href={rmpSearchUrl(profName)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rmp-find-link"
                              >
                                <FaStar size={11} /> Find {profName} on RateMyProfessors →
                              </a>
                            )
                          }
                          return null
                        })()}
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
                  const isNearCurrent = Math.abs(page - currentPage) <= 1
                  const isEdge        = page === 1 || page === totalPages

                  if (!isNearCurrent && !isEdge) {
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

            {/* GPA badge — API returns `average` (most recent year) */}
            {selectedCourse.average && (
              <div className="course-stat-badge">
                {selectedCourse.average} GPA ({gpaToLetterGrade(selectedCourse.average)})
              </div>
            )}

            {/* RMP — prefer syllabus prof's data if available, else flat rmp_* fields */}
          {(() => {
            const sylProf = selectedCourse._syllabusProf
            const sylRmp  = sylProf ? courseInstructorRmp[sylProf] : null
            // Use syllabus-prof's live data if we have it, else fall back to stored flat fields
            const rating   = sylRmp?.avg_rating   ?? selectedCourse.rmp_rating
            const diff     = sylRmp?.avg_difficulty ?? selectedCourse.rmp_difficulty
            const numR     = sylRmp?.num_ratings   ?? selectedCourse.rmp_num_ratings
            const wta      = sylRmp?.would_take_again_percent ?? selectedCourse.rmp_would_take_again
            const profName = sylProf || selectedCourse.instructors?.[0]
            if (!rating) return null
            return (
              <div className="course-professor-rating">
                {profName && (
                  <h3>
                    <FaChartBar /> {t('courses.professorRating')}: {profName}
                    {sylProf && (
                      <span className="instructor-badge-syllabus" style={{ marginLeft: 8 }}>
                        📄 Your prof
                      </span>
                    )}
                  </h3>
                )}
                <div className="rmp-stats-grid">
                  <div className="rmp-stat-card">
                    <div className="rmp-stat-value">{parseFloat(rating).toFixed(1)}</div>
                    <div className="rmp-stat-label">{t('courses.rating')}</div>
                  </div>
                  <div className="rmp-stat-card">
                    <div className="rmp-stat-value">{diff ? parseFloat(diff).toFixed(1) : t('common.na')}</div>
                    <div className="rmp-stat-label">{t('courses.difficulty')}</div>
                  </div>
                  <div className="rmp-stat-card">
                    <div className="rmp-stat-value">{numR ? Math.round(numR) : t('common.na')}</div>
                    <div className="rmp-stat-label">{t('courses.reviews')}</div>
                  </div>
                  <div className="rmp-stat-card">
                    <div className="rmp-stat-value">{wta != null ? Math.round(wta) + '%' : t('common.na')}</div>
                    <div className="rmp-stat-label">{t('courses.wouldRetake')}</div>
                  </div>
                </div>
              </div>
            )
          })()}
          </div>

          {/* Instructors with individual RMP data */}
          {selectedCourse.instructors?.length > 0 && (
            <div className="course-sections">
              <h3 className="sections-header">
                <FaUser style={{ marginRight: 8 }} />
                Instructors ({selectedCourse.instructors.length})
                {rmpLoading && <span className="rmp-loading-indicator"> · Loading ratings…</span>}
              </h3>
              <div className="ct-prof-list">
                {selectedCourse.instructors.map((instructor, idx) => {
                  const rmp = courseInstructorRmp[instructor]
                  const cls = rmpRatingClass(rmp?.avg_rating)
                  return (
                    <div key={idx} className="ct-prof-card">
                      <div className="ct-prof-name">
                        <FaUser className="ct-prof-icon" />
                        {instructor}
                      </div>
                      {rmp ? (
                        <div className="ct-prof-rmp">
                          <div className="ct-rmp-stats">
                            <div className={`ct-rmp-score ct-rmp-score--${cls}`}>
                              <FaStar className="ct-rmp-star" />
                              {rmp.avg_rating?.toFixed(1)}/5.0
                            </div>
                            <div className="ct-rmp-stat">
                              <span className="ct-rmp-label">Difficulty</span>
                              <span className="ct-rmp-val">{rmp.avg_difficulty?.toFixed(1) ?? 'N/A'}/5.0</span>
                            </div>
                            {rmp.would_take_again_percent != null && (
                              <div className="ct-rmp-stat">
                                <span className="ct-rmp-label">Would Retake</span>
                                <span className="ct-rmp-val">{rmp.would_take_again_percent}%</span>
                              </div>
                            )}
                            <div className="ct-rmp-stat ct-rmp-stat--count">
                              <span className="ct-rmp-label">{rmp.num_ratings} rating{rmp.num_ratings !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <a
                            href={rmp.rmp_url || rmpSearchUrl(instructor)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ct-rmp-link"
                          >
                            RateMyProfessors <FaExternalLinkAlt />
                          </a>
                        </div>
                      ) : (
                        <a
                          href={rmpSearchUrl(instructor)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ct-rmp-search-link"
                        >
                          <FaStar /> Search on RateMyProfessors →
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Grade trend — API returns grade_trend: [{year, average, sections}] */}
          {selectedCourse.grade_trend?.length > 0 && (
            <div className="course-sections">
              <h3 className="sections-header">
                {t('courses.sections')} ({selectedCourse.num_sections})
              </h3>
              <div className="sections-grid">
                {selectedCourse.grade_trend.map((entry, idx) => (
                  <div key={idx} className="section-card-compact">
                    <div className="section-compact-header">
                      <span className="section-term">{entry.year}</span>
                      {entry.average && (
                        <span className="section-average">
                          {parseFloat(entry.average).toFixed(2)} ({gpaToLetterGrade(entry.average)})
                          <span className="average-note"></span>
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
