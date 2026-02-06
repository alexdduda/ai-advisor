import { BADGES } from '../../utils/mcgillData'
import { calculateBadges } from '../../utils/academicUtils'
import './Badges.css'

export default function BadgesDisplay({ userData }) {
  const earnedBadges = calculateBadges(userData)
  const allBadges = BADGES

  return (
    <div className="badges-section">
      <div className="badges-header">
        <h3>🏆 Achievements</h3>
        <p className="badges-count">
          {earnedBadges.length} of {allBadges.length} unlocked
        </p>
      </div>
      
      <div className="badges-grid">
        {allBadges.map((badge) => {
          const isEarned = earnedBadges.some(b => b?.id === badge.id)
          
          return (
            <div 
              key={badge.id} 
              className={`badge-card ${isEarned ? 'earned' : 'locked'}`}
              title={badge.description}
            >
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-info">
                <div className="badge-name">{badge.name}</div>
                <div className="badge-description">{badge.description}</div>
              </div>
              {isEarned && <div className="badge-checkmark">✓</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
