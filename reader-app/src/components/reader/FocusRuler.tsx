import { useEffect, useState } from 'react'
import { useSettingsStore } from '../../store/settingsStore'

export function FocusRuler() {
  const { showFocusRuler, focusRulerHeight, focusRulerOpacity } = useSettingsStore()
  const [mouseY, setMouseY] = useState<number | null>(null)

  useEffect(() => {
    if (!showFocusRuler) return

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setMouseY(e.touches[0].clientY)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [showFocusRuler])

  if (!showFocusRuler || mouseY === null) return null

  return (
    <div
      className="fixed inset-x-0 pointer-events-none z-30 transition-transform duration-75 ease-out"
      style={{
        top: `${mouseY - focusRulerHeight / 2}px`,
        height: `${focusRulerHeight}px`,
        backgroundColor: 'var(--color-app-accent)',
        opacity: focusRulerOpacity,
        boxShadow: '0 0 15px rgba(0,0,0,0.1)',
        borderTop: '1px solid var(--color-app-accent)',
        borderBottom: '1px solid var(--color-app-accent)',
      }}
    />
  )
}
