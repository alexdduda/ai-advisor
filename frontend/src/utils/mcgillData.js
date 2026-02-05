// McGill University Academic Programs Data

export const FACULTIES = [
  'Faculty of Arts',
  'Faculty of Science',
  'Faculty of Arts and Science',
  'Desautels Faculty of Management',
  'Faculty of Engineering',
  'Faculty of Medicine and Health Sciences',
  'Faculty of Law',
  'Faculty of Education',
  'Schulich School of Music',
  'School of Architecture',
  'Faculty of Agricultural and Environmental Sciences',
  'School of Continuing Studies',
  'Faculty of Dentistry',
  'Faculty of Religious Studies'
];

export const MAJORS = [
  // Arts
  'Anthropology', 'Art History', 'Classical Studies', 'East Asian Studies',
  'Economics', 'English', 'French', 'German Studies', 'Hispanic Studies',
  'History', 'Italian Studies', 'Linguistics', 'Philosophy', 'Political Science',
  'Psychology', 'Sociology', 'Geography', 'International Development Studies',
  
  // Science
  'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Statistics',
  'Computer Science', 'Software Engineering', 'Biochemistry',
  'Microbiology and Immunology', 'Physiology', 'Anatomy and Cell Biology',
  'Atmospheric and Oceanic Sciences', 'Earth and Planetary Sciences',
  'Environmental Science', 'Neuroscience',
  
  // Engineering
  'Chemical Engineering', 'Civil Engineering', 'Electrical Engineering',
  'Mechanical Engineering', 'Mining Engineering', 'Materials Engineering',
  'Bioengineering', 'Software Engineering',
  
  // Management
  'Accounting', 'Finance', 'Information Systems', 'International Management',
  'Managing for Sustainability', 'Marketing', 'Operations Management',
  'Organizational Behaviour', 'Strategic Management',
  
  // Other
  'Architecture', 'Music', 'Education', 'Kinesiology', 'Nursing',
  'Agricultural Economics', 'Food Science', 'Wildlife Biology'
];

export const MINORS = [
  'Anthropology', 'Art History', 'Biology', 'Chemistry', 'Classics',
  'Computer Science', 'Economics', 'English', 'Environmental Studies',
  'French', 'Geography', 'German Studies', 'History', 'Italian Studies',
  'Mathematics', 'Music', 'Philosophy', 'Physics', 'Political Science',
  'Psychology', 'Religious Studies', 'Sociology', 'Spanish',
  'Statistics', 'Gender, Sexuality, Feminist and Social Justice Studies',
  'Canadian Studies', 'African Studies', 'East Asian Studies',
  'Latin American and Caribbean Studies', 'Middle Eastern Studies',
  'World Cinemas', 'Urban Systems', 'Communication Studies',
  'Linguistics', 'Cognitive Science', 'Entrepreneurship',
  'Business', 'Management', 'Sustainability Science and Society'
];

export const YEAR_OPTIONS = [
  { value: '0', label: 'U0' },
  { value: '1', label: 'U1' },
  { value: '2', label: 'U2' },
  { value: '3', label: 'U3' },
  { value: '4', label: 'U4' },
  { value: '5', label: 'U5+' }
];

// Credit requirements by program type
export const CREDIT_REQUIREMENTS = {
  'single_major': 120,
  'double_major': 120,
  'major_minor': 120,
  'honours': 120
};

export const BADGES = [
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Set up your profile',
    icon: '🎯',
    requirement: 'profile_complete'
  },
  {
    id: 'course_explorer',
    name: 'Course Explorer',
    description: 'Saved 10+ courses',
    icon: '🔍',
    requirement: 'saved_10_courses'
  },
  {
    id: 'chat_master',
    name: 'Chat Master',
    description: '50+ AI conversations',
    icon: '💬',
    requirement: 'chat_50_times'
  },
  {
    id: 'well_rounded',
    name: 'Well-Rounded',
    description: 'Took courses in 5+ departments',
    icon: '🌟',
    requirement: 'courses_5_departments'
  },
  {
    id: 'deans_list',
    name: "Dean's List",
    description: 'GPA above 3.7',
    icon: '🏆',
    requirement: 'gpa_3.7'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Plan next semester early',
    icon: '🐦',
    requirement: 'saved_15_courses'
  },
  {
    id: 'veteran',
    name: 'McGill Veteran',
    description: 'Complete 60+ credits',
    icon: '🎓',
    requirement: 'credits_60'
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete 90+ credits',
    icon: '📚',
    requirement: 'credits_90'
  },
  {
    id: 'graduate',
    name: 'Almost There!',
    description: 'Complete 100+ credits',
    icon: '🎉',
    requirement: 'credits_100'
  }
];
