import api from './api'

/**
 * Professor ratings API methods
 */
export const professorsAPI = {
  /**
   * Search for a professor on RateMyProfessor
   * @param {string} name - Professor name
   * @returns {Promise<Object>} Professor rating data
   */
  search: async (name) => {
    try {
      const response = await api.get('/professors/search', {
        params: { name }
      })
      return response.data
    } catch (error) {
      console.error('Professor search error:', error)
      throw error
    }
  },

  /**
   * Get professor details by RMP ID
   * @param {string} professorId - RateMyProfessor ID
   * @returns {Promise<Object>} Professor details
   */
  getById: async (professorId) => {
    try {
      const response = await api.get(`/professors/${professorId}`)
      return response.data
    } catch (error) {
      console.error('Get professor error:', error)
      throw error
    }
  },
}

/**
 * Updated courses API with professor ratings support
 */
export const coursesAPI = {
  search: async (query = '', subject = null, limit = 50, includeRatings = false) => {
    try {
      const params = {}
      if (query) params.query = query
      if (subject) params.subject = subject
      params.limit = limit
      params.include_ratings = includeRatings
      
      const response = await api.get('/courses/search', { params })
      return response.data
    } catch (error) {
      console.error('Course search error:', error)
      throw error
    }
  },
  
  getDetails: async (subject, catalog, includeRatings = true) => {
    try {
      const response = await api.get(`/courses/${subject}/${catalog}`, {
        params: { include_ratings: includeRatings }
      })
      return response.data
    } catch (error) {
      console.error('Course details error:', error)
      throw error
    }
  },
  
  getSubjects: async () => {
    try {
      const response = await api.get('/courses/subjects')
      return response.data
    } catch (error) {
      console.error('Subjects error:', error)
      throw error
    }
  },
}

export default { professorsAPI, coursesAPI }