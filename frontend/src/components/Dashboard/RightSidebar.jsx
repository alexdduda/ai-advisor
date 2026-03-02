import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { chatAPI } from '../../lib/api'
import { FaChevronRight, FaArrowRight, FaTimes, FaCommentDots, FaRobot } from 'react-icons/fa'
import { MdPushPin, MdOutlinePushPin } from 'react-icons/md'
import './RightSidebar.css'

function renderText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part === '\n') return <br key={i} />
    return part
  })
}

function SidebarChatBar({ onSend, isThinking, placeholder }) {
  const [value, setValue] = useState('')
  const taRef = useRef(null)
  const adjustHeight = () => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 100) + 'px'
  }
  const handleChange = (e) => { setValue(e.target.value); adjustHeight() }
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }
  const submit = () => {
    if (!value.trim() || isThinking) return
    onSend(value.trim())
    setValue('')
    if (taRef.current) taRef.current.style.height = 'auto'
  }
  return (
    <div className="rsb-chat-bar">
      <textarea ref={taRef} className="rsb-chat-bar__input" placeholder={placeholder}
        value={value} onChange={handleChange} onKeyDown={handleKeyDown}
        disabled={isThinking} rows={1} />
      <button className="rsb-chat-bar__send" onClick={submit}
        disabled={isThinking || !value.trim()} type="button">
        {isThinking ? <span className="rsb-thinking-dots"><span /><span /><span /></span> : <FaArrowRight />}
      </button>
    </div>
  )
}

const TAB_LABEL_KEY = {
  courses: 'rsb.tab.courses', calendar: 'rsb.tab.calendar', degree: 'rsb.tab.degree',
  profile: 'rsb.tab.profile', 'study-abroad': 'rsb.tab.abroad',
}
const TAB_SUGGESTION_KEYS = {
  courses:       ['rsb.nav.courses.1', 'rsb.nav.courses.2', 'rsb.nav.courses.3'],
  calendar:      ['rsb.nav.calendar.1', 'rsb.nav.calendar.2', 'rsb.nav.calendar.3'],
  degree:        ['rsb.nav.degree.1', 'rsb.nav.degree.2', 'rsb.nav.degree.3'],
  profile:       ['rsb.nav.profile.1', 'rsb.nav.profile.2', 'rsb.nav.profile.3'],
  'study-abroad':['rsb.nav.abroad.1', 'rsb.nav.abroad.2', 'rsb.nav.abroad.3'],
}
const DEFAULT_SUGGESTION_KEYS = ['rsb.nav.default.1', 'rsb.nav.default.2', 'rsb.nav.default.3']

export default function RightSidebar({ isOpen, setIsOpen, pinnedCard, pinnedThread, pinnedIsThinking, onSend, onUnpin, activeTab }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const scrollRef = useRef(null)
  const navScrollRef = useRef(null)
  const [navMessages, setNavMessages] = useState([])
  const [navThinking, setNavThinking] = useState(false)
  const [navSessionId, setNavSessionId] = useState(null)

  useEffect(() => {
    if (!isOpen || pinnedCard) return
    const tabLabel = t(TAB_LABEL_KEY[activeTab] || 'rsb.tab.default')
    setNavMessages([{ role: 'assistant', content: t('rsb.greeting').replace('{tab}', tabLabel) }])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pinnedCard, activeTab])

  useEffect(() => {
    if (navScrollRef.current) navScrollRef.current.scrollTop = navScrollRef.current.scrollHeight
  }, [navMessages, navThinking])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [pinnedThread?.length, pinnedIsThinking])

  const handleNavSend = async (text) => {
    if (!user?.id) return
    setNavMessages(prev => [...prev, { role: 'user', content: text }])
    setNavThinking(true)
    try {
      const res = await chatAPI.sendMessage(user.id, text, navSessionId, activeTab)
      if (!navSessionId && res.session_id) setNavSessionId(res.session_id)
      setNavMessages(prev => [...prev, { role: 'assistant', content: res.response }])
    } catch {
      setNavMessages(prev => [...prev, { role: 'assistant', content: t('rsb.errorMsg') }])
    } finally {
      setNavThinking(false)
    }
  }

  const [buttonPos, setButtonPos] = useState(() => {
    const saved = localStorage.getItem('rightSidebarButtonPosition')
    return saved ? parseFloat(saved) : 50
  })
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => { localStorage.setItem('rightSidebarButtonPosition', buttonPos.toString()) }, [buttonPos])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e) => {
      const y = e.touches ? e.touches[0].clientY : e.clientY
      setButtonPos(Math.min(Math.max((y / window.innerHeight) * 100, 10), 90))
    }
    const onUp = () => setIsDragging(false)
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove); document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onUp)
    }
  }, [isDragging])

  const hasPinned = !!pinnedCard
  const showSidebar = activeTab !== 'chat'
  const suggestionKeys = TAB_SUGGESTION_KEYS[activeTab] || DEFAULT_SUGGESTION_KEYS

  return (
    <>
      {!isOpen && showSidebar && (
        <button
          className={`rsb-toggle ${isDragging ? 'rsb-toggle--dragging' : ''} ${hasPinned ? 'rsb-toggle--pinned' : 'rsb-toggle--nav'}`}
          style={{ top: `${buttonPos}%` }}
          onMouseDown={(e) => { setIsDragging(true); e.preventDefault() }}
          onClick={() => { if (!isDragging) setIsOpen(true) }}
          title={t(hasPinned ? 'rsb.openPinned' : 'rsb.openAssistant')}
          aria-label={t(hasPinned ? 'rsb.openPinned' : 'rsb.openAssistant')}
        >
          {hasPinned ? <MdPushPin size={16} /> : <FaCommentDots size={15} />}
          <FaChevronRight size={12} />
        </button>
      )}

      <aside className={`right-sidebar ${isOpen && showSidebar ? 'rsb--open' : 'rsb--closed'}`}>
        {isOpen && showSidebar && (
          <>
            {hasPinned ? (
              <>
                <div className="rsb-header">
                  <div className="rsb-header__left">
                    <div className="rsb-logo-icon"><MdPushPin size={18} /></div>
                    <div className="rsb-header__text">
                      <span className="rsb-header__label">{t('rsb.pinnedChat')}</span>
                      <span className="rsb-header__title">{pinnedCard.title}</span>
                    </div>
                  </div>
                  <div className="rsb-header__actions">
                    <button className="rsb-unpin-btn" onClick={onUnpin} title={t('rsb.unpinCard')}><MdOutlinePushPin size={16} /></button>
                    <button className="rsb-close-btn" onClick={() => setIsOpen(false)} title={t('rsb.closeSidebar')}><FaChevronRight size={14} /></button>
                  </div>
                </div>
                <div className="rsb-thread" ref={scrollRef}>
                  {(!pinnedThread || pinnedThread.length === 0) ? (
                    <div className="rsb-thread__empty">
                      <FaRobot className="rsb-thread__empty-icon" />
                      <p>{t('rsb.noMessages')}</p>
                    </div>
                  ) : pinnedThread.map((msg, i) => (
                    <div key={i} className={`rsb-msg rsb-msg--${msg.role}`}>
                      <p className="rsb-msg__text">{renderText(msg.content)}</p>
                    </div>
                  ))}
                  {pinnedIsThinking && (
                    <div className="rsb-msg rsb-msg--assistant">
                      <p className="rsb-msg__text"><span className="rsb-thinking-dots"><span /><span /><span /></span></p>
                    </div>
                  )}
                </div>
                <div className="rsb-footer">
                  <SidebarChatBar onSend={onSend} isThinking={pinnedIsThinking} placeholder={t('rsb.followUpPlaceholder')} />
                </div>
              </>
            ) : (
              <>
                <div className="rsb-header rsb-header--nav">
                  <div className="rsb-header__left">
                    <div className="rsb-header__text">
                      <span className="rsb-header__label">{t('rsb.websiteAssistant')}</span>
                      <span className="rsb-header__title">{t('rsb.askAnything')}</span>
                    </div>
                  </div>
                  <button className="rsb-close-btn" onClick={() => setIsOpen(false)} title={t('rsb.close')}><FaTimes size={14} /></button>
                </div>
                <div className="rsb-thread" ref={navScrollRef}>
                  {navMessages.map((msg, i) => (
                    <div key={i} className={`rsb-msg rsb-msg--${msg.role}`}>
                      <p className="rsb-msg__text">{renderText(msg.content)}</p>
                    </div>
                  ))}
                  {navThinking && (
                    <div className="rsb-msg rsb-msg--assistant">
                      <p className="rsb-msg__text"><span className="rsb-thinking-dots"><span /><span /><span /></span></p>
                    </div>
                  )}
                </div>
                {navMessages.length <= 1 && !navThinking && (
                  <div className="rsb-suggestions">
                    {suggestionKeys.map((key, i) => (
                      <button key={i} className="rsb-suggestion-chip" onClick={() => handleNavSend(t(key))}>
                        {t(key)}
                      </button>
                    ))}
                  </div>
                )}
                <div className="rsb-footer">
                  <SidebarChatBar onSend={handleNavSend} isThinking={navThinking} placeholder={t('rsb.navPlaceholder')} />
                </div>
              </>
            )}
          </>
        )}
      </aside>
    </>
  )
}
