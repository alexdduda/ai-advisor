/**
 * ErrorBoundary — catches uncaught React render errors at the root.
 *
 * On error:
 *   1. If the error is a stale-deploy chunk-load failure (see
 *      isChunkLoadError below), reload ONCE instead of showing the error
 *      screen — the fix is always "get the new asset manifest", which a
 *      reload does automatically. Falls through to the normal error screen
 *      if that reload didn't help, so a genuinely broken deploy or an
 *      offline user still gets a real error rather than a reload loop.
 *   2. Otherwise: captures the exception to Sentry (if VITE_SENTRY_DSN is
 *      set) and stashes the returned event ID so the user can quote it.
 *   3. Logs locally to console for dev visibility.
 *   4. Shows the shared branded <ErrorScreen> so users see the same
 *      polished UI regardless of which path crashed.
 *
 * NEVER let this component itself throw. The fallback path uses inline
 * fallback strings so a missing i18n provider doesn't escalate.
 */
import { Component } from 'react'
import ErrorScreen from '../ErrorScreen/ErrorScreen'

// Vite's own preload-helper and dynamic-import machinery throw errors in
// this shape when a lazy chunk's hashed URL 404s — i.e. the browser still
// has the index.html (or an old chunk-to-hash mapping) from BEFORE the most
// recent deploy overwrote that file on the CDN. Every one of these is fixed
// by a reload: the new index.html points at chunks that actually exist.
// Wording differs across Vite versions/browsers, so this matches any of them.
const CHUNK_LOAD_ERROR_PATTERN =
  /unable to preload css|failed to fetch dynamically imported module|loading chunk .* failed|importing a module script failed/i

function isChunkLoadError(error) {
  return CHUNK_LOAD_ERROR_PATTERN.test(error?.message || '')
}

// One reload attempt per browser session. If the SAME class of error fires
// again after that reload, it is not a stale-manifest problem (a real
// deploy issue, or the user is offline) and looping would just thrash.
const RELOAD_GUARD_KEY = 'symbolos_chunk_reload_attempted'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, eventId: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    if (isChunkLoadError(error)) {
      let alreadyTried = false
      try { alreadyTried = sessionStorage.getItem(RELOAD_GUARD_KEY) === '1' } catch { /* private mode etc. */ }
      if (!alreadyTried) {
        try { sessionStorage.setItem(RELOAD_GUARD_KEY, '1') } catch { /* best effort — worst case we reload twice */ }
        console.warn('Stale chunk detected, reloading for a fresh deploy manifest:', error)
        window.location.reload()
        return
      }
      // Already tried once this session and hit it again — stop hiding it
      // behind a silent reload and fall through to the normal error path.
    }

    // Always log locally — Vercel function logs would have shown the
    // backend half but the frontend stack is harder to get without this.
    console.error('Error caught by boundary:', error, errorInfo)

    // Capture to Sentry async so we don't block the fallback render.
    // The dynamic import keeps Sentry out of the bundle until needed
    // AND means this works fine when Sentry isn't configured (the
    // import succeeds; init was a no-op so capture is also a no-op).
    import('@sentry/react').then(Sentry => {
      try {
        const eventId = Sentry.captureException(error, {
          contexts: { react: { componentStack: errorInfo?.componentStack } },
        })
        this.setState({ eventId })
      } catch { /* never let the error path throw */ }
    }).catch(() => {})
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          variant="generic"
          eventId={this.state.eventId}
          showReload={true}
          showHome={true}
        />
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
