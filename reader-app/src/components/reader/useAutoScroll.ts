import { useCallback, useEffect, useRef, useState } from 'react'

export function useAutoScroll(speed: number) {
  const [active, setActive] = useState(false)
  const [paused, setPaused] = useState(false)
  const rafRef = useRef<number | null>(null)
  const speedRef = useRef(speed)
  speedRef.current = speed

  const tick = useCallback(() => {
    if (!paused) {
      // Base rate ~18px/sec at speed=1, scaled by user speed multiplier.
      window.scrollBy({ top: (speedRef.current * 18) / 60, behavior: 'auto' })
      if (Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) {
        setActive(false)
        return
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [paused])

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active, tick])

  const start = useCallback(() => {
    setPaused(false)
    setActive(true)
  }, [])
  const stop = useCallback(() => setActive(false), [])
  const togglePause = useCallback(() => setPaused((p) => !p), [])

  return { active, paused, start, stop, togglePause }
}
