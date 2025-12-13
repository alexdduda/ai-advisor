import axios from 'axios'
import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance with configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
    } catch (error) {
      console.error('Error getting session for API request:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
      return Promise.reject({
        message: 'Unable to connect to server. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      })
    }

    // Handle 401 Unauthorized - refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError || !session) {
          // Refresh failed, sign out user
          await supabase.auth.signOut()
          window.location.href = '/'
          return Promise.reject(error)
        }
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        await supabase.auth.signOut()
        window.location.href = '/'
        return Promise.reject(error)
      }
    }

    // Handle specific HTTP errors
    if (error.response?.status === 429) {
      return Promise.reject({
        message: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT_EXCEEDED',
        response: error.response
      })
    }

    if (error.response?.status >= 500) {
      return Promise.reject({
        message: 'Server error. Please try again later.',
        code: 'SERVER_ERROR',
        response: error.response
      })
    }

    // Return structured error
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      response: error.response
    })
  }
)

// API methods with error handling
export const chatAPI = {
  sendMessage: async (userId, message) => {
    try {
      const response = await api.post('/chat/send', {
        user_id: userId,
        message: message,
      })
      return response.data
    } catch (error) {
      console.error('Chat API error:', error)
      throw error
    }
  },
  
  getHistory: async (userId, limit = 50) => {
    try {
      const response = await api.get(`/chat/history/${userId}`, {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('Chat history error:', error)
      throw error
    }
  },
}

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

export const usersAPI = {
  createUser: async (userData) => {
    try {
      const response = await api.post('/users/', userData)
      return response.data
    } catch (error) {
      console.error('User creation error:', error)
      throw error
    }
  },
  
  getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      console.error('Get user error:', error)
      throw error
    }
  },
  
  updateUser: async (userId, updates) => {
    try {
      const response = await api.patch(`/users/${userId}`, updates)
      return response.data
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    }
  },
}

export default api