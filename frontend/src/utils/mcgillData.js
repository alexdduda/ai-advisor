// McGill University Academic Programs Data

export const FACULTIES = [
  'Faculty of Agricultural and Environmental Sciences',
  'Faculty of Arts',
  'Bachelor of Arts and Science',
  'School of Continuing Studies',
  'Faculty of Dental Medicine and Oral Health Sciences',
  'Faculty of Education',
  'Faculty of Engineering',
  'School of Environment',
  'Graduate and Postdoctoral Studies',
  'Faculty of Law',
  'Desautels Faculty of Management',
  'Faculty of Medicine and Health Sciences',
  'Schulich School of Music',
  'Ingram School of Nursing',
  'School of Physical and Occupational Therapy',
  'Faculty of Science',
  'Study Abroad and Field Studies',
];

// Credit requirements by faculty and specific programs
export const FACULTY_CREDIT_REQUIREMENTS = {
  'Faculty of Agricultural and Environmental Sciences': 120,
  'School of Continuing Studies': 90,
  'Faculty of Education': 120,
  'Graduate and Postdoctoral Studies': 45,
  'Desautels Faculty of Management': 120,
  'Schulich School of Music': 120,
  'Faculty of Arts': 120,
  'Faculty of Dental Medicine and Oral Health Sciences': 120,
  'Faculty of Engineering': 120, // Default for engineering
  'Faculty of Law': 90,
  'Faculty of Medicine and Health Sciences': 170,
  'Faculty of Science': 120
};

// Program-specific credit requirements (overrides faculty defaults)
export const PROGRAM_CREDIT_REQUIREMENTS = {
  'Mechanical Engineering': 142,
  'Civil Engineering': 139,
  'Electrical Engineering': 134,
  'Computer Engineering': 133,
  'Software Engineering (Co-op)': 141,
  'Software Engineering': 141,
  'Bioengineering': 142,
  'Chemical Engineering': 143,
  'Mining Engineering': 144,
  'Materials Engineering': 148,
  'Computer Engineering': 133,
  'Global Engineering': 127,
  'Architecture (B.Sc.)': 126,
};

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
  'Bioengineering', 'Computer Engineering', 'Software Engineering (Co-op)',
  'Global Engineering', 'Architecture (B.Sc.)',
  
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
