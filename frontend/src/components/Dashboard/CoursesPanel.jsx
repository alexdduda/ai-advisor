import { useState } from 'react'
import coursesAPI from '../../lib/professorsAPI'
import ProfessorRating from '../ProfessorRating/ProfessorRating'
import { gpaToLetterGrade } from '../../utils/gpaUtils'
import { FaChartBar, FaBook } from 'react-icons/fa'
import './CoursesPanel.css'

export default function CoursesPanel() {
  const [searchQuery,    setSearchQuery]    = useState('')
  const [searchResults,  setSearchResults]  = useState([])
  const [isSearching,    setIsSearching]    = useState(false)
  const [searchError,    setSearchError]    = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isLoadingCourse,setIsLoadingCourse]= useState(false)

  // ── search ────────────────────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchError(null)
    setSelectedCourse(null)

    try {
      const data = await coursesAPI.search(searchQuery, null, 100)

      // Group sections by course code
      const map = new Map()
      data.courses?.forEach(section => {
        const key = `${section.subject}-${section.catalog}`
        if (!map.has(key)) {
          map.set(key, {
            id: section.id, subject: section.subject, catalog: section.catalog,
            title: section.course_name, average: section.average,
            sections: [section]
          })
        } else {
          const course = map.get(key)
          course.sections.push(section)
          if (section.average && (!course.average || section.average > course.average)) {
            course.average = section.average
          }
        }
      })

      const courses = Array.from(map.values())
      setSearchResults(courses)
      if (!courses.length) setSearchError('No courses found matching your search.')
    } catch (err) {
      console.error('Course search error:', err)
      setSearchError('Failed to search courses. Please try again.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // ── detail ────────────────────────────────────────────────────────
  const handleCourseClick = async (course) => {
    setIsLoadingCourse(true)
    setSelectedCourse(null)
    try {
      const data = await coursesAPI.getDetails(course.subject, course.catalog)
      setSelectedCourse(data.course)
    } catch (err) {
      console.error('Error loading course details:', err)
      setSearchError('Failed to load course details.')
    } finally {
      setIsLoadingCourse(false)
    }
  }

  // ── render ────────────────────────────────────────────────────────
  return (
    <div className="courses-container">
      <form className="search-section" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Search for courses (e.g., COMP 202, Introduction to Programming)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isSearching}
        />
        <button type="submit" className="btn btn-search" disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searchError && <div className="error-banner">{searchError}</div>}

      {/* Result list */}
      {searchResults.length > 0 && !selectedCourse && (
        <div className="search-results">
          <h3 className="results-header">
            Found {searchResults.length} course{searchResults.length !== 1 ? 's' : ''}
          </h3>
          <div className="course-list">
            {searchResults.map(course => (
              <div
                key={`${course.subject}-${course.catalog}`}
                className="course-card"
                onClick={() => handleCourseClick(course)}
              >
                <div className="course-header">
                  <div className="course-code">{course.subject} {course.catalog}</div>
                  {course.average && (
                    <div className="course-average">
                      {course.average.toFixed(1)} GPA ({gpaToLetterGrade(course.average)})
                    </div>
                  )}
                </div>
                <h4 className="course-title">{course.title}</h4>
                {course.sections && (
                  <div className="course-meta">
                    <FaChartBar className="meta-icon" /> {course.sections.length} section{course.sections.length !== 1 ? 's' : ''} available
                  </div>
                )}
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

      {/* Detail view */}
      {selectedCourse && !isLoadingCourse && (
        <div className="course-details">
          <button className="btn-back" onClick={() => setSelectedCourse(null)}>← Back to Results</button>

          <div className="course-details-header">
            <h2 className="course-details-title">
              {selectedCourse.subject} {selectedCourse.catalog}: {selectedCourse.title}
            </h2>
            {selectedCourse.average_grade && (
              <div className="course-stat-badge">
                Average: {selectedCourse.average_grade} GPA ({gpaToLetterGrade(selectedCourse.average_grade)})
              </div>
            )}
          </div>

          <div className="course-sections">
            <h3 className="sections-header">Sections ({selectedCourse.num_sections})</h3>
            {selectedCourse.sections.map((section, idx) => (
              <div key={idx} className="section-card">
                <div className="section-info">
                  <div className="section-header">
                    <span className="section-term">{section.term || 'N/A'}</span>
                    {section.average && (
                      <span className="section-average">
                        Average: {section.average} GPA ({gpaToLetterGrade(section.average)})
                      </span>
                    )}
                  </div>
                  {section.instructor && section.instructor !== 'TBA' && (
                    <div className="section-instructor">
                      <strong>Instructor:</strong> {section.instructor}
                    </div>
                  )}
                </div>
                {section.professor_rating && <ProfessorRating rating={section.professor_rating} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty / placeholder */}
      {!searchResults.length && !selectedCourse && !searchError && !isSearching && (
        <div className="placeholder-content">
          <div className="placeholder-icon"><FaBook className="placeholder-icon" /></div>
          <h3>Course Explorer with Professor Ratings</h3>
          <p>Search through McGill courses with historical grade data and live RateMyProfessor ratings.</p>
        </div>
      )}
    </div>
  )
}
