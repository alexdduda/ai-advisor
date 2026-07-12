import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CoursesTab from './CoursesTab'

vi.mock('../../contexts/PreferencesContext', () => ({
  useLanguage: vi.fn(),
}))

vi.mock('../../contexts/CourseDetailContext', () => ({
  useCourseDetail: vi.fn(),
}))

import { useLanguage } from '../../contexts/PreferencesContext'
import { useCourseDetail } from '../../contexts/CourseDetailContext'

const COURSE = {
  subject: 'COMP', catalog: '202', title: 'Foundations of Programming',
  average: 3.2, instructor: 'Jane Doe',
  blended_rating: 4.2, rmp_difficulty: 2.8,
  rmp_num_ratings: 100, mc_num_ratings: 28,
}

function setup(overrides = {}) {
  const openCourse = vi.fn()
  useCourseDetail.mockReturnValue({ openCourse })
  const props = {
    searchQuery: '',
    setSearchQuery: vi.fn(),
    searchResults: [],
    isSearching: false,
    searchError: null,
    handleCourseSearch: vi.fn((e) => e?.preventDefault?.()),
    sortBy: 'relevance',
    setSortBy: vi.fn(),
    sortCourses: (courses) => courses,
    isFavorited: () => false,
    isCompleted: () => false,
    isCurrent: () => false,
    handleToggleFavorite: vi.fn(),
    handleToggleCompleted: vi.fn(),
    handleToggleCurrent: vi.fn(),
    gpaToLetterGrade: () => 'B',
    searchCorrection: null,
    hasSearched: false,
    ...overrides,
  }
  render(<CoursesTab {...props} />)
  return { openCourse, props }
}

beforeEach(() => {
  useLanguage.mockReturnValue({ t: (k) => k, language: 'en' })
})

describe('CoursesTab search results', () => {
  it('renders result cards with code, title, and review count', () => {
    setup({ searchResults: [COURSE], hasSearched: true })
    expect(screen.getByText('COMP 202')).toBeInTheDocument()
    expect(screen.getByText('Foundations of Programming')).toBeInTheDocument()
    expect(screen.getByText('· 128')).toBeInTheDocument()
  })

  it('opens the shared course detail modal on card click', async () => {
    const user = userEvent.setup()
    const { openCourse } = setup({ searchResults: [COURSE], hasSearched: true })
    await user.click(screen.getByText('Foundations of Programming'))
    expect(openCourse).toHaveBeenCalledWith('COMP', '202')
  })

  it('action buttons toggle without opening the detail modal', async () => {
    const user = userEvent.setup()
    const { openCourse, props } = setup({ searchResults: [COURSE], hasSearched: true })
    await user.click(document.querySelector('.favorite-btn'))
    expect(props.handleToggleFavorite).toHaveBeenCalled()
    expect(openCourse).not.toHaveBeenCalled()
  })
})

describe('CoursesTab states', () => {
  it('shows the typo-correction banner when a correction was applied', () => {
    setup({
      searchResults: [COURSE],
      hasSearched: true,
      searchCorrection: { original: 'CMOP 202', corrected: 'COMP 202' },
    })
    expect(screen.getByText(/courses\.correctionPrefix/)).toBeInTheDocument()
    expect(screen.getByText('COMP 202', { selector: 'strong' })).toBeInTheDocument()
  })

  it('shows skeleton cards while searching', () => {
    setup({ isSearching: true, hasSearched: true })
    expect(document.querySelectorAll('.course-card--skeleton').length).toBeGreaterThan(0)
  })

  it('shows an empty state after a search with no results', () => {
    setup({ hasSearched: true, searchResults: [] })
    expect(screen.getByText('courses.noResultsTitle')).toBeInTheDocument()
  })

  it('shows the explorer placeholder before any search', () => {
    setup()
    expect(screen.getByText('courses.explorerTitle')).toBeInTheDocument()
  })
})
