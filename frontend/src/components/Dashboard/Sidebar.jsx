import { useState, useRef, useEffect } from 'react'
import {
  FaChevronRight, FaComments, FaBook,
  FaUser, FaCog, FaPalette, FaSignOutAlt, FaCalendarAlt,
  FaGraduationCap, FaUsers, FaExpandAlt
} from 'react-icons/fa'
import { MdLanguage } from 'react-icons/md'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import './Sidebar.css'

const NAV_ITEMS = (t) => [
  { key: 'chat',      icon: <FaComments />,     label: t('nav.chat') },
  { key: 'favorites', icon: <FaGraduationCap />, label: t('nav.degreePlanning') },
  { key: 'courses',   icon: <FaBook />,          label: t('nav.courses') },
  { key: 'calendar',  icon: <FaCalendarAlt />,   label: t('nav.calendar') },
  { key: 'clubs',     icon: <FaUsers />,         label: 'Clubs' },
  { key: 'forum',     icon: <FaComments />,      label: t('nav.forum') },
  { key: 'profile',   icon: <FaUser />,          label: t('nav.profile') },
]

export default function Sidebar({
  sidebarOpen, setSidebarOpen,
  activeTab, onTabChange,
  user, profile, profileImage, onSignOut,
}) {
  const [popupOpen, setPopupOpen] = useState(false)
  const popupRef   = useRef(null)
  const triggerRef = useRef(null)

  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => { if (!sidebarOpen) setPopupOpen(false) }, [sidebarOpen])

  useEffect(() => {
    if (!popupOpen) return
    const handler = (e) => {
      if (
        popupRef.current   && !popupRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) setPopupOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [popupOpen])

  const themeLabel = theme === 'light' ? t('settings.light') : theme === 'dark' ? t('settings.dark') : t('settings.auto')

  const handleSettingsClick = () => {
    setPopupOpen(false)
    onTabChange('profile')
    setTimeout(() => {
      const el = document.querySelector('.settings-container')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'fr' : 'en')
    setPopupOpen(false)
  }

  const cycleTheme = () => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light')

  const navItems = NAV_ITEMS(t)
  const avatarLetter = user?.email?.[0].toUpperCase()

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : 'sidebar--mini'}`}>

        {/* ── OPEN: full sidebar ── */}
        {sidebarOpen && (
          <>
            <div className="sidebar-header">
              <div className="logo-container">
                <div className="logo-icon">SY</div>
                <span className="logo-name">Symbolos</span>
              </div>
              <button className="sidebar-collapse-btn" onClick={() => setSidebarOpen(false)} title="Collapse">
                <FaChevronRight size={12} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>

            <nav className="sidebar-nav">
              {navItems.map(({ key, icon, label }) => (
                <button
                  key={key}
                  className={`nav-item ${activeTab === key ? 'active' : ''}`}
                  onClick={() => onTabChange(key)}
                >
                  <span className="nav-icon">{icon}</span>
                  <span className="nav-label">{label}</span>
                </button>
              ))}
            </nav>

            <div className="sidebar-footer">
              {popupOpen && (
                <div className="sidebar-popup" ref={popupRef}>
                  <button className="sidebar-popup-item" onClick={handleSettingsClick}>
                    <span className="sidebar-popup-icon"><FaCog /></span>
                    <span className="sidebar-popup-label">{t('sidebar.settings')}</span>
                  </button>
                  <button className="sidebar-popup-item" onClick={handleLanguageToggle}>
                    <span className="sidebar-popup-icon"><MdLanguage /></span>
                    <span className="sidebar-popup-label">{language === 'en' ? 'Français' : 'English'}</span>
                  </button>
                  <button className="sidebar-popup-item" onClick={cycleTheme}>
                    <span className="sidebar-popup-icon"><FaPalette /></span>
                    <span className="sidebar-popup-label">{t('sidebar.colorTheme')}: {themeLabel}</span>
                  </button>
                  <div className="sidebar-popup-divider" />
                  <button className="sidebar-popup-item sidebar-popup-item--danger" onClick={() => { setPopupOpen(false); onSignOut() }}>
                    <span className="sidebar-popup-icon"><FaSignOutAlt /></span>
                    <span className="sidebar-popup-label">{t('sidebar.logOut')}</span>
                  </button>
                  <div className="sidebar-popup-arrow" />
                </div>
              )}
              <button className="user-info" ref={triggerRef} onClick={() => setPopupOpen(p => !p)}>
                <div className="user-avatar">
                  {profileImage ? <img src={profileImage} alt="Profile" className="user-avatar-image" /> : avatarLetter}
                </div>
                <div className="user-details">
                  <div className="user-name">{profile?.username || t('common.user')}</div>
                  <div className="user-email">{user?.email}</div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* ── MINI: icon pills inside ONE shared capsule outline ── */}
        {!sidebarOpen && (
          <div className="mini-rail">
            <div className="mini-capsule">
              {navItems.map(({ key, icon, label }) => (
                <button
                  key={key}
                  className={`mini-pill ${activeTab === key ? 'mini-pill--active' : ''}`}
                  onClick={() => onTabChange(key)}
                  title={label}
                >
                  {icon}
                </button>
              ))}
              <div className="mini-capsule-divider" />
              <button
                className="mini-pill mini-pill--expand"
                onClick={() => setSidebarOpen(true)}
                title="Expand sidebar"
              >
                <FaExpandAlt size={11} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {sidebarOpen && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  )
}
