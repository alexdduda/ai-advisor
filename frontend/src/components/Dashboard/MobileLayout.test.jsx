import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MobileLayout from './MobileLayout'
import useViewport from '../../hooks/useViewport'

// The shell is the piece both layouts hang off, so it is worth testing on its
// own. Everything below it is stubbed: this asserts navigation structure, not
// the eight screens (which have their own tests).
vi.mock('./DashboardTabContent', () => ({
  default: () => <div data-testid="tab-content" />,
}))
vi.mock('../shared/CourseDetailModal', () => ({ default: () => null }))
vi.mock('../Legal/PrivacyPolicy', () => ({ default: () => null }))
vi.mock('../Legal/TOS', () => ({ default: () => null }))
vi.mock('../Legal/AboutUs', () => ({ default: () => null }))

vi.mock('../../contexts/PreferencesContext', () => ({
  useLanguage: vi.fn(),
  useTheme: vi.fn(),
}))
vi.mock('../../contexts/DashboardDataContext', () => ({
  useDashboardData: vi.fn(),
}))

import { useLanguage, useTheme } from '../../contexts/PreferencesContext'
import { useDashboardData } from '../../contexts/DashboardDataContext'

function mockData(overrides = {}) {
  return {
    user: { id: 'u1', email: 'student@mail.mcgill.ca' },
    profile: { username: 'Student' },
    activeTab: 'home',
    handleTabChange: vi.fn(),
    setCoursesDeepLink: vi.fn(),
    setBriefOpenCardId: vi.fn(),
    upcomingUrgentCount: 0,
    showCompleteCourseModal: false,
    courseToComplete: null,
    handleConfirmComplete: vi.fn(),
    cancelCompleteCourse: vi.fn(),
    showTranscriptUpload: false,
    transcriptUploadTab: 'transcript',
    setShowTranscriptUpload: vi.fn(),
    handleTranscriptImportComplete: vi.fn(),
    isFavorited: () => false,
    isCompleted: () => false,
    isCurrent: () => false,
    handleToggleFavorite: vi.fn(),
    handleToggleCompleted: vi.fn(),
    handleToggleCurrent: vi.fn(),
    handleSignOut: vi.fn(),
    ...overrides,
  }
}

function setup(overrides = {}) {
  const data = mockData(overrides)
  useDashboardData.mockReturnValue(data)
  render(<MobileLayout />)
  return data
}

beforeEach(() => {
  localStorage.clear()
  // t() returns the key so assertions are locale-independent
  useLanguage.mockReturnValue({ t: (k) => k, language: 'en', setLanguage: vi.fn() })
  useTheme.mockReturnValue({ theme: 'light', setTheme: vi.fn() })
})

describe('MobileLayout bottom tab bar', () => {
  it('renders exactly the five primary tabs plus More', () => {
    setup()
    for (const key of ['nav.home', 'nav.chat', 'nav.degreePlanning', 'nav.calendar', 'nav.profile', 'nav.more']) {
      expect(screen.getByRole('button', { name: key })).toBeInTheDocument()
    }
  })

  it('keeps the secondary destinations out of the bar until More is opened', () => {
    setup()
    // Courses/Clubs/Forum are deliberately NOT in the bar — that is the whole
    // point of the 5-tab + More split.
    expect(screen.queryByRole('button', { name: 'nav.courses' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'nav.clubs' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'nav.forum' })).not.toBeInTheDocument()
  })

  it('marks the active tab with aria-current', () => {
    setup({ activeTab: 'calendar' })
    expect(screen.getByRole('button', { name: 'nav.calendar' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'nav.home' })).not.toHaveAttribute('aria-current')
  })

  it('navigates when a tab is tapped', async () => {
    const data = setup()
    await userEvent.click(screen.getByRole('button', { name: 'nav.chat' }))
    expect(data.handleTabChange).toHaveBeenCalledWith('chat')
  })

  it('shows the calendar badge when something is urgent', () => {
    setup({ upcomingUrgentCount: 3 })
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('hides the calendar badge when nothing is urgent', () => {
    setup({ upcomingUrgentCount: 0 })
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('caps the calendar badge at 9+', () => {
    setup({ upcomingUrgentCount: 42 })
    expect(screen.getByText('9+')).toBeInTheDocument()
  })
})

describe('MobileLayout More sheet', () => {
  it('reveals the secondary destinations', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'nav.more' }))
    expect(screen.getByRole('button', { name: /nav\.courses/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nav\.clubs/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nav\.forum/ })).toBeInTheDocument()
  })

  it('navigates and closes when a secondary destination is chosen', async () => {
    const data = setup()
    await userEvent.click(screen.getByRole('button', { name: 'nav.more' }))
    await userEvent.click(screen.getByRole('button', { name: /nav\.forum/ }))
    expect(data.handleTabChange).toHaveBeenCalledWith('forum')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('highlights More while a secondary destination is active', () => {
    setup({ activeTab: 'clubs' })
    expect(screen.getByRole('button', { name: 'nav.more' }).className).toMatch(/mobile-tab--active/)
  })

  it('signs out from the sheet', async () => {
    const data = setup()
    await userEvent.click(screen.getByRole('button', { name: 'nav.more' }))
    await userEvent.click(screen.getByRole('button', { name: /sidebar\.logOut/ }))
    expect(data.handleSignOut).toHaveBeenCalled()
  })

  it('closes on Escape', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'nav.more' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('useViewport', () => {
  // Guards the stub added to test/setup.js: without a window.matchMedia
  // implementation this hook throws, and every component that adapts its
  // layout would fail the moment it was rendered in a test.
  function Probe() {
    const { isMobile, isDesktop } = useViewport()
    return <span data-testid="vp">{`${isMobile}:${isDesktop}`}</span>
  }

  it('reports desktop when the media query does not match', () => {
    render(<Probe />)
    expect(screen.getByTestId('vp')).toHaveTextContent('false:true')
  })

  it('reports mobile when the media query matches', () => {
    const original = window.matchMedia
    window.matchMedia = (query) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })
    try {
      render(<Probe />)
      expect(screen.getByTestId('vp')).toHaveTextContent('true:false')
    } finally {
      window.matchMedia = original
    }
  })
})
