import { useState, useMemo } from 'react'
import { FaBullseye, FaLightbulb, FaBan, FaSmile, FaFire } from 'react-icons/fa'
import { FaDumbbell } from 'react-icons/fa6'
import { FaBook } from 'react-icons/fa'
import { HiMiniSparkles } from "react-icons/hi2";
import './TargetGPACalculator.css'

export default function TargetGPACalculator({ currentGPA, completedCredits, totalCreditsRequired = 120 }) {
  const [targetGPA, setTargetGPA] = useState('')
  const [showResult, setShowResult] = useState(false)

  // Calculate required GPA for remaining courses
  const calculation = useMemo(() => {
    if (!currentGPA || !targetGPA || !completedCredits) {
      return null
    }

    const current = parseFloat(currentGPA)
    const target = parseFloat(targetGPA)
    const completed = parseFloat(completedCredits)
    const remaining = totalCreditsRequired - completed

    // Validation
    if (isNaN(current) || isNaN(target) || isNaN(completed)) {
      return null
    }

    if (target < 0 || target > 4.0) {
      return { error: 'Target GPA must be between 0.0 and 4.0' }
    }

    if (current < 0 || current > 4.0) {
      return { error: 'Current GPA must be between 0.0 and 4.0' }
    }

    if (completed < 0 || completed > totalCreditsRequired) {
      return { error: 'Completed credits cannot exceed total credits' }
    }

    if (remaining <= 0) {
      return { error: 'You have already completed all required credits' }
    }

    // Calculate required GPA
    // Formula: target_gpa = (current_gpa * completed_credits + required_gpa * remaining_credits) / total_credits
    // Solving for required_gpa: required_gpa = (target_gpa * total_credits - current_gpa * completed_credits) / remaining_credits
    
    const requiredGPA = (target * totalCreditsRequired - current * completed) / remaining

    // Check if it's achievable
    if (requiredGPA > 4.0) {
      return {
        isAchievable: false,
        requiredGPA: requiredGPA.toFixed(2),
        message: `Impossible to achieve. Even with a perfect 4.0 GPA for all remaining courses, your final GPA would only be ${((current * completed + 4.0 * remaining) / totalCreditsRequired).toFixed(2)}`
      }
    }

    if (requiredGPA < 0) {
      return {
        isAchievable: true,
        requiredGPA: '0.00',
        message: `You've already exceeded your target! Your current GPA of ${current.toFixed(2)} will reach ${target.toFixed(2)} even if you score 0.0 in remaining courses.`
      }
    }

    // Calculate scenarios
    const scenarios = [
      {
        label: 'Conservative (B average)',
        gpa: 3.0,
        finalGPA: ((current * completed + 3.0 * remaining) / totalCreditsRequired).toFixed(2)
      },
      {
        label: 'Strong (A- average)',
        gpa: 3.7,
        finalGPA: ((current * completed + 3.7 * remaining) / totalCreditsRequired).toFixed(2)
      },
      {
        label: 'Perfect (A average)',
        gpa: 4.0,
        finalGPA: ((current * completed + 4.0 * remaining) / totalCreditsRequired).toFixed(2)
      }
    ]

    return {
      isAchievable: true,
      requiredGPA: requiredGPA.toFixed(2),
      remainingCredits: remaining,
      completedCredits: completed,
      currentGPA: current.toFixed(2),
      targetGPA: target.toFixed(2),
      scenarios,
      difficulty: getDifficulty(requiredGPA)
    }
  }, [currentGPA, targetGPA, completedCredits, totalCreditsRequired])

  function getDifficulty(requiredGPA) {
    if (requiredGPA <= 2.5) return { level: 'Easy', color: '#10b981', emoji: <FaSmile className="difficulty-emoji" /> }
    if (requiredGPA <= 3.0) return { level: 'Moderate', color: '#3b82f6', emoji: <FaDumbbell className="difficulty-emoji" /> }
    if (requiredGPA <= 3.5) return { level: 'Challenging', color: '#f59e0b', emoji: <FaBook className="difficulty-emoji" /> }
    if (requiredGPA <= 3.8) return { level: 'Difficult', color: '#ef4444', emoji: <FaFire className="difficulty-emoji" /> }
    return { level: 'Very Difficult', color: '#dc2626', emoji: <FaBullseye className="difficulty-emoji" /> }
  }

  const handleCalculate = () => {
    if (targetGPA && currentGPA && completedCredits) {
      setShowResult(true)
    }
  }

  const handleReset = () => {
    setTargetGPA('')
    setShowResult(false)
  }

  return (
    <div className="target-gpa-calculator">
      <div className="calculator-header">
        <h3 className="calculator-title"><FaBullseye className="calculator-icon" /> Target GPA Calculator</h3>
        <p className="calculator-subtitle">Calculate what you need to achieve your goal</p>
      </div>

      <div className="calculator-body">
        {/* Current Stats */}
        <div className="current-stats">
          <div className="stat-box">
            <span className="stat-label">Current GPA</span>
            <span className="stat-value">{currentGPA || '--'}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Credits Completed</span>
            <span className="stat-value">{completedCredits || 0}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Credits Remaining</span>
            <span className="stat-value">{totalCreditsRequired - (completedCredits || 0)}</span>
          </div>
        </div>

        {/* Input Section */}
        <div className="input-section">
          <label className="input-label">
            <span className="label-text">Target GPA</span>
            <input
              type="number"
              min="0"
              max="4.0"
              step="0.01"
              placeholder="e.g., 3.5"
              value={targetGPA}
              onChange={(e) => {
                setTargetGPA(e.target.value)
                setShowResult(false)
              }}
              className="gpa-input"
            />
          </label>

          <button 
            onClick={handleCalculate}
            disabled={!targetGPA || !currentGPA || !completedCredits}
            className="calculate-btn"
          >
            Calculate Required GPA
          </button>
        </div>

        {/* Results */}
        {showResult && calculation && (
          <div className="results-section">
            {calculation.error ? (
              <div className="error-message">
                <span className="error-icon"><FaLightbulb className="error-icon" /></span>
                <p>{calculation.error}</p>
              </div>
            ) : calculation.isAchievable ? (
              <>
                {/* Main Result */}
                <div className="main-result">
                  <div className="result-header">
                    <span className="result-label">Required GPA for Remaining Courses</span>
                    {calculation.difficulty && (
                      <span 
                        className="difficulty-badge"
                        style={{ backgroundColor: calculation.difficulty.color }}
                      >
                        {calculation.difficulty.emoji} {calculation.difficulty.level}
                      </span>
                    )}
                  </div>
                  <div className="result-value">{calculation.requiredGPA}</div>
                  <div className="result-details">
                    To reach <strong>{calculation.targetGPA}</strong> GPA with <strong>{calculation.remainingCredits}</strong> credits remaining
                  </div>
                </div>

                {/* Letter Grade Equivalent */}
                <div className="grade-equivalent">
                  <span className="grade-label">Equivalent to maintaining approximately:</span>
                  <span className="grade-value">{getLetterGrade(parseFloat(calculation.requiredGPA))}</span>
                </div>

                {/* Scenarios */}
                <div className="scenarios-section">
                  <h4 className="scenarios-title"><HiMiniSparkles className="scenarios-icon" /> What if scenarios</h4>
                  <div className="scenarios-list">
                    {calculation.scenarios.map((scenario, idx) => (
                      <div key={idx} className="scenario-item">
                        <div className="scenario-header">
                          <span className="scenario-label">{scenario.label}</span>
                          <span className="scenario-gpa">{scenario.gpa.toFixed(1)}</span>
                        </div>
                        <div className="scenario-result">
                          Final GPA: <strong>{scenario.finalGPA}</strong>
                          {parseFloat(scenario.finalGPA) >= parseFloat(calculation.targetGPA) ? (
                            <span className="check-icon">✓</span>
                          ) : (
                            <span className="cross-icon">✗</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="tips-section">
                  <h4 className="tips-title"><FaLightbulb className="tips-icon" /> Tips to Reach Your Goal</h4>
                  <ul className="tips-list">
                    {getTips(parseFloat(calculation.requiredGPA)).map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <button onClick={handleReset} className="reset-btn">
                  Calculate Another Target
                </button>
              </>
            ) : (
              <div className="impossible-result">
                <span className="impossible-icon"><FaBan className="impossible-icon" /></span>
                <h4>Target Not Achievable</h4>
                <p>{calculation.message}</p>
                <button onClick={handleReset} className="reset-btn">
                  Try Different Target
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function getLetterGrade(gpa) {
  if (gpa >= 3.85) return 'A (Excellent)'
  if (gpa >= 3.5) return 'A- to A (Very Good)'
  if (gpa >= 3.15) return 'B+ (Good)'
  if (gpa >= 2.85) return 'B (Satisfactory)'
  if (gpa >= 2.5) return 'B- to B (Acceptable)'
  if (gpa >= 2.15) return 'C+ (Below Average)'
  if (gpa >= 1.85) return 'C (Minimal Pass)'
  return 'Below C (Needs Improvement)'
}

function getTips(requiredGPA) {
  const tips = []
  
  if (requiredGPA >= 3.7) {
    tips.push('Focus on your strongest subjects for higher grades')
    tips.push('Consider taking fewer courses per semester to maintain quality')
    tips.push('Form study groups with high-performing classmates')
    tips.push('Attend all office hours and seek help early')
  } else if (requiredGPA >= 3.3) {
    tips.push('Maintain consistent study habits throughout the semester')
    tips.push('Start assignments early to allow time for revisions')
    tips.push('Attend review sessions before exams')
  } else if (requiredGPA >= 2.7) {
    tips.push('Stay on top of coursework and avoid falling behind')
    tips.push('Review material regularly, not just before exams')
    tips.push('Take advantage of tutoring resources')
  } else {
    tips.push('You have a comfortable cushion - maintain good habits')
    tips.push('Consider challenging yourself with interesting electives')
    tips.push('Focus on learning, not just grades')
  }
  
  return tips
}
