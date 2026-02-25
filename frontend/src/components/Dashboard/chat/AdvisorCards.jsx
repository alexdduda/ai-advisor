import { useState, useEffect, useCallback, useRef } from 'react'
import {
  FaRobot, FaSync, FaChevronDown, FaChevronUp,
  FaBolt, FaArrowRight, FaGraduationCap,
  FaClipboardList, FaComments, FaCalendarAlt,
  FaChartBar, FaMapMarkedAlt, FaLightbulb,
  FaBookmark, FaRegBookmark, FaThumbtack,
  FaGripVertical, FaTrash,
} from 'react-icons/fa'
import { MdPushPin, MdOutlinePushPin } from 'react-icons/md'
import { CARD_CATEGORIES, CATEGORY_LABELS } from '../../../lib/cardsAPI'
import './AdvisorCards.css'

const CATEGORY_ICON_COMPONENTS = {
  deadlines:     FaCalendarAlt,
  degree:        FaGraduationCap,
  courses:       FaClipboardList,
  grades:        FaChartBar,
  planning:      FaMapMarkedAlt,
  opportunities: FaLightbulb,
}

const CARD_CONFIG = {
  urgent:   { accent: 'var(--card-urgent,   #ED1B2F)' },
  warning:  { accent: 'var(--card-warning,  #F59E0B)' },
  insight:  { accent: 'var(--card-insight,  #3B82F6)' },
  progress: { accent: 'var(--card-progress, #10B981)' },
}

// ── Thread messages scroller ──────────────────────────────────
function ThreadMessages({ thread, isThinking }) {
  const scrollRef = useRef(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [thread.length, isThinking])

  return (
    <div className="thread-messages" ref={scrollRef}>
      {thread.map((msg, i) => (
        <div key={i} className={`thread-message thread-message--${msg.role}`}>
          <p className="thread-text">{msg.content}</p>
        </div>
      ))}
      {isThinking && (
        <div className="thread-message thread-message--assistant">
          <p className="thread-text">
            <span className="thinking-dots"><span /><span /><span /></span>
          </p>
        </div>
      )}
    </div>
  )
}

// ── Auto-growing textarea chat bar ────────────────────────────
function CardChatBar({ onSend, isThinking, onFocus }) {
  const [value, setValue] = useState('')
  const taRef = useRef(null)

  const adjustHeight = () => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
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
    if (!value.trim() || isThinking) return
    onSend(value.trim())
    setValue('')
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  return (
    <div className="card-chat-bar">
      <textarea
        ref={taRef}
        className="card-chat-bar__input"
        placeholder="Ask a follow-up…"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        disabled={isThinking}
        rows={1}
      />
      <button
        className="card-chat-bar__send"
        onClick={submit}
        disabled={isThinking || !value.trim()}
        type="button"
      >
        {isThinking
          ? <span className="thinking-dots small"><span /><span /><span /></span>
          : <FaArrowRight />}
      </button>
    </div>
  )
}

// ── Individual card ───────────────────────────────────────────
function AdvisorCard({
  card,
  thread = [],
  isThinking = false,
  isExpanded = false,
  isPinned = false,
  onSaveToggle,
  onPinToggle,
  onSend,
  onExpand,
  onCollapse,
  onDelete,
  dragHandleProps,
  isDragging,
}) {
  const [saving, setSaving]       = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const cardRef = useRef(null)

  const config   = CARD_CONFIG[card.card_type || card.type] || CARD_CONFIG.insight
  const CardIcon = CATEGORY_ICON_COMPONENTS[card.category || 'planning'] || FaMapMarkedAlt
  const isSaved  = card.is_saved || false
  const isUser   = card.source === 'user'

  useEffect(() => {
    if (!isExpanded) return
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        onCollapse(card.id)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isExpanded, card.id, onCollapse])
  const chips    = card.actions || []

  // Sync with parent expanded state
  useEffect(() => { if (isExpanded) setPanelOpen(true) }, [isExpanded])

  // Auto-open when thread arrives
  useEffect(() => { if (thread.length > 0) setPanelOpen(true) }, [thread.length])

  const handleSave = async (e) => {
    e.stopPropagation()
    if (saving) return
    setSaving(true)
    try { await onSaveToggle(card.id, !isSaved) }
    finally { setSaving(false) }
  }

  const handlePin = (e) => {
    e.stopPropagation()
    onPinToggle(card, thread)
  }

  const togglePanel = () => {
    const next = !panelOpen
    setPanelOpen(next)
    if (next) {
      onExpand(card.id)
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80)
    } else {
      onCollapse(card.id)
    }
  }

  const handleSend = (msg) => {
    if (!panelOpen) {
      setPanelOpen(true)
      onExpand(card.id)
    }
    onSend(msg)
  }

  return (
    <article
      data-card-id={card.id}
      className={[
        'advisor-card',
        `advisor-card--${card.card_type || card.type}`,
        isUser     ? 'advisor-card--user' : '',
        isSaved    ? 'advisor-card--saved' : '',
        isDragging ? 'advisor-card--dragging' : '',
        panelOpen  ? 'advisor-card--expanded' : '',
        isPinned  ? 'advisor-card--pinned' : '',
      ].filter(Boolean).join(' ')}
      style={{ '--card-accent': config.accent }}
      ref={cardRef}
    >
      {/* Drag handle */}
      <span className="advisor-card__drag-handle" {...dragHandleProps} title="Drag to reorder">
        <FaGripVertical />
      </span>

      {/* ── Header: icon | meta | save | trash ── */}
      <div className="advisor-card__header">
        <span className="advisor-card__icon"><CardIcon /></span>

        <div className="advisor-card__meta">
          <div className="advisor-card__meta-top">
            <span className="advisor-card__label">{card.label}</span>
            {isUser && <span className="advisor-card__user-badge">Asked by you</span>}
            {isSaved && (
              <span className="advisor-card__saved-badge">
                <FaThumbtack className="saved-badge__icon" /> Saved
              </span>
            )}
            {isPinned && (
              <span className="advisor-card__pinned-badge">
                <MdPushPin className="pinned-badge__icon" /> Pinned
              </span>
            )}
          </div>
          <h3 className="advisor-card__title">{card.title}</h3>
        </div>

        {/* Trash left, save rightmost */}
        <div className="advisor-card__header-actions">
          <button
            className="advisor-card__delete"
            onClick={() => onDelete(card.id)}
            title="Delete card"
          >
            <FaTrash />
          </button>

          <button
            className={`advisor-card__save ${isSaved ? 'advisor-card__save--active' : ''}`}
            onClick={handleSave}
            disabled={saving}
            title={isSaved ? 'Remove bookmark' : 'Bookmark'}
          >
            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
          </button>

          <button
            className={`advisor-card__pin ${isPinned ? 'advisor-card__pin--active' : ''}`}
            onClick={handlePin}
            title={isPinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
          >
            {isPinned ? <MdPushPin /> : <MdOutlinePushPin />}
          </button>
        </div>
      </div>

      {/* ── Body — always visible ── */}
      <p className="advisor-card__body">{card.body}</p>

      {/* ── Collapsible panel: chips + thread + chat bar + close toggle ── */}
      <div className={`advisor-card__panel ${panelOpen ? 'advisor-card__panel--open' : ''}`}>
        <div className="advisor-card__panel-inner">

          {/* Follow-up question chips */}
          {chips.length > 0 && (
            <div className="advisor-card__chips">
              {chips.map((chip, i) => (
                <button
                  key={i}
                  className="advisor-card__chip"
                  onClick={() => handleSend(chip)}
                  disabled={isThinking}
                >
                  <FaBolt className="chip-icon" />
                  {chip}
                </button>
              ))}
            </div>
          )}

      {thread.length > 0 && (
        <div className={`advisor-card__thread ${isExpanded ? '' : 'advisor-card__thread--preview'}`}>
          <div className="thread-divider" />
          {isExpanded ? (
            <ThreadMessages thread={thread} isThinking={isThinking} />
          ) : (
            <div className="advisor-card__thread-preview">
              <div className={`thread-message thread-message--${thread[thread.length - 1].role}`}>
                <p className="thread-text">
                  {thread[thread.length - 1].content.slice(0, 100)}
                  {thread[thread.length - 1].content.length > 100 ? '…' : ''}
                </p>
              </div>
            </div>
          )}

          {/* Chat bar */}
          <div className="advisor-card__chat-bar-wrapper">
            <CardChatBar
              onSend={handleSend}
              isThinking={isThinking}
              onFocus={() => {
                if (!panelOpen) { setPanelOpen(true); onExpand(card.id) }
              }}
            />
          </div>

          {/* Close chevron — at the bottom of the open panel */}
          <div className="advisor-card__toggle-row">
            <button
              className="advisor-card__toggle advisor-card__toggle--open"
              onClick={togglePanel}
              aria-label="Collapse"
            >
              <FaChevronUp />
            </button>
          </div>

        </div>
      </div>

      {/* ── Open chevron — always visible below the body when closed ── */}
      {!panelOpen && (
        <div className="advisor-card__toggle-row">
          <button
            className="advisor-card__toggle"
            onClick={togglePanel}
            aria-label="Expand"
          >
            <FaChevronDown />
          </button>
        </div>
      )}

      {/* Peek strip when collapsed but thread has messages */}
      {!panelOpen && thread.length > 0 && (
        <button className="advisor-card__thread-peek" onClick={togglePanel}>
          <span className={`thread-peek__role thread-peek__role--${thread[thread.length - 1].role}`}>
            {thread[thread.length - 1].role === 'user' ? 'You' : 'AI'}:
          </span>{' '}
          <span className="thread-peek__text">
            {thread[thread.length - 1].content.slice(0, 90)}
            {thread[thread.length - 1].content.length > 90 ? '…' : ''}
          </span>
        </button>
      )}
    </article>
  )
}

// ── Skeleton ──────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="advisor-card advisor-card--skeleton">
      <div className="skeleton-header">
        <div className="skeleton-circle" />
        <div className="skeleton-lines">
          <div className="skeleton-line skeleton-line--short" />
          <div className="skeleton-line skeleton-line--medium" />
        </div>
      </div>
      <div className="skeleton-line skeleton-line--long" />
      <div className="skeleton-line skeleton-line--medium" />
      <div className="skeleton-chips">
        <div className="skeleton-chip" /><div className="skeleton-chip" />
      </div>
    </div>
  )
}

// ── Drag-and-drop feed ────────────────────────────────────────
function DraggableFeed({ cards, threadMap, thinkingCards, expandedCards, onSaveToggle, onReorder, onSend, onExpand, onCollapse, onDelete }) {
  const [items, setItems]     = useState(cards)
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)
  const commitRef             = useRef(null)

  useEffect(() => { setItems(cards) }, [cards])

  const handleDragStart = (idx) => (e) => {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
    const ghost = document.createElement('div')
    ghost.style.cssText = 'position:absolute;top:-9999px'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  const handleDragEnter = (idx) => () => {
    if (idx === dragIdx) return
    setOverIdx(idx)
    setItems(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx, 1)
      next.splice(idx, 0, moved)
      setDragIdx(idx)
      return next
    })
  }

  const handleDragEnd = () => {
    setDragIdx(null); setOverIdx(null)
    clearTimeout(commitRef.current)
    commitRef.current = setTimeout(() => {
      onReorder(items.map((card, i) => ({ id: card.id, sort_order: i })))
    }, 300)
  }

  return (
    <>
      {items.map((card, idx) => (
        <div
          key={card.id}
          className={`dnd-row ${dragIdx === idx ? 'dnd-row--dragging' : ''} ${overIdx === idx ? 'dnd-row--over' : ''}`}
          draggable
          onDragStart={handleDragStart(idx)}
          onDragEnter={handleDragEnter(idx)}
          onDragOver={e => e.preventDefault()}
          onDragEnd={handleDragEnd}
        >
          <AdvisorCard
            card={card}
            thread={threadMap[card.id] || []}
            isThinking={thinkingCards.has(card.id)}
            isExpanded={expandedCards.has(card.id)}
            isPinned={card.id === pinnedCardId}
            onSaveToggle={onSaveToggle}
            onPinToggle={onPinToggle}
            onSend={(msg) => onSend(card.id, msg, card.title, card.body)}
            onExpand={onExpand}
            onCollapse={onCollapse}
            onDelete={onDelete}
            isDragging={dragIdx === idx}
            dragHandleProps={{
              onMouseDown: e => e.currentTarget.closest('[draggable]').setAttribute('draggable', true),
            }}
          />
        </div>
      ))}
    </>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function AdvisorCards({
  userId = null,
  cards = [],
  isLoading = false,
  isGenerating = false,
  isAsking = false,
  generatedAt = null,
  onRefresh,
  onChipClick,
  onSaveToggle,
  onPinToggle,
  pinnedCardId = null,
  onReorder,
  onDeleteCard,
  freeformInput,
  setFreeformInput,
  onFreeformSubmit,
}) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [timeAgo, setTimeAgo] = useState('')

  const storageKey = userId ? `advisor_threads_${userId}` : 'advisor_threads'

  const [threadMap, setThreadMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem(userId ? `advisor_threads_${userId}` : 'advisor_threads') || '{}') } catch { return {} }
  })
  const [thinkingCards, setThinking] = useState(new Set())
  const [expandedCards, setExpanded] = useState(new Set())

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(threadMap)) } catch {}
  }, [threadMap, storageKey])

  const feedRef = useRef(null)
  const prevLen = useRef(cards.length)

  useEffect(() => {
    if (cards.length > prevLen.current && feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
    prevLen.current = cards.length
  }, [cards.length])

  useEffect(() => {
    if (!generatedAt) return
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(generatedAt).getTime()) / 60000)
      if (diff < 1)  setTimeAgo('just now')
      else if (diff === 1) setTimeAgo('1 min ago')
      else if (diff < 60) setTimeAgo(`${diff} mins ago`)
      else setTimeAgo(`${Math.floor(diff / 60)}h ago`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [generatedAt])

  const handleSend = useCallback(async (cardId, message, cardTitle, cardBody) => {
    setExpanded(prev => new Set([...prev, cardId]))
    setThreadMap(prev => ({
      ...prev,
      [cardId]: [...(prev[cardId] || []), { role: 'user', content: message }],
    }))
    setThinking(prev => new Set([...prev, cardId]))

    try {
      const reply = await onChipClick(cardId, message, cardTitle, cardBody)
      setThreadMap(prev => ({
        ...prev,
        [cardId]: [...(prev[cardId] || []), { role: 'assistant', content: reply }],
      }))
    } catch {
      setThreadMap(prev => ({
        ...prev,
        [cardId]: [...(prev[cardId] || []), { role: 'assistant', content: 'Something went wrong. Please try again.' }],
      }))
    } finally {
      setThinking(prev => { const n = new Set(prev); n.delete(cardId); return n })
    }
  }, [onChipClick])

  const handleExpand   = useCallback((id) => setExpanded(prev => new Set([...prev, id])), [])
  const handleCollapse = useCallback((id) => setExpanded(prev => { const n = new Set(prev); n.delete(id); return n }), [])

  const handleDelete = useCallback((cardId) => {
    setExpanded(prev  => { const n = new Set(prev); n.delete(cardId); return n })
    setThreadMap(prev => { const n = { ...prev }; delete n[cardId]; return n })
    setThinking(prev  => { const n = new Set(prev); n.delete(cardId); return n })
    try {
      const existing = JSON.parse(localStorage.getItem(deletedKey) || '[]')
      if (!existing.includes(cardId)) {
        localStorage.setItem(deletedKey, JSON.stringify([...existing, cardId]))
      }
    } catch {}
    if (onDeleteCard) onDeleteCard(cardId)
  }, [onDeleteCard])

  const handlePinToggle = useCallback((card, thread) => {
    const isCurrentlyPinned = card.id === pinnedCardId
    if (onPinToggle) onPinToggle(isCurrentlyPinned ? null : card, isCurrentlyPinned ? [] : thread)
  }, [pinnedCardId, onPinToggle])

  const showSkeletons = isLoading || isGenerating

  const categoryCounts = cards.reduce((acc, card) => {
    const cat = card.category || 'planning'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  const savedCards = cards.filter(c => c.is_saved)

  const filteredCards =
    activeCategory === 'all'   ? cards :
    activeCategory === 'saved' ? savedCards :
    cards.filter(c => (c.category || 'planning') === activeCategory)

  const activeCats = CARD_CATEGORIES.filter(cat => categoryCounts[cat])

  return (
    <div className="advisor-cards-root">

      {/* ── Header ── */}
      <header className="advisor-cards-header">
        <div className="advisor-cards-header__left">
          <FaRobot className="header-robot-icon" />
          <h2 className="advisor-cards-header__title">Academic Brief</h2>
          {generatedAt && !showSkeletons && (
            <span className="advisor-cards-header__timestamp">Updated {timeAgo}</span>
          )}
        </div>
        <button
          className={`advisor-cards-refresh ${isGenerating ? 'spinning' : ''}`}
          onClick={onRefresh}
          disabled={isGenerating}
          title="Refresh cards"
        >
          <FaSync />
        </button>
      </header>

      {/* ── Category bar ── */}
      {!showSkeletons && activeCats.length > 1 && (
        <nav className="category-bar">
          <button
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <FaClipboardList className="category-tab__icon" />
            All
            <span className="category-tab__count">{cards.length}</span>
          </button>

          {activeCats.map(cat => {
            const CatIcon = CATEGORY_ICON_COMPONENTS[cat] || FaMapMarkedAlt
            return (
              <button
                key={cat}
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                <CatIcon className="category-tab__icon" />
                {CATEGORY_LABELS[cat]}
                <span className="category-tab__count">{categoryCounts[cat]}</span>
              </button>
            )
          })}

          <button
            className={`category-tab category-tab--saved ${activeCategory === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveCategory('saved')}
          >
            <FaBookmark className="category-tab__icon" />
            Saved
            {savedCards.length > 0 && (
              <span className="category-tab__count category-tab__count--saved">{savedCards.length}</span>
            )}
          </button>
        </nav>
      )}

      {/* ── Card feed ── */}
      <div className="advisor-cards-feed" ref={feedRef}>
        {showSkeletons ? (
          <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
        ) : filteredCards.length === 0 && cards.length === 0 ? (
          <div className="advisor-cards-empty">
            <FaGraduationCap className="empty-icon" />
            <p>Your academic brief is being prepared.</p>
            <button className="btn-primary" onClick={onRefresh}>Generate Now</button>
          </div>
        ) : filteredCards.length === 0 && activeCategory === 'saved' ? (
          <div className="advisor-cards-empty">
            <FaBookmark className="empty-icon" />
            <p>No saved cards yet. Bookmark cards to keep them here.</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="advisor-cards-empty">
            {(() => { const I = CATEGORY_ICON_COMPONENTS[activeCategory] || FaMapMarkedAlt; return <I className="empty-icon" /> })()}
            <p>No {CATEGORY_LABELS[activeCategory]} cards right now.</p>
          </div>
        ) : (
          <DraggableFeed
            cards={filteredCards}
            threadMap={threadMap}
            thinkingCards={thinkingCards}
            expandedCards={expandedCards}
            pinnedCardId={pinnedCardId}
            onSaveToggle={onSaveToggle}
            onPinToggle={handlePinToggle}
            onReorder={onReorder}
            onSend={handleSend}
            onExpand={handleExpand}
            onCollapse={handleCollapse}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* ── Freeform input ── */}
      <form className="advisor-cards-freeform" onSubmit={onFreeformSubmit}>
        <input
          type="text"
          className="freeform-input"
          placeholder="Ask anything about your academics — creates a new chat card"
          value={freeformInput}
          onChange={e => setFreeformInput(e.target.value)}
          disabled={isAsking}
        />
        <button
          type="submit"
          className="freeform-send"
          disabled={isAsking || !freeformInput.trim()}
        >
          {isAsking
            ? <span className="thinking-dots small"><span /><span /><span /></span>
            : <FaArrowRight />}
        </button>
      </form>

    </div>
  )
}