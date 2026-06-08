import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'
import { initTelemetry } from './lib/telemetry'

// Fire Sentry + PostHog before React mounts so the first paint is already
// being observed. No-ops if the env vars aren't set (local dev / preview).
initTelemetry()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
