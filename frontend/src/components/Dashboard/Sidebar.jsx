import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
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
  handleSignOut,
  // Drag
  leftToggleY,
  isDraggingLeft,
  handleLeftToggleMouseDown,
  handleLeftToggleTouchStart,
}) {
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
                { key: 'chat', icon: '💬', label: 'AI Chat' },
                { key: 'courses', icon: '📚', label: 'Courses' },
                { key: 'favorites', icon: '⭐', label: 'Saved', badge: favorites.length || null },
                { key: 'forum', icon: '💬', label: 'Forum' },
                { key: 'profile', icon: '👤', label: 'Profile' },
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
              <button
                className="user-info"
                onClick={() => {
                  onTabChange('profile')
                  setSidebarOpen(false)
                }}
              >
                <div className="user-avatar">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="user-avatar-image" />
                  ) : (
                    user?.email?.[0].toUpperCase()
                  )}
                </div>
                <div className="user-details">
                  <div className="user-name">{profile?.username || 'User'}</div>
                  <div className="user-email">{user?.email}</div>
                </div>
              </button>
              <button className="btn btn-signout" onClick={handleSignOut}>
                Sign Out
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