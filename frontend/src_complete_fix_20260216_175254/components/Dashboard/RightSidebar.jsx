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
  
  return (
    <aside className={`right-sidebar ${isOpen ? 'open' : 'closed'}`}>
      {!isOpen && (
        <div className="right-sidebar-header-collapsed">
          <button
            className="right-sidebar-toggle-collapsed"
            onClick={() => setIsOpen(true)}
            title={t('chat.showHistory')}
          >
            <FaChevronLeft size={20} />
          </button>
        </div>
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
