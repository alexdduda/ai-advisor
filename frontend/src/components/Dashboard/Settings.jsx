import { useState } from 'react'
import './Settings.css'

export default function Settings({ user, profile, onUpdateSettings }) {
  const [settings, setSettings] = useState({
    // Theme
    theme: localStorage.getItem('theme') || 'light',
    
    // Notifications
    emailNotifications: JSON.parse(localStorage.getItem('emailNotifications') ?? 'true'),
    deadlineReminders: JSON.parse(localStorage.getItem('deadlineReminders') ?? 'true'),
    courseUpdates: JSON.parse(localStorage.getItem('courseUpdates') ?? 'true'),
    
    // Privacy
    profileVisibility: localStorage.getItem('profileVisibility') || 'private',
    shareProgress: JSON.parse(localStorage.getItem('shareProgress') ?? 'false'),
    
    // Preferences
    language: localStorage.getItem('language') || 'en',
    timezone: localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  const [showExportModal, setShowExportModal] = useState(false)

  // Handle theme toggle
  const handleThemeChange = (theme) => {
    setSettings(prev => ({ ...prev, theme }))
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    if (onUpdateSettings) onUpdateSettings({ theme })
  }

  // Handle notification toggles
  const handleNotificationToggle = (key) => {
    const newValue = !settings[key]
    setSettings(prev => ({ ...prev, [key]: newValue }))
    localStorage.setItem(key, JSON.stringify(newValue))
    if (onUpdateSettings) onUpdateSettings({ [key]: newValue })
  }

  // Handle privacy settings
  const handlePrivacyChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    localStorage.setItem(key, typeof value === 'boolean' ? JSON.stringify(value) : value)
    if (onUpdateSettings) onUpdateSettings({ [key]: value })
  }

  // Export user data
  const handleExportData = () => {
    const userData = {
      user: {
        email: user?.email,
        id: user?.id
      },
      profile: profile,
      settings: settings,
      exportDate: new Date().toISOString()
    }

    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mcgill-advisor-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    setShowExportModal(false)
    alert('✓ Data exported successfully!')
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2 className="settings-title">⚙️ Settings</h2>
        <p className="settings-subtitle">Customize your McGill Advisor experience</p>
      </div>

      <div className="settings-sections">
        {/* Theme Section */}
        <div className="settings-section">
          <div className="section-header">
            <span className="section-icon">🎨</span>
            <h3 className="section-title">Appearance</h3>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Theme</label>
                <p className="setting-description">Choose your preferred color scheme</p>
              </div>
              <div className="theme-toggle">
                <button
                  className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  ☀️ Light
                </button>
                <button
                  className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  🌙 Dark
                </button>
                <button
                  className={`theme-btn ${settings.theme === 'auto' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('auto')}
                >
                  🔄 Auto
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="settings-section">
          <div className="section-header">
            <span className="section-icon">🔔</span>
            <h3 className="section-title">Notifications</h3>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Email Notifications</label>
                <p className="setting-description">Receive updates via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleNotificationToggle('emailNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Deadline Reminders</label>
                <p className="setting-description">Get notified about upcoming deadlines</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.deadlineReminders}
                  onChange={() => handleNotificationToggle('deadlineReminders')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Course Updates</label>
                <p className="setting-description">Notifications about course changes</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.courseUpdates}
                  onChange={() => handleNotificationToggle('courseUpdates')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="settings-section">
          <div className="section-header">
            <span className="section-icon">🔒</span>
            <h3 className="section-title">Privacy & Data</h3>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Profile Visibility</label>
                <p className="setting-description">Who can see your profile</p>
              </div>
              <select
                className="setting-select"
                value={settings.profileVisibility}
                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
              >
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Share Academic Progress</label>
                <p className="setting-description">Allow others to view your progress</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.shareProgress}
                  onChange={() => handlePrivacyChange('shareProgress', !settings.shareProgress)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Export Your Data</label>
                <p className="setting-description">Download all your data as JSON</p>
              </div>
              <button
                className="export-btn"
                onClick={() => setShowExportModal(true)}
              >
                📥 Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="settings-section">
          <div className="section-header">
            <span className="section-icon">⚡</span>
            <h3 className="section-title">Preferences</h3>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Language</label>
                <p className="setting-description">Interface language</p>
              </div>
              <select
                className="setting-select"
                value={settings.language}
                onChange={(e) => handlePrivacyChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Timezone</label>
                <p className="setting-description">Your local timezone</p>
              </div>
              <select
                className="setting-select"
                value={settings.timezone}
                onChange={(e) => handlePrivacyChange('timezone', e.target.value)}
              >
                <option value="America/Toronto">Eastern Time (Toronto)</option>
                <option value="America/Montreal">Eastern Time (Montreal)</option>
                <option value="America/Vancouver">Pacific Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Export Confirmation Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Export Your Data</h3>
            <p className="modal-text">
              This will download all your profile data, courses, and settings as a JSON file. 
              You can use this for backup or to transfer your data.
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
              <button className="modal-btn confirm-btn" onClick={handleExportData}>
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
