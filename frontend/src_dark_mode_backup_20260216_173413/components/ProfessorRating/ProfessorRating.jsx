import React from 'react'
import './ProfessorRating.css'

/**
 * Component to display professor ratings from RateMyProfessor
 */
const ProfessorRating = ({ rating }) => {
  if (!rating) {
    return (
      <div className="professor-rating professor-rating-unavailable">
        <span className="rating-unavailable-text">No ratings available</span>
      </div>
    )
  }

  const {
    first_name,
    last_name,
    avg_rating,
    avg_difficulty,
    num_ratings,
    would_take_again_percent,
    rmp_url,
    department
  } = rating

  // Determine rating quality class
  const getRatingClass = (rating) => {
    if (rating >= 4.0) return 'excellent'
    if (rating >= 3.5) return 'good'
    if (rating >= 3.0) return 'average'
    return 'poor'
  }

  const ratingClass = avg_rating ? getRatingClass(avg_rating) : 'unknown'

  return (
    <div className={`professor-rating rating-${ratingClass}`}>
      <div className="professor-header">
        <div className="professor-name">
          {first_name} {last_name}
        </div>
        {department && (
          <div className="professor-department">{department}</div>
        )}
      </div>

      <div className="rating-stats">
        <div className="rating-stat">
          <div className="stat-label">Quality</div>
          <div className={`stat-value stat-quality-${ratingClass}`}>
            {avg_rating ? avg_rating.toFixed(1) : 'N/A'}
            <span className="stat-max">/5.0</span>
          </div>
        </div>

        <div className="rating-stat">
          <div className="stat-label">Difficulty</div>
          <div className="stat-value">
            {avg_difficulty ? avg_difficulty.toFixed(1) : 'N/A'}
            <span className="stat-max">/5.0</span>
          </div>
        </div>

        {would_take_again_percent !== null && would_take_again_percent !== undefined && (
          <div className="rating-stat">
            <div className="stat-label">Would Take Again</div>
            <div className="stat-value stat-percent">
              {would_take_again_percent}%
            </div>
          </div>
        )}
      </div>

      <div className="rating-footer">
        <div className="rating-count">
          Based on {num_ratings} rating{num_ratings !== 1 ? 's' : ''}
        </div>
        <a 
          href={rmp_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="rmp-link"
        >
          View on RateMyProfessor →
        </a>
      </div>
    </div>
  )
}

/**
 * Compact version for course lists
 */
export const ProfessorRatingCompact = ({ rating }) => {
  if (!rating) {
    return <span className="rating-compact-unavailable">No ratings</span>
  }

  const { avg_rating, num_ratings } = rating

  const getRatingClass = (rating) => {
    if (rating >= 4.0) return 'excellent'
    if (rating >= 3.5) return 'good'
    if (rating >= 3.0) return 'average'
    return 'poor'
  }

  const ratingClass = avg_rating ? getRatingClass(avg_rating) : 'unknown'

  return (
    <span className={`rating-compact rating-${ratingClass}`}>
      ⭐ {avg_rating ? avg_rating.toFixed(1) : 'N/A'}
      <span className="rating-count-compact">({num_ratings})</span>
    </span>
  )
}

export default ProfessorRating