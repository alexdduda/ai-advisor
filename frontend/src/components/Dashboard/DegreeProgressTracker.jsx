import { useMemo } from 'react'
import { FACULTY_CREDIT_REQUIREMENTS, PROGRAM_CREDIT_REQUIREMENTS } from '../../utils/mcgillData'
import './DegreeProgressTracker.css'

export default function DegreeProgressTracker({ completedCourses = [], profile = {} }) {
  const stats = useMemo(() => {
    // Calculate completed course credits
    const completedCredits = completedCourses.reduce((sum, course) => {
      return sum + (course.credits || 3) // Default to 3 if not specified
    }, 0)

    // Calculate advanced standing credits
    const advancedStandingCredits = (profile?.advanced_standing || []).reduce((sum, course) => {
      return sum + (course.credits || 0)
    }, 0)

    // Total earned credits
    const totalEarnedCredits = completedCredits + advancedStandingCredits

    // Get credit requirements - check program first, then faculty, default to 120
    let TOTAL_CREDITS_REQUIRED = 120 // Default
    
    // Check if the major has specific credit requirements
    if (profile?.major && PROGRAM_CREDIT_REQUIREMENTS[profile.major]) {
      TOTAL_CREDITS_REQUIRED = PROGRAM_CREDIT_REQUIREMENTS[profile.major]
    }
    // Otherwise check faculty requirements
    else if (profile?.faculty && FACULTY_CREDIT_REQUIREMENTS[profile.faculty]) {
      TOTAL_CREDITS_REQUIRED = FACULTY_CREDIT_REQUIREMENTS[profile.faculty]
    }
    
    const remainingCredits = Math.max(0, TOTAL_CREDITS_REQUIRED - totalEarnedCredits)
    const progressPercentage = Math.min(100, (totalEarnedCredits / TOTAL_CREDITS_REQUIRED) * 100)

    return {
      completedCredits,
      advancedStandingCredits,
      totalEarnedCredits,
      totalRequired: TOTAL_CREDITS_REQUIRED,
      remainingCredits,
      progressPercentage,
      completedCourseCount: completedCourses.length,
      advancedStandingCourseCount: (profile?.advanced_standing || []).length
    }
  }, [completedCourses, profile])

  return (
    <div className="degree-progress-tracker">
      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <h3 className="progress-title">Degree Completion</h3>
          <span className="progress-percentage">{Math.round(stats.progressPercentage)}%</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${stats.progressPercentage}%` }}
          >
            <div className="progress-bar-shine"></div>
          </div>
        </div>
        <div className="progress-labels">
          <span className="progress-label">{stats.totalEarnedCredits} credits earned</span>
          <span className="progress-label">{stats.totalRequired} credits required</span>
        </div>
      </div>

      {/* Credit Breakdown */}
      <div className="credits-breakdown">
        <div className="credit-item">
          <div className="credit-icon">📚</div>
          <div className="credit-details">
            <div className="credit-label">Completed Courses</div>
            <div className="credit-value">
              {stats.completedCredits} credits
              <span className="credit-count">({stats.completedCourseCount} courses)</span>
            </div>
          </div>
        </div>

        {stats.advancedStandingCredits > 0 && (
          <div className="credit-item highlight">
            <div className="credit-icon">⚡</div>
            <div className="credit-details">
              <div className="credit-label">Advanced Standing</div>
              <div className="credit-value">
                {stats.advancedStandingCredits} credits
                <span className="credit-count">({stats.advancedStandingCourseCount} courses)</span>
              </div>
            </div>
          </div>
        )}

        <div className="credit-item total">
          <div className="credit-icon">✓</div>
          <div className="credit-details">
            <div className="credit-label">Total Earned</div>
            <div className="credit-value">{stats.totalEarnedCredits} credits</div>
          </div>
        </div>

        <div className="credit-item remaining">
          <div className="credit-icon">🎯</div>
          <div className="credit-details">
            <div className="credit-label">Remaining</div>
            <div className="credit-value">{stats.remainingCredits} credits</div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="milestones">
        <div className={`milestone ${stats.totalEarnedCredits >= Math.round(stats.totalRequired * 0.25) ? 'completed' : ''}`}>
          <div className="milestone-marker">
            {stats.totalEarnedCredits >= Math.round(stats.totalRequired * 0.25) ? '✓' : '○'}
          </div>
          <div className="milestone-text">{Math.round(stats.totalRequired * 0.25)} credits - 1/4 of the way there!</div>
        </div>
        <div className={`milestone ${stats.totalEarnedCredits >= Math.round(stats.totalRequired * 0.5) ? 'completed' : ''}`}>
          <div className="milestone-marker">
            {stats.totalEarnedCredits >= Math.round(stats.totalRequired * 0.5) ? '✓' : '○'}
          </div>
          <div className="milestone-text">{Math.round(stats.totalRequired * 0.5)} credits - Halfway done! 🎉</div>
        </div>
        <div className={`milestone ${stats.totalEarnedCredits >= Math.round(stats.totalRequired * 0.75) ? 'completed' : ''}`}>
          <div className="milestone-marker">
            {stats.totalEarnedCredits >= Math.round(stats.totalRequired * 0.75) ? '✓' : '○'}
          </div>
          <div className="milestone-text">{Math.round(stats.totalRequired * 0.75)} credits - Almost there! 💪</div>
        </div>
        <div className={`milestone ${stats.totalEarnedCredits >= stats.totalRequired ? 'completed' : ''}`}>
          <div className="milestone-marker">
            {stats.totalEarnedCredits >= stats.totalRequired ? '✓' : '○'}
          </div>
          <div className="milestone-text">{stats.totalRequired} credits - Graduation! 🎓</div>
        </div>
      </div>

      {stats.advancedStandingCredits > 0 && (
        <div className="info-note">
          <span className="info-icon">💡</span>
          <span>Your {stats.advancedStandingCredits} AP/IB/transfer credits give you a head start!</span>
        </div>
      )}
    </div>
  )
}
