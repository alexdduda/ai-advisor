import { useState, useRef, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight, FaComments, FaBook, FaStar, FaUser, FaCog, FaPalette, FaSignOutAlt, FaCalendarAlt, FaGraduationCap, FaUsers } from 'react-icons/fa'
import { MdLanguage } from 'react-icons/md'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import './Sidebar.css'

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  onTabChange,
  favorites,
  user,
  profile,
  profileImage,
  onSignOut,
}) {
  const [popupOpen, setPopupOpen] = useState(false)
  const popupRef = useRef(null)
  const triggerRef = useRef(null)

  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  // Draggable toggle button position (in pixels, like the original)
  const [leftToggleY, setLeftToggleY] = useState(() => {
    const saved = localStorage.getItem('leftSidebarButtonY')
    return saved ? parseFloat(saved) : window.innerHeight / 2
  })
  
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('leftSidebarButtonY', leftToggleY.toString())
  }, [leftToggleY])

  const handleLeftToggleMouseDown = (e) => {
    setIsDraggingLeft(true)
    e.preventDefault()
  }

  const handleLeftToggleTouchStart = (e) => {
    setIsDraggingLeft(true)
  }

  const handleMouseMove = (e) => {
    if (!isDraggingLeft) return
    
    const windowHeight = window.innerHeight
    const newY = e.clientY
    
    // Constrain between 10% and 90% of window height
    const minY = windowHeight * 0.1
    const maxY = windowHeight * 0.9
    const constrainedY = Math.min(Math.max(newY, minY), maxY)
    
    setLeftToggleY(constrainedY)
  }

  const handleTouchMove = (e) => {
    if (!isDraggingLeft) return
    
    const windowHeight = window.innerHeight
    const touch = e.touches[0]
    const newY = touch.clientY
    
    const minY = windowHeight * 0.1
    const maxY = windowHeight * 0.9
    const constrainedY = Math.min(Math.max(newY, minY), maxY)
    
    setLeftToggleY(constrainedY)
  }

  const handleMouseUp = () => {
    setIsDraggingLeft(false)
  }

  const handleTouchEnd = () => {
    setIsDraggingLeft(false)
  }

  // Mouse event listeners for dragging
  useEffect(() => {
    if (isDraggingLeft) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleTouchEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDraggingLeft])

  // Close popup on outside click
  useEffect(() => {
    if (!popupOpen) return

    const handleClickOutside = (e) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setPopupOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [popupOpen])

  // Close popup when sidebar closes
  useEffect(() => {
    if (!sidebarOpen) setPopupOpen(false)
  }, [sidebarOpen])

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light'
    setTheme(next)
  }

  const themeLabel = theme === 'light'
    ? t('settings.light')
    : theme === 'dark'
      ? t('settings.dark')
      : t('settings.auto')

  const handleSettingsClick = () => {
    setPopupOpen(false)
    onTabChange('profile')
    setTimeout(() => {
      const el = document.querySelector('.settings-container')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  const handleLanguageToggle = () => {
    const cycleLanguage = () => {
      if (language === 'en') setLanguage('fr')
      else setLanguage('en')
    }
    cycleLanguage()
    setPopupOpen(false)
  }

  const handleThemeClick = () => {
    cycleTheme()
    // Keep popup open so user can cycle through options
  }

  const handleLogOut = () => {
    setPopupOpen(false)
    onSignOut()
  }

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && (
            <>
              <div className="logo-container">
                <div className="logo-icon">SY</div>
                <span className="logo-name">Symbolos</span>
              </div>
              <button
                className="sidebar-toggle-btn"
                onClick={() => setSidebarOpen(false)}
                aria-label="Collapse sidebar"
              >
                <FaChevronLeft size={20} />
              </button>
            </>
          )}
          {!sidebarOpen && (
            <button
              className={`sidebar-toggle-btn-collapsed ${isDraggingLeft ? 'dragging' : ''}`}
              onClick={() => setSidebarOpen(true)}
              onMouseDown={handleLeftToggleMouseDown}
              onTouchStart={handleLeftToggleTouchStart}
              style={{
                top: `${leftToggleY}px`,
                cursor: isDraggingLeft ? 'grabbing' : 'grab',
              }}
              aria-label="Expand sidebar"
            >
              <FaChevronRight size={20} />
            </button>
          )}
        </div>

        {sidebarOpen && (
          <>
            <nav className="sidebar-nav">
              {[
                { key: 'chat', icon: <FaComments />, label: 'Academic Brief' },
                { key: 'favorites', icon: <FaGraduationCap />, label: 'Degree Planning', badge: null },
                { key: 'courses', icon: <FaBook />, label: t('nav.courses') },
                { key: 'saved', icon: <FaStar />, label: t('nav.saved') },
                { key: 'calendar', icon: <FaCalendarAlt />, label: t('nav.calendar') },
                { key: 'clubs', icon: <FaUsers />, label: 'Clubs' },
                { key: 'forum', icon: <FaComments />, label: t('nav.forum') },
                { key: 'profile', icon: <FaUser />, label: t('nav.profile') },
              ].map(({ key, icon, label, badge }) => (
                <button
                  key={key}
                  className={`nav-item ${activeTab === key ? 'active' : ''}`}
                  onClick={() => onTabChange(key)}
                >
                  <span className="nav-icon">{icon}</span>
                  <span className="nav-label">{label}</span>
                  {badge > 0 && <span className="nav-badge">{badge}</span>}
                </button>
              ))}
            </nav>

            <div className="sidebar-footer">
              {/* Popup Menu */}
              {popupOpen && (
                <div className="sidebar-popup" ref={popupRef}>
                  <button className="sidebar-popup-item" onClick={handleSettingsClick}>
                    <span className="sidebar-popup-icon"><FaCog /></span>
                    <span className="sidebar-popup-label">{t('sidebar.settings')}</span>
                  </button>
                  <button className="sidebar-popup-item" onClick={handleLanguageToggle}>
                    <span className="sidebar-popup-icon"><MdLanguage /></span>
                    <span className="sidebar-popup-label">
                      {language === 'en' ? 'Français' : 'English'}
                    </span>
                  </button>
                  <button className="sidebar-popup-item" onClick={handleThemeClick}>
                    <span className="sidebar-popup-icon"><FaPalette /></span>
                    <span className="sidebar-popup-label">
                      {t('sidebar.colorTheme')}: {themeLabel}
                    </span>
                  </button>
                  <div className="sidebar-popup-divider" />
                  <button className="sidebar-popup-item sidebar-popup-item--danger" onClick={handleLogOut}>
                    <span className="sidebar-popup-icon"><FaSignOutAlt /></span>
                    <span className="sidebar-popup-label">{t('sidebar.logOut')}</span>
                  </button>
                  <div className="sidebar-popup-arrow" />
                </div>
              )}

              {/* User Profile Button */}
              <button
                className="user-info"
                ref={triggerRef}
                onClick={() => setPopupOpen((prev) => !prev)}
              >
                <div className="user-avatar">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="user-avatar-image" />
                  ) : (
                    user?.email?.[0].toUpperCase()
                  )}
                </div>
                <div className="user-details">
                  <div className="user-name">{profile?.username || t('common.user')}</div>
                  <div className="user-email">{user?.email}</div>
                </div>
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}
