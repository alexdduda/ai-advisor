import { useLanguage } from '../../contexts/LanguageContext'
import { generateInsights } from '../../utils/academicUtils'
import './PersonalizedInsights.css'

export default function PersonalizedInsights({ userData }) {
  const { t } = useLanguage()
  const insights = generateInsights(userData, t)

  return (
    <div className="insights-section">
      <p className="insights-subtitle">{t('profile.insightsSubtitle')}</p>

      {insights.length > 0 ? (
        <div className="insights-grid">
          {insights.map((insight, idx) => (
            <div key={idx} className={`insight-card insight-${insight.type}`}>
              <div className="insight-icon">{insight.icon}</div>
              <div className="insight-content">
                <h4 className="insight-title">{insight.title}</h4>
                <p className="insight-text">{insight.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="insights-empty">
          <span className="empty-icon">🎯</span>
          <p>{t('profile.insightsEmpty')}</p>
        </div>
      )}
    </div>
  )
}
