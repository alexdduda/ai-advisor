import { useState } from 'react'
import { FaChevronRight } from 'react-icons/fa'
import { useLanguage } from '../../contexts/PreferencesContext'
import PrivacyPolicy from '../Legal/PrivacyPolicy'
import TermsOfService from '../Legal/TOS'
import logoMark from '../../assets/loading-logo.png'
import './MobileWelcome.css'

/**
 * First screen inside the installed app.
 *
 * Someone who went to the App Store, tapped Install and waited has already
 * decided. Showing them the marketing landing page at that point re-pitches a
 * product they just bought and puts a scroll between them and the thing they
 * came to do. So the app opens on a short branded welcome that exists only to
 * route: sign up, or sign in.
 *
 * Rendered ONLY when isNativeApp() is true. Mobile web keeps the full landing
 * page, because a phone visitor arriving from a link has not been sold yet and
 * that page is the entire conversion surface.
 */
export default function MobileWelcome({ onSignUp, onSignIn }) {
  const { t } = useLanguage()
  const [legalModal, setLegalModal] = useState(null)

  return (
    <div className="mw-root">
      {legalModal === 'privacy' && <PrivacyPolicy onClose={() => setLegalModal(null)} />}
      {legalModal === 'terms'   && <TermsOfService onClose={() => setLegalModal(null)} />}

      <div className="mw-hero">
        <img src={logoMark} alt="" className="mw-logo" />
        <h1 className="mw-wordmark">Symbolos</h1>
        <p className="mw-tagline">{t('mw.tagline')}</p>
      </div>

      {/* Three lines, not a feature grid. Enough to orient someone who
          installed on a friend's recommendation and has never seen the site;
          short enough that nobody scrolls to reach the buttons. */}
      <ul className="mw-points">
        <li className="mw-point">{t('mw.point1')}</li>
        <li className="mw-point">{t('mw.point2')}</li>
        <li className="mw-point">{t('mw.point3')}</li>
      </ul>

      <div className="mw-actions">
        <button className="mw-btn mw-btn--primary" onClick={onSignUp}>
          {t('mw.getStarted')}
          <FaChevronRight size={12} />
        </button>
        <button className="mw-btn mw-btn--ghost" onClick={onSignIn}>
          {t('mw.haveAccount')}
        </button>
      </div>

      <div className="mw-footer">
        <span className="mw-disclaimer">{t('rsb.notAffiliated')}</span>
        <span className="mw-legal">
          <button className="mw-legal-link" onClick={() => setLegalModal('privacy')}>
            {t('legal.navPrivacy')}
          </button>
          <span className="mw-legal-sep">·</span>
          <button className="mw-legal-link" onClick={() => setLegalModal('terms')}>
            {t('legal.navTerms')}
          </button>
        </span>
      </div>
    </div>
  )
}
