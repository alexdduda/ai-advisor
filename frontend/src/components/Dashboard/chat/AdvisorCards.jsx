import { useState, useEffect } from 'react'
import { FaRobot } from 'react-icons/fa'
import { HiRefresh, HiChevronDown, HiChevronUp, HiLightningBolt } from 'react-icons/hi'
import { CARD_CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS } from '../../../lib/cardsAPI'
import './AdvisorCards.css'

// ── Card type → accent colour ─────────────────────────────────
const CARD_CONFIG = {
  urgent:   { accent: 'var(--card-urgent)'   },
  warning:  { accent: 'var(--card-warning)'  },
  insight:  { accent: 'var(--card-insight)'  },
  progress: { accent: 'var(--card-progress)' },
}

// ── Individual card ───────────────────────────────────────────
function AdvisorCard({ card, onChipClick, onFollowUp }) {
  const [thread, setThread]           = useState([])
  const [collapsed, setCollapsed]     = useState(false)
  const [followUpInput, setFollowUp]  = useState('')
  const [isThinking, setIsThinking]   = useState(false)
  const [chips, setChips]             = useState(card.actions || [])

  const config = CARD_CONFIG[card.card_type || card.type] || CARD_CONFIG.insight
  const isUserCard = card.source === 'user'

  const runThread = async (message, isChip = false) => {
    if (isChip) setChips(prev => prev.filter(c => c !== message))
    setThread(prev => [...prev, { role: 'user', content: message }])
    setIsThinking(true)
    try {
      const reply = await onChipClick(card.id, message, card.title, card.body)
      setThread(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setThread(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setIsThinking(false)
    }
  }

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault()
    if (!followUpInput.trim() || isThinking) return
    const msg = followUpInput.trim()
    setFollowUp('')
    await runThread(msg, false)
  }

  const hasThread = thread.length > 0

  return (
    <article
      className={`advisor-card advisor-card--${card.card_type || card.type}${isUserCard ? ' advisor-card--user' : ''}`}
      style={{ '--card-accent': config.accent }}
    >
      {/* Header */}
      <div className="advisor-card__header">
        <span className="advisor-card__icon">{card.icon}</span>
        <div className="advisor-card__meta">
          <div className="advisor-card__meta-top">
            <span className="advisor-card__label">{card.label}</span>
            {isUserCard && <span className="advisor-card__user-badge">Asked by you</span>}
          </div>
          <h3 className="advisor-card__title">{card.title}</h3>
        </div>
        {hasThread && (
          <button
            className="advisor-card__collapse"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <HiChevronDown /> : <HiChevronUp />}
          </button>
        )}
      </div>

      {/* Body */}
      <p className="advisor-card__body">{card.body}</p>

      {/* Action chips */}
      {chips.length > 0 && (
        <div className="advisor-card__chips">
          {chips.map((chip, i) => (
            <button
              key={i}
              className="advisor-card__chip"
              onClick={() => runThread(chip, true)}
              disabled={isThinking}
            >
              <HiLightningBolt className="chip-icon" />
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Thread */}
      {hasThread && !collapsed && (
        <div className="advisor-card__thread">
          <div className="thread-divider" />
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
          <form className="thread-input-form" onSubmit={handleFollowUpSubmit}>
            <input
              className="thread-input"
              type="text"
              placeholder="Ask a follow-up…"
              value={followUpInput}
              onChange={e => setFollowUp(e.target.value)}
              disabled={isThinking}
            />
            <button type="submit" className="thread-send"
              disabled={isThinking || !followUpInput.trim()}>↵</button>
          </form>
        </div>
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
  onFollowUp,
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

  // Build category tab counts
  const categoryCounts = cards.reduce((acc, card) => {
    const cat = card.category || 'other'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  const filteredCards = activeCategory === 'all'
    ? cards
    : cards.filter(c => (c.category || 'other') === activeCategory)

  // Only show category tabs that have cards (plus 'all')
  const activeCats = CARD_CATEGORIES.filter(cat => categoryCounts[cat])

  return (
    <div className="advisor-cards-root">

      {/* Header */}
      <header className="advisor-cards-header">
        <div className="advisor-cards-header__left">
          <h2 className="advisor-cards-header__title">
            <FaRobot className="header-robot-icon" />
            Academic Brief
          </h2>
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
          <HiRefresh />
        </button>
      </header>

      {/* Category filter bar */}
      {!showSkeletons && activeCats.length > 1 && (
        <nav className="category-bar">
          <button
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
            <span className="category-tab__count">{cards.length}</span>
          </button>
          {activeCats.map(cat => (
            <button
              key={cat}
              className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span className="category-tab__icon">{CATEGORY_ICONS[cat]}</span>
              {CATEGORY_LABELS[cat]}
              <span className="category-tab__count">{categoryCounts[cat]}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Card feed */}
      <div className="advisor-cards-feed">
        {showSkeletons ? (
          <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
        ) : filteredCards.length === 0 && cards.length === 0 ? (
          <div className="advisor-cards-empty">
            <span className="empty-icon">🎓</span>
            <p>Your academic brief is being prepared.</p>
            <button className="btn-generate" onClick={onRefresh}>Generate Now</button>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="advisor-cards-empty">
            <span className="empty-icon">{CATEGORY_ICONS[activeCategory]}</span>
            <p>No {CATEGORY_LABELS[activeCategory]} cards right now.</p>
          </div>
        ) : (
          filteredCards.map(card => (
            <AdvisorCard
              key={card.id}
              card={card}
              onChipClick={onChipClick}
              onFollowUp={onFollowUp}
            />
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
          {isAsking ? (
            <span className="thinking-dots small"><span /><span /><span /></span>
          ) : '↵'}
        </button>
      </form>

    </div>
  )
}