import { useState, useEffect, useRef } from 'react'
import { FaRobot, FaChevronRight, FaArrowRight, FaTimes } from 'react-icons/fa'
import { MdPushPin, MdOutlinePushPin } from 'react-icons/md'
import './RightSidebar.css'

function SidebarChatBar({ onSend, isThinking, disabled }) {
  const [value, setValue] = useState('')
  const taRef = useRef(null)

  const adjustHeight = () => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 100) + 'px'
  }

  const handleChange = (e) => {
    setValue(e.target.value)
    adjustHeight()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = () => {
    if (!value.trim() || isThinking || disabled) return
    onSend(value.trim())
    setValue('')
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  return (
    <div className="rsb-chat-bar">
      <textarea
        ref={taRef}
        className="rsb-chat-bar__input"
        placeholder="Ask a follow-up…"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isThinking || disabled}
        rows={1}
      />
      <button
        className="rsb-chat-bar__send"
        onClick={submit}
        disabled={isThinking || !value.trim() || disabled}
        type="button"
      >
        {isThinking
          ? <span className="rsb-thinking-dots"><span /><span /><span /></span>
          : <FaArrowRight />}
      </button>
    </div>
  )
}

export default function RightSidebar({
  isOpen,
  setIsOpen,
  pinnedCard,
  pinnedThread,
  pinnedIsThinking,
  onSend,
  onUnpin,
  activeTab,
}) {
  const scrollRef = useRef(null)

  // Auto-scroll thread to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [pinnedThread?.length, pinnedIsThinking])

  // Button drag position
  const [buttonPos, setButtonPos] = useState(() => {
    const saved = localStorage.getItem('rightSidebarButtonPosition')
    return saved ? parseFloat(saved) : 50
  })
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    localStorage.setItem('rightSidebarButtonPosition', buttonPos.toString())
  }, [buttonPos])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e) => {
      const y = e.touches ? e.touches[0].clientY : e.clientY
      const pct = Math.min(Math.max((y / window.innerHeight) * 100, 10), 90)
      setButtonPos(pct)
    }
    const onUp = () => setIsDragging(false)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove)
    document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
    }
  }, [isDragging])

  const hasPinned = !!pinnedCard
  const showSidebar = hasPinned && activeTab !== 'chat'

  return (
    <>
      {/* Collapsed toggle button — only on non-chat tabs */}
      {!isOpen && showSidebar && (
        <button
          className={`rsb-toggle ${isDragging ? 'rsb-toggle--dragging' : ''}`}
          style={{ top: `${buttonPos}%` }}
          onMouseDown={(e) => { setIsDragging(true); e.preventDefault() }}
          onClick={(e) => { if (!isDragging) setIsOpen(true) }}
          title="Open pinned chat"
          aria-label="Open pinned chat"
        >
          <MdPushPin size={16} />
          <FaChevronRight size={12} />
        </button>
      )}

      {/* Sidebar panel */}
      <aside className={`right-sidebar ${isOpen && showSidebar ? 'rsb--open' : 'rsb--closed'}`}>
        {isOpen && showSidebar && (
          <>
            {/* Header — mirrors left sidebar header style */}
            <div className="rsb-header">
              <div className="rsb-header__left">
                <div className="rsb-logo-icon">
                  <MdPushPin size={18} />
                </div>
                <div className="rsb-header__text">
                  <span className="rsb-header__label">Pinned Chat</span>
                  <span className="rsb-header__title">{pinnedCard.title}</span>
                </div>
              </div>
              <div className="rsb-header__actions">
                <button
                  className="rsb-unpin-btn"
                  onClick={onUnpin}
                  title="Unpin card"
                >
                  <MdOutlinePushPin size={16} />
                </button>
                <button
                  className="rsb-close-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close sidebar"
                >
                  <FaChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Thread */}
            <div className="rsb-thread" ref={scrollRef}>
              {(!pinnedThread || pinnedThread.length === 0) ? (
                <div className="rsb-thread__empty">
                  <FaRobot className="rsb-thread__empty-icon" />
                  <p>No messages yet. Ask a follow-up below to continue the conversation.</p>
                </div>
              ) : (
                pinnedThread.map((msg, i) => (
                  <div key={i} className={`rsb-msg rsb-msg--${msg.role}`}>
                    <p className="rsb-msg__text">{msg.content}</p>
                  </div>
                ))
              )}
              {pinnedIsThinking && (
                <div className="rsb-msg rsb-msg--assistant">
                  <p className="rsb-msg__text">
                    <span className="rsb-thinking-dots"><span /><span /><span /></span>
                  </p>
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="rsb-footer">
              <SidebarChatBar
                onSend={onSend}
                isThinking={pinnedIsThinking}
              />
            </div>
          </>
        )}
      </aside>
    </>
  )
}
