import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { usersAPI } from '../../lib/api'
import { validateUsername } from '../../utils/validation'
import './ProfileSetup.css'

function ProfileSetup() {
  const { user, clearError } = useAuth()
  const [username, setUsername] = useState('')
  const [major, setMajor] = useState('')
  const [year, setYear] = useState('')
  const [interests, setInterests] = useState('')
  const [currentGpa, setCurrentGpa] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate username if provided
    if (username.trim()) {
      const usernameError = validateUsername(username)
      if (usernameError) {
        setError(usernameError)
        return
      }
    }

    // Validate GPA if provided
    if (currentGpa) {
      const gpa = parseFloat(currentGpa)
      if (isNaN(gpa) || gpa < 0 || gpa > 4) {
        setError('GPA must be between 0.0 and 4.0')
        return
      }
    }

    setLoading(true)

    try {
      // Build profile data - only include fields that are filled
      const profileData = {
        id: user.id,
        email: user.email,
      }

      if (username.trim()) profileData.username = username.trim()
      if (major.trim()) profileData.major = major.trim()
      if (year) profileData.year = parseInt(year)
      if (interests.trim()) profileData.interests = interests.trim()
      if (currentGpa) profileData.current_gpa = parseFloat(currentGpa)

      // Try to create the profile
      try {
        await usersAPI.createUser(profileData)
        console.log('Profile created successfully')
      } catch (createError) {
        console.error('Create error:', createError)
        
        // If user already exists (409 conflict), try updating instead
        if (createError.response?.status === 409 || 
            createError.code === 'USER_ALREADY_EXISTS') {
          
          console.log('Profile exists, updating instead...')
          
          // Build update data (exclude id and email)
          const updateData = {}
          if (username.trim()) updateData.username = username.trim()
          if (major.trim()) updateData.major = major.trim()
          if (year) updateData.year = parseInt(year)
          if (interests.trim()) updateData.interests = interests.trim()
          if (currentGpa) updateData.current_gpa = parseFloat(currentGpa)
          
          // Update the existing profile
          await usersAPI.updateUser(user.id, updateData)
          console.log('Profile updated successfully')
        } else {
          // Some other error, rethrow it
          throw createError
        }
      }

      // Success! Clear errors and reload to fetch the profile
      clearError()
      window.location.reload()
      
    } catch (err) {
      console.error('Profile setup error:', err)
      
      // Get a friendly error message
      let errorMessage = 'Failed to set up profile. Please try again.'
      
      if (err.message) {
        errorMessage = err.message
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    // Create minimal profile (just id and email)
    setLoading(true)
    
    usersAPI.createUser({
      id: user.id,
      email: user.email,
    })
    .then(() => {
      clearError()
      window.location.reload()
    })
    .catch((err) => {
      console.error('Skip error:', err)
      // If profile exists, just reload anyway
      if (err.response?.status === 409) {
        window.location.reload()
      } else {
        setError('Failed to skip setup. Please try again.')
        setLoading(false)
      }
    })
  }

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-container">
        <div className="setup-header">
          <h1>Complete Your Profile</h1>
          <p>Let's set up your academic profile to get personalized recommendations</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username <span className="optional">(optional)</span>
            </label>
            <input
              id="username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="major" className="form-label">
              Major <span className="optional">(optional)</span>
            </label>
            <input
              id="major"
              type="text"
              placeholder="e.g., Computer Science"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="form-input"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="year" className="form-label">
              Year <span className="optional">(optional)</span>
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="form-input"
              disabled={loading}
            >
              <option value="">Select year</option>
              <option value="1">U0/U1</option>
              <option value="2">U2</option>
              <option value="3">U3</option>
              <option value="4">U4+</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="interests" className="form-label">
              Interests <span className="optional">(optional)</span>
            </label>
            <textarea
              id="interests"
              placeholder="e.g., Machine Learning, Web Development, Data Science"
              rows="3"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gpa" className="form-label">
              Current GPA <span className="optional">(optional)</span>
            </label>
            <input
              id="gpa"
              type="number"
              step="0.01"
              min="0"
              max="4"
              placeholder="e.g., 3.5"
              value={currentGpa}
              onChange={(e) => setCurrentGpa(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Setting up...
                </span>
              ) : (
                'Complete Setup'
              )}
            </button>

            <button 
              type="button"
              onClick={handleSkip}
              className="btn btn-secondary"
              disabled={loading}
            >
              Skip for Now
            </button>
          </div>

          <p className="skip-note">
            You can update your profile anytime from the dashboard.
          </p>
        </form>
      </div>
    </div>
  )
}

export default ProfileSetup