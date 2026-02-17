import { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useLanguage } from '../../contexts/LanguageContext'
import './RightSidebar.css'

export default function RightSidebar({
  isOpen,
  setIsOpen,
  chatHistory,
  onLoadChat,
}) {
  const { t } = useLanguage()
  
  // Load saved position from localStorage or default to 50%
  const [buttonPosition, setButtonPosition] = useState(() => {
    const saved = localStorage.getItem('rightSidebarButtonPosition')
    return saved ? parseFloat(saved) : 50
  })
  
  const [isDragging, setIsDragging] = useState(false)

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('rightSidebarButtonPosition', buttonPosition.toString())
  }, [buttonPosition])

  const handleMouseDown = (e) => {
    setIsDragging(true)
    e.preventDefault()
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const windowHeight = window.innerHeight
    const newPosition = (e.clientY / windowHeight) * 100
    
    // Constrain between 10% and 90%
    const constrainedPosition = Math.min(Math.max(newPosition, 10), 90)
    setButtonPosition(constrainedPosition)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add/remove mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  return (
    <aside className={`right-sidebar ${isOpen ? 'open' : 'closed'}`}>
      {!isOpen && (
        <button
          className={`right-sidebar-toggle-collapsed ${isDragging ? 'dragging' : ''}`}
          style={{ top: `${buttonPosition}%` }}
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            if (!isDragging) {
              setIsOpen(true)
            }
          }}
          aria-label={t('chat.showHistory')}
        >
          <FaChevronLeft size={20} />
        </button>
      )}

      {isOpen && (
        <>
          <div className="right-sidebar-header">
            <h3>{t('chat.historyTitle')}</h3>
            <button
              className="right-sidebar-close"
              onClick={() => setIsOpen(false)}
              aria-label={t('chat.closeHistory')}
            >
              <FaChevronRight size={20} />
            </button>
          </div>
          <div className="right-sidebar-content">
            {chatHistory.length > 0 ? (
              chatHistory.map((session) => (
                <div
                  key={session.session_id}
                  className="history-item"
                  onClick={() => onLoadChat(session.session_id)}
                >
                  <div className="history-title">
                    {session.last_message?.substring(0, 50) || t('chat.chatSession')}
                    {session.last_message && session.last_message.length > 50 && '...'}
                  </div>
                  <div className="history-meta">
                    {new Date(session.last_updated).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="history-empty">
                <p>{t('chat.noPreviousChats')}</p>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  )
}
