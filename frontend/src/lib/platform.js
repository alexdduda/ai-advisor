import { Capacitor } from '@capacitor/core'

/**
 * Platform detection — deliberately separate from useViewport().
 *
 * These answer different questions and must not be conflated:
 *
 *   useViewport()   "is this screen phone-sized?"  → drives ALL layout.
 *   isNativeApp()   "are we inside the installed app?" → drives only the
 *                   handful of things that are genuinely native concerns.
 *
 * Layout switches on viewport so that mobile *web* visitors get the same UI
 * as app users. A lot of Symbolos traffic arrives from r/mcgill on phones,
 * and those people must not get a desktop layout crammed onto a phone.
 *
 * Reach for isNativeApp() only when the app and the mobile website should
 * genuinely behave differently. Legitimate cases:
 *   - Skipping the marketing landing page. Someone who installed the app has
 *     already been sold; someone landing on symbolos.ca from a link has not,
 *     and stripping the pitch there would cost signups.
 *   - "Get the app" prompts, which must never appear inside the app.
 *   - Deep links, push notifications, status bar, native keyboard handling.
 *
 * Using it for layout would silently give mobile web visitors the desktop
 * experience, which is the exact regression the viewport rule exists to
 * prevent.
 *
 * Value is fixed for the lifetime of the page, so this is a plain function
 * rather than a hook — there is no state to subscribe to.
 */
/**
 * Preview-only escape hatch.
 *
 * The native-only screens are invisible in a browser, which makes them
 * untestable until someone has Xcode or Android Studio running. `?native=1`
 * on a preview deployment forces the native code path so they can be reviewed
 * from a phone browser.
 *
 * Hard-gated on hostname: this returns false on symbolos.ca no matter what is
 * in the URL. Without that gate it would be a live way for anyone to skip the
 * marketing landing page, and a crawler following such a link could index the
 * wrong entry point. Preview hosts are *.vercel.app and localhost.
 *
 * Persisted for the session so the flag survives navigation and reloads;
 * `?native=0` clears it.
 */
function nativePreviewOverride() {
  if (typeof window === 'undefined') return false

  const host = window.location.hostname
  const isProductionHost = host === 'symbolos.ca' || host.endsWith('.symbolos.ca')
  if (isProductionHost) return false

  try {
    const param = new URLSearchParams(window.location.search).get('native')
    if (param === '1') {
      sessionStorage.setItem('symbolos_force_native', '1')
      return true
    }
    if (param === '0') {
      sessionStorage.removeItem('symbolos_force_native')
      return false
    }
    return sessionStorage.getItem('symbolos_force_native') === '1'
  } catch {
    return false
  }
}

export function isNativeApp() {
  if (nativePreviewOverride()) return true
  try {
    return Capacitor.isNativePlatform()
  } catch {
    // Capacitor isn't present at all (plain web build) — treat as web.
    return false
  }
}

/** 'ios' | 'android' | 'web' — for the rare place the two natives differ. */
export function getPlatform() {
  try {
    return Capacitor.getPlatform()
  } catch {
    return 'web'
  }
}
