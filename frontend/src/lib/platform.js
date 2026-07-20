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
export function isNativeApp() {
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
