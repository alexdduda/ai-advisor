import React from 'react'
import { FaStar, FaExternalLinkAlt, FaGraduationCap } from 'react-icons/fa'
import { MdOutlineRateReview, MdSchool } from 'react-icons/md'
import { HiOutlineAcademicCap } from 'react-icons/hi'
import './ProfessorRating.css'

/**
 * ProfessorRating — shows blended RMP + mcgill.courses ratings.
 *
 * Backwards-compatible: if only rmp_rating is present (scraper not yet run),
 * renders exactly as before. Once blended_rating / mc_rating are available,
 * shows the full dual-source breakdown.
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
    name,
    avg_rating,
    blended_rating,
    rmp_rating,
    rmp_difficulty,
    rmp_num_ratings,
    rmp_would_take_again,
    rmp_url,
    mc_rating,
    mc_num_ratings,
    mc_url,
    rating_source,
    department,
  } = rating

  const displayRating = blended_rating ?? avg_rating ?? rmp_rating ?? mc_rating
  const hasBlended    = blended_rating != null && rating_source === 'both'

  const getRatingClass = (r) => {
    if (r == null) return 'unknown'
    if (r >= 4.0) return 'excellent'
    if (r >= 3.5) return 'good'
    if (r >= 3.0) return 'average'
    return 'poor'
  }

  const ratingClass = getRatingClass(displayRating)

  return (
    <div className={`professor-rating rating-${ratingClass}`}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="professor-header">
        <div className="professor-name">
          <HiOutlineAcademicCap className="professor-name-icon" />
          {first_name || last_name
            ? `${first_name || ''} ${last_name || ''}`.trim()
            : name || 'Instructor'}
        </div>
        {department && <div className="professor-department">{department}</div>}
      </div>

      {/* ── Main stats ─────────────────────────────────────────────────── */}
      <div className="rating-stats">
        <div className="rating-stat">
          <div className="stat-label">
            {hasBlended ? 'Blended Rating' : 'Quality'}
          </div>
          <div className={`stat-value stat-quality-${ratingClass}`}>
            {displayRating != null ? Number(displayRating).toFixed(1) : 'N/A'}
            <span className="stat-max">/5.0</span>
          </div>
          {hasBlended && <div className="stat-sublabel">weighted avg</div>}
        </div>

        {rmp_difficulty != null && (
          <div className="rating-stat">
            <div className="stat-label">Difficulty</div>
            <div className="stat-value">
              {Number(rmp_difficulty).toFixed(1)}
              <span className="stat-max">/5.0</span>
            </div>
          </div>
        )}

        {rmp_would_take_again != null && (
          <div className="rating-stat">
            <div className="stat-label">Would Retake</div>
            <div className="stat-value stat-percent">
              {Math.round(rmp_would_take_again)}%
            </div>
          </div>
        )}
      </div>

      {/* ── Source breakdown (only when both sources present) ──────────── */}
      {hasBlended && (
        <div className="rating-sources">
          <div className="rating-sources-label">Rating sources</div>
          <div className="rating-sources-row">
            {rmp_rating != null && (
              <a
                href={rmp_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`source-badge source-rmp rating-${getRatingClass(rmp_rating)}`}
              >
                <FaStar className="source-icon" />
                <span className="source-name">RateMyProf</span>
                <span className="source-score">{Number(rmp_rating).toFixed(1)}</span>
                <span className="source-count">({rmp_num_ratings ?? 0})</span>
              </a>
            )}
            {mc_rating != null && (
              <a
                href={mc_url || 'https://mcgill.courses'}
                target="_blank"
                rel="noopener noreferrer"
                className={`source-badge source-mc rating-${getRatingClass(mc_rating)}`}
              >
                <MdSchool className="source-icon" />
                <span className="source-name">mcgill.courses</span>
                <span className="source-score">{Number(mc_rating).toFixed(1)}</span>
                <span className="source-count">({mc_num_ratings ?? 0})</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="rating-footer">
        <div className="rating-count">
          <MdOutlineRateReview className="footer-icon" />
          {hasBlended
            ? `${(rmp_num_ratings ?? 0) + (mc_num_ratings ?? 0)} total reviews`
            : `${rmp_num_ratings ?? mc_num_ratings ?? 0} review${
                (rmp_num_ratings ?? mc_num_ratings ?? 0) !== 1 ? 's' : ''
              }`
          }
        </div>
        <div className="rating-footer-links">
          {rmp_url && (
            <a href={rmp_url} target="_blank" rel="noopener noreferrer" className="rmp-link">
              RMP <FaExternalLinkAlt className="link-icon" />
            </a>
          )}
          {mc_url && mc_rating != null && (
            <a href={mc_url} target="_blank" rel="noopener noreferrer" className="rmp-link mc-link">
              mcgill.courses <FaExternalLinkAlt className="link-icon" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Compact version for course lists — shows blended if available, else RMP.
 */
export const ProfessorRatingCompact = ({ rating }) => {
  if (!rating) {
    return <span className="rating-compact-unavailable">No ratings</span>
  }

  const { avg_rating, blended_rating, rmp_num_ratings, mc_num_ratings, rating_source } = rating
  const display = blended_rating ?? avg_rating
  const total   = (rmp_num_ratings ?? 0) + (mc_num_ratings ?? 0)
  const isBlended = rating_source === 'both' && blended_rating != null

  const getRatingClass = (r) => {
    if (r == null) return 'unknown'
    if (r >= 4.0) return 'excellent'
    if (r >= 3.5) return 'good'
    if (r >= 3.0) return 'average'
    return 'poor'
  }

  return (
    <span className={`rating-compact rating-${getRatingClass(display)}`}>
      <FaStar className="compact-star" />
      {display != null ? Number(display).toFixed(1) : 'N/A'}
      {isBlended && (
        <span className="rating-blended-badge" title="Blended from 2 sources">
          <MdSchool className="blended-icon" />
        </span>
      )}
      <span className="rating-count-compact">({total})</span>
    </span>
  )
}

export default ProfessorRating