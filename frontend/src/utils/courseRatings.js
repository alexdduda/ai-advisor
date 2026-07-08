/**
 * Shared course/professor rating helpers.
 *
 * Single source of truth for the rating-color ramp and rating-precedence
 * logic previously duplicated between CoursesTab.jsx and
 * shared/CourseDetailModal.jsx. Colors come from theme.css tokens
 * (--rating-*) so they adapt to light/dark.
 */

export const getRatingColor = (rating) => {
  if (!rating) return undefined
  if (rating >= 4.0) return 'var(--rating-great)'
  if (rating >= 3.5) return 'var(--rating-good)'
  if (rating >= 3.0) return 'var(--rating-ok)'
  return 'var(--rating-poor)'
}

export const getDifficultyColor = (difficulty) => {
  if (!difficulty) return undefined
  if (difficulty <= 2.0) return 'var(--rating-great)'
  if (difficulty <= 3.0) return 'var(--rating-good)'
  if (difficulty <= 4.0) return 'var(--rating-ok)'
  return 'var(--rating-poor)'
}

/** Display rating precedence: blended > RateMyProfessors > mcgill.courses. */
export const getBestRating = (course) =>
  course?.blended_rating ?? course?.rmp_rating ?? course?.mc_rating ?? null

/** Combined review count across both rating sources, or null if none. */
export const getTotalReviews = (course) => {
  if (!course) return null
  const total = (course.rmp_num_ratings ?? 0) + (course.mc_num_ratings ?? 0)
  return total > 0 ? total : null
}
