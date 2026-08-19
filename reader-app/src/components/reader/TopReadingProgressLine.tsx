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
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (progress <= 0) return null

  return (
    <div className="fixed top-0 inset-x-0 z-40 h-[2.5px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-app-accent shadow-sm transition-all duration-100 ease-out"
        style={{ width: `${progress}%`, opacity: 0.85 }}
      />
    </div>
  )
}
