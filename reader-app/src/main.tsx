import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Handle stale chunk hash errors caused by new deployments
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  const key = 'vite_preload_retry'
  const lastRetry = sessionStorage.getItem(key)
  const now = Date.now()
  if (!lastRetry || now - Number(lastRetry) > 5000) {
    sessionStorage.setItem(key, String(now))
    window.location.reload()
  }
})

// Automatically reload when an update is available to prevent stale PWA cache
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

