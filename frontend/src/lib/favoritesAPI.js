// Frontend API client for favorites

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

export const favoritesAPI = {
  // Get all favorites for a user
  async getFavorites(userId) {
    const response = await fetch(`${BASE_URL}/api/favorites/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }

    return response.json();
  },

  // Add a course to favorites
  async addFavorite(userId, courseData) {
    const response = await fetch(`${BASE_URL}/api/favorites/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course_code: courseData.course_code,
        course_title: courseData.course_title,
        subject: courseData.subject,
        catalog: courseData.catalog,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add favorite');
    }

    return response.json();
  },

  // Remove a course from favorites
  async removeFavorite(userId, courseCode) {
    const response = await fetch(`${BASE_URL}/api/favorites/${userId}/${courseCode}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to remove favorite');
    }

    return response.json();
  },

  // Check if a course is favorited
  async checkFavorite(userId, courseCode) {
    const response = await fetch(`${BASE_URL}/api/favorites/${userId}/check/${courseCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { is_favorited: false };
    }

    return response.json();
  },
};

export default favoritesAPI;