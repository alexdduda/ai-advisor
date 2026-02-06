import { generateInsights } from '../../utils/academicUtils'
import './PersonalizedInsights.css'

export default function PersonalizedInsights({ userData }) {
  const insights = generateInsights(userData)

  return (
    <div className="insights-section">
      <div className="insights-header">
        <h3>💡 Personalized Insights</h3>
        <p className="insights-subtitle">Recommendations based on your profile and activity</p>
      </div>

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
          <p>Complete your profile and interact with the AI advisor to get personalized recommendations!</p>
        </div>
      )}
    </div>
  )
}
