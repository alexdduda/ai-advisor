import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './ProfilePanel.css'

export default function ProfilePanel() {
  const { user, profile, updateProfile } = useAuth()

  const [editing,     setEditing]     = useState(false)
  const [profileForm, setProfileForm] = useState({ major: '', year: '', interests: '', current_gpa: '' })

  // ── helpers ───────────────────────────────────────────────────────
  const openEditor = () => {
    setProfileForm({
      major:       profile?.major       || '',
      year:        profile?.year        || '',
      interests:   profile?.interests   || '',
      current_gpa: profile?.current_gpa || ''
    })
    setEditing(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const updates = {}
      if (profileForm.major?.trim())      updates.major       = profileForm.major.trim()
      if (profileForm.year)               updates.year        = parseInt(profileForm.year)
      if (profileForm.interests?.trim())  updates.interests   = profileForm.interests.trim()
      if (profileForm.current_gpa) {
        const gpa = parseFloat(profileForm.current_gpa)
        if (!isNaN(gpa) && gpa >= 0 && gpa <= 4) updates.current_gpa = gpa
      }
      if (Object.keys(updates).length) await updateProfile(updates)
    } catch (err) {
      console.error('Error updating profile:', err)
      alert('Failed to update profile. Please try again.')
    } finally {
      setEditing(false)
    }
  }

  const field = (key) => ({
    value:    profileForm[key],
    onChange: (e) => setProfileForm(prev => ({ ...prev, [key]: e.target.value }))
  })

  // ── render ────────────────────────────────────────────────────────
  return (
    <div className="profile-page">
      {/* Hero */}
      <div className="profile-page-header">
        <div className="profile-hero">
          <div className="profile-avatar-section">
            <div className="profile-avatar-xl">{user?.email?.[0].toUpperCase()}</div>
            <div className="profile-hero-info">
              <h1 className="profile-display-name">{profile?.username || 'McGill Student'}</h1>
              <p className="profile-email">{user?.email}</p>
              <div className="profile-badges">
                <span className="badge badge-year">
                  {profile?.year ? `Year ${profile.year}` : 'Year not set'}
                </span>
                {profile?.major && <span className="badge badge-major">{profile.major}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="profile-content">
        <div className="profile-grid">

          {/* ── Personal Information ── */}
          <div className="profile-section-card">
            <div className="card-header">
              <div className="card-title-group">
                <span className="card-icon">👤</span>
                <h2 className="card-title">Personal Information</h2>
              </div>
              {!editing && (
                <button className="btn-icon-edit" onClick={openEditor} title="Edit Profile">✏️</button>
              )}
            </div>

            <div className="card-content">
              {!editing ? (
                <div className="info-grid">
                  <InfoItem icon="🎓" label="Major"         value={profile?.major || 'Not specified'} />
                  <InfoItem icon="📅" label="Academic Year" value={profile?.year ? `U${profile.year}` : 'Not specified'} />
                  <InfoItem icon="📧" label="Email"         value={user?.email} />
                  <InfoItem icon="👤" label="Username"      value={profile?.username || 'Not set'} />
                </div>
              ) : (
                <form className="edit-form" onSubmit={handleUpdate}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Major</label>
                      <input type="text" className="form-input" placeholder="e.g., Computer Science" {...field('major')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Year</label>
                      <select className="form-input" {...field('year')}>
                        <option value="">Select year</option>
                        <option value="1">U1</option>
                        <option value="2">U2</option>
                        <option value="3">U3</option>
                        <option value="4">U4</option>
                        <option value="5">U5+</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions-inline">
                    <button type="submit" className="btn btn-primary-sm">💾 Save Changes</button>
                    <button type="button" className="btn btn-secondary-sm" onClick={() => setEditing(false)}>✕ Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ── Academic Performance ── */}
          <div className="profile-section-card">
            <div className="card-header">
              <div className="card-title-group">
                <span className="card-icon">📊</span>
                <h2 className="card-title">Academic Performance</h2>
              </div>
            </div>
            <div className="card-content">
              <div className="stat-showcase">
                <div className="stat-item">
                  <div className="stat-value-large">{profile?.current_gpa || '--'}</div>
                  <div className="stat-label">Current GPA</div>
                </div>
              </div>
              {editing && (
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Update GPA</label>
                  <input type="number" step="0.01" min="0" max="4.0" className="form-input"
                    placeholder="e.g., 3.75" {...field('current_gpa')} />
                </div>
              )}
              <div className="performance-tips">
                <div className="tip-item">
                  <span className="tip-icon">💡</span>
                  <p className="tip-text">Keep your GPA updated for better course recommendations</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Interests & Preferences ── */}
          <div className="profile-section-card card-full-width">
            <div className="card-header">
              <div className="card-title-group">
                <span className="card-icon">✨</span>
                <h2 className="card-title">Interests &amp; Preferences</h2>
              </div>
            </div>
            <div className="card-content">
              {!editing ? (
                <div className="interests-display">
                  {profile?.interests ? (
                    <div className="interests-tags">
                      {profile.interests.split(',').map((interest, i) => (
                        <span key={i} className="interest-tag">{interest.trim()}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">
                      <span className="empty-icon">🎯</span>
                      <span>No interests added yet. Add your academic interests to get personalised recommendations!</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Your Interests</label>
                  <textarea className="form-input" rows="4"
                    placeholder="e.g., Machine Learning, Web Development, Data Science, Finance (comma-separated)"
                    {...field('interests')} />
                  <p className="form-hint">Separate multiple interests with commas</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Account Settings ── */}
          <div className="profile-section-card card-full-width">
            <div className="card-header">
              <div className="card-title-group">
                <span className="card-icon">⚙️</span>
                <h2 className="card-title">Account Settings</h2>
              </div>
            </div>
            <div className="card-content">
              <div className="settings-grid">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3 className="setting-title">Account Status</h3>
                    <p className="setting-description">Your account is active and verified</p>
                  </div>
                  <span className="status-badge status-active">Active</span>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h3 className="setting-title">Member Since</h3>
                    <p className="setting-description">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'Recently joined'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── tiny presentational helper (avoids repeating the same 7-line block 4×) ── */
function InfoItem({ icon, label, value }) {
  return (
    <div className="info-item">
      <span className="info-icon">{icon}</span>
      <div className="info-details">
        <span className="info-label">{label}</span>
        <span className="info-value">{value}</span>
      </div>
    </div>
  )
}
