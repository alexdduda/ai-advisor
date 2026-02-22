import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  FaRobot,
  FaGraduationCap,
  FaExclamationTriangle,
  FaLightbulb,
  FaChartLine,
  FaCalendarAlt,
  FaBook,
  FaClipboardList,
  FaStar,
  FaComments,
  FaSync,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaBolt,
  FaPlus,
  FaArrowRight,
} from 'react-icons/fa'
import { CARD_CATEGORIES, CATEGORY_LABELS } from '../../../lib/cardsAPI'
import './AdvisorCards.css'

// ── Card type config ──────────────────────────────────────────
const CARD_CONFIG = {
  urgent:   { accent: 'var(--card-urgent)',   Icon: FaExclamationTriangle },
  warning:  { accent: 'var(--card-warning)',  Icon: FaExclamationTriangle },
  insight:  { accent: 'var(--card-insight)',  Icon: FaLightbulb },
  progress: { accent: 'var(--card-progress)', Icon: FaChartLine },
}

const CATEGORY_ICON_COMPONENTS = {
  deadlines:     FaCalendarAlt,
  degree:        FaGraduationCap,
  courses:       FaBook,
  grades:        FaChartLine,
  planning:      FaClipboardList,
  opportunities: FaStar,
  other:         FaComments,
}

// ── Thread messages ───────────────────────────────────────────
function ThreadMessages({ thread, isThinking }) {
  const bottomRef = useRef(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip scroll on first render so opening a thread doesn't jump the page
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [thread, isThinking])

  return (
    <>
      {thread.map((msg, i) => (
        <div key={i} className={`thread-message thread-message--${msg.role}`}>
          {msg.role === 'assistant' && (
            <span className="thread-avatar"><FaRobot /></span>
          )}
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
      <div ref={bottomRef} />
    </>
  )
}

// ── Thread input ──────────────────────────────────────────────
function ThreadInput({ onSubmit, isThinking, placeholder = 'Ask a follow-up…', autoFocus = false }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus) setTimeout(() => inputRef.current?.focus(), 50)
  }, [autoFocus])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim() || isThinking) return
    onSubmit(value.trim())
    setValue('')
  }

  return (
    <form className="thread-input-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className="thread-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => setValue(e.target.value)}
        disabled={isThinking}
      />
      <button type="submit" className="thread-send" disabled={isThinking || !value.trim()}>
        {isThinking
          ? <span className="thinking-dots small"><span /><span /><span /></span>
          : <FaArrowRight />}
      </button>
    </form>
  )
}

// ── Thread modal ──────────────────────────────────────────────
function ThreadModal({ card, thread, isThinking, onSend, onClose }) {
  const config = CARD_CONFIG[card.card_type || card.type] || CARD_CONFIG.insight
  const CategoryIcon = CATEGORY_ICON_COMPONENTS[card.category || 'other'] || FaComments
  const overlayRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return createPortal(
    <div
      className="thread-modal-overlay"
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="thread-modal"
        style={{ '--card-accent': config.accent }}
        role="dialog"
        aria-modal="true"
      >
        <div className="thread-modal__header">
          <div className="thread-modal__card-info">
            <span className="thread-modal__cat-icon"><CategoryIcon /></span>
            <div className="thread-modal__card-text">
              <span className="thread-modal__label">{card.label}</span>
              <h3 className="thread-modal__title">{card.title}</h3>
            </div>
          </div>
          <button className="thread-modal__close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <div className="thread-modal__summary">
          <p>{card.body}</p>
        </div>

        <div className="thread-modal__messages">
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
function AdvisorCard({ card, onChipClick }) {
  const [thread, setThread]         = useState([])
  const [collapsed, setCollapsed]   = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [chips, setChips]           = useState(card.actions || [])
  const [modalOpen, setModalOpen]   = useState(false)

  const config     = CARD_CONFIG[card.card_type || card.type] || CARD_CONFIG.insight
  const CardIcon   = config.Icon
  const isUserCard = card.source === 'user'

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

  return (
    <>
      <article
        className={`advisor-card advisor-card--${card.card_type || card.type}${isUserCard ? ' advisor-card--user' : ''}`}
        style={{ '--card-accent': config.accent }}
      >
        {/* Header */}
        <div className="advisor-card__header">
          <span className="advisor-card__icon"><CardIcon /></span>
          <div className="advisor-card__meta">
            <div className="advisor-card__meta-top">
              <span className="advisor-card__label">{card.label}</span>
              {isUserCard && <span className="advisor-card__user-badge">Asked by you</span>}
            </div>
            <h3 className="advisor-card__title">{card.title}</h3>
          </div>
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

// ── Main component ────────────────────────────────────────────
export default function AdvisorCards({
  cards = [],
  isLoading = false,
  isGenerating = false,
  isAsking = false,
  generatedAt = null,
  onRefresh,
  onChipClick,
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
          filteredCards.map(card => (
            <AdvisorCard key={card.id} card={card} onChipClick={onChipClick} />
          ))
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