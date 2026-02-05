import { useState, useEffect } from 'react'
import { getCourseCredits, getCommonCreditOptions, formatCredits, getCreditNotes } from '../../utils/courseCredits'
import './MarkCompleteModal.css'

export default function MarkCompleteModal({ 
  course, 
  onComplete, 
  onCancel,
  existingData = null 
}) {
  const [formData, setFormData] = useState({
    term: existingData?.term || 'Fall',
    year: existingData?.year || new Date().getFullYear(),
    grade: existingData?.grade || '',
    credits: existingData?.credits || getCourseCredits(
      course.course_code || `${course.subject} ${course.catalog}`,
      course.subject,
      course.catalog
    )
  })

  const courseCode = course.course_code || `${course.subject} ${course.catalog}`
  const creditNote = getCreditNotes(courseCode)
  const creditOptions = getCommonCreditOptions(courseCode)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  const terms = ['Fall', 'Winter', 'Summer']
  const grades = [
    { value: 'A', label: 'A (4.0)' },
    { value: 'A-', label: 'A- (3.7)' },
    { value: 'B+', label: 'B+ (3.3)' },
    { value: 'B', label: 'B (3.0)' },
    { value: 'B-', label: 'B- (2.7)' },
    { value: 'C+', label: 'C+ (2.3)' },
    { value: 'C', label: 'C (2.0)' },
    { value: 'C-', label: 'C- (1.7)' },
    { value: 'D', label: 'D (1.0)' },
    { value: 'F', label: 'F (0.0)' },
    { value: 'P', label: 'P (Pass)' },
    { value: 'S', label: 'S (Satisfactory)' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    onComplete(formData)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Mark Course as Completed</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          <div className="course-info">
            <div className="course-code-display">
              {courseCode}
            </div>
            <div className="course-title-display">
              {course.course_title || course.title}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="complete-form">
            {/* Term Selection */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="term">
                  Term <span className="required">*</span>
                </label>
                <select
                  id="term"
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  required
                >
                  {terms.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="year">
                  Year <span className="required">*</span>
                </label>
                <select
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grade Selection */}
            <div className="form-group">
              <label htmlFor="grade">
                Grade <span className="optional">(optional)</span>
              </label>
              <select
                id="grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              >
                <option value="">Select grade...</option>
                {grades.map(grade => (
                  <option key={grade.value} value={grade.value}>
                    {grade.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Credits Selection */}
            <div className="form-group">
              <label htmlFor="credits">
                Credits <span className="required">*</span>
              </label>
              <select
                id="credits"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                required
              >
                {creditOptions.map(credits => (
                  <option key={credits} value={credits}>
                    {formatCredits(credits)}
                  </option>
                ))}
              </select>
              {creditNote && (
                <div className="field-hint">
                  💡 {creditNote}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                ✓ Mark as Completed
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
