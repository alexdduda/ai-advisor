import { useLanguage } from '../../contexts/LanguageContext'
import { FaComments, FaUsers, FaStickyNote, FaBullseye } from 'react-icons/fa'
import './Forum.css'

export default function Forum() {
  const { t } = useLanguage()

  const features = [
    {
      icon: <FaComments />,
      title: t('forum.feature1Title'),
      description: t('forum.feature1Desc')
    },
    {
      icon: <FaUsers />,
      title: t('forum.feature2Title'),
      description: t('forum.feature2Desc')
    },
    {
      icon: <FaStickyNote />,
      title: t('forum.feature3Title'),
      description: t('forum.feature3Desc')
    },
    {
      icon: <FaBullseye />,
      title: t('forum.feature4Title'),
      description: t('forum.feature4Desc')
    }
  ]

  return (
    <div className="forum-container">
      <div className="forum-features">
        <h2 className="features-title">{t('forum.whatsComingTitle')}</h2>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
