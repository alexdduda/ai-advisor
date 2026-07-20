# 3. Capacitor ships bundled web assets, not a remote URL

Date: 2026-07-20

## Status

Accepted

## Context

The mobile app wraps the existing React/Vite frontend in a Capacitor WebView
rather than being a separate codebase. Capacitor can load the web layer two
ways:

1. **Bundled** — `webDir: "dist"`. The Vite build output is copied into the
   native projects by `npx cap sync` and ships inside the app binary.
2. **Remote** — `server.url: "https://symbolos.ca"`. The app is a thin shell
   that loads the live site at runtime.

Remote is tempting for a small team: a Vercel deploy would reach app users
immediately, with no store review and no version skew between web and app.

The decision is recorded here rather than as a comment in the config because
`capacitor.config.json` cannot hold comments. The project has no TypeScript
dependency, so the `.ts` config form (which would allow comments) would mean
adding TypeScript solely to parse one file, and the `.js` form is unusable
because `frontend/package.json` sets `"type": "module"` while Capacitor's
config loader expects CommonJS there.

## Decision

Ship bundled web assets.

## Consequences

Why bundled wins:

- **App Store Review Guideline 4.2 ("minimum functionality").** Apple rejects
  apps that are essentially a wrapper around a website. A remote-URL shell is
  the canonical example. Symbolos is publishing iOS-first, so a rejection here
  blocks the launch entirely — there is no Android release to fall back on.
- **Offline cold start.** A remote shell with no connection shows a blank
  WebView. A bundled app paints its shell and can show a real error state.
- **First paint.** Remote makes every launch depend on a network round trip.

What it costs, and what follows from it:

- Shipping a frontend change to app users requires a new store build. Web and
  app versions **will** drift, potentially by weeks given review times.
- Backend changes still reach everyone instantly. Therefore **the API must
  stay backward-compatible with older shipped frontends** — an API response
  shape change that assumes the current frontend will break installed apps
  that cannot update. This is the main ongoing constraint this decision
  creates, and it is easy to forget because it does not affect the web app.
- `npx cap sync` must run after every `npm run build` intended for a native
  release, or the app ships stale assets.

## Notes

`VITE_API_URL` must be set in the shell when building for native.
`frontend/src/lib/apiConfig.js` throws if it is missing in a production build,
and `cap sync` copies whatever `dist/` contains — so a missing variable
produces an app that fails at startup with no useful error.
