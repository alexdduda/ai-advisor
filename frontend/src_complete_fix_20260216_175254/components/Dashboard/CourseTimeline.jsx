import { groupCoursesBySemester } from '../../utils/academicUtils'
import './CourseTimeline.css'

export default function CourseTimeline({ completedCourses }) {
  const semesterGroups = groupCoursesBySemester(completedCourses)
  const totalCredits = completedCourses.reduce((sum, c) => sum + (c.credits || 3), 0)
  const targetCredits = 120

  const semesterColors = [
    '#ED1B2F', '#FF6B6B', '#4CAF50', '#2196F3', 
    '#9C27B0', '#FF9800', '#00BCD4', '#8BC34A'
  ]

  return (
    <div className="course-timeline-section">
      <div className="timeline-header">
        <h3>📅 Course Timeline</h3>
        <p className="timeline-subtitle">
          {totalCredits} / {targetCredits} credits • {semesterGroups.length} semesters
        </p>
      </div>

      {/* Visual Credit Progress Bar */}
      <div className="timeline-progress-container">
        <div className="timeline-progress-bar">
          {semesterGroups.map((group, idx) => {
            const semesterCredits = group.courses.reduce((sum, c) => sum + (c.credits || 3), 0)
            const percentage = (semesterCredits / targetCredits) * 100
            
            return (
              <div
                key={idx}
                className="timeline-segment"
                style={{
                  width: `${percentage}%`,
                  background: semesterColors[idx % semesterColors.length]
                }}
                title={`${group.semester}: ${semesterCredits} credits`}
              />
            )
          })}
        </div>
        <div className="timeline-markers">
          <span>0</span>
          <span>30</span>
          <span>60</span>
          <span>90</span>
          <span>120</span>
        </div>
      </div>

      {/* Semester List */}
      <div className="timeline-semesters">
        {semesterGroups.map((group, idx) => {
          const semesterCredits = group.courses.reduce((sum, c) => sum + (c.credits || 3), 0)
          
          return (
            <div key={idx} className="timeline-semester">
              <div className="semester-header">
                <div 
                  className="semester-color-indicator"
                  style={{ background: semesterColors[idx % semesterColors.length] }}
                />
                <div className="semester-info">
                  <h4 className="semester-name">{group.semester}</h4>
                  <p className="semester-meta">
                    {group.courses.length} courses • {semesterCredits} credits
                  </p>
                </div>
              </div>
              <div className="semester-courses">
                {group.courses.map((course, courseIdx) => (
                  <div key={courseIdx} className="timeline-course">
                    <span className="course-code">
                      {course.subject} {course.catalog}
                    </span>
                    {course.grade && (
                      <span className="course-grade">{course.grade}</span>
                    )}
                    <span className="course-credits">{course.credits || 3} cr</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {completedCourses.length === 0 && (
        <div className="timeline-empty">
          <span className="empty-icon">📚</span>
          <p>No completed courses yet. Mark courses as taken in the Saved tab!</p>
        </div>
      )}
    </div>
  )
}
