import { useLanguage } from '../../contexts/LanguageContext'
import { calculateBadges } from '../../utils/academicUtils'
import {
  FaBullseye, FaSearch, FaComments, FaStar, FaTrophy,
  FaClock, FaGraduationCap, FaBook,
  FaCheck, FaLock,
} from 'react-icons/fa'
import './Badges.css'

// Badge definitions with translation keys
const BADGES = [
  {
    id: 'getting_started',
    nameKey: 'badges.gettingStarted',
    descKey: 'badges.gettingStartedDesc',
    icon: FaBullseye,
    color: 'accent',
    requirement: 'profile_complete'
  },
  {
    id: 'course_explorer',
    nameKey: 'badges.courseExplorer',
    descKey: 'badges.courseExplorerDesc',
    icon: FaSearch,
    color: 'info',
    requirement: 'saved_10_courses'
  },
  {
    id: 'chat_master',
    nameKey: 'badges.chatMaster',
    descKey: 'badges.chatMasterDesc',
    icon: FaComments,
    color: 'success',
    requirement: 'chat_50_times'
  },
  {
    id: 'well_rounded',
    nameKey: 'badges.wellRounded',
    descKey: 'badges.wellRoundedDesc',
    icon: FaStar,
    color: 'warning',
    requirement: 'courses_5_departments'
  },
  {
    id: 'deans_list',
    nameKey: 'badges.deansList',
    descKey: 'badges.deansListDesc',
    icon: FaTrophy,
    color: 'accent',
    requirement: 'gpa_3.7'
  },
  {
    id: 'early_bird',
    nameKey: 'badges.earlyBird',
    descKey: 'badges.earlyBirdDesc',
    icon: FaClock,
    color: 'info',
    requirement: 'saved_15_courses'
  },
  {
    id: 'veteran',
    nameKey: 'badges.mcgillVeteran',
    descKey: 'badges.mcgillVeteranDesc',
    icon: FaGraduationCap,
    color: 'success',
    requirement: 'credits_60'
  },
  {
    id: 'scholar',
    nameKey: 'badges.scholar',
    descKey: 'badges.scholarDesc',
    icon: FaBook,
    color: 'warning',
    requirement: 'credits_90'
  },
  {
    id: 'graduate',
    nameKey: 'badges.almostThere',
    descKey: 'badges.almostThereDesc',
    icon: FaGraduationCap,
    color: 'accent',
    requirement: 'credits_100'
  }
]

export default function BadgesDisplay({ userData }) {
  const { t } = useLanguage()
  const earnedBadges = calculateBadges(userData)
  const allBadges = BADGES

  return (
    <div className="badges-section">
      <div className="badges-header">
        <p className="badges-count">
          {t('badges.unlocked')
            .replace('{count}', earnedBadges.length)
            .replace('{total}', allBadges.length)}
        </p>
      </div>

      <div className="badges-grid">
        {allBadges.map((badge) => {
          const isEarned = earnedBadges.some(b => b?.id === badge.id)
          const Icon = badge.icon

          return (
            <div
              key={badge.id}
              className={`badge-card ${isEarned ? 'earned' : 'locked'}`}
              title={t(badge.descKey)}
            >
              <div className={`badge-icon-wrap badge-icon-wrap--${badge.color} ${!isEarned ? 'badge-icon-wrap--locked' : ''}`}>
                <Icon className="badge-icon" />
              </div>
              <div className="badge-info">
                <div className="badge-name">{t(badge.nameKey)}</div>
                <div className="badge-description">{t(badge.descKey)}</div>
              </div>
              {isEarned ? (
                <div className="badge-checkmark">
                  <FaCheck />
                </div>
              ) : (
                <div className="badge-lock">
                  <FaLock />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}