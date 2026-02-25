import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  FaSearch, FaUsers, FaHeart, FaCalendarAlt,
  FaPlus, FaTimes, FaExternalLinkAlt, FaPaperPlane,
  FaEnvelope, FaCheck, FaBell, FaBellSlash,
  FaChevronRight, FaArrowLeft, FaMapMarkerAlt, FaClock,
  FaRegClock, FaInfoCircle, FaSort,
  FaBook, FaFootballBall, FaPalette, FaLaptopCode,
  FaGlobe, FaBriefcase, FaHeartbeat,
  FaHandHoldingHeart, FaGraduationCap, FaChevronDown
} from 'react-icons/fa'
import { MdGroups, MdOutlineExplore, MdPeopleAlt } from 'react-icons/md'
import { useLanguage } from '../../contexts/LanguageContext'
import clubsAPI from '../../lib/clubsAPI'
import './ClubsTab.css'

// ── Helpers ──────────────────────────────────────────────────
const CATEGORY_META = {
  'Academic':                { color: '#2563eb', bg: '#dbeafe', border: '#93c5fd', icon: <FaBook /> },
  'Engineering & Technology':{ color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd', icon: <FaLaptopCode /> },
  'Professional':            { color: '#0f766e', bg: '#ccfbf1', border: '#5eead4', icon: <FaBriefcase /> },
  'Debate & Politics':       { color: '#b45309', bg: '#fef3c7', border: '#fcd34d', icon: <FaGlobe /> },
  'Athletics & Recreation':  { color: '#16a34a', bg: '#dcfce7', border: '#86efac', icon: <FaFootballBall /> },
  'Arts & Culture':          { color: '#db2777', bg: '#fce7f3', border: '#f9a8d4', icon: <FaPalette /> },
  'Environment':             { color: '#15803d', bg: '#dcfce7', border: '#6ee7b7', icon: <FaHandHoldingHeart /> },
  'Health & Wellness':       { color: '#0284c7', bg: '#e0f2fe', border: '#7dd3fc', icon: <FaHeartbeat /> },
  'Community Service':       { color: '#ea580c', bg: '#ffedd5', border: '#fdba74', icon: <FaHandHoldingHeart /> },
  'International':           { color: '#0891b2', bg: '#cffafe', border: '#67e8f9', icon: <FaGlobe /> },
  'Science':                 { color: '#4f46e5', bg: '#e0e7ff', border: '#a5b4fc', icon: <FaBook /> },
  'Social':                  { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', icon: <FaUsers /> },
  'Spiritual & Religious':   { color: '#a16207', bg: '#fefce8', border: '#fde047', icon: <FaHeart /> },
  'Default':                 { color: 'var(--text-secondary)', bg: 'var(--bg-tertiary)', border: 'var(--border-secondary)', icon: <FaGraduationCap /> },
}

function getCat(category) {
  return CATEGORY_META[category] || CATEGORY_META.Default
}

// ── CategoryBadge ─────────────────────────────────────────────
function CategoryBadge({ category, size = 'sm' }) {
  if (!category) return null
  const meta = getCat(category)
  return (
    <span className={`club-category-badge club-category-badge--${size}`}
      style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}>
      <span className="club-category-badge__icon">{meta.icon}</span> {category}
    </span>
  )
}

// ── ClubAvatar ────────────────────────────────────────────────
function ClubAvatar({ name, category, size = 'md' }) {
  const meta = getCat(category)
  return (
    <div className={`club-avatar club-avatar--${size}`} style={{ background: meta.bg, color: meta.color }}>
      <span className="club-avatar__icon">{meta.icon}</span>
    </div>
  )
}

// ── ClubDetailDrawer ──────────────────────────────────────────
// FIX #6: Accept liveClub (from clubs list) in addition to the snapshot,
// so stats like member_count always reflect the latest fetched data.
function ClubDetailDrawer({ club, liveClub, joined, calSynced, onJoin, onLeave, onToggleCalendar, onClose, clubLoading }) {
  if (!club) return null
  // Prefer live data for fields that change (member_count), fall back to snapshot
  const display = liveClub ? { ...club, ...liveClub } : club
  const meta = getCat(display.category)
  const isLoading = clubLoading[club.id] ?? false

  return (
    <div className="club-drawer-overlay" onClick={onClose}>
      <aside className="club-drawer" onClick={e => e.stopPropagation()}>
        <div className="club-drawer__strip" style={{
          background: `linear-gradient(135deg, ${meta.color}18, ${meta.color}08)`,
          borderBottom: `3px solid ${meta.color}`
        }}>
          <button className="club-drawer__back" onClick={onClose}>
            <FaArrowLeft size={13} /> Back
          </button>
          <div className="club-drawer__strip-main">
            <ClubAvatar name={display.name} category={display.category} size="lg" />
            <div className="club-drawer__strip-text">
              <h2 className="club-drawer__name">{display.name}</h2>
              <CategoryBadge category={display.category} size="md" />
            </div>
          </div>
          <div className="club-drawer__strip-actions">
            {joined ? (
              <button className="club-action-btn club-action-btn--leave" onClick={() => onLeave(club.id)} disabled={isLoading}>
                <FaTimes size={12} /> Leave Club
              </button>
            ) : (
              <button className="club-action-btn club-action-btn--join" onClick={() => onJoin(club.id)} disabled={isLoading}>
                <FaPlus size={12} /> Join Club
              </button>
            )}
          </div>
        </div>

        <div className="club-drawer__body">
          {/* Stats */}
          <div className="club-drawer__stats">
            {display.member_count != null && (
              <div className="club-drawer__stat">
                <MdPeopleAlt size={22} style={{ color: meta.color }} />
                <span className="club-drawer__stat-value">{display.member_count}</span>
                <span className="club-drawer__stat-label">Members</span>
              </div>
            )}
            {display.meeting_schedule && (
              <div className="club-drawer__stat">
                <FaRegClock size={18} style={{ color: meta.color }} />
                <span className="club-drawer__stat-value" style={{ fontSize: '0.78rem', textAlign: 'center' }}>{display.meeting_schedule}</span>
                <span className="club-drawer__stat-label">Meets</span>
              </div>
            )}
            {display.location && (
              <div className="club-drawer__stat">
                <FaMapMarkerAlt size={18} style={{ color: meta.color }} />
                <span className="club-drawer__stat-value" style={{ fontSize: '0.78rem', textAlign: 'center' }}>{display.location}</span>
                <span className="club-drawer__stat-label">Location</span>
              </div>
            )}
          </div>

          {/* About */}
          {display.description && (
            <section className="club-drawer__section">
              <h3 className="club-drawer__section-title"><FaInfoCircle size={12} /> About</h3>
              <p className="club-drawer__desc">{display.description}</p>
            </section>
          )}

          {/* Calendar sync */}
          {joined && (
            <section className="club-drawer__section">
              <h3 className="club-drawer__section-title"><FaCalendarAlt size={12} /> Calendar Sync</h3>
              <div className="club-drawer__cal-row">
                <div className="club-drawer__cal-info">
                  <p>Sync this club's meetings to your Calendar tab.</p>
                  {display.meeting_schedule && (
                    <span className="club-drawer__cal-schedule"><FaCalendarAlt size={11} /> {display.meeting_schedule}</span>
                  )}
                </div>
                <button
                  className={`club-cal-toggle-btn ${calSynced ? 'active' : ''}`}
                  onClick={() => onToggleCalendar(club.id, !calSynced)}
                  style={calSynced ? { borderColor: meta.color, color: meta.color, background: meta.bg } : {}}
                >
                  {calSynced
                    ? <><FaBell size={12} /> Synced</>
                    : <><FaBellSlash size={12} /> Not synced</>}
                </button>
              </div>
            </section>
          )}

          {/* Links */}
          {(display.website_url || display.contact_email) && (
            <section className="club-drawer__section">
              <h3 className="club-drawer__section-title"><FaExternalLinkAlt size={11} /> Links & Contact</h3>
              <div className="club-drawer__links">
                {display.website_url && (
                  <a className="club-drawer__link-btn" href={display.website_url} target="_blank" rel="noopener noreferrer">
                    <FaExternalLinkAlt size={10} /> Visit Website
                  </a>
                )}
                {display.contact_email && (
                  <a className="club-drawer__link-btn" href={`mailto:${display.contact_email}`}>
                    <FaEnvelope size={10} /> {display.contact_email}
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  )
}

// ── ClubCard ──────────────────────────────────────────────────
// FIX #5: Accepts clubLoading map instead of a single boolean,
// so each card tracks its own loading state independently.
function ClubCard({ club, joined, calSynced, onJoin, onLeave, onToggleCalendar, onOpen, clubLoading }) {
  const meta = getCat(club.category)
  const [justJoined, setJustJoined] = useState(false)
  const isLoading = clubLoading[club.id] ?? false

  const handleJoin = async (e) => {
    e.stopPropagation()
    await onJoin(club.id)
    setJustJoined(true)
    setTimeout(() => setJustJoined(false), 2500)
  }

  return (
    <article className={`club-card ${joined ? 'club-card--joined' : ''}`} onClick={() => onOpen(club)}>
      <div className="club-card__accent" style={{ background: meta.color }} />

      {joined && (
        <div className="club-card__joined-badge" style={{ background: meta.color }}>
          <FaCheck size={8} /> Joined
        </div>
      )}

      <div className="club-card__body">
        <div className="club-card__top">
          <ClubAvatar name={club.name} category={club.category} size="md" />
          <div className="club-card__info">
            <h3 className="club-card__name">{club.name}</h3>
            <CategoryBadge category={club.category} />
          </div>
        </div>

        {club.description && (
          <p className="club-card__desc">
            {club.description.length > 105 ? club.description.slice(0, 105) + '…' : club.description}
          </p>
        )}

        <div className="club-card__meta-row">
          {club.member_count != null && (
            <span className="club-meta-chip"><FaUsers size={10} /> {club.member_count}</span>
          )}
          {club.meeting_schedule && (
            <span className="club-meta-chip"><FaClock size={10} /> {club.meeting_schedule.length > 20 ? club.meeting_schedule.slice(0,20)+'…' : club.meeting_schedule}</span>
          )}
          {club.location && (
            <span className="club-meta-chip"><FaMapMarkerAlt size={10} /> {club.location}</span>
          )}
        </div>
      </div>

      {/* FIX #7: stopPropagation on the footer wrapper so clicks here
          don't bubble up and trigger onOpen on the card */}
      <div className="club-card__footer" onClick={e => e.stopPropagation()}>
        {joined ? (
          <div className="club-card__footer-joined">
            <button
              className={`club-cal-chip ${calSynced ? 'active' : ''}`}
              onClick={() => onToggleCalendar(club.id, !calSynced)}
              style={calSynced ? { borderColor: meta.color, color: meta.color, background: meta.bg } : {}}
              title={calSynced ? 'Remove from calendar' : 'Add to calendar'}
            >
              <FaCalendarAlt size={10} />
              {calSynced ? 'Calendar On' : 'Calendar Off'}
            </button>
            <button className="club-leave-chip" onClick={() => onLeave(club.id)} disabled={isLoading}>
              <FaTimes size={10} /> Leave
            </button>
          </div>
        ) : (
          <button
            className={`club-join-btn ${justJoined ? 'done' : ''}`}
            onClick={handleJoin}
            disabled={isLoading}
            style={justJoined ? { background: meta.color, borderColor: meta.color } : {}}
          >
            {justJoined ? <><FaCheck size={10} /> Joined!</> : <><FaPlus size={10} /> Join</>}
          </button>
        )}
        <button className="club-card__open-btn" onClick={() => onOpen(club)} title="View details">
          <FaChevronRight size={11} />
        </button>
      </div>
    </article>
  )
}

// ── MyClubRow ─────────────────────────────────────────────────
// FIX #7: Wrap action buttons in a div with stopPropagation so
// clicking calendar/leave doesn't simultaneously open the drawer.
function MyClubRow({ club, calSynced, onLeave, onToggleCalendar, onOpen, clubLoading }) {
  const meta = getCat(club.category)
  const isLoading = clubLoading[club.id] ?? false
  return (
    <div className="my-club-row" onClick={() => onOpen(club)}>
      <ClubAvatar name={club.name} category={club.category} size="sm" />
      <div className="my-club-row__info">
        <span className="my-club-row__name">{club.name}</span>
        <CategoryBadge category={club.category} />
      </div>
      {/* FIX #7: stopPropagation wrapper prevents opening drawer when clicking buttons */}
      <div className="my-club-row__right" onClick={e => e.stopPropagation()}>
        {club.meeting_schedule && (
          <span className="my-club-row__schedule"><FaClock size={10} /> {club.meeting_schedule}</span>
        )}
        <button
          className={`club-cal-chip ${calSynced ? 'active' : ''}`}
          style={calSynced ? { borderColor: meta.color, color: meta.color, background: meta.bg } : {}}
          onClick={() => onToggleCalendar(club.id, !calSynced)}
          title={calSynced ? 'Disable calendar sync' : 'Sync to calendar'}
        >
          <FaCalendarAlt size={10} /> {calSynced ? 'Synced' : 'Sync'}
        </button>
        <button className="club-leave-chip small" onClick={() => onLeave(club.id)} disabled={isLoading} title="Leave club">
          <FaTimes size={10} />
        </button>
        <button className="club-card__open-btn" onClick={() => onOpen(club)}>
          <FaChevronRight size={11} />
        </button>
      </div>
    </div>
  )
}

// ── SubmitClubModal ───────────────────────────────────────────
function SubmitClubModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', category: '', description: '', meeting_schedule: '', website_url: '', contact_email: '', location: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState({})
  const set = key => val => setForm(f => ({ ...f, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.description.trim()) e.description = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try { await onSubmit(form); setDone(true) }
    catch { /* silent */ }
    finally { setSubmitting(false) }
  }

  return (
    <div className="clubs-modal-overlay" onClick={onClose}>
      <div className="clubs-modal" onClick={e => e.stopPropagation()}>
        <div className="clubs-modal__header">
          <div className="clubs-modal__header-left">
            <span className="clubs-modal__icon"><FaGraduationCap size={22} /></span>
            <div>
              <h2>Submit a Club</h2>
              <p>Help grow McGill's club directory</p>
            </div>
          </div>
          <button className="clubs-modal__close" onClick={onClose}><FaTimes /></button>
        </div>

        {done ? (
          <div className="clubs-modal__success">
            <span className="clubs-modal__success-icon"><FaCheck size={28} /></span>
            <h3>Submitted!</h3>
            <p>Your club has been queued for review and will be added soon.</p>
            <button className="club-action-btn club-action-btn--join" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form className="clubs-modal__body" onSubmit={handleSubmit} noValidate>
            <div className={`clubs-field ${errors.name ? 'error' : ''}`}>
              <label>Club Name <span className="req">*</span></label>
              <input value={form.name} onChange={e => set('name')(e.target.value)} placeholder="e.g. McGill Chess Club" />
              {errors.name && <span className="clubs-field-error">{errors.name}</span>}
            </div>

            <div className="clubs-field-row">
              <div className="clubs-field">
                <label>Category</label>
                <select value={form.category} onChange={e => set('category')(e.target.value)}>
                  <option value="">Select…</option>
                  {Object.keys(CATEGORY_META).filter(k => k !== 'Default').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="clubs-field">
                <label>Location</label>
                <input value={form.location} onChange={e => set('location')(e.target.value)} placeholder="e.g. Burnside 105" />
              </div>
            </div>

            <div className={`clubs-field ${errors.description ? 'error' : ''}`}>
              <label>Description <span className="req">*</span></label>
              <textarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3} placeholder="What does this club do?" />
              {errors.description && <span className="clubs-field-error">{errors.description}</span>}
            </div>

            <div className="clubs-field-row">
              <div className="clubs-field">
                <label>Meeting Schedule</label>
                <input value={form.meeting_schedule} onChange={e => set('meeting_schedule')(e.target.value)} placeholder="Tuesdays 5–7pm" />
              </div>
              <div className="clubs-field">
                <label>Contact Email</label>
                <input type="email" value={form.contact_email} onChange={e => set('contact_email')(e.target.value)} placeholder="club@mail.mcgill.ca" />
              </div>
            </div>

            <div className="clubs-field">
              <label>Website URL</label>
              <input type="url" value={form.website_url} onChange={e => set('website_url')(e.target.value)} placeholder="https://…" />
            </div>

            <div className="clubs-modal__footer">
              <button type="button" className="club-action-btn club-action-btn--ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="club-action-btn club-action-btn--join" disabled={submitting}>
                {submitting ? <><span className="btn-spinner" /> Submitting…</> : <><FaPaperPlane size={12} /> Submit Club</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── PAGE_SIZE constant for pagination (FIX #10) ───────────────
const PAGE_SIZE = 24

// ── Main ──────────────────────────────────────────────────────
export default function ClubsTab({ user, onClubEventsChange }) {
  const { t } = useLanguage()

  const [activeView, setActiveView] = useState('explore')
  const [clubs, setClubs] = useState([])
  const [categories, setCategories] = useState([])
  const [myClubs, setMyClubs] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortMode, setSortMode] = useState('default')
  const [loading, setLoading] = useState(false)
  const [myClubsLoading, setMyClubsLoading] = useState(false)
  const [error, setError] = useState(null)

  // FIX #5: Per-club loading map instead of a single shared boolean.
  // { [clubId]: true } while that specific club's action is in-flight.
  const [clubLoading, setClubLoading] = useState({})
  const setClubBusy = (clubId, busy) =>
    setClubLoading(prev => ({ ...prev, [clubId]: busy }))

  // FIX #10: Pagination state
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [openClub, setOpenClub] = useState(null)
  const [joinToast, setJoinToast] = useState(null)
  const debounceRef = useRef(null)

  // FIX #8: isMounted ref to prevent state updates after unmount
  const isMounted = useRef(true)
  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  const joinedIds    = useMemo(() => new Set(myClubs.map(m => m.club?.id ?? m.id)), [myClubs])
  const calSyncedIds = useMemo(() => new Set(myClubs.filter(m => m.calendar_synced).map(m => m.club?.id ?? m.id)), [myClubs])

  // FIX #10: Fetch a single page of clubs
  const fetchClubs = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) { setLoading(true); setError(null) }
    else setLoadingMore(true)

    try {
      const data = await clubsAPI.getClubs({
        search: debouncedSearch,
        category: selectedCategory,
        limit: PAGE_SIZE,
        offset: (pageNum - 1) * PAGE_SIZE,
      })
      const results = Array.isArray(data) ? data : data.clubs ?? []
      if (!isMounted.current) return

      if (pageNum === 1) {
        setClubs(results)
      } else {
        setClubs(prev => [...prev, ...results])
      }
      // If a full page came back, there might be more
      setHasMore(results.length === PAGE_SIZE)
      setPage(pageNum)
    } catch (e) {
      if (isMounted.current) setError(e.message)
    } finally {
      if (isMounted.current) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }, [debouncedSearch, selectedCategory])

  const fetchMyClubs = useCallback(async () => {
    if (!user?.id) return
    setMyClubsLoading(true)
    try {
      const data = await clubsAPI.getUserClubs(user.id)
      const list = Array.isArray(data) ? data : data.clubs ?? []
      if (!isMounted.current) return
      setMyClubs(list)
      if (onClubEventsChange) onClubEventsChange(buildClubCalendarEvents(list))
    } catch { /* silent */ }
    finally { if (isMounted.current) setMyClubsLoading(false) }
  }, [user?.id, onClubEventsChange])

  const fetchCategories = useCallback(async () => {
    try {
      const data = await clubsAPI.getCategories()
      if (isMounted.current) {
        setCategories(Array.isArray(data) ? data : data.categories ?? [])
      }
    } catch { /* silent */ }
  }, [])

  // Reset to page 1 whenever search/category changes
  useEffect(() => { setPage(1); fetchClubs(1) }, [fetchClubs])
  useEffect(() => { fetchMyClubs() }, [fetchMyClubs])
  useEffect(() => { fetchCategories() }, [fetchCategories])

  // FIX #8: Debounce with isMounted guard
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (isMounted.current) setDebouncedSearch(search)
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  // FIX #5: Per-club loading; optimistic member_count update on join
  const handleJoin = async (clubId) => {
    if (!user?.id) return
    setClubBusy(clubId, true)
    try {
      await clubsAPI.joinClub(user.id, clubId)
      await fetchMyClubs()
      // Optimistically bump member_count in clubs list
      setClubs(prev => prev.map(c =>
        c.id === clubId ? { ...c, member_count: (c.member_count ?? 0) + 1 } : c
      ))
      // FIX #6: Update openClub snapshot so drawer reflects new count
      if (openClub?.id === clubId) {
        setOpenClub(prev => prev ? { ...prev, member_count: (prev.member_count ?? 0) + 1 } : prev)
      }
      const club = clubs.find(c => c.id === clubId)
      if (club) { setJoinToast(`Joined ${club.name}!`); setTimeout(() => { if (isMounted.current) setJoinToast(null) }, 3000) }
    } catch (e) { setError(e.message) }
    finally { setClubBusy(clubId, false) }
  }

  const handleLeave = async (clubId) => {
    if (!user?.id) return
    setClubBusy(clubId, true)
    try {
      await clubsAPI.leaveClub(user.id, clubId)
      await fetchMyClubs()
      // Optimistically decrement member_count
      setClubs(prev => prev.map(c =>
        c.id === clubId ? { ...c, member_count: Math.max(0, (c.member_count ?? 1) - 1) } : c
      ))
      // FIX #6: Update openClub snapshot
      if (openClub?.id === clubId) {
        setOpenClub(prev => prev ? { ...prev, member_count: Math.max(0, (prev.member_count ?? 1) - 1) } : prev)
      }
    } catch (e) { setError(e.message) }
    finally { setClubBusy(clubId, false) }
  }

  // FIX #5: Calendar toggle also uses per-club loading
  const handleToggleCalendar = async (clubId, synced) => {
    setClubBusy(clubId, true)
    try {
      await clubsAPI.toggleCalendarSync(user.id, clubId, synced)
      await fetchMyClubs()
    } catch (e) { setError(e.message) }
    finally { setClubBusy(clubId, false) }
  }

  const handleSubmitClub = async (formData) => {
    await clubsAPI.submitClub({ ...formData, submitted_by: user?.id })
  }

  const displayClubs = useMemo(() => {
    let list = [...clubs]
    if (sortMode === 'members') list.sort((a, b) => (b.member_count ?? 0) - (a.member_count ?? 0))
    if (sortMode === 'name') list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
    return list
  }, [clubs, sortMode])

  const resolvedMyClubs = useMemo(() =>
    myClubs.map(m => ({ club: m.club ?? m, calendar_synced: m.calendar_synced ?? false })).filter(m => m.club?.id),
    [myClubs]
  )

  // FIX #6: Live club data map so drawer always shows fresh data
  const clubsById = useMemo(() => {
    const map = {}
    clubs.forEach(c => { map[c.id] = c })
    return map
  }, [clubs])

  return (
    <div className="clubs-tab">

      {/* Toast */}
      {joinToast && (
        <div className="clubs-toast">
          <FaCheck size={12} /> {joinToast}
        </div>
      )}

      {/* Header */}
      <div className="clubs-header">
        <div className="clubs-header__left">
          <div className="clubs-header__icon-wrap">
            <MdGroups size={26} />
          </div>
          <div>
            <h1 className="clubs-header__title">Student Clubs</h1>
            <p className="clubs-header__sub">Discover, join, and sync McGill clubs to your calendar</p>
          </div>
        </div>
        <button className="clubs-submit-btn" onClick={() => setShowSubmitModal(true)}>
          <FaPlus size={11} /> Submit a Club
        </button>
      </div>

      {/* Tabs */}
      <div className="clubs-tabs">
        <button className={`clubs-tab-btn ${activeView === 'explore' ? 'active' : ''}`} onClick={() => setActiveView('explore')}>
          <MdOutlineExplore size={15} /> Explore
        </button>
        <button className={`clubs-tab-btn ${activeView === 'my-clubs' ? 'active' : ''}`} onClick={() => setActiveView('my-clubs')}>
          <FaHeart size={12} /> My Clubs
          {resolvedMyClubs.length > 0 && <span className="clubs-tab-count">{resolvedMyClubs.length}</span>}
        </button>
      </div>

      {/* ── EXPLORE ── */}
      {activeView === 'explore' && (
        <div className="clubs-explore">

          {/* Search + sort */}
          <div className="clubs-toolbar">
            <div className="clubs-search-wrap">
              <FaSearch className="clubs-search-icon" size={13} />
              <input
                className="clubs-search-input"
                type="text"
                placeholder="Search clubs by name, keyword, or category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="clubs-search-clear" onClick={() => setSearch('')}><FaTimes size={11} /></button>}
            </div>
            <div className="clubs-sort-wrap">
              <FaSort size={11} />
              <select className="clubs-sort-select" value={sortMode} onChange={e => setSortMode(e.target.value)}>
                <option value="default">Default order</option>
                <option value="members">Most members</option>
                <option value="name">Name A→Z</option>
              </select>
            </div>
          </div>

          {/* Category chips */}
          {categories.length > 0 && (
            <div className="clubs-filter-row">
              <div className="clubs-category-chips">
                <button
                  className={`clubs-chip ${!selectedCategory ? 'clubs-chip--all-active' : 'clubs-chip--all'}`}
                  onClick={() => setSelectedCategory('')}
                >
                  All
                </button>
                {categories.map(cat => {
                  const meta = getCat(cat)
                  const active = selectedCategory === cat
                  return (
                    <button
                      key={cat}
                      className={`clubs-chip ${active ? 'clubs-chip--active' : ''}`}
                      style={{
                        background: meta.bg,
                        color: meta.color,
                        borderColor: active ? meta.color : meta.border,
                        fontWeight: active ? 700 : 500,
                        opacity: active ? 1 : 0.75,
                      }}
                      onClick={() => setSelectedCategory(p => p === cat ? '' : cat)}
                    >
                      <span className="clubs-chip__icon">{meta.icon}</span> {cat}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="clubs-error">{error}<button onClick={() => setError(null)}><FaTimes size={11} /></button></div>
          )}

          {loading ? (
            <div className="clubs-loading"><div className="clubs-spinner" /><p>Loading clubs…</p></div>
          ) : displayClubs.length === 0 ? (
            <div className="clubs-empty">
              <div className="clubs-empty__visual"><FaSearch size={52} /></div>
              <h3>No clubs found</h3>
              <p>Try different keywords or <button className="clubs-empty__link" onClick={() => setShowSubmitModal(true)}>submit a new club</button>.</p>
            </div>
          ) : (
            <>
              <p className="clubs-results-label">
                <strong>{displayClubs.length}</strong> club{displayClubs.length !== 1 ? 's' : ''}
                {selectedCategory && <> in <em>{selectedCategory}</em></>}
                {debouncedSearch && <> matching "<em>{debouncedSearch}</em>"</>}
                {hasMore && <> — showing first {displayClubs.length}</>}
              </p>
              <div className="clubs-grid">
                {displayClubs.map(club => (
                  <ClubCard
                    key={club.id}
                    club={club}
                    joined={joinedIds.has(club.id)}
                    calSynced={calSyncedIds.has(club.id)}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                    onToggleCalendar={handleToggleCalendar}
                    onOpen={setOpenClub}
                    clubLoading={clubLoading}
                  />
                ))}
              </div>

              {/* FIX #10: Load more button */}
              {hasMore && (
                <div className="clubs-load-more">
                  <button
                    className="clubs-load-more__btn"
                    onClick={() => fetchClubs(page + 1)}
                    disabled={loadingMore}
                  >
                    {loadingMore
                      ? <><span className="btn-spinner" style={{ borderTopColor: 'var(--accent-primary)' }} /> Loading…</>
                      : <><FaChevronDown size={11} /> Load more clubs</>}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── MY CLUBS ── */}
      {activeView === 'my-clubs' && (
        <div className="clubs-mine">
          {myClubsLoading ? (
            <div className="clubs-loading"><div className="clubs-spinner" /><p>Loading your clubs…</p></div>
          ) : resolvedMyClubs.length === 0 ? (
            <div className="clubs-empty">
              <div className="clubs-empty__visual" style={{ opacity: 0.2 }}><FaHeart size={52} /></div>
              <h3>No clubs joined yet</h3>
              <p>Find something you're passionate about in the Explore tab.</p>
              <button className="club-action-btn club-action-btn--join" onClick={() => setActiveView('explore')}>
                <MdOutlineExplore size={13} /> Browse Clubs
              </button>
            </div>
          ) : (
            <div className="clubs-mine__list">
              {resolvedMyClubs.map(({ club, calendar_synced }) => (
                <MyClubRow
                  key={club.id}
                  club={club}
                  calSynced={calendar_synced}
                  onLeave={handleLeave}
                  onToggleCalendar={handleToggleCalendar}
                  onOpen={setOpenClub}
                  clubLoading={clubLoading}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drawer */}
      {/* FIX #6: Pass liveClub from clubsById so drawer always shows fresh data */}
      {openClub && (
        <ClubDetailDrawer
          club={openClub}
          liveClub={clubsById[openClub.id]}
          joined={joinedIds.has(openClub.id)}
          calSynced={calSyncedIds.has(openClub.id)}
          onJoin={handleJoin}
          onLeave={handleLeave}
          onToggleCalendar={handleToggleCalendar}
          onClose={() => setOpenClub(null)}
          clubLoading={clubLoading}
        />
      )}

      {showSubmitModal && (
        <SubmitClubModal onClose={() => setShowSubmitModal(false)} onSubmit={handleSubmitClub} />
      )}
    </div>
  )
}

// ── Calendar event builder (exported for Dashboard) ───────────
export function buildClubCalendarEvents(myClubs) {
  const events = []
  const today = new Date()

  myClubs.forEach(membership => {
    const club = membership.club ?? membership
    if (!membership.calendar_synced) return
    if (!club?.name) return

    const schedule = (club.meeting_schedule || '').toLowerCase()

    // FIX #9 (calendar parser): Skip unparseable schedules entirely rather
    // than generating a stale one-off event on today.
    if (!schedule || /\b(tbd|varies|tba|to be announced)\b/.test(schedule)) return

    // Parse start time
    const timeMatch = schedule.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i)
    let timeStr = ''
    if (timeMatch) {
      let h = parseInt(timeMatch[1])
      const m = timeMatch[2] ?? '00'
      const ampm = timeMatch[3]?.toLowerCase()
      if (ampm === 'pm' && h < 12) h += 12
      if (ampm === 'am' && h === 12) h = 0
      timeStr = `${String(h).padStart(2, '0')}:${m}`
    }

    const DAY_MAP = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }
    const foundDays = Object.entries(DAY_MAP)
      .filter(([name]) => schedule.includes(name))
      .map(([, idx]) => idx)

    // FIX #9: If no day found and schedule is non-trivial, skip rather than
    // creating a confusing one-off today event.
    if (foundDays.length === 0) return

    // FIX #9: Detect biweekly/bimonthly cadence so we don't over-generate
    const isbiweekly = /bi[-\s]?weekly|every (other|2nd) week|alternate weeks?/.test(schedule)
    const weekStep = isbiweekly ? 2 : 1

    // Generate up to 8 weeks of occurrences (4 for biweekly)
    const totalWeeks = isbiweekly ? 8 : 8
    for (let week = 0; week < totalWeeks; week += weekStep) {
      foundDays.forEach(targetDay => {
        const d = new Date(today)
        const diff = (targetDay - d.getDay() + 7) % 7
        d.setDate(d.getDate() + diff + week * 7)
        const pad = n => String(n).padStart(2, '0')
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
        events.push({
          id: `club-${club.id}-${dateStr}`,
          title: `${club.name}`,
          date: dateStr,
          time: timeStr,
          type: 'club',
          category: club.category || 'Club',
          description: club.meeting_schedule || '',
          readOnly: true,
          clubId: club.id,
        })
      })
    }
  })

  return events
}