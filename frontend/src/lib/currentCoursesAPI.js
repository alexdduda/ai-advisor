// Frontend API client for current courses
import { BASE_URL } from './apiConfig'

export const currentCoursesAPI = {
  async getCurrent(userId) {
    const response = await fetch(`${BASE_URL}/api/current/${userId}`)
    if (!response.ok) throw new Error('Failed to fetch current courses')
    return response.json()
  },

  async addCurrent(userId, courseData) {
    const response = await fetch(`${BASE_URL}/api/current/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_code: courseData.course_code,
        course_title: courseData.course_title,
        subject: courseData.subject,
        catalog: courseData.catalog,
        credits: courseData.credits || 3,
      }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to add current course')
    }
    return response.json()
  },

  async removeCurrent(userId, courseCode) {
    const response = await fetch(`${BASE_URL}/api/current/${userId}/${encodeURIComponent(courseCode)}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to remove current course')
    return response.json()
  },
}

export default currentCoursesAPI