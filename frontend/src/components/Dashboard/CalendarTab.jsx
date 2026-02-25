import { useState, useEffect, useMemo } from 'react'
import {
  FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaBell,
  FaCalendarAlt, FaBullhorn, FaGraduationCap, FaUser,
  FaTrash, FaEdit, FaCheck, FaClipboardList, FaUsers,
  FaChevronDown, FaChevronUp
} from 'react-icons/fa'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTimezone } from '../../contexts/TimezoneContext'
import useNotificationPrefs from '../../hooks/useNotificationPrefs'
import { scheduleNotification, deleteEvent as deleteEventAPI } from '../../services/notificationService'
import { lookupExam, formatExamTime } from '../../utils/examSchedule2026'
import currentCoursesAPI from '../../lib/currentCoursesAPI'
import './CalendarTab.css'

// ── McGill Academic Dates 2025–26 ────────────────────────────────
const MCGILL_ACADEMIC_DATES = [
  { id: 'f-01', title: 'Deadline to Register (avoid penalty)',         date: '2025-08-14', type: 'academic', category: 'Fall 2025' },
  { id: 'f-02', title: 'Fall Classes Begin',                           date: '2025-08-27', type: 'academic', category: 'Fall 2025' },
  { id: 'f-03', title: 'Labour Day (no classes)',                      date: '2025-09-01', type: 'academic', category: 'Fall 2025' },
  { id: 'f-04', title: 'Deadline to Cancel Registration',              date: '2025-08-31', type: 'academic', category: 'Fall 2025' },
  { id: 'f-05', title: 'Add/Drop Deadline',                            date: '2025-09-09', type: 'academic', category: 'Fall 2025' },
  { id: 'f-06', title: 'Withdrawal with Refund Deadline',              date: '2025-09-16', type: 'academic', category: 'Fall 2025' },
  { id: 'f-07', title: 'Thanksgiving (no classes)',                    date: '2025-10-13', type: 'academic', category: 'Fall 2025' },
  { id: 'f-08', title: 'Fall Reading Break Begins',                    date: '2025-10-14', type: 'academic', category: 'Fall 2025' },
  { id: 'f-09', title: 'Fall Reading Break Ends',                      date: '2025-10-17', type: 'academic', category: 'Fall 2025' },
  { id: 'f-10', title: 'Withdrawal WITHOUT Refund Deadline',           date: '2025-10-28', type: 'academic', category: 'Fall 2025' },
  { id: 'f-11', title: 'Fall Classes End / Makeup Day (Monday sched)', date: '2025-12-03', type: 'academic', category: 'Fall 2025' },
  { id: 'f-12', title: 'Study Day',                                    date: '2025-12-04', type: 'academic', category: 'Fall 2025' },
  { id: 'f-13', title: 'Fall Exams Begin',                             date: '2025-12-05', type: 'academic', category: 'Fall 2025' },
  { id: 'f-14', title: 'Holiday Break Begins (offices closed)',        date: '2025-12-25', type: 'academic', category: 'Fall 2025' },
  { id: 'f-15', title: 'Fall Exams End',                               date: '2025-12-19', type: 'academic', category: 'Fall 2025' },
  { id: 'w-01', title: 'Deadline to Cancel Registration',              date: '2025-12-31', type: 'academic', category: 'Winter 2026' },
  { id: 'w-02', title: 'Holiday Break Ends',                           date: '2026-01-02', type: 'academic', category: 'Winter 2026' },
  { id: 'w-03', title: 'Winter Classes Begin',                         date: '2026-01-05', type: 'academic', category: 'Winter 2026' },
  { id: 'w-04', title: 'Add/Drop Deadline',                            date: '2026-01-20', type: 'academic', category: 'Winter 2026' },
  { id: 'w-05', title: 'Withdrawal with Refund Deadline',              date: '2026-01-27', type: 'academic', category: 'Winter 2026' },
  { id: 'w-06', title: 'Winter Reading Break Begins',                  date: '2026-03-02', type: 'academic', category: 'Winter 2026' },
  { id: 'w-07', title: 'Winter Reading Break Ends',                    date: '2026-03-06', type: 'academic', category: 'Winter 2026' },
  { id: 'w-08', title: 'Withdrawal WITHOUT Refund Deadline',           date: '2026-03-10', type: 'academic', category: 'Winter 2026' },
  { id: 'w-09', title: 'Good Friday (no classes)',                     date: '2026-04-03', type: 'academic', category: 'Winter 2026' },
  { id: 'w-10', title: 'Easter Monday (no classes)',                   date: '2026-04-06', type: 'academic', category: 'Winter 2026' },
  { id: 'w-11', title: 'Winter Classes End / Makeup Day (Friday sched)', date: '2026-04-14', type: 'academic', category: 'Winter 2026' },
  { id: 'w-12', title: 'Study Day',                                    date: '2026-04-15', type: 'academic', category: 'Winter 2026' },
  { id: 'w-13', title: 'Winter Exams Begin',                           date: '2026-04-16', type: 'academic', category: 'Winter 2026' },
  { id: 'w-14', title: 'Winter Exams End',                             date: '2026-04-30', type: 'academic', category: 'Winter 2026' },
]

// ── Club category colors — must match ClubsTab CATEGORY_META ────
// Used to colour club events on the calendar per their category.
const CLUB_CATEGORY_COLORS = {
  'Academic':                 { color: '#2563eb', bg: '#dbeafe' },
  'Engineering & Technology': { color: '#7c3aed', bg: '#ede9fe' },
  'Professional':             { color: '#0f766e', bg: '#ccfbf1' },
  'Debate & Politics':        { color: '#b45309', bg: '#fef3c7' },
  'Athletics & Recreation':   { color: '#16a34a', bg: '#dcfce7' },
  'Arts & Culture':           { color: '#db2777', bg: '#fce7f3' },
  'Environment':              { color: '#15803d', bg: '#dcfce7' },
  'Health & Wellness':        { color: '#0284c7', bg: '#e0f2fe' },
  'Community Service':        { color: '#ea580c', bg: '#ffedd5' },
  'International':            { color: '#0891b2', bg: '#cffafe' },
  'Science':                  { color: '#4f46e5', bg: '#e0e7ff' },
  'Social':                   { color: '#dc2626', bg: '#fee2e2' },
  'Spiritual & Religious':    { color: '#a16207', bg: '#fefce8' },
}

// Returns color+bg for a club event, falling back to a default amber.
function getClubEventStyle(event) {
  if (event.category && CLUB_CATEGORY_COLORS[event.category]) {
    return CLUB_CATEGORY_COLORS[event.category]
  }
  return { color: '#d97706', bg: '#fef3c7' }
}

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

// ── Event Modal ───────────────────────────────────────────────────
function EventModal({ event, onSave, onDelete, onClose, t, notifPrefs, user }) {
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  const defaultNotif = () => ({
    notifyEnabled: notifPrefs.method !== 'none',
    notifySameDay: notifPrefs.timing.sameDay,
    notify1Day:    notifPrefs.timing.oneDay,
    notify7Days:   notifPrefs.timing.oneWeek,
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
          notifyEnabled: event.notifyEnabled ?? true,
          notifySameDay: event.notifySameDay ?? false,
          notify1Day:    event.notify1Day    ?? true,
          notify7Days:   event.notify7Days   ?? true,
        }
      : defaultNotif()
    ),
  }))

  const isEdit = !!event?.id && !event?.titleKey
  const typeConfig = {
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
          <div className="cal-field">
            <label>{t('calendar.eventTitle')} *</label>
            <input type="text" value={form.title} onChange={e => f('title')(e.target.value)} placeholder={t('calendar.eventTitlePlaceholder')} required />
          </div>
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
          <div className="cal-section-divider"><FaBell /> {t('calendar.reminders')}</div>
          <div className="cal-field">
            <label className="cal-checkbox-label cal-notif-master">
              <input type="checkbox" checked={form.notifyEnabled} onChange={() => toggle('notifyEnabled')} />
              <span className={`cal-notif-toggle ${form.notifyEnabled ? 'on' : 'off'}`}>
                {form.notifyEnabled ? t('calendar.notifOn') : t('calendar.notifOff')}
              </span>
              {t('calendar.enableNotifications')}
            </label>
          </div>
          {form.notifyEnabled && (
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
          )}
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

// ── Single Event Popup ────────────────────────────────────────────
function EventPopup({ event, onClose, onEdit, canEdit, t, language, formatDate, typeConfig, getEventStyle }) {
  const style = getEventStyle(event, typeConfig)
  const days = daysUntil(event.date)
  const countdownText = days < 0
    ? `${Math.abs(days)}${t('calendar.daysAgo')}`
    : days === 0 ? t('calendar.today2')
    : `${t('calendar.inDays')} ${days}${t('calendar.inDaysSuffix')}`

  return (
    <div className="cal-event-popup">
      <div className="cal-event-popup-header" style={{ borderColor: style.color }}>
        <div className="cal-event-popup-type" style={{ color: style.color, background: style.bg }}>
          {style.icon} {style.label}
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
          <span className="cal-event-popup-countdown" style={{ color: days < 0 ? '#9ca3af' : days <= 7 ? '#f59e0b' : style.color }}>
            {countdownText}
          </span>
        </div>
        {event.description && <p className="cal-event-popup-desc">{event.description}</p>}
        {event.notifyEnabled && (
          <div className="cal-event-popup-notif">
            <FaBell size={11} />
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

// ── Day Events Drawer ─────────────────────────────────────────────
// FIX: Replaces the single-event popup. Shows ALL events for a day
// plus an "Add Event" button so users can always create new events
// even when events already exist on that date.
function DayDrawer({ date, events, onClose, onAddEvent, onEditEvent, onSelectEvent, t, language, formatDate, typeConfig, getEventStyle, userEventIds }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="cal-day-drawer-overlay" onClick={onClose}>
      <div className="cal-day-drawer" onClick={e => e.stopPropagation()}>
        <div className="cal-day-drawer__header">
          <div className="cal-day-drawer__title">
            <span className="cal-day-drawer__date">{formatDate(date)}</span>
            <span className="cal-day-drawer__count">{events.length} event{events.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="cal-day-drawer__actions">
            <button className="cal-day-drawer__add-btn" onClick={onAddEvent}>
              <FaPlus size={11} /> {t('calendar.addEvent')}
            </button>
            <button className="cal-day-drawer__close" onClick={onClose}><FaTimes /></button>
          </div>
        </div>
        <div className="cal-day-drawer__list">
          {events.map(event => {
            const style = getEventStyle(event, typeConfig)
            const isEditable = userEventIds.has(event.id)
            const isExpanded = expanded === event.id
            return (
              <div key={event.id} className="cal-day-drawer__item" style={{ borderLeftColor: style.color }}>
                <div className="cal-day-drawer__item-header" onClick={() => setExpanded(isExpanded ? null : event.id)}>
                  <div className="cal-day-drawer__item-left">
                    <span className="cal-day-drawer__item-type" style={{ color: style.color, background: style.bg }}>
                      {style.icon} {style.label}
                    </span>
                    <span className="cal-day-drawer__item-title">{event.title}</span>
                  </div>
                  <div className="cal-day-drawer__item-right">
                    {event.time && <span className="cal-day-drawer__item-time">{event.time}</span>}
                    {isEditable && (
                      <button className="cal-day-drawer__edit-btn" onClick={e => { e.stopPropagation(); onEditEvent(event) }}>
                        <FaEdit size={11} />
                      </button>
                    )}
                    {isExpanded ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="cal-day-drawer__item-body">
                    {event.category && <div className="cal-day-drawer__item-cat">{event.category}</div>}
                    {event.description && <p className="cal-day-drawer__item-desc">{event.description}</p>}
                    {event.notifyEnabled && (
                      <div className="cal-event-popup-notif">
                        <FaBell size={10} />
                        {[
                          event.notifySameDay && t('calendar.remindSameDay'),
                          event.notify1Day    && t('calendar.remind1Day'),
                          event.notify7Days   && t('calendar.remind7Days'),
                        ].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function CalendarTab({ user, clubEvents = [] }) {
  const { t, language } = useLanguage()
  const { getTodayStr, getNow } = useTimezone()
  const [notifPrefs] = useNotificationPrefs(user?.id, user?.email)

  const today = getNow()
  const MONTHS = language === 'fr' ? MONTHS_FR : MONTHS_EN
  const DAYS   = language === 'fr' ? DAYS_FR   : DAYS_EN

  // Base type config — club type uses dynamic colors via getEventStyle()
  const typeConfig = {
    academic: { color: '#ed1b2f', bg: '#fef2f2', icon: <FaGraduationCap />, label: t('calendar.academicDates') },
    exam:     { color: '#7c3aed', bg: '#f5f3ff', icon: <FaClipboardList />, label: language === 'fr' ? 'Examens finaux' : 'Final Exams' },
    personal: { color: '#059669', bg: '#ecfdf5', icon: <FaUser />,          label: t('calendar.personalEvents') },
    club:     { color: '#d97706', bg: '#fef3c7', icon: <FaUsers />,         label: language === 'fr' ? 'Réunion de club' : 'Club Meeting' },
  }

  // FIX: Returns the full style for any event type, with club events
  // getting their category-specific color instead of flat amber.
  const getEventStyle = (event, cfg) => {
    if (event.type === 'club') {
      const clubStyle = getClubEventStyle(event)
      return { ...clubStyle, icon: <FaUsers />, label: language === 'fr' ? 'Réunion de club' : 'Club Meeting' }
    }
    return cfg[event.type] || cfg.personal
  }

  const [examEvents, setExamEvents] = useState([])

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    currentCoursesAPI.getCurrent(user.id).then(data => {
      if (cancelled) return
      const courses = data?.current_courses || []
      const events = []
      courses.forEach((course, idx) => {
        const exam = lookupExam(course.course_code)
        if (!exam) return
        const timeStr = exam.start ? formatExamTime(exam.start) : ''
        const endStr  = exam.end   ? formatExamTime(exam.end)   : ''
        const campusLabel = exam.campus === 'D.T.' ? 'Downtown Campus'
                          : exam.campus === 'MAC'  ? 'MacDonald Campus' : ''
        const formatLabel = exam.type === 'ONLINE' ? '(Online)' : campusLabel ? `@ ${campusLabel}` : ''
        events.push({
          id: `exam-${course.course_code}-${idx}`,
          title: `${course.course_code} – Final Exam`,
          date: exam.date,
          time: timeStr,
          type: 'exam',
          category: 'Winter 2026 Finals',
          description: [course.course_title || exam.title, timeStr && endStr ? `${timeStr} – ${endStr}` : timeStr, formatLabel].filter(Boolean).join(' · '),
          readOnly: true,
        })
      })
      setExamEvents(events)
    }).catch(() => {})
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

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

  const [view, setView]               = useState('calendar')
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [userEvents, setUserEvents]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('mcgill_calendar_events') || '[]') } catch { return [] }
  })
  const [filter, setFilter]           = useState({ academic: true, exam: true, personal: true, club: true })
  const [showModal, setShowModal]     = useState(false)
  const [editEvent, setEditEvent]     = useState(null)
  const [preselectedDate, setPreselectedDate] = useState(null)

  // FIX: Day drawer state replaces single-event popup
  const [dayDrawer, setDayDrawer]     = useState(null)   // { date, events }
  // Legacy single-event popup (for announcements view)
  const [popupEvent, setPopupEvent]   = useState(null)

  const [notifSaved, setNotifSaved]   = useState(false)

  useEffect(() => {
    localStorage.setItem('mcgill_calendar_events', JSON.stringify(userEvents))
  }, [userEvents])

  const allEvents = useMemo(() => [
    ...MCGILL_ACADEMIC_DATES.map(tEvent),
    ...examEvents,
    ...userEvents,
    ...clubEvents,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [userEvents, examEvents, clubEvents, language])

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

  // Set of user-owned event IDs for editable check
  const userEventIds = useMemo(() => new Set(userEvents.map(e => e.id)), [userEvents])

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

  const handleSaveEvent = async (event) => {
    const isEdit = event.id && userEvents.some(e => e.id === event.id)
    if (isEdit) {
      setUserEvents(prev => prev.map(e => e.id === event.id ? event : e))
    } else {
      const newEvent = { ...event, id: event.id || `user-${Date.now()}` }
      setUserEvents(prev => [...prev, newEvent])
      if (user?.id && event.notifyEnabled) {
        try { await scheduleNotification(event, user.id, user.email) }
        catch (err) { console.error('Failed to schedule notification:', err) }
      }
    }
    setShowModal(false); setEditEvent(null); setPreselectedDate(null)
    if (event.notifyEnabled) {
      setNotifSaved(true)
      setTimeout(() => setNotifSaved(false), 3000)
    }
  }

  const handleDeleteEvent = async (id) => {
    setUserEvents(prev => prev.filter(e => e.id !== id))
    setShowModal(false); setEditEvent(null); setPopupEvent(null); setDayDrawer(null)
    if (user?.id && id && !id.startsWith('user-')) {
      try { await deleteEventAPI(id, user.id) }
      catch (err) { console.error('Failed to delete event from backend:', err) }
    }
  }

  // FIX: Clicking a day always opens the day drawer.
  // From there users can view all events AND add a new one.
  const handleDayClick = (day) => {
    if (!day) return
    const dateStr = toDateStr(currentYear, currentMonth, day)
    const eventsOnDay = eventsByDate[dateStr] || []
    if (eventsOnDay.length > 0) {
      setDayDrawer({ date: dateStr, events: eventsOnDay })
    } else {
      // Empty day — go straight to add modal
      setPreselectedDate(dateStr); setEditEvent(null); setShowModal(true)
    }
  }

  const handleAddFromDrawer = () => {
    const date = dayDrawer?.date
    setDayDrawer(null)
    setPreselectedDate(date); setEditEvent(null); setShowModal(true)
  }

  const handleEditFromDrawer = (event) => {
    setDayDrawer(null)
    setEditEvent(event); setShowModal(true)
  }

  const upcomingEvents = useMemo(() => {
    const todayStr = getTodayStr()
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
              const isToday = dateStr === getTodayStr()
              return (
                <div key={dateStr}
                  className={`cal-cell ${isToday ? 'cal-cell-today' : ''} ${eventsOnDay.length > 0 ? 'cal-cell-has-events' : ''}`}
                  onClick={() => handleDayClick(day)}>
                  <span className={`cal-cell-number ${isToday ? 'today' : ''}`}>{day}</span>
                  <div className="cal-cell-events">
                    {eventsOnDay.slice(0, 3).map(e => {
                      // FIX: Use per-event style so club events show category color
                      const style = getEventStyle(e, typeConfig)
                      return (
                        <div key={e.id} className="cal-event-dot" style={{ background: style.color, color: '#fff' }} title={e.title}>
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
              <strong>{urgentEvents.length} {urgentEvents.length === 1 ? t('calendar.event') : t('calendar.events')} {t('calendar.upcomingIn7')}</strong>
            </div>
          )}
          <div className="cal-announce-list">
            {upcomingEvents.length === 0 ? (
              <div className="cal-empty-state">
                <FaCalendarAlt size={40} />
                <p>{t('calendar.noUpcoming')}</p>
              </div>
            ) : upcomingEvents.map(event => {
              const style = getEventStyle(event, typeConfig)
              const days = daysUntil(event.date)
              const isUrgent = days <= 7 && days >= 0
              return (
                <div key={event.id}
                  className={`cal-announce-card ${isUrgent ? 'urgent' : ''}`}
                  style={{ borderLeftColor: style.color }}
                  onClick={() => setPopupEvent(event)}>
                  <div className="cal-announce-card-left">
                    <div className="cal-announce-type" style={{ color: style.color, background: style.bg }}>
                      {style.icon} {style.label}
                    </div>
                    <h4>{event.title}</h4>
                    {event.category && <span className="cal-announce-category">{event.category}</span>}
                    {event.description && <p className="cal-announce-desc">{event.description}</p>}
                  </div>
                  <div className="cal-announce-card-right">
                    <div className="cal-announce-date">{formatDate(event.date)}</div>
                    <div className="cal-announce-countdown" style={{ color: days === 0 ? '#ef4444' : isUrgent ? '#f59e0b' : style.color }}>
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

      {/* Day Events Drawer (calendar view) */}
      {dayDrawer && (
        <DayDrawer
          date={dayDrawer.date}
          events={dayDrawer.events}
          onClose={() => setDayDrawer(null)}
          onAddEvent={handleAddFromDrawer}
          onEditEvent={handleEditFromDrawer}
          onSelectEvent={setPopupEvent}
          t={t} language={language} formatDate={formatDate}
          typeConfig={typeConfig} getEventStyle={getEventStyle}
          userEventIds={userEventIds}
        />
      )}

      {/* Single Event Popup (announcements view) */}
      {popupEvent && (
        <div className="cal-popup-overlay" onClick={() => setPopupEvent(null)}>
          <EventPopup
            event={popupEvent}
            onClose={() => setPopupEvent(null)}
            canEdit={userEventIds.has(popupEvent.id)}
            onEdit={() => { setEditEvent(popupEvent); setPopupEvent(null); setShowModal(true) }}
            t={t} language={language} formatDate={formatDate}
            typeConfig={typeConfig} getEventStyle={getEventStyle}
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
