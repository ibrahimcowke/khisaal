import { useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'

export function ThemeEffect() {
  const theme = useSettingsStore((s) => s.theme)
  const accentColor = useSettingsStore((s) => s.accentColor)
  const cardShaping = useSettingsStore((s) => s.cardShaping)
  const edgeToEdgeDisplay = useSettingsStore((s) => s.edgeToEdgeDisplay)
  const brightnessOverlay = useSettingsStore((s) => s.brightnessOverlay)

  useEffect(() => {
    document.documentElement.setAttribute('data-reader-theme', theme)
    document.documentElement.setAttribute('data-accent', accentColor || 'gold')
    document.documentElement.setAttribute('data-shaping', cardShaping || 'andalusian')
    document.documentElement.setAttribute('data-edge-to-edge', edgeToEdgeDisplay ? 'true' : 'false')
    document.documentElement.style.colorScheme = theme === 'night' || theme === 'oled' ? 'dark' : 'light'
  }, [theme, accentColor, cardShaping, edgeToEdgeDisplay])

  useEffect(() => {
    let overlay = document.getElementById('brightness-overlay')
    if (!overlay) {
      overlay = document.createElement('div')
      overlay.id = 'brightness-overlay'
      overlay.style.position = 'fixed'
      overlay.style.inset = '0'
      overlay.style.pointerEvents = 'none'
      overlay.style.zIndex = '9999'
      overlay.style.background = 'black'
      overlay.style.transition = 'opacity 0.2s ease'
      document.body.appendChild(overlay)
    }
    overlay.style.opacity = String(brightnessOverlay * 0.6)
  }, [brightnessOverlay])

  return null
}
