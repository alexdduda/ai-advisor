import { useState } from 'react'
import { FaCog, FaPalette, FaBell, FaLock, FaBolt, FaSun, FaMoon, FaSyncAlt, FaDownload } from 'react-icons/fa'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import './Settings.css'

export default function Settings({ user, profile, onUpdateSettings }) {
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  
  const [settings, setSettings] = useState({
    // Theme
    theme: theme || 'light',
    
    // Notifications
    emailNotifications: JSON.parse(localStorage.getItem('emailNotifications') ?? 'true'),
    deadlineReminders: JSON.parse(localStorage.getItem('deadlineReminders') ?? 'true'),
    courseUpdates: JSON.parse(localStorage.getItem('courseUpdates') ?? 'true'),
    
    // Privacy
    profileVisibility: localStorage.getItem('profileVisibility') || 'private',
    shareProgress: JSON.parse(localStorage.getItem('shareProgress') ?? 'false'),
    
    // Preferences
    language: language || 'en',
    timezone: localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  const [showExportModal, setShowExportModal] = useState(false)

  // Handle theme toggle
  const handleThemeChange = (newTheme) => {
    setSettings(prev => ({ ...prev, theme: newTheme }))
    setTheme(newTheme)
    if (onUpdateSettings) onUpdateSettings({ theme: newTheme })
  }

  // Handle language change
  const handleLanguageChange = (newLang) => {
    setSettings(prev => ({ ...prev, language: newLang }))
    setLanguage(newLang)
    if (onUpdateSettings) onUpdateSettings({ language: newLang })
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
    alert(t('settings.dataExported'))
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2 className="settings-title"><FaCog className="settings-title-icon" /> {t('settings.title')}</h2>
        <p className="settings-subtitle">{t('settings.subtitle')}</p>
      </div>

      <div className="settings-sections">
        {/* Theme Section */}
        <div className="settings-section">
          <div className="section-header">
            <span className="section-icon"><FaPalette /></span>
            <h3 className="section-title">{t('settings.appearance')}</h3>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">{t('settings.theme')}</label>
                <p className="setting-description">{t('settings.themeDescription')}</p>
              </div>
              <div className="theme-toggle">
                <button
                  className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  <FaSun className="theme-btn-icon" /> {t('settings.light')}
                </button>
                <button
                  className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <FaMoon className="theme-btn-icon" /> {t('settings.dark')}
                </button>
                <button
                  className={`theme-btn ${settings.theme === 'auto' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('auto')}
                >
                  <FaSyncAlt className="theme-btn-icon" /> {t('settings.auto')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="settings-section">
          <div className="section-header">
            <span className="section-icon"><FaBell /></span>
            <h3 className="section-title">{t('settings.notifications')}</h3>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">{t('settings.emailNotifications')}</label>
                <p className="setting-description">{t('settings.emailNotificationsDesc')}</p>
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
                <label className="setting-label">{t('settings.deadlineReminders')}</label>
                <p className="setting-description">{t('settings.deadlineRemindersDesc')}</p>
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
                <label className="setting-label">{t('settings.courseUpdates')}</label>
                <p className="setting-description">{t('settings.courseUpdatesDesc')}</p>
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
            <span className="section-icon"><FaLock /></span>
            <h3 className="section-title">{t('settings.privacyData')}</h3>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">{t('settings.profileVisibility')}</label>
                <p className="setting-description">{t('settings.profileVisibilityDesc')}</p>
              </div>
              <select
                className="setting-select"
                value={settings.profileVisibility}
                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
              >
                <option value="private">{t('settings.private')}</option>
                <option value="friends">{t('settings.friendsOnly')}</option>
                <option value="public">{t('settings.public')}</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">{t('settings.shareProgress')}</label>
                <p className="setting-description">{t('settings.shareProgressDesc')}</p>
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
                <label className="setting-label">{t('settings.exportYourData')}</label>
                <p className="setting-description">{t('settings.exportDataDesc')}</p>
              </div>
              <button
                className="export-btn"
                onClick={() => setShowExportModal(true)}
              >
                <FaDownload className="export-btn-icon" /> {t('settings.exportData')}
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="settings-section">
          <div className="section-header">
            <span className="section-icon"><FaBolt /></span>
            <h3 className="section-title">{t('settings.preferences')}</h3>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">{t('settings.language')}</label>
                <p className="setting-description">{t('settings.languageDesc')}</p>
              </div>
              <select
                className="setting-select"
                value={settings.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                <option value="en">{t('common.english')}</option>
                <option value="fr">{t('common.french')}</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">{t('settings.timezone')}</label>
                <p className="setting-description">{t('settings.timezoneDesc')}</p>
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
            <h3 className="modal-title">{t('settings.exportYourData')}</h3>
            <p className="modal-text">
              {t('settings.exportModalText')}
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => setShowExportModal(false)}>
                {t('common.cancel')}
              </button>
              <button className="modal-btn confirm-btn" onClick={handleExportData}>
                {t('settings.downloadJson')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
