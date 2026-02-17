import { useState, useRef, useEffect } from 'react'
import { useAuth }        from '../../contexts/AuthContext'
import { chatAPI }        from '../../lib/api'
import { FaRobot } from 'react-icons/fa'
import './ChatPanel.css'

export default function ChatPanel({
  tabs, activeId, activeTab, messages, isLoadingHistory,
  setActiveId, createTab, closeTab, reorderTab,
  setMessages, setSessionId, setTitle, loadSessions
}) {
  const { user } = useAuth()

  const [chatInput,  setChatInput]  = useState('')
  const [isSending,  setIsSending]  = useState(false)
  const [chatError,  setChatError]  = useState(null)
  const [draggedTab, setDraggedTab] = useState(null)

  const messagesEndRef = useRef(null)

  // auto-scroll on new messages or tab switch
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeId])

  // ── send ──────────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || isSending || !user?.id) return

    const text = chatInput.trim()
    setChatInput('')
    setChatError(null)

    const userMsg = { role: 'user', content: text }

    // title from first real message
    if (messages.length <= 1) {
      setTitle(text.length > 30 ? text.substring(0, 30) + '...' : text)
    }

    setMessages(prev => [...prev, userMsg])
    setIsSending(true)

    try {
      const response = await chatAPI.sendMessage(user.id, text, activeTab.sessionId)

      if (!activeTab.sessionId && response.session_id) {
        setSessionId(response.session_id)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response.response }])
      await loadSessions()
    } catch (err) {
      console.error('Error sending message:', err)
      setChatError('Failed to get response. Please try again.')
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '❌ Sorry, I encountered an error. Please try again or contact support if the issue persists.' }
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  // ── drag-reorder helpers ──────────────────────────────────────────
  const onDragStart  = (e, id) => { setDraggedTab(id); e.dataTransfer.effectAllowed = 'move' }
  const onDragOver   = (e)     => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const onDrop       = (e, id) => { e.preventDefault(); reorderTab(draggedTab, id); setDraggedTab(null) }
  const onDragEnd    = ()      => setDraggedTab(null)

  // ── render ────────────────────────────────────────────────────────
  return (
    <>
      {/* Tab bar */}
      <div className="chat-tabs-bar">
        <div className="chat-tabs-container">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`chat-tab ${activeId === tab.id ? 'active' : ''} ${draggedTab === tab.id ? 'dragging' : ''}`}
              onClick={() => setActiveId(tab.id)}
              draggable
              onDragStart={(e) => onDragStart(e, tab.id)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, tab.id)}
              onDragEnd={onDragEnd}
            >
              <span className="chat-tab-title">{tab.title}</span>
              <button className="chat-tab-close" onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}>✕</button>
            </div>
          ))}
          <button className="chat-tab-new" onClick={createTab}>+</button>
        </div>
      </div>

      {/* Message list */}
      <div className="chat-container">
        <div className="chat-messages">
          {isLoadingHistory ? (
            <div className="message assistant">
              <div className="message-avatar"><FaRobot /></div>
              <div className="message-content">
                <div className="message-text">Loading chat history...</div>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? user?.email?.[0].toUpperCase() : <FaRobot />}
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.content}</div>
                </div>
              </div>
            ))
          )}

          {isSending && (
            <div className="message assistant">
              <div className="message-avatar"><FaRobot /></div>
              <div className="message-content">
                <div className="message-text">
                  <span className="typing-indicator">●●●</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {chatError && <div className="error-banner">{chatError}</div>}

        {/* Input */}
        <form className="chat-input-container" onSubmit={handleSendMessage}>
          <textarea
            className="chat-input"
            placeholder="Ask me anything about courses, planning, or McGill academics..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            rows={1}
            style={{ resize: 'none', overflow: 'hidden' }}
            onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
          />
          <button type="submit" className="btn btn-send" disabled={isSending || !chatInput.trim()}>
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </>
  )
}
