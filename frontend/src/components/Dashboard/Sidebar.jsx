import { useState, useRef, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
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

  // Load saved position from localStorage or default to 20px from top
  const [leftToggleY, setLeftToggleY] = useState(() => {
    const saved = localStorage.getItem('leftSidebarButtonPosition')
    return saved ? parseInt(saved) : 20
  })
  
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('leftSidebarButtonPosition', leftToggleY.toString())
  }, [leftToggleY])

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

  // Handle drag for left toggle button
  const handleLeftToggleMouseDown = (e) => {
    e.stopPropagation()
    setIsDraggingLeft(true)
  }

  const handleLeftToggleTouchStart = (e) => {
    e.stopPropagation()
    setIsDraggingLeft(true)
  }

  useEffect(() => {
    if (!isDraggingLeft) return

    const handleMouseMove = (e) => {
      const newY = e.clientY
      const windowHeight = window.innerHeight
      
      // Constrain between 20px and windowHeight - 56px
      const constrainedY = Math.min(Math.max(newY, 20), windowHeight - 56)
      setLeftToggleY(constrainedY)
    }

    const handleTouchMove = (e) => {
      const touch = e.touches[0]
      const newY = touch.clientY
      const windowHeight = window.innerHeight
      
      const constrainedY = Math.min(Math.max(newY, 20), windowHeight - 56)
      setLeftToggleY(constrainedY)
    }

    const handleEnd = () => {
      setIsDraggingLeft(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isDraggingLeft])

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
    setLanguage(language === 'en' ? 'fr' : 'en')
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
                <div className="logo-icon">M</div>
                <span className="logo-name">McGill AI</span>
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
                { key: 'chat', icon: '💬', label: t('nav.chat') },
                { key: 'courses', icon: '📚', label: t('nav.courses') },
                { key: 'favorites', icon: '⭐', label: t('nav.saved'), badge: favorites.length || null },
                { key: 'forum', icon: '💬', label: t('nav.forum') },
                { key: 'profile', icon: '👤', label: t('nav.profile') },
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
                    <span className="sidebar-popup-icon">⚙️</span>
                    <span className="sidebar-popup-label">{t('sidebar.settings')}</span>
                  </button>
                  <button className="sidebar-popup-item" onClick={handleLanguageToggle}>
                    <span className="sidebar-popup-icon">🌐</span>
                    <span className="sidebar-popup-label">
                      {language === 'en' ? 'Français' : 'English'}
                    </span>
                  </button>
                  <button className="sidebar-popup-item" onClick={handleThemeClick}>
                    <span className="sidebar-popup-icon">🎨</span>
                    <span className="sidebar-popup-label">
                      {t('sidebar.colorTheme')}: {themeLabel}
                    </span>
                  </button>
                  <div className="sidebar-popup-divider" />
                  <button className="sidebar-popup-item sidebar-popup-item--danger" onClick={handleLogOut}>
                    <span className="sidebar-popup-icon">🚪</span>
                    <span className="sidebar-popup-label">{t('sidebar.logOut')}</span>
                  </button>
                  <div className="sidebar-popup-arrow" />
                </div>
              )}

              {/* User Info Button (trigger) */}
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
