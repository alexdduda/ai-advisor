import { useState } from 'react'
import { FaHeart, FaRegHeart, FaCheckCircle } from 'react-icons/fa'
import './SavedCoursesView.css'

export default function SavedCoursesView({ 
  favorites = [], 
  completedCourses = [],
  completedCoursesMap = new Set(),
  favoritesMap = new Set(),
  user,
  onToggleFavorite,
  onToggleCompleted,
  onCourseClick,
  onRefresh 
}) {
  const [activeView, setActiveView] = useState('saved') // 'saved' or 'completed'

  // Check if a course is completed
  const isCompleted = (subject, catalog) => {
    const courseCode = `${subject} ${catalog}`
    return completedCoursesMap.has(courseCode)
  }

  // Check if a course is favorited
  const isFavorited = (subject, catalog) => {
    const courseCode = `${subject}${catalog}`
    const result = favoritesMap.has(courseCode)
    console.log('Checking if favorited:', { subject, catalog, courseCode, result, favoritesMap: Array.from(favoritesMap) })
    return result
  }

  return (
    <div className="saved-courses-view">
      {/* Tab Navigation */}
      <div className="saved-tabs">
        <button
          className={`saved-tab ${activeView === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveView('saved')}
        >
          <span className="tab-icon">⭐</span>
          <span className="tab-label">Saved Courses</span>
          {favorites.length > 0 && (
            <span className="tab-count">{favorites.length}</span>
          )}
        </button>
        
        <button
          className={`saved-tab ${activeView === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveView('completed')}
        >
          <span className="tab-icon">✓</span>
          <span className="tab-label">Completed</span>
          {completedCourses.length > 0 && (
            <span className="tab-count">{completedCourses.length}</span>
          )}
        </button>
      </div>

      {/* Saved Courses View */}
      {activeView === 'saved' && (
        <div className="saved-courses-content">
          {favorites.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <h3>No Saved Courses Yet</h3>
              <p>Save courses from the Course Explorer to see them here</p>
            </div>
          ) : (
            <div className="course-list">
              {favorites.map((course, idx) => (
                <div key={idx} className="course-card">
                  <div 
                    className="course-card-content" 
                    onClick={() => {
                      console.log('Card clicked:', course)
                      if (onCourseClick) {
                        onCourseClick(course)
                      }
                    }}
                  >
                    <div className="course-header">
                      <div className="course-code">
                        {course.subject} {course.catalog}
                      </div>
                    </div>
                    <h4 className="course-title">{course.course_title}</h4>
                  </div>

                  {/* Buttons below the bar */}
                  <div className="course-card-actions">
                    {/* Favorite Button */}
                    <button
                      className="favorite-btn favorited"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onToggleFavorite) {
                          onToggleFavorite({
                            subject: course.subject,
                            catalog: course.catalog,
                            title: course.course_title
                          })
                        }
                      }}
                      title="Remove from favorites"
                    >
                      <FaHeart className="favorite-icon" />
                    </button>

                    {/* Completed Button */}
                    {onToggleCompleted && (
                      <button
                        className={`completed-btn ${isCompleted(course.subject, course.catalog) ? 'completed' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleCompleted({
                            subject: course.subject,
                            catalog: course.catalog,
                            title: course.course_title
                          })
                        }}
                        title={isCompleted(course.subject, course.catalog) ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        <FaCheckCircle className="completed-icon" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed Courses View */}
      {activeView === 'completed' && (
        <div className="completed-courses-content">
          {completedCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h3>No Completed Courses Yet</h3>
              <p>Mark courses as completed to track your progress</p>
            </div>
          ) : (
            <div className="course-list">
              {completedCourses.map((course, idx) => (
                <div key={idx} className="course-card completed-course-card">
                  <div 
                    className="course-card-content"
                    onClick={() => {
                      console.log('Completed card clicked:', course)
                      if (onCourseClick) {
                        onCourseClick(course)
                      }
                    }}
                  >
                    <div className="course-header">
                      <div className="course-code">
                        {course.subject} {course.catalog}
                      </div>
                      {course.grade && (
                        <div className="course-grade-badge">
                          {course.grade}
                        </div>
                      )}
                    </div>
                    <h4 className="course-title">{course.course_title}</h4>
                    {(course.term || course.year || course.credits) && (
                      <div className="course-meta">
                        {(course.term || course.year) && (
                          <span className="course-term">{course.term} {course.year}</span>
                        )}
                        {course.credits && (
                          <span className="course-credits"> • {course.credits} credits</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Buttons below the bar */}
                  <div className="course-card-actions">
                    {/* Favorite Button */}
                    {onToggleFavorite && (
                      <button
                        className={`favorite-btn ${isFavorited(course.subject, course.catalog) ? 'favorited' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite({
                            subject: course.subject,
                            catalog: course.catalog,
                            title: course.course_title
                          })
                        }}
                        title={isFavorited(course.subject, course.catalog) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {isFavorited(course.subject, course.catalog) ? (
                          <FaHeart className="favorite-icon" />
                        ) : (
                          <FaRegHeart className="favorite-icon" />
                        )}
                      </button>
                    )}

                    {/* Completed Button - Always shown as completed */}
                    <button
                      className="completed-btn completed"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onToggleCompleted) {
                          onToggleCompleted({
                            subject: course.subject,
                            catalog: course.catalog,
                            title: course.course_title
                          })
                        }
                      }}
                      title="Remove from completed"
                    >
                      <FaCheckCircle className="completed-icon" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
