import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  FaRobot, FaSync, FaChevronDown, FaChevronUp,
  FaBolt, FaPlus, FaArrowRight, FaGraduationCap,
  FaClipboardList, FaComments, FaCalendarAlt,
  FaChartBar, FaMapMarkedAlt, FaLightbulb,
  FaBookmark, FaRegBookmark, FaThumbtack,
  FaGripVertical,
} from 'react-icons/fa'
import { CARD_CATEGORIES, CATEGORY_LABELS } from '../../../lib/cardsAPI'
import './AdvisorCards.css'

// ── Category → icon component map ────────────────────────────
const CATEGORY_ICON_COMPONENTS = {
  deadlines:     FaCalendarAlt,
  degree:        FaGraduationCap,
  courses:       FaClipboardList,
  grades:        FaChartBar,
  planning:      FaMapMarkedAlt,
  opportunities: FaLightbulb,
  other:         FaComments,
}

// ── Card type → accent colour ─────────────────────────────────
const CARD_CONFIG = {
  urgent:   { accent: 'var(--card-urgent,   #ED1B2F)' },
  warning:  { accent: 'var(--card-warning,  #F59E0B)' },
  insight:  { accent: 'var(--card-insight,  #3B82F6)' },
  progress: { accent: 'var(--card-progress, #10B981)' },
}

// ── Thread sub-components ─────────────────────────────────────

function ThreadMessages({ thread, isThinking }) {
  const scrollRef = useRef(null)

  // Scroll the messages container (not the page) to the bottom on each update
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [thread.length, isThinking])

  return (
    <div className="thread-messages" ref={scrollRef}>
      {thread.map((msg, i) => (
        <div key={i} className={`thread-message thread-message--${msg.role}`}>
          <span className="thread-avatar">
            {msg.role === 'user' ? '👤' : <FaRobot />}
          </span>
          <p className="thread-text">{msg.content}</p>
        </div>
      ))}
      {isThinking && (
        <div className="thread-message thread-message--assistant">
          <span className="thread-avatar"><FaRobot /></span>
          <p className="thread-text">
            <span className="thinking-dots"><span /><span /><span /></span>
          </p>
        </div>
      )}
    </div>
  )
}

function ThreadInput({ onSubmit, isThinking, placeholder = 'Ask a follow-up…', autoFocus = false }) {
  const [value, setValue] = useState('')
  const handle = (e) => {
    e.preventDefault()
    if (!value.trim() || isThinking) return
    onSubmit(value.trim())
    setValue('')
  }
  return (
    <form className="thread-input-form" onSubmit={handle}>
      <input
        className="thread-input"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={isThinking}
        autoFocus={autoFocus}
      />
      <button className="thread-send" type="submit" disabled={isThinking || !value.trim()}>
        <FaArrowRight />
      </button>
    </form>
  )
}

function ThreadModal({ card, thread, isThinking, onSend, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="thread-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="thread-modal" role="dialog" aria-modal="true">
        <div className="thread-modal__header">
          <h3 className="thread-modal__title">{card.title}</h3>
          <button className="thread-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="thread-modal__body">
          {thread.length === 0 && !isThinking ? (
            <div className="thread-modal__empty">
              <FaRobot className="thread-modal__empty-icon" />
              <p>Ask anything about this insight.</p>
            </div>
          ) : (
            <ThreadMessages thread={thread} isThinking={isThinking} />
          )}
        </div>
        <div className="thread-modal__input-area">
          <ThreadInput
            onSubmit={onSend}
            isThinking={isThinking}
            placeholder="Ask a follow-up question…"
            autoFocus
          />
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Individual card ───────────────────────────────────────────
function AdvisorCard({ card, onChipClick, onSaveToggle, dragHandleProps, isDragging }) {
  const [thread, setThread]         = useState([])
  const [collapsed, setCollapsed]   = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [chips, setChips]           = useState(card.actions || [])
  const [modalOpen, setModalOpen]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const cardRef                     = useRef(null)
  const threadOpenedRef             = useRef(false)

  // When thread first opens, scroll the card into view (top-anchored)
  // so the feed doesn't jump the user below the card.
  useEffect(() => {
    if (thread.length > 0 && !threadOpenedRef.current) {
      threadOpenedRef.current = true
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 50)
    }
    if (thread.length === 0) threadOpenedRef.current = false
  }, [thread.length])

  const config     = CARD_CONFIG[card.card_type || card.type] || CARD_CONFIG.insight
  const CardIcon   = CATEGORY_ICON_COMPONENTS[card.category || 'other'] || FaComments
  const isUserCard = card.source === 'user'
  const isSaved    = card.is_saved || false

  const runThread = useCallback(async (message, isChip = false) => {
    if (isChip) setChips(prev => prev.filter(c => c !== message))
    setThread(prev => [...prev, { role: 'user', content: message }])
    setIsThinking(true)
    try {
      const reply = await onChipClick(card.id, message, card.title, card.body)
      setThread(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setThread(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      }])
    } finally {
      setIsThinking(false)
    }
  }, [card.id, card.title, card.body, onChipClick])

  const handleSave = async (e) => {
    e.stopPropagation()
    if (saving) return
    setSaving(true)
    try {
      await onSaveToggle(card.id, !isSaved)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <article
        className={[
          'advisor-card',
          `advisor-card--${card.card_type || card.type}`,
          isUserCard ? 'advisor-card--user' : '',
          isSaved    ? 'advisor-card--saved' : '',
          isDragging ? 'advisor-card--dragging' : '',
        ].filter(Boolean).join(' ')}
        style={{ '--card-accent': config.accent }}
        ref={cardRef}
      >
        {/* Drag handle */}
        <span className="advisor-card__drag-handle" {...dragHandleProps} title="Drag to reorder">
          <FaGripVertical />
        </span>

        {/* Header */}
        <div className="advisor-card__header">
          <span className="advisor-card__icon"><CardIcon /></span>
          <div className="advisor-card__meta">
            <div className="advisor-card__meta-top">
              <span className="advisor-card__label">{card.label}</span>
              {isUserCard && <span className="advisor-card__user-badge">Asked by you</span>}
              {isSaved && (
                <span className="advisor-card__saved-badge">
                  <FaThumbtack className="saved-badge__icon" /> Saved
                </span>
              )}
            </div>
            <h3 className="advisor-card__title">{card.title}</h3>
          </div>

          {/* Save button */}
          <button
            className={`advisor-card__save ${isSaved ? 'advisor-card__save--active' : ''}`}
            onClick={handleSave}
            disabled={saving}
            title={isSaved ? 'Remove bookmark' : 'Bookmark — keep after refresh'}
            aria-label={isSaved ? 'Remove bookmark' : 'Bookmark card'}
          >
            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
          </button>

          {thread.length > 0 && (
            <button
              className="advisor-card__collapse"
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? 'Show thread' : 'Hide thread'}
            >
              {collapsed ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          )}
        </div>

        {/* Body */}
        <p className="advisor-card__body">{card.body}</p>

        {/* Chips + plus bubble */}
        <div className="advisor-card__chips">
          {chips.map((chip, i) => (
            <button
              key={i}
              className="advisor-card__chip"
              onClick={() => runThread(chip, true)}
              disabled={isThinking}
            >
              <FaBolt className="chip-icon" />
              {chip}
            </button>
          ))}
          <button
            className="advisor-card__chip advisor-card__chip--plus"
            onClick={() => setModalOpen(true)}
            title="Ask your own question"
            aria-label="Open chat"
            disabled={isThinking}
          >
            <FaPlus />
          </button>
        </div>

        {/* Inline thread — appears after first chip/message */}
        {!collapsed && thread.length > 0 && (
          <div className="advisor-card__thread">
            <div className="thread-divider" />
            <ThreadMessages thread={thread} isThinking={isThinking} />
            <ThreadInput
              onSubmit={msg => runThread(msg, false)}
              isThinking={isThinking}
            />
          </div>
        )}
      </article>

      {modalOpen && (
        <ThreadModal
          card={card}
          thread={thread}
          isThinking={isThinking}
          onSend={msg => runThread(msg, false)}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
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
        <div className="skeleton-chip" />
        <div className="skeleton-chip" />
      </div>
    </div>
  )
}

// ── Drag-and-drop feed ────────────────────────────────────────
function DraggableFeed({ cards, onChipClick, onSaveToggle, onReorder }) {
  const [items, setItems]       = useState(cards)
  const [dragIdx, setDragIdx]   = useState(null)
  const [overIdx, setOverIdx]   = useState(null)
  const commitRef               = useRef(null)

  // Keep in sync when parent cards change (e.g. after refresh/save)
  useEffect(() => { setItems(cards) }, [cards])

  const handleDragStart = (idx) => (e) => {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
    // transparent drag image so we can style ourselves
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
    setDragIdx(null)
    setOverIdx(null)
    // Persist the new order — debounce slightly
    clearTimeout(commitRef.current)
    commitRef.current = setTimeout(() => {
      const order = items.map((card, i) => ({ id: card.id, sort_order: i }))
      onReorder(order)
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
            onChipClick={onChipClick}
            onSaveToggle={onSaveToggle}
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

// ── Main component ────────────────────────────────────────────
export default function AdvisorCards({
  cards = [],
  isLoading = false,
  isGenerating = false,
  isAsking = false,
  generatedAt = null,
  onRefresh,
  onChipClick,
  onSaveToggle,
  onReorder,
  freeformInput,
  setFreeformInput,
  onFreeformSubmit,
}) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    if (!generatedAt) return
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(generatedAt).getTime()) / 60000)
      if (diff < 1) setTimeAgo('just now')
      else if (diff === 1) setTimeAgo('1 min ago')
      else if (diff < 60) setTimeAgo(`${diff} mins ago`)
      else setTimeAgo(`${Math.floor(diff / 60)}h ago`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [generatedAt])

  const showSkeletons = isLoading || isGenerating

  const categoryCounts = cards.reduce((acc, card) => {
    const cat = card.category || 'other'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  const filteredCards = activeCategory === 'all'
    ? cards
    : cards.filter(c => (c.category || 'other') === activeCategory)

  const activeCats = CARD_CATEGORIES.filter(cat => categoryCounts[cat])

  return (
    <div className="advisor-cards-root">

      {/* Header */}
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

      {/* Category filter bar */}
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
            const CatIcon = CATEGORY_ICON_COMPONENTS[cat] || FaComments
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
        </nav>
      )}

      {/* Card feed */}
      <div className="advisor-cards-feed">
        {showSkeletons ? (
          <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
        ) : filteredCards.length === 0 && cards.length === 0 ? (
          <div className="advisor-cards-empty">
            <FaGraduationCap className="empty-icon" />
            <p>Your academic brief is being prepared.</p>
            <button className="btn-primary" onClick={onRefresh}>Generate Now</button>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="advisor-cards-empty">
            {(() => { const I = CATEGORY_ICON_COMPONENTS[activeCategory] || FaComments; return <I className="empty-icon" /> })()}
            <p>No {CATEGORY_LABELS[activeCategory]} cards right now.</p>
          </div>
        ) : (
          <DraggableFeed
            cards={filteredCards}
            onChipClick={onChipClick}
            onSaveToggle={onSaveToggle}
            onReorder={onReorder}
          />
        )}
      </div>

      {/* Freeform question input */}
      <form className="advisor-cards-freeform" onSubmit={onFreeformSubmit}>
        <input
          type="text"
          className="freeform-input"
          placeholder="Ask anything about your academics…"
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