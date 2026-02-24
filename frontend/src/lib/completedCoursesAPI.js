// Frontend API client for completed courses

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Remove trailing slash and /api if present to normalize
const normalizeUrl = (url) => {
  let normalized = url.replace(/\/$/, ''); // Remove trailing slash
  if (normalized.endsWith('/api')) {
    normalized = normalized.slice(0, -4); // Remove /api suffix
  }
  return normalized;
};

const BASE_URL = normalizeUrl(API_URL);

export const completedCoursesAPI = {
  // Get all completed courses for a user
  async getCompleted(userId) {
    const response = await fetch(`${BASE_URL}/api/completed/${userId}?limit=200`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch completed courses');
    }

    return response.json();
  },

  // Add a completed course
  async addCompleted(userId, courseData) {
    const response = await fetch(`${BASE_URL}/api/completed/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course_code: courseData.course_code,
        course_title: courseData.course_title,
        subject: courseData.subject,
        catalog: courseData.catalog,
        term: courseData.term,
        year: courseData.year,
        grade: courseData.grade || null,
        credits: courseData.credits || 3,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add completed course');
    }

    return response.json();
  },

  // Update a completed course (e.g., change grade)
  async updateCompleted(userId, courseCode, updates) {
    const response = await fetch(`${BASE_URL}/api/completed/${userId}/${encodeURIComponent(courseCode)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update completed course');
    }

    return response.json();
  },

  // Remove a completed course
  async removeCompleted(userId, courseCode) {
    const response = await fetch(`${BASE_URL}/api/completed/${userId}/${encodeURIComponent(courseCode)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to remove completed course');
    }

    return response.json();
  },
};

export default completedCoursesAPI;
