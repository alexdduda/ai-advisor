import { useState, useEffect, useMemo } from 'react'
import {
  FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaBell,
  FaCalendarAlt, FaBullhorn, FaGraduationCap, FaUsers, FaUser,
  FaTrash, FaEdit, FaEnvelope, FaMobileAlt, FaCheck
} from 'react-icons/fa'
import { useLanguage } from '../../contexts/LanguageContext'
import useNotificationPrefs from '../../hooks/useNotificationPrefs'
import './CalendarTab.css'

// ── McGill Academic Dates 2025–26 ────────────────────────────────
const MCGILL_ACADEMIC_DATES = [
  { id: 'acad-1',  titleKey: 'cal.fallBegins',           date: '2025-09-02', type: 'academic' },
  { id: 'acad-2',  titleKey: 'cal.addDropFall',          date: '2025-09-16', type: 'academic' },
  { id: 'acad-3',  titleKey: 'cal.thanksgiving',         date: '2025-10-13', type: 'academic' },
  { id: 'acad-4',  titleKey: 'cal.fallMidterms',         date: '2025-10-13', type: 'academic' },
  { id: 'acad-5',  titleKey: 'cal.fallReadingWeek',      date: '2025-10-27', type: 'academic' },
  { id: 'acad-6',  titleKey: 'cal.withdrawalFall',       date: '2025-11-03', type: 'academic' },
  { id: 'acad-7',  titleKey: 'cal.lastDayFall',          date: '2025-12-03', type: 'academic' },
  { id: 'acad-8',  titleKey: 'cal.fallExamsBegin',       date: '2025-12-08', type: 'academic' },
  { id: 'acad-9',  titleKey: 'cal.fallExamsEnd',         date: '2025-12-20', type: 'academic' },
  { id: 'acad-10', titleKey: 'cal.winterBegins',         date: '2026-01-05', type: 'academic' },
  { id: 'acad-11', titleKey: 'cal.addDropWinter',        date: '2026-01-19', type: 'academic' },
  { id: 'acad-12', titleKey: 'cal.winterMidterms',       date: '2026-02-09', type: 'academic' },
  { id: 'acad-13', titleKey: 'cal.winterReadingWeek',    date: '2026-02-16', type: 'academic' },
  { id: 'acad-14', titleKey: 'cal.withdrawalWinter',     date: '2026-03-09', type: 'academic' },
  { id: 'acad-15', titleKey: 'cal.goodFriday',           date: '2026-04-03', type: 'academic' },
  { id: 'acad-16', titleKey: 'cal.lastDayWinter',        date: '2026-04-14', type: 'academic' },
  { id: 'acad-17', titleKey: 'cal.winterExamsBegin',     date: '2026-04-16', type: 'academic' },
  { id: 'acad-18', titleKey: 'cal.winterExamsEnd',       date: '2026-04-30', type: 'academic' },
  { id: 'acad-19', titleKey: 'cal.registration',         date: '2026-03-23', type: 'academic' },
  { id: 'acad-20', titleKey: 'cal.convocation',          date: '2026-06-02', type: 'academic' },
]

const STUDENT_UNION_EVENTS = [
  { id: 'su-1', titleKey: 'cal.ssmuGA',       date: '2026-02-26', type: 'union', categoryKey: 'cal.catSSMU',   descKey: 'cal.descSSMUGA'    },
  { id: 'su-2', titleKey: 'cal.froshWeek',    date: '2025-09-01', type: 'union', categoryKey: 'cal.catSSMU',   descKey: 'cal.descFrosh'     },
  { id: 'su-3', titleKey: 'cal.hackathon',    date: '2025-10-18', type: 'club',  categoryKey: 'cal.catCSClub', descKey: 'cal.descHack'      },
  { id: 'su-4', titleKey: 'cal.careerFair',   date: '2026-02-05', type: 'club',  categoryKey: 'cal.catEUS',    descKey: 'cal.descCareer'    },
  { id: 'su-5', titleKey: 'cal.symposium',    date: '2026-03-12', type: 'club',  categoryKey: 'cal.catArts',   descKey: 'cal.descSymp'      },
  { id: 'su-6', titleKey: 'cal.foodFestival', date: '2026-03-27', type: 'union', categoryKey: 'cal.catSSMU',   descKey: 'cal.descFood'      },
  { id: 'su-7', titleKey: 'cal.studyBreak',   date: '2026-04-10', type: 'union', categoryKey: 'cal.catSSMU',   descKey: 'cal.descStudyBreak'},
]

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DAYS_FR = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay() }
function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((new Date(dateStr + 'T00:00:00') - today) / 86400000)
}

// ── Event Modal ──────────────────────────────────────────────────
function EventModal({ event, onSave, onDelete, onClose, t, notifPrefs, user }) {
  const today = new Date().toISOString().split('T')[0]

  // Build default notification state from global prefs
  const defaultNotif = () => ({
    notifyEnabled: notifPrefs.method !== 'none',
    notifyEmail:   notifPrefs.method === 'email' || notifPrefs.method === 'both',
    notifySMS:     notifPrefs.method === 'sms'   || notifPrefs.method === 'both',
    notifySameDay: notifPrefs.timing.sameDay,
    notify1Day:    notifPrefs.timing.oneDay,
    notify7Days:   notifPrefs.timing.oneWeek,
    notifyEmail_addr: notifPrefs.email || user?.email || '',
    notifyPhone:   notifPrefs.phone || '',
  })

  const [form, setForm] = useState(() => ({
    title:    event?.title    || '',
    date:     event?.date     || today,
    time:     event?.time     || '',
    type:     event?.type     || 'personal',
    category: event?.category || '',
    description: event?.description || '',
    ...(event?.id && !event?.titleKey
      ? {
          notifyEnabled:    event.notifyEnabled    ?? true,
          notifyEmail:      event.notifyEmail      ?? true,
          notifySMS:        event.notifySMS        ?? false,
          notifySameDay:    event.notifySameDay    ?? false,
          notify1Day:       event.notify1Day       ?? true,
          notify7Days:      event.notify7Days      ?? true,
          notifyEmail_addr: event.notifyEmail_addr ?? '',
          notifyPhone:      event.notifyPhone      ?? '',
        }
      : defaultNotif()
    ),
  }))

  const isEdit = !!event?.id && !event?.titleKey
  const typeConfig = {
    union:    { color: '#7c3aed', bg: '#f5f3ff', label: t('calendar.unionEvents') },
    club:     { color: '#0891b2', bg: '#ecfeff', label: t('calendar.clubEvents') },
    personal: { color: '#059669', bg: '#ecfdf5', label: t('calendar.personalEvents') },
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return
    onSave({ ...form, id: event?.id || `user-${Date.now()}` })
  }

  const f = (key) => (val) => setForm(p => ({ ...p, [key]: val }))
  const toggle = (key) => setForm(p => ({ ...p, [key]: !p[key] }))

  return (
    <div className="cal-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cal-modal">
        <div className="cal-modal-header">
          <h3>{isEdit ? t('calendar.editEventTitle') : t('calendar.addEventTitle')}</h3>
          <button className="cal-modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        <form className="cal-modal-body" onSubmit={handleSubmit}>

          {/* Title */}
          <div className="cal-field">
            <label>{t('calendar.eventTitle')} *</label>
            <input type="text" value={form.title} onChange={e => f('title')(e.target.value)} placeholder={t('calendar.eventTitlePlaceholder')} required />
          </div>

          {/* Date & time */}
          <div className="cal-field-row">
            <div className="cal-field">
              <label>{t('calendar.date')} *</label>
              <input type="date" value={form.date} onChange={e => f('date')(e.target.value)} required />
            </div>
            <div className="cal-field">
              <label>{t('calendar.time')}</label>
              <input type="time" value={form.time} onChange={e => f('time')(e.target.value)} />
            </div>
          </div>

          {/* Type */}
          <div className="cal-field">
            <label>{t('calendar.eventType')}</label>
            <div className="cal-type-grid">
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <button key={key} type="button"
                  className={`cal-type-btn ${form.type === key ? 'selected' : ''}`}
                  style={form.type === key ? { borderColor: cfg.color, background: cfg.bg, color: cfg.color } : {}}
                  onClick={() => f('type')(key)}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="cal-field">
            <label>{t('calendar.groupCategory')}</label>
            <input type="text" value={form.category} onChange={e => f('category')(e.target.value)} placeholder={t('calendar.groupPlaceholder')} />
          </div>
          <div className="cal-field">
            <label>{t('calendar.description')}</label>
            <textarea value={form.description} onChange={e => f('description')(e.target.value)} rows={2} placeholder={t('calendar.descPlaceholder')} />
          </div>

          {/* ── Notifications ── */}
          <div className="cal-section-divider"><FaBell /> {t('calendar.reminders')}</div>

          {/* On/off master toggle */}
          <div className="cal-field">
            <label className="cal-checkbox-label cal-notif-master">
              <input type="checkbox" checked={form.notifyEnabled} onChange={() => toggle('notifyEnabled')} />
              <span className={`cal-notif-toggle ${form.notifyEnabled ? 'on' : 'off'}`}>
                {form.notifyEnabled ? t('calendar.notifOn') : t('calendar.notifOff')}
              </span>
              {t('calendar.enableNotifications')}
            </label>
          </div>

          {form.notifyEnabled && (<>
            {/* Method */}
            <div className="cal-field">
              <label>{t('calendar.notifyVia')}</label>
              <div className="cal-notify-row">
                <label className="cal-checkbox-label">
                  <input type="checkbox" checked={form.notifyEmail} onChange={() => toggle('notifyEmail')} />
                  <FaEnvelope /> {t('calendar.email')}
                </label>
                <label className="cal-checkbox-label">
                  <input type="checkbox" checked={form.notifySMS} onChange={() => toggle('notifySMS')} />
                  <FaMobileAlt /> {t('calendar.sms')}
                </label>
              </div>
            </div>

            {form.notifyEmail && (
              <div className="cal-field">
                <label>{t('calendar.emailAddress')}</label>
                <input type="email" value={form.notifyEmail_addr} onChange={e => f('notifyEmail_addr')(e.target.value)} placeholder={user?.email || 'your@email.com'} />
              </div>
            )}
            {form.notifySMS && (
              <div className="cal-field">
                <label>{t('calendar.phoneNumber')}</label>
                <input type="tel" value={form.notifyPhone} onChange={e => f('notifyPhone')(e.target.value)} placeholder="+1 (514) 555-0100" />
              </div>
            )}

            {/* Timing */}
            <div className="cal-field">
              <label>{t('calendar.whenToRemind')}</label>
              <div className="cal-notify-row cal-notify-wrap">
                {[
                  { key: 'notifySameDay', label: t('calendar.remindSameDay') },
                  { key: 'notify1Day',    label: t('calendar.remind1Day') },
                  { key: 'notify7Days',   label: t('calendar.remind7Days') },
                ].map(({ key, label }) => (
                  <label key={key} className={`cal-timing-chip ${form[key] ? 'active' : ''}`}>
                    <input type="checkbox" checked={form[key]} onChange={() => toggle(key)} />
                    {form[key] && <FaCheck size={9} />} {label}
                  </label>
                ))}
              </div>
            </div>
          </>)}

          {/* Actions */}
          <div className="cal-modal-actions">
            {isEdit && (
              <button type="button" className="cal-btn-danger" onClick={() => onDelete(event.id)}>
                <FaTrash /> {t('calendar.delete')}
              </button>
            )}
            <div className="cal-modal-actions-right">
              <button type="button" className="cal-btn-secondary" onClick={onClose}>{t('calendar.cancel')}</button>
              <button type="submit" className="cal-btn-primary">
                <FaCheck /> {isEdit ? t('calendar.saveChanges') : t('calendar.addEvent')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Event Popup ──────────────────────────────────────────────────
function EventPopup({ event, onClose, onEdit, canEdit, t, language, formatDate, typeConfig }) {
  const cfg = typeConfig[event.type] || typeConfig.personal
  const days = daysUntil(event.date)
  const countdownText = days < 0
    ? `${Math.abs(days)}${t('calendar.daysAgo')}`
    : days === 0 ? t('calendar.today2')
    : `${t('calendar.inDays')} ${days}${t('calendar.inDaysSuffix')}`

  return (
    <div className="cal-event-popup">
      <div className="cal-event-popup-header" style={{ borderColor: cfg.color }}>
        <div className="cal-event-popup-type" style={{ color: cfg.color, background: cfg.bg }}>
          {cfg.icon} {cfg.label}
        </div>
        <button className="cal-event-popup-close" onClick={onClose}><FaTimes /></button>
      </div>
      <div className="cal-event-popup-body">
        <h4>{event.title}</h4>
        {event.category && <div className="cal-event-popup-cat">{event.category}</div>}
        <div className="cal-event-popup-date">
          <FaCalendarAlt />
          {formatDate(event.date)}
          {event.time && ` ${language === 'fr' ? 'à' : 'at'} ${event.time}`}
          <span className="cal-event-popup-countdown" style={{ color: days < 0 ? '#9ca3af' : days <= 7 ? '#f59e0b' : cfg.color }}>
            {countdownText}
          </span>
        </div>
        {event.description && <p className="cal-event-popup-desc">{event.description}</p>}
        {event.notifyEnabled && (
          <div className="cal-event-popup-notif">
            <FaBell size={11} />
            {[
              event.notifyEmail && t('calendar.email'),
              event.notifySMS   && t('calendar.sms'),
            ].filter(Boolean).join(' + ')}
            {' — '}
            {[
              event.notifySameDay && t('calendar.remindSameDay'),
              event.notify1Day    && t('calendar.remind1Day'),
              event.notify7Days   && t('calendar.remind7Days'),
            ].filter(Boolean).join(', ')}
          </div>
        )}
      </div>
      {canEdit && (
        <button className="cal-event-popup-edit" onClick={onEdit}>
          <FaEdit /> {t('calendar.editEvent')}
        </button>
      )}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────
export default function CalendarTab({ user }) {
  const { t, language } = useLanguage()
  const [notifPrefs] = useNotificationPrefs(user?.email)
  const today = new Date()

  const MONTHS = language === 'fr' ? MONTHS_FR : MONTHS_EN
  const DAYS   = language === 'fr' ? DAYS_FR   : DAYS_EN

  const typeConfig = {
    academic: { color: '#ed1b2f', bg: '#fef2f2', icon: <FaGraduationCap />, label: t('calendar.academicDates') },
    union:    { color: '#7c3aed', bg: '#f5f3ff', icon: <FaUsers />,         label: t('calendar.unionEvents') },
    club:     { color: '#0891b2', bg: '#ecfeff', icon: <FaUsers />,         label: t('calendar.clubEvents') },
    personal: { color: '#059669', bg: '#ecfdf5', icon: <FaUser />,          label: t('calendar.personalEvents') },
  }

  const tEvent = (ev) => ({
    ...ev,
    title:       ev.titleKey    ? t(ev.titleKey)    : ev.title    || '',
    category:    ev.categoryKey ? t(ev.categoryKey) : ev.category || '',
    description: ev.descKey     ? t(ev.descKey)     : ev.description || '',
  })

  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-')
    return `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}, ${y}`
  }

  const [view, setView] = useState('calendar')
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [userEvents, setUserEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mcgill_calendar_events') || '[]') } catch { return [] }
  })
  const [filter, setFilter] = useState({ academic: true, union: true, club: true, personal: true })
  const [showModal, setShowModal] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [preselectedDate, setPreselectedDate] = useState(null)
  const [popupEvent, setPopupEvent] = useState(null)
  const [notifSaved, setNotifSaved] = useState(false)

  useEffect(() => {
    localStorage.setItem('mcgill_calendar_events', JSON.stringify(userEvents))
  }, [userEvents])

  const allEvents = useMemo(() => [
    ...MCGILL_ACADEMIC_DATES.map(tEvent),
    ...STUDENT_UNION_EVENTS.map(tEvent),
    ...userEvents,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [userEvents, language])

  // Filter out event types the user has muted in notification prefs (for announcements)
  // Calendar still shows all — only notification delivery is filtered
  const filteredEvents = useMemo(() =>
    allEvents.filter(e => filter[e.type] !== false),
    [allEvents, filter]
  )

  const eventsByDate = useMemo(() => {
    const map = {}
    filteredEvents.forEach(e => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return map
  }, [filteredEvents])

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const handleSaveEvent = (event) => {
    if (event.id && userEvents.some(e => e.id === event.id)) {
      setUserEvents(prev => prev.map(e => e.id === event.id ? event : e))
    } else {
      setUserEvents(prev => [...prev, event])
    }
    setShowModal(false); setEditEvent(null)
    if (event.notifyEnabled) {
      setNotifSaved(true)
      setTimeout(() => setNotifSaved(false), 3000)
    }
  }

  const handleDeleteEvent = (id) => {
    setUserEvents(prev => prev.filter(e => e.id !== id))
    setShowModal(false); setEditEvent(null); setPopupEvent(null)
  }

  const handleDayClick = (day) => {
    if (!day) return
    const dateStr = toDateStr(currentYear, currentMonth, day)
    const eventsOnDay = eventsByDate[dateStr]
    if (eventsOnDay?.length >= 1) setPopupEvent(eventsOnDay[0])
    else { setPreselectedDate(dateStr); setEditEvent(null); setShowModal(true) }
  }

  const upcomingEvents = useMemo(() => {
    const todayStr = today.toISOString().split('T')[0]
    return [...filteredEvents].filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 30)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredEvents])

  const urgentEvents = upcomingEvents.filter(e => daysUntil(e.date) <= 7)

  const countdownLabel = (days) => {
    if (days === 0) return language === 'fr' ? "🔴 Aujourd'hui!" : '🔴 Today!'
    if (days === 1) return `⚠️ ${t('calendar.tomorrow')}`
    if (days <= 7)  return `⚠️ ${t('calendar.inXDays').replace('{n}', days)}`
    return t('calendar.inXDays').replace('{n}', days)
  }

  return (
    <div className="cal-container">
      {/* Header */}
      <div className="cal-header">
        <div className="cal-header-left">
          <FaCalendarAlt className="cal-header-icon" />
          <div>
            <h2 className="cal-title">{t('nav.calendar')}</h2>
            <p className="cal-subtitle">{t('calendar.subtitle')}</p>
          </div>
        </div>
        <div className="cal-header-right">
          {notifSaved && (
            <div className="cal-notif-toast"><FaBell /> {t('calendar.remindersSet')}</div>
          )}
          <div className="cal-view-toggle">
            <button className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}>
              <FaCalendarAlt /> {t('calendar.calendarView')}
            </button>
            <button className={view === 'announcements' ? 'active' : ''} onClick={() => setView('announcements')}>
              <FaBullhorn /> {t('calendar.announcements')}
              {urgentEvents.length > 0 && <span className="cal-badge">{urgentEvents.length}</span>}
            </button>
          </div>
          <button className="cal-add-btn" onClick={() => { setPreselectedDate(null); setEditEvent(null); setShowModal(true) }}>
            <FaPlus /> {t('calendar.addEventBtn')}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="cal-filter-bar">
        {Object.entries(typeConfig).map(([key, cfg]) => (
          <button key={key}
            className={`cal-filter-chip ${filter[key] ? 'active' : ''}`}
            style={filter[key] ? { borderColor: cfg.color, background: cfg.bg, color: cfg.color } : {}}
            onClick={() => setFilter(f => ({ ...f, [key]: !f[key] }))}>
            {cfg.icon} {cfg.label}
          </button>
        ))}
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="cal-body">
          <div className="cal-month-nav">
            <button onClick={prevMonth}><FaChevronLeft /></button>
            <div className="cal-month-title">
              <h3>{MONTHS[currentMonth]} {currentYear}</h3>
              <button className="cal-today-btn" onClick={() => { setCurrentYear(today.getFullYear()); setCurrentMonth(today.getMonth()) }}>
                {t('calendar.todayBtn')}
              </button>
            </div>
            <button onClick={nextMonth}><FaChevronRight /></button>
          </div>
          <div className="cal-grid-header">
            {DAYS.map(d => <div key={d} className="cal-grid-day-label">{d}</div>)}
          </div>
          <div className="cal-grid">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="cal-cell cal-cell-empty" />
              const dateStr = toDateStr(currentYear, currentMonth, day)
              const eventsOnDay = eventsByDate[dateStr] || []
              const isToday = dateStr === today.toISOString().split('T')[0]
              return (
                <div key={dateStr}
                  className={`cal-cell ${isToday ? 'cal-cell-today' : ''} ${eventsOnDay.length > 0 ? 'cal-cell-has-events' : ''}`}
                  onClick={() => handleDayClick(day)}>
                  <span className={`cal-cell-number ${isToday ? 'today' : ''}`}>{day}</span>
                  <div className="cal-cell-events">
                    {eventsOnDay.slice(0, 3).map(e => {
                      const cfg = typeConfig[e.type] || typeConfig.personal
                      return (
                        <div key={e.id} className="cal-event-dot" style={{ background: cfg.color, color: '#fff' }} title={e.title}>
                          {e.title.length > 14 ? e.title.slice(0, 13) + '…' : e.title}
                        </div>
                      )
                    })}
                    {eventsOnDay.length > 3 && (
                      <div className="cal-event-more">+{eventsOnDay.length - 3} {t('calendar.moreDots')}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="cal-legend">
            {Object.entries(typeConfig).map(([key, cfg]) => (
              <div key={key} className="cal-legend-item">
                <span className="cal-legend-dot" style={{ background: cfg.color }} />
                {cfg.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcements View */}
      {view === 'announcements' && (
        <div className="cal-announcements">
          {urgentEvents.length > 0 && (
            <div className="cal-urgent-banner">
              <FaBell />
              <strong>
                {urgentEvents.length} {urgentEvents.length === 1 ? t('calendar.event') : t('calendar.events')} {t('calendar.upcomingIn7')}
              </strong>
            </div>
          )}
          <div className="cal-announce-list">
            {upcomingEvents.length === 0 ? (
              <div className="cal-empty-state">
                <FaCalendarAlt size={40} />
                <p>{t('calendar.noUpcoming')}</p>
              </div>
            ) : upcomingEvents.map(event => {
              const cfg = typeConfig[event.type] || typeConfig.personal
              const days = daysUntil(event.date)
              const isUrgent = days <= 7 && days >= 0
              return (
                <div key={event.id}
                  className={`cal-announce-card ${isUrgent ? 'urgent' : ''}`}
                  style={{ borderLeftColor: cfg.color }}
                  onClick={() => setPopupEvent(event)}>
                  <div className="cal-announce-card-left">
                    <div className="cal-announce-type" style={{ color: cfg.color, background: cfg.bg }}>
                      {cfg.icon} {cfg.label}
                    </div>
                    <h4>{event.title}</h4>
                    {event.category && <span className="cal-announce-category">{event.category}</span>}
                    {event.description && <p className="cal-announce-desc">{event.description}</p>}
                  </div>
                  <div className="cal-announce-card-right">
                    <div className="cal-announce-date">{formatDate(event.date)}</div>
                    <div className="cal-announce-countdown" style={{ color: days === 0 ? '#ef4444' : isUrgent ? '#f59e0b' : cfg.color }}>
                      {countdownLabel(days)}
                    </div>
                    {event.notifyEnabled && (
                      <div className="cal-announce-notif"><FaBell size={10} /> {t('calendar.remindersSet')}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Event Popup */}
      {popupEvent && (
        <div className="cal-popup-overlay" onClick={() => setPopupEvent(null)}>
          <EventPopup
            event={popupEvent}
            onClose={() => setPopupEvent(null)}
            canEdit={userEvents.some(e => e.id === popupEvent.id)}
            onEdit={() => { setEditEvent(popupEvent); setPopupEvent(null); setShowModal(true) }}
            t={t} language={language} formatDate={formatDate} typeConfig={typeConfig}
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <EventModal
          event={editEvent ? editEvent : preselectedDate ? { date: preselectedDate } : null}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => { setShowModal(false); setEditEvent(null); setPreselectedDate(null) }}
          t={t} notifPrefs={notifPrefs} user={user}
        />
      )}
    </div>
  )
}
