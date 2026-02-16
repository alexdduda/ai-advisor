import { useState, useEffect } from 'react'
import { FaEdit, FaChevronDown, FaChevronUp, FaCheck, FaUser, FaEnvelope, FaGraduationCap } from 'react-icons/fa'
import { HiMiniSparkles } from "react-icons/hi2";
import EnhancedProfileForm from './EnhancedProfileForm'
import './PersonalInfoCard.css'

export default function PersonalInfoCard({ profile, user, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    academic: true,
    contact: true,
    additional: false
  })

  // Log profile changes
  useEffect(() => {
    console.log('PersonalInfoCard: Profile prop changed:', JSON.stringify(profile, null, 2))
  }, [profile])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Calculate profile completeness
  const calculateCompleteness = () => {
    const fields = [
      'username', 'major', 'year', 'faculty', 
      'interests', 'concentration'
    ]
    const completed = fields.filter(field => profile?.[field]).length
    return Math.round((completed / fields.length) * 100)
  }

  const completeness = calculateCompleteness()

  return (
    <div className="personal-info-card">
      {/* Card Header */}
      <div className="card-header-modern">
        <div className="header-left">
          <div className="header-icon-wrapper">
            <span className="header-icon"><FaUser /></span>
          </div>
          <div className="header-text">
            <h2 className="card-title-modern">Personal Information</h2>
            <p className="card-subtitle">Manage your profile details</p>
          </div>
        </div>
        
        <div className="header-right">
          {!isEditing && (
            <button 
              className="btn-edit-modern"
              onClick={() => setIsEditing(true)}
              title="Edit Profile"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Completeness Bar */}
      <div className="completeness-section">
        <div className="completeness-header">
          <span className="completeness-label">Profile Completeness</span>
          <span className="completeness-percentage">{completeness}%</span>
        </div>
        <div className="completeness-bar">
          <div 
            className="completeness-fill"
            style={{ 
              width: `${completeness}%`,
              background: completeness === 100 
                ? 'linear-gradient(90deg, #10b981, #059669)' 
                : 'linear-gradient(90deg, #ED1B2F, #c91625)'
            }}
          />
        </div>
        {completeness < 100 && (
          <p className="completeness-hint">
            Complete your profile to get better course recommendations
          </p>
        )}
      </div>

      {/* Main Content */}
      {!isEditing ? (
        <div className="info-sections">
          {/* Academic Information Section */}
          <div className="info-section">
            <button 
              className="section-header"
              onClick={() => toggleSection('academic')}
            >
              <div className="section-header-left">
                <span className="section-icon"><FaGraduationCap /></span>
                <h3 className="section-title">Academic Information</h3>
              </div>
              {expandedSections.academic ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {expandedSections.academic && (
              <div className="section-content">
                <div className="info-grid-modern">
                  {/* Major */}
                  <div className="info-field">
                    <label className="field-label">Primary Major</label>
                    <div className="field-value">
                      {profile?.major || <span className="text-muted">Not specified</span>}
                    </div>
                  </div>

                  {/* Additional Majors */}
                  {profile?.other_majors && profile.other_majors.length > 0 && (
                    <div className="info-field">
                      <label className="field-label">Additional Majors</label>
                      <div className="field-tags">
                        {profile.other_majors.map((major, idx) => (
                          <span key={idx} className="tag tag-major">{major}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Minor */}
                  {profile?.minor && (
                    <div className="info-field">
                      <label className="field-label">Primary Minor</label>
                      <div className="field-value">{profile.minor}</div>
                    </div>
                  )}

                  {/* Additional Minors */}
                  {profile?.other_minors && profile.other_minors.length > 0 && (
                    <div className="info-field">
                      <label className="field-label">Additional Minors</label>
                      <div className="field-tags">
                        {profile.other_minors.map((minor, idx) => (
                          <span key={idx} className="tag tag-minor">{minor}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Concentration */}
                  {profile?.concentration && (
                    <div className="info-field">
                      <label className="field-label">Concentration</label>
                      <div className="field-value">{profile.concentration}</div>
                    </div>
                  )}

                  {/* Faculty */}
                  <div className="info-field">
                    <label className="field-label">Faculty</label>
                    <div className="field-value">
                      {profile?.faculty || <span className="text-muted">Not specified</span>}
                    </div>
                  </div>

                  {/* Year */}
                  <div className="info-field">
                    <label className="field-label">Academic Year</label>
                    <div className="field-value">
                      {profile?.year ? (
                        <span className="year-badge">U{profile.year}</span>
                      ) : (
                        <span className="text-muted">Not specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Information Section */}
          <div className="info-section">
            <button 
              className="section-header"
              onClick={() => toggleSection('contact')}
            >
              <div className="section-header-left">
                <span className="section-icon"><FaEnvelope /></span>
                <h3 className="section-title">Contact Information</h3>
              </div>
              {expandedSections.contact ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {expandedSections.contact && (
              <div className="section-content">
                <div className="info-grid-modern">
                  <div className="info-field">
                    <label className="field-label">Username</label>
                    <div className="field-value">
                      {profile?.username || <span className="text-muted">Not set</span>}
                    </div>
                  </div>

                  <div className="info-field">
                    <label className="field-label">Email Address</label>
                    <div className="field-value email-value">
                      {user?.email}
                      <span className="verified-badge">
                        <FaCheck /> Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Information Section */}
          <div className="info-section">
            <button 
              className="section-header"
              onClick={() => toggleSection('additional')}
            >
              <div className="section-header-left">
                <span className="section-icon"><HiMiniSparkles /></span>
                <h3 className="section-title">Additional Information</h3>
              </div>
              {expandedSections.additional ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {expandedSections.additional && (
              <div className="section-content">
                <div className="info-grid-modern">
                  {/* Interests */}
                  <div className="info-field full-width">
                    <label className="field-label">Academic Interests</label>
                    {profile?.interests ? (
                      <div className="field-tags">
                        {profile.interests.split(',').map((interest, idx) => (
                          <span key={idx} className="tag tag-interest">
                            {interest.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="field-value">
                        <span className="text-muted">No interests added</span>
                      </div>
                    )}
                  </div>

                  {/* Advanced Standing */}
                  {profile?.advanced_standing && profile.advanced_standing.length > 0 && (
                    <div className="info-field full-width">
                      <label className="field-label">
                        Advanced Standing 
                        <span className="credits-badge">
                          {profile.advanced_standing.reduce((sum, c) => sum + (c.credits || 0), 0)} credits
                        </span>
                      </label>
                      <div className="advanced-standing-list">
                        {profile.advanced_standing.map((course, idx) => (
                          <div key={idx} className="advanced-course-item">
                            <span className="course-code-badge">{course.course_code}</span>
                            <span className="course-credits">{course.credits} cr</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="edit-mode-container">
          <EnhancedProfileForm
            profile={profile}
            onSave={async (formData) => {
              try {
                console.log('PersonalInfoCard: Saving form data:', formData)
                const result = await onUpdateProfile(formData)
                console.log('PersonalInfoCard: Update result:', result)
                console.log('PersonalInfoCard: Updated user data:', result?.data)
                
                // Force a small delay to ensure state updates
                await new Promise(resolve => setTimeout(resolve, 100))
                
                setIsEditing(false)
                // Success - alert removed to prevent loop
              } catch (error) {
                console.error('Error updating profile:', error)
                alert('Failed to update profile: ' + (error.message || 'Unknown error'))
              }
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}
    </div>
  )
}
