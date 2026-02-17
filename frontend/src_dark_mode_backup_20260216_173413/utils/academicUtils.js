import { BADGES, CREDIT_REQUIREMENTS } from './mcgillData'

/**
 * Calculate which badges a user has earned
 */
export function calculateBadges(userData) {
  const earned = []
  
  const {
    profile,
    completedCourses = [],
    savedCourses = [],
    chatCount = 0
  } = userData

  // Getting Started
  if (profile?.major && profile?.year && profile?.current_gpa) {
    earned.push(BADGES.find(b => b.id === 'getting_started'))
  }

  // Course Explorer (10+ saved)
  if (savedCourses.length >= 10) {
    earned.push(BADGES.find(b => b.id === 'course_explorer'))
  }

  // Early Bird (15+ saved)
  if (savedCourses.length >= 15) {
    earned.push(BADGES.find(b => b.id === 'early_bird'))
  }

  // Chat Master (50+ chats)
  if (chatCount >= 50) {
    earned.push(BADGES.find(b => b.id === 'chat_master'))
  }

  // Dean's List (GPA 3.7+)
  if (profile?.current_gpa >= 3.7) {
    earned.push(BADGES.find(b => b.id === 'deans_list'))
  }

  // Well-Rounded (5+ departments)
  const departments = new Set(completedCourses.map(c => c.subject))
  if (departments.size >= 5) {
    earned.push(BADGES.find(b => b.id === 'well_rounded'))
  }

  // Credit-based badges
  const totalCredits = completedCourses.reduce((sum, c) => sum + (c.credits || 3), 0)
  
  if (totalCredits >= 60) {
    earned.push(BADGES.find(b => b.id === 'veteran'))
  }
  if (totalCredits >= 90) {
    earned.push(BADGES.find(b => b.id === 'scholar'))
  }
  if (totalCredits >= 100) {
    earned.push(BADGES.find(b => b.id === 'graduate'))
  }

  return earned.filter(Boolean)
}

/**
 * Calculate degree progress for majors and minors
 */
export function calculateDegreeProgress(completedCourses, majors = [], minors = []) {
  const progress = {
    totalCredits: completedCourses.reduce((sum, c) => sum + (c.credits || 3), 0),
    targetCredits: CREDIT_REQUIREMENTS.single_major,
    overallProgress: 0,
    majors: [],
    minors: []
  }

  progress.overallProgress = Math.min(
    (progress.totalCredits / progress.targetCredits) * 100,
    100
  )

  // Calculate major progress (simplified - would need major requirements data)
  majors.forEach(major => {
    const majorCourses = completedCourses.filter(c => 
      // This is simplified - in reality you'd match against major requirements
      c.subject === getMajorPrefix(major)
    )
    
    progress.majors.push({
      name: major,
      completed: majorCourses.length,
      required: 20, // Simplified - varies by major
      progress: Math.min((majorCourses.length / 20) * 100, 100)
    })
  })

  // Calculate minor progress
  minors.forEach(minor => {
    const minorCourses = completedCourses.filter(c => 
      c.subject === getMinorPrefix(minor)
    )
    
    progress.minors.push({
      name: minor,
      completed: minorCourses.length,
      required: 6, // Standard minor requirement
      progress: Math.min((minorCourses.length / 6) * 100, 100)
    })
  })

  return progress
}

/**
 * Get department prefix from major name (simplified)
 */
function getMajorPrefix(major) {
  const map = {
    'Computer Science': 'COMP',
    'Mathematics': 'MATH',
    'Biology': 'BIOL',
    'Chemistry': 'CHEM',
    'Physics': 'PHYS',
    'Psychology': 'PSYC',
    'Economics': 'ECON',
    'Political Science': 'POLI',
    'English': 'ENGL',
    'History': 'HIST'
    // Add more mappings as needed
  }
  return map[major] || major.substring(0, 4).toUpperCase()
}

function getMinorPrefix(minor) {
  return getMajorPrefix(minor) // Same logic
}

/**
 * Generate personalized insights based on user data
 * @param {Object} userData - User profile and activity data
 * @param {Function} t - Translation function from useLanguage hook
 * @returns {Array} Array of insight objects
 */
export function generateInsights(userData, t) {
  const {
    profile,
    completedCourses = [],
    savedCourses = [],
    chatHistory = []
  } = userData

  const insights = []

  // Interest-based recommendations
  if (profile?.interests) {
    const interests = profile.interests.split(',').map(i => i.trim())
    insights.push({
      type: 'interests',
      icon: '✨',
      title: t('insights.basedOnInterests'),
      content: t('insights.exploreCourses').replace('{interests}', interests.slice(0, 3).join(', '))
    })
  }

  // Peer recommendations
  if (profile?.major) {
    insights.push({
      type: 'peer',
      icon: '👥',
      title: t('insights.peersAlsoTook'),
      content: 'COMP 206, COMP 251, MATH 240' // Mock data - connect to backend
    })
  }

  // Chat-based insights
  const chatTopics = extractChatTopics(chatHistory)
  if (chatTopics.length > 0) {
    insights.push({
      type: 'chat',
      icon: '💬',
      title: t('insights.frequentlyAsk'),
      content: chatTopics.slice(0, 3).join(', ')
    })
  }

  // GPA-based insights
  if (profile?.current_gpa >= 3.7) {
    insights.push({
      type: 'achievement',
      icon: '🏆',
      title: t('insights.outstandingPerformance'),
      content: t('insights.honoursProgramsQualify')
    })
  }

  // Credit progress
  const totalCredits = completedCourses.reduce((sum, c) => sum + (c.credits || 3), 0)
  const remaining = 120 - totalCredits
  if (remaining > 0 && remaining <= 30) {
    insights.push({
      type: 'progress',
      icon: '🎓',
      title: t('insights.almostThere'),
      content: t('insights.creditsUntilGrad').replace('{count}', remaining)
    })
  }

  return insights
}

/**
 * Extract topics from chat history (simplified)
 */
function extractChatTopics(chatHistory) {
  // This would use NLP in production
  const topics = []
  const keywords = ['COMP', 'MATH', 'study', 'professor', 'prerequisite']
  
  chatHistory.forEach(chat => {
    keywords.forEach(keyword => {
      if (chat.messages?.some(m => m.content?.includes(keyword))) {
        if (!topics.includes(keyword)) topics.push(keyword)
      }
    })
  })
  
  return topics
}

/**
 * Group completed courses by semester for timeline
 */
export function groupCoursesBySemester(completedCourses) {
  const grouped = {}
  
  completedCourses.forEach(course => {
    const semester = course.semester || 'Unassigned'
    if (!grouped[semester]) {
      grouped[semester] = []
    }
    grouped[semester].push(course)
  })

  // Sort semesters chronologically
  const sorted = Object.keys(grouped).sort((a, b) => {
    if (a === 'Unassigned') return 1
    if (b === 'Unassigned') return -1
    
    // Parse semester strings like "Fall 2023", "Winter 2024"
    const [seasonA, yearA] = a.split(' ')
    const [seasonB, yearB] = b.split(' ')
    
    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB)
    
    const seasonOrder = { Fall: 1, Winter: 2, Summer: 3 }
    return seasonOrder[seasonA] - seasonOrder[seasonB]
  })

  return sorted.map(semester => ({
    semester,
    courses: grouped[semester]
  }))
}
