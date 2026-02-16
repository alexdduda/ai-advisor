import { useRef, useEffect, useState } from 'react'
import FileUpload from './FileUpload'
import './ChatTab.css'

export default function ChatTab({
  messages = [],
  isLoadingHistory = false,
  isSending = false,
  chatInput = '',
  setChatInput = () => {},
  chatError = null,
  onSendMessage = () => {},
  userEmail = '',
}) {
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const [attachedFiles, setAttachedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  // File validation helper
  const validateFiles = (files) => {
    const maxSize = 32 * 1024 * 1024 // 32MB
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'text/csv',
      'text/markdown'
    ]
    
    const validFiles = []
    const errors = []
    
    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large. Maximum file size is 32MB.`)
      } else if (!validTypes.includes(file.type)) {
        errors.push(`${file.name} is not a supported file type.`)
      } else {
        validFiles.push(file)
      }
    })
    
    if (errors.length > 0) {
      alert(errors.join('\n'))
    }
    
    return validFiles
  }

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const validFiles = validateFiles(files)
      if (validFiles.length > 0) {
        handleFilesSelected(validFiles)
      }
    }
  }

  const handleFilesSelected = (files) => {
    setAttachedFiles(prev => [...prev, ...files])
  }

  const handleRemoveFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Pass files to parent handler
    await onSendMessage(e, attachedFiles)
    
    // Clear files after sending
    setAttachedFiles([])
  }

  return (
    <div 
      className={`chat-container ${isDragging ? 'drag-active' : ''}`}
      ref={chatContainerRef}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="drag-overlay">
          <div className="drag-overlay-content">
            <div className="drag-icon">📎</div>
            <div className="drag-text">Drop files here to attach</div>
            <div className="drag-subtext">PDF, Images, Text files (max 32MB)</div>
          </div>
        </div>
      )}

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
                {/* Show attached files in user messages */}
                {message.role === 'user' && message.files && message.files.length > 0 && (
                  <div className="message-files">
                    {message.files.map((file, i) => (
                      <div key={i} className="message-file-badge">
                        📎 {file.name}
                      </div>
                    ))}
                  </div>
                )}
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

      <form className="chat-input-container" onSubmit={handleSubmit}>
        {/* File Upload Component */}
        <FileUpload
          onFilesSelected={handleFilesSelected}
          attachedFiles={attachedFiles}
          onRemoveFile={handleRemoveFile}
        />

        <textarea
          className="chat-input"
          placeholder="Ask me anything about courses, planning, or McGill academics..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
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
          disabled={isSending || (!chatInput.trim() && attachedFiles.length === 0)}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}