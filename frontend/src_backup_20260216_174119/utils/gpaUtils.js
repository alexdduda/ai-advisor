/**
 * Convert a numeric GPA (0–4.0) to its letter-grade equivalent.
 * Returns an empty string when the input is falsy.
 */
export function gpaToLetterGrade(gpa) {
  if (!gpa) return ''
  const n = parseFloat(gpa)
  if (n >= 3.85) return 'A'
  if (n >= 3.7)  return 'A-'
  if (n >= 3.3)  return 'B+'
  if (n >= 3.0)  return 'B'
  if (n >= 2.7)  return 'B-'
  if (n >= 2.3)  return 'C+'
  if (n >= 2.0)  return 'C'
  if (n >= 1.0)  return 'D'
  return 'F'
}
