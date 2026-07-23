import { useState, useEffect } from 'react'

/**
 * Single source of truth for the mobile/desktop breakpoint.
 *
 * 768px was chosen because it already *is* the de-facto breakpoint in this
 * codebase: it's what Dashboard.jsx checked in two places before this hook
 * existed, and it's the most common width across the ~72 hand-written media
 * queries. Keeping the JS and CSS boundaries identical avoids a band of
 * widths where the layout shell and its styles disagree.
 *
 * Deliberately switches on viewport width, NOT on Capacitor.isNativePlatform().
 * Mobile *web* visitors (a lot of Symbolos traffic arrives from r/mcgill on
 * phones) must get the same mobile UI as native app users.
 */
export const MOBILE_BREAKPOINT = 768

const query = `(max-width: ${MOBILE_BREAKPOINT}px)`

export default function useViewport() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setIsMobile(e.matches)
    // matchMedia fires only on threshold crossings, so this is far cheaper
    // than a resize listener that runs on every pixel of a window drag.
    mql.addEventListener('change', onChange)
    // Re-sync in case the width changed between the initial render and here.
    setIsMobile(mql.matches)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return { isMobile, isDesktop: !isMobile }
}
