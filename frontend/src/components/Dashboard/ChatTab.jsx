import { useRef, useEffect } from 'react'
import './ChatTab.css'

export default function ChatTab({
  messages,
  isLoadingHistory,
  isSending,
  chatInput,
  setChatInput,
  chatError,
  onSendMessage,
  userEmail,
}) {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {isLoadingHistory ? (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-text">Loading chat history...</div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-text">
                Hello! I'm your McGill AI Academic Advisor. How can I help you plan your courses today?
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, idx) => (
            <div key={idx} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'assistant' ? '🤖' : userEmail?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
              </div>
            </div>
          ))
        )}
        {isSending && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
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

      <form className="chat-input-container" onSubmit={onSendMessage}>
        <textarea
          className="chat-input"
          placeholder="Ask me anything about courses, planning, or McGill academics..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSendMessage(e)
            }
          }}
          disabled={isSending}
          rows={1}
          style={{ resize: 'none', overflow: 'hidden' }}
          onInput={(e) => {
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
        />
        <button
          type="submit"
          className="btn btn-send"
          disabled={isSending || !chatInput.trim()}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}