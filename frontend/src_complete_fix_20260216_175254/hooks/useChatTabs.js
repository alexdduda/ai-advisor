import { useState, useRef } from 'react'
import { chatAPI } from '../lib/api'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hello! I'm your McGill AI Academic Advisor. How can I help you plan your courses today?"
}

function freshTab(id) {
  return { id, title: 'New Chat', messages: [], sessionId: null }
}

/**
 * All state & helpers for the multi-tab chat UI.
 *
 * @param {string|undefined} userId  – current authenticated user ID
 */
export default function useChatTabs(userId) {
  const [tabs, setTabs]                     = useState([{ ...freshTab(1), messages: [WELCOME_MESSAGE] }])
  const [activeId, setActiveId]             = useState(1)
  const [chatHistory, setChatHistory]       = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const nextId                              = useRef(2)

  // ── derived ──────────────────────────────────────────────────────
  const activeTab   = tabs.find(t => t.id === activeId) ?? tabs[0]
  const messages    = activeTab.messages

  // ── internal helpers ─────────────────────────────────────────────
  const patchTab = (id, fn) =>
    setTabs(prev => prev.map(t => (t.id === id ? fn(t) : t)))

  const bump = () => {
    const id = nextId.current++
    return id
  }

  // ── public API ───────────────────────────────────────────────────
  const createTab = () => {
    const id = bump()
    setTabs(prev => [...prev, freshTab(id)])
    setActiveId(id)
  }

  const closeTab = (id) => {
    if (tabs.length === 1) {
      const newId = bump()
      setTabs([freshTab(newId)])
      setActiveId(newId)
      return
    }
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id)
      if (activeId === id) setActiveId(next[next.length - 1].id)
      return next
    })
  }

  // drag-reorder
  const reorderTab = (draggedId, targetId) => {
    if (draggedId === targetId) return
    setTabs(prev => {
      const from = prev.findIndex(t => t.id === draggedId)
      const to   = prev.findIndex(t => t.id === targetId)
      const next = [...prev]
      next.splice(to, 0, ...next.splice(from, 1))
      return next
    })
  }

  // update messages for the *current* active tab
  const setMessages = (updater) =>
    patchTab(activeId, t => ({
      ...t,
      messages: typeof updater === 'function' ? updater(t.messages) : updater
    }))

  const setSessionId = (sessionId) =>
    patchTab(activeId, t => ({ ...t, sessionId }))

  const setTitle = (title) =>
    patchTab(activeId, t => ({ ...t, title }))

  // ── session / history loading ────────────────────────────────────
  const loadSessions = async () => {
    if (!userId) return
    try {
      const data = await chatAPI.getSessions(userId, 20)
      if (data.sessions?.length) {
        setChatHistory(
          data.sessions.map(s => ({
            id:           s.session_id,
            title:        s.last_message || 'Previous Chat',
            messageCount: s.message_count || 0,
            lastUpdated:  s.last_updated
          }))
        )
      }
    } catch (err) {
      console.error('Error loading chat sessions:', err)
    }
  }

  const loadHistoricalChat = async (sessionId) => {
    try {
      setIsLoadingHistory(true)

      // If already open in a tab, just switch to it
      const existing = tabs.find(t => t.sessionId === sessionId)
      if (existing) {
        setActiveId(existing.id)
        return
      }

      const data = await chatAPI.getHistory(userId, sessionId, 200)
      if (data.messages?.length) {
        const firstUser = data.messages.find(m => m.role === 'user')
        const title = firstUser
          ? firstUser.content.substring(0, 30) + (firstUser.content.length > 30 ? '...' : '')
          : 'Previous Chat'

        const id = bump()
        setTabs(prev => [...prev, { id, title, messages: data.messages, sessionId }])
        setActiveId(id)
      }
    } catch (err) {
      console.error('Error loading historical chat:', err)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const initialize = async () => {
    if (!userId) return
    try {
      setIsLoadingHistory(true)
      await loadSessions()
    } catch (err) {
      console.error('Error initializing chat:', err)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  return {
    tabs, activeId, activeTab, messages,
    chatHistory, isLoadingHistory,
    setActiveId, createTab, closeTab, reorderTab,
    setMessages, setSessionId, setTitle,
    loadSessions, loadHistoricalChat, initialize
  }
}
