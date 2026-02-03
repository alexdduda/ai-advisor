import api from './api'

/**
 * Updated courses API with professor ratings support
 */
export const coursesAPI = {
  search: async (query = '', subject = null, limit = 50) => {
    try {
      const params = {}
      if (query) params.query = query
      if (subject) params.subject = subject
      params.limit = limit
      
      const response = await api.get('/courses/search', { params })
      return response.data
    } catch (error) {
      console.error('Course search error:', error)
      throw error
    }
  },
  
  getDetails: async (subject, catalog) => {
    try {
      const response = await api.get(`/courses/${subject}/${catalog}`)
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

export default coursesAPI