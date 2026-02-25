// Frontend API client for favorites
import { BASE_URL } from './apiConfig'

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