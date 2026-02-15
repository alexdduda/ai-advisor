import { useState } from 'react'
import './MarkCompleteModal.css'

export default function MarkCompleteModal({ 
  course, 
  onConfirm, 
  onCancel 
}) {
  const currentYear = new Date().getFullYear()
  const [formData, setFormData] = useState({
    term: 'Fall',
    year: currentYear.toString(),
    grade: '',
    credits: course.defaultCredits || 3
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(formData)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Mark Course as Completed</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body">
          <div className="course-info">
            <div className="course-code-display">{course.code}</div>
            <div className="course-title-display">{course.title}</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="term">Term *</label>
                <select
                  id="term"
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  required
                >
                  <option value="Fall">Fall</option>
                  <option value="Winter">Winter</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <input
                  id="year"
                  type="number"
                  min="2000"
                  max={currentYear + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="grade">Grade (optional)</label>
                <select
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                >
                  <option value="">Not specified</option>
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="B-">B-</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="C-">C-</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                  <option value="S">S (Satisfactory)</option>
                  <option value="U">U (Unsatisfactory)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="credits">Credits *</label>
                <input
                  id="credits"
                  type="number"
                  min="1"
                  max="12"
                  step="1"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="common-credits-note">
              <strong>Common credit values:</strong> Most courses are 3 credits. 
              Lab courses are often 1-2 credits. Some intensive courses may be 4-6 credits.
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Mark as Completed
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}