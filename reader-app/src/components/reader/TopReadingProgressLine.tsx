import { useEffect, useState } from 'react'

export function TopReadingProgressLine() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll <= 0) {
        setProgress(0)
        return
      }
      const currentScroll = window.scrollY
      const ratio = Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100))
      setProgress(ratio)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-[env(safe-area-inset-top,0px)] inset-x-0 z-50 h-0.75 bg-app-border/20 pointer-events-none">
      <div
        className="h-full bg-linear-to-r from-app-accent/70 via-app-accent to-app-accent/90 shadow-xs transition-all duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
