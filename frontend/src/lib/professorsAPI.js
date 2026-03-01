import api from './api'

/**
 * professorsAPI — Rate My Professors lookup helpers
 */

const professorsAPI = {
  /** Look up RMP data for a professor by name (from syllabus). */
  getRmpByName: async (name, subject = null) => {
    try {
      const params = { name }
      if (subject) params.subject = subject
      const response = await api.get('/professors/rmp', { params })
      return response.data
    } catch (error) {
      console.error('RMP by-name lookup error:', error)
      return { found: false, professor: null, match_score: 0 }
    }
  },

  /** Return instructors with RMP data who have taught a specific course. */
  getRmpByCourse: async (subject, catalog) => {
    try {
      const response = await api.get('/professors/rmp-by-course', {
        params: { subject, catalog },
      })
      return response.data
    } catch (error) {
      console.error('RMP by-course lookup error:', error)
      return { professors: [], count: 0 }
    }
  },

  /**
   * Bulk RMP lookup for an array of course codes.
   * Returns { ratings: { "ECON 208": rmpData, ... } }
   * Used by DegreeRequirementsView to load an entire block at once.
   * @param {string[]} codes — e.g. ["ECON208", "COMP251"]
   */
  getRmpBulk: async (codes) => {
    if (!codes || !codes.length) return { ratings: {} }
    try {
      const response = await api.post('/professors/rmp-bulk', { codes })
      return response.data
    } catch (error) {
      console.error('RMP bulk lookup error:', error)
      return { ratings: {} }
    }
  },

  /** Search professors by name (autocomplete). */
  searchProfessors: async (q, subject = null, limit = 10) => {
    try {
      const params = { q, limit }
      if (subject) params.subject = subject
      const response = await api.get('/professors/search', { params })
      return response.data
    } catch (error) {
      console.error('Professor search error:', error)
      return { professors: [], count: 0 }
    }
  },
}

export default professorsAPI

export function rmpRatingClass(rating) {
  if (!rating) return 'unknown'
  if (rating >= 4.0) return 'excellent'
  if (rating >= 3.5) return 'good'
  if (rating >= 3.0) return 'average'
  return 'poor'
}

export function rmpSearchUrl(name) {
  return `https://www.ratemyprofessors.com/search/professors/1439?q=${encodeURIComponent(name)}`
}
