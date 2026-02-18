import { useState } from 'react'
import {
  FaCog, FaPalette, FaBell, FaLock, FaBolt,
  FaSun, FaMoon, FaSyncAlt, FaDownload,
  FaEnvelope, FaMobileAlt, FaGraduationCap, FaUsers, FaUser, FaCheck
} from 'react-icons/fa'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import useNotificationPrefs from '../../hooks/useNotificationPrefs'
import './Settings.css'

export default function Settings({ user, profile, onUpdateSettings }) {
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [notifPrefs, setNotifPrefs] = useNotificationPrefs(user?.email)

  const [settings, setSettings] = useState({
    theme: theme || 'light',
    emailNotifications: JSON.parse(localStorage.getItem('emailNotifications') ?? 'true'),
    deadlineReminders:  JSON.parse(localStorage.getItem('deadlineReminders')  ?? 'true'),
    courseUpdates:      JSON.parse(localStorage.getItem('courseUpdates')      ?? 'true'),
    profileVisibility:  localStorage.getItem('profileVisibility') || 'private',
    shareProgress:      JSON.parse(localStorage.getItem('shareProgress') ?? 'false'),
    language: language || 'en',
    timezone: localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  const [showExportModal, setShowExportModal] = useState(false)
  const [autoSaveFlash, setAutoSaveFlash] = useState(false)

  // Flash "Saved" indicator on any change
  const flash = () => {
    setAutoSaveFlash(true)
    setTimeout(() => setAutoSaveFlash(false), 1800)
  }

  const handleThemeChange = (v) => {
    setSettings(p => ({ ...p, theme: v }))
    setTheme(v)
    onUpdateSettings?.({ theme: v })
    flash()
  }

  const handleLanguageChange = (v) => {
    setSettings(p => ({ ...p, language: v }))
    setLanguage(v)
    onUpdateSettings?.({ language: v })
    flash()
  }

  const handleToggle = (key) => {
    const val = !settings[key]
    setSettings(p => ({ ...p, [key]: val }))
    localStorage.setItem(key, JSON.stringify(val))
    onUpdateSettings?.({ [key]: val })
    flash()
  }

  const handleSelect = (key, val) => {
    setSettings(p => ({ ...p, [key]: val }))
    localStorage.setItem(key, typeof val === 'boolean' ? JSON.stringify(val) : val)
    onUpdateSettings?.({ [key]: val })
    flash()
  }

  // Notification prefs auto-save through the hook's setNotifPrefs
  const setNotifMethod  = (v) => { setNotifPrefs(p => ({ ...p, method: v })); flash() }
  const toggleTiming    = (k) => { setNotifPrefs(p => ({ ...p, timing: { ...p.timing, [k]: !p.timing[k] } })); flash() }
  const toggleEventType = (k) => { setNotifPrefs(p => ({ ...p, eventTypes: { ...p.eventTypes, [k]: !p.eventTypes[k] } })); flash() }
  const setNotifEmail   = (v) => { setNotifPrefs(p => ({ ...p, email: v })); flash() }
  const setNotifPhone   = (v) => { setNotifPrefs(p => ({ ...p, phone: v })); flash() }

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify({ user: { email: user?.email, id: user?.id }, profile, settings, exportDate: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: `mcgill-advisor-data-${new Date().toISOString().split('T')[0]}.json` })
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    setShowExportModal(false)
    alert(t('settings.dataExported'))
  }

  const METHOD_OPTIONS = [
    { value: 'email', icon: <FaEnvelope size={16} />,  label: t('settings.notifEmail') },
    { value: 'sms',   icon: <FaMobileAlt size={16} />, label: t('settings.notifSMS') },
    { value: 'both',  icon: <span style={{ display:'flex', gap: 3 }}><FaEnvelope size={13} /><FaMobileAlt size={13} /></span>, label: t('settings.notifBoth') },
    { value: 'none',  icon: null,                      label: t('settings.notifNone') },
  ]

  const EVENT_TYPE_CFG = {
    academic: { icon: <FaGraduationCap />, color: '#ed1b2f', bg: '#fef2f2', label: t('calendar.academicDates') },
    union:    { icon: <FaUsers />,         color: '#7c3aed', bg: '#f5f3ff', label: t('calendar.unionEvents') },
    club:     { icon: <FaUsers />,         color: '#0891b2', bg: '#ecfeff', label: t('calendar.clubEvents') },
    personal: { icon: <FaUser />,          color: '#059669', bg: '#ecfdf5', label: t('calendar.personalEvents') },
  }

  return (
    <div className="settings-container">

      {/* Page header */}
      <div className="settings-header">
        <div className="settings-header-row">
          <div>
            <h2 className="settings-title">
              <FaCog className="settings-title-icon" /> {t('settings.title')}
            </h2>
            <p className="settings-subtitle">{t('settings.subtitle')}</p>
          </div>
          {autoSaveFlash && (
            <div className="settings-autosave-badge">
              <FaCheck size={10} /> {t('settings.notifSaved')}
            </div>
          )}
        </div>
      </div>

      <div className="settings-sections">

        {/* ── Appearance ── */}
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
                {[
                  { v: 'light', icon: <FaSun />,     label: t('settings.light') },
                  { v: 'dark',  icon: <FaMoon />,    label: t('settings.dark') },
                  { v: 'auto',  icon: <FaSyncAlt />, label: t('settings.auto') },
                ].map(({ v, icon, label }) => (
                  <button key={v} className={`theme-btn ${settings.theme === v ? 'active' : ''}`} onClick={() => handleThemeChange(v)}>
                    <span className="theme-btn-icon">{icon}</span> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Calendar Notification Defaults ── */}
        <div className="settings-section">
          <div className="section-header">
            <span className="section-icon"><FaBell /></span>
            <h3 className="section-title">{t('settings.calendarNotifications')}</h3>
          </div>
          <div className="section-content">

            {/* Method */}
            <div className="setting-item setting-item--block">
              <div className="setting-info">
                <label className="setting-label">{t('settings.notifMethod')}</label>
                <p className="setting-description">{t('settings.notifMethodDesc')}</p>
              </div>
              <div className="notif-method-grid">
                {METHOD_OPTIONS.map(({ value, icon, label }) => (
                  <button key={value}
                    className={`notif-method-btn ${notifPrefs.method === value ? 'active' : ''}`}
                    onClick={() => setNotifMethod(value)}>
                    {icon && <span className="notif-method-icon">{icon}</span>}
                    {label}
                    {notifPrefs.method === value && <FaCheck className="notif-method-check" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Email address */}
            {(notifPrefs.method === 'email' || notifPrefs.method === 'both') && (
              <div className="setting-item setting-item--block">
                <div className="setting-info">
                  <label className="setting-label">{t('settings.notifEmailAddr')}</label>
                  <p className="setting-description">{t('settings.notifEmailAddrDesc')}</p>
                </div>
                <input type="email" className="setting-input"
                  value={notifPrefs.email}
                  onChange={e => setNotifEmail(e.target.value)}
                  placeholder={user?.email || 'your@mail.mcgill.ca'} />
              </div>
            )}

            {/* Phone */}
            {(notifPrefs.method === 'sms' || notifPrefs.method === 'both') && (
              <div className="setting-item setting-item--block">
                <div className="setting-info">
                  <label className="setting-label">{t('settings.notifPhone')}</label>
                  <p className="setting-description">{t('settings.notifPhoneDesc')}</p>
                </div>
                <input type="tel" className="setting-input"
                  value={notifPrefs.phone}
                  onChange={e => setNotifPhone(e.target.value)}
                  placeholder="+1 (514) 555-0100" />
              </div>
            )}

            {/* Timing */}
            <div className="setting-item setting-item--block">
              <div className="setting-info">
                <label className="setting-label">{t('settings.notifTiming')}</label>
                <p className="setting-description">{t('settings.notifTimingDesc')}</p>
              </div>
              <div className="notif-timing-grid">
                {[
                  { key: 'sameDay', label: t('settings.notifSameDay') },
                  { key: 'oneDay',  label: t('settings.notifOneDay') },
                  { key: 'oneWeek', label: t('settings.notifOneWeek') },
                ].map(({ key, label }) => (
                  <label key={key} className={`notif-timing-chip ${notifPrefs.timing[key] ? 'active' : ''}`}>
                    <input type="checkbox" checked={notifPrefs.timing[key]} onChange={() => toggleTiming(key)} />
                    {notifPrefs.timing[key] && <FaCheck size={9} />} {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Event types */}
            <div className="setting-item setting-item--block">
              <div className="setting-info">
                <label className="setting-label">{t('settings.notifEventTypes')}</label>
                <p className="setting-description">{t('settings.notifEventTypesDesc')}</p>
              </div>
              <div className="notif-type-grid">
                {Object.entries(EVENT_TYPE_CFG).map(([key, cfg]) => (
                  <label key={key}
                    className={`notif-type-chip ${notifPrefs.eventTypes[key] ? 'active' : ''}`}
                    style={notifPrefs.eventTypes[key] ? { borderColor: cfg.color, background: cfg.bg, color: cfg.color } : {}}>
                    <input type="checkbox" checked={notifPrefs.eventTypes[key]} onChange={() => toggleEventType(key)} />
                    {cfg.icon} {cfg.label}
                    {notifPrefs.eventTypes[key] && <FaCheck size={9} />}
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── General Notifications ── */}
        <div className="settings-section">
          <div className="section-header">
            <span className="section-icon"><FaBell /></span>
            <h3 className="section-title">{t('settings.notifications')}</h3>
          </div>
          <div className="section-content">
            {[
              { key: 'emailNotifications', label: t('settings.emailNotifications'), desc: t('settings.emailNotificationsDesc') },
              { key: 'deadlineReminders',  label: t('settings.deadlineReminders'),  desc: t('settings.deadlineRemindersDesc') },
              { key: 'courseUpdates',      label: t('settings.courseUpdates'),      desc: t('settings.courseUpdatesDesc') },
            ].map(({ key, label, desc }) => (
              <div key={key} className="setting-item">
                <div className="setting-info">
                  <label className="setting-label">{label}</label>
                  <p className="setting-description">{desc}</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings[key]} onChange={() => handleToggle(key)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ── Privacy ── */}
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
              <select className="setting-select" value={settings.profileVisibility} onChange={e => handleSelect('profileVisibility', e.target.value)}>
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
                <input type="checkbox" checked={settings.shareProgress} onChange={() => handleSelect('shareProgress', !settings.shareProgress)} />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">{t('settings.exportYourData')}</label>
                <p className="setting-description">{t('settings.exportDataDesc')}</p>
              </div>
              <button className="export-btn" onClick={() => setShowExportModal(true)}>
                <FaDownload className="export-btn-icon" /> {t('settings.exportData')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Preferences ── */}
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
              <select className="setting-select" value={settings.language} onChange={e => handleLanguageChange(e.target.value)}>
                <option value="en">{t('common.english')}</option>
                <option value="fr">{t('common.french')}</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">{t('settings.timezone')}</label>
                <p className="setting-description">{t('settings.timezoneDesc')}</p>
              </div>
              <select className="setting-select" value={settings.timezone} onChange={e => handleSelect('timezone', e.target.value)}>
                <option value="America/Toronto">Eastern Time (Toronto)</option>
                <option value="America/Montreal">Eastern Time (Montréal)</option>
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{t('settings.exportYourData')}</h3>
            <p className="modal-text">{t('settings.exportModalText')}</p>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => setShowExportModal(false)}>{t('common.cancel')}</button>
              <button className="modal-btn confirm-btn" onClick={handleExportData}>{t('settings.downloadJson')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
