import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Separate from vite.config.js on purpose: that file has async Sentry-plugin
// loading and production build options (terser, manualChunks) that tests
// don't need and that having vitest evaluate could only add risk for.
// Vitest uses this file instead of (not merged with) vite.config.js once it
// exists, so the react() plugin is repeated here for JSX support in tests.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    // Dummy Supabase creds so `createClient()` in src/lib/supabase.js (reached
    // transitively via AuthContext, e.g. from FeedbackModal) doesn't throw
    // "supabaseUrl is required" under CI, which has no VITE_SUPABASE_* vars.
    // The app still errors loudly on missing env in real runs — this only
    // affects the test environment.
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
  },
})
