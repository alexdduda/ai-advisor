import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import './ChatTabsBar.css'

export default function ChatTabsBar({
  chatTabs,
  activeChatTab,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onReorder,
}) {
  const { t } = useLanguage()
  const [draggedTab, setDraggedTab] = useState(null)

  const handleDragStart = (e, tabId) => {
    setDraggedTab(tabId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetTabId) => {
    e.preventDefault()
    if (draggedTab === targetTabId) return

    const from = chatTabs.findIndex((t) => t.id === draggedTab)
    const to = chatTabs.findIndex((t) => t.id === targetTabId)
    const next = [...chatTabs]
    const [removed] = next.splice(from, 1)
    next.splice(to, 0, removed)
    onReorder(next)
    setDraggedTab(null)
  }

  const handleDragEnd = () => setDraggedTab(null)

  return (
    <div className="chat-tabs-bar">
      <div className="chat-tabs-container">
        {chatTabs.map((tab) => (
          <div
            key={tab.id}
            className={`chat-tab ${activeChatTab === tab.id ? 'active' : ''} ${draggedTab === tab.id ? 'dragging' : ''}`}
            onClick={() => onSelectTab(tab.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, tab.id)}
            onDragEnd={handleDragEnd}
          >
            <span className="chat-tab-title">
              {tab.title.startsWith('chat.') ? t(tab.title) : tab.title}
            </span>
            <button
              className="chat-tab-close"
              onClick={(e) => {
                e.stopPropagation()
                onCloseTab(tab.id)
              }}
            >
              ✕
            </button>
          </div>
        ))}
        <button className="chat-tab-new" onClick={onNewTab}>
          +
        </button>
      </div>
    </div>
  )
}
