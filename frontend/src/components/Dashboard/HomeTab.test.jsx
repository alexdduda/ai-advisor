import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomeTab from './HomeTab'

vi.mock('../../contexts/PreferencesContext', () => ({
  useLanguage: vi.fn(),
}))

import { useLanguage } from '../../contexts/PreferencesContext'

const USER = { id: 'user-1' }

function setup({
  profile = {},
  advisorCards = [],
  cardsLoading = false,
  currentCourses = [],
  completedCourses = [],
  upcoming = { events: [], urgentCount: 0, hasCourseEvents: false, loading: false },
} = {}) {
  const onTabChange = vi.fn()
  const onImportTranscript = vi.fn()
  const onImportSyllabus = vi.fn()
  render(
    <HomeTab
      user={USER}
      profile={profile}
      advisorCards={advisorCards}
      cardsLoading={cardsLoading}
      currentCourses={currentCourses}
      completedCourses={completedCourses}
      events={upcoming.events}
      eventsLoading={upcoming.loading}
      hasCourseEvents={upcoming.hasCourseEvents}
      onTabChange={onTabChange}
      onImportTranscript={onImportTranscript}
      onImportSyllabus={onImportSyllabus}
    />
  )
  return { onTabChange, onImportTranscript, onImportSyllabus }
}

beforeEach(() => {
  localStorage.clear()
  // t() returns the key so assertions are locale-independent
  useLanguage.mockReturnValue({ t: (k) => k, language: 'en' })
})

describe('HomeTab setup checklist', () => {
  it('shows all three steps with CTAs when nothing is set up', () => {
    setup()
    expect(screen.getByText('setup.title')).toBeInTheDocument()
    expect(screen.getByText('setup.transcriptTitle')).toBeInTheDocument()
    expect(screen.getByText('setup.programTitle')).toBeInTheDocument()
    expect(screen.getByText('setup.syllabusTitle')).toBeInTheDocument()
    expect(screen.getAllByText(/setup\.start/)).toHaveLength(3)
    // progress pill: 0 of 3
    expect(screen.getByText('home.setupProgress')).toBeInTheDocument()
  })

  it('marks completed steps done and drops their CTA', () => {
    setup({
      completedCourses: [{ course_code: 'COMP 202' }],
      profile: { major: 'Computer Science' },
    })
    // only the syllabus step still needs action
    expect(screen.getAllByText(/setup\.start/)).toHaveLength(1)
  })

  it('hides the checklist entirely when all steps are done', () => {
    setup({
      completedCourses: [{ course_code: 'COMP 202' }],
      profile: { major: 'Computer Science' },
      upcoming: { events: [], urgentCount: 0, hasCourseEvents: true, loading: false },
    })
    expect(screen.queryByText('setup.title')).not.toBeInTheDocument()
    expect(screen.queryByText('home.setupProgress')).not.toBeInTheDocument()
  })

  it('stays hidden after the user dismisses it', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'setup.dismiss' }))
    expect(screen.queryByText('setup.title')).not.toBeInTheDocument()
    expect(localStorage.getItem(`symbolos_setup_dismissed_${USER.id}`)).toBe('1')
  })

  it('transcript CTA opens the transcript upload', async () => {
    const user = userEvent.setup()
    const { onImportTranscript } = setup()
    await user.click(screen.getAllByText(/setup\.start/)[0].closest('button'))
    expect(onImportTranscript).toHaveBeenCalled()
  })
})

describe('HomeTab Up Next', () => {
  it('shows the empty state with a syllabus CTA when there are no events', () => {
    setup()
    expect(screen.getByText('home.upNextEmptyTitle')).toBeInTheDocument()
    expect(screen.getByText(/home\.upNextEmptyCta/)).toBeInTheDocument()
  })

  it('renders upcoming events with titles', () => {
    setup({
      upcoming: {
        events: [
          { id: 'e1', title: 'COMP 202 Final Exam', date: '2026-08-10', time: '09:00', type: 'exam', course_code: 'COMP 202', location: '' },
          { id: 'e2', title: 'Essay due', date: '2026-07-08', time: '', type: 'assignment', course_code: '', location: '' },
        ],
        urgentCount: 1,
        hasCourseEvents: true,
        loading: false,
      },
    })
    expect(screen.getByText('COMP 202 Final Exam')).toBeInTheDocument()
    expect(screen.getByText('Essay due')).toBeInTheDocument()
    expect(screen.queryByText('home.upNextEmptyTitle')).not.toBeInTheDocument()
  })
})

describe('HomeTab Brief highlights', () => {
  it('renders top cards and navigates to the Brief on click', async () => {
    const user = userEvent.setup()
    const { onTabChange } = setup({
      advisorCards: [
        { id: 'c1', icon: '🎯', title: 'Register for fall courses', body: 'Registration opens soon.' },
        { id: 'c2', icon: '📚', title: 'Missing a core course', body: 'COMP 251 is required.' },
      ],
    })
    await user.click(screen.getByText('Register for fall courses'))
    expect(onTabChange).toHaveBeenCalledWith('chat')
  })

  it('shows an empty state when there are no cards', () => {
    setup()
    expect(screen.getByText('home.briefEmptyTitle')).toBeInTheDocument()
  })
})
