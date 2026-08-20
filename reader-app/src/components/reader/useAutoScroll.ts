import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Ultra-smooth auto-scroll hook with delta-time subpixel accumulation,
 * user-interaction touch/wheel detection, and zero-jerk easing.
 */
export function useAutoScroll(speed: number) {
  const [active, setActive] = useState(false)
  const [paused, setPaused] = useState(false)
  const rafRef = useRef<number | null>(null)
  const speedRef = useRef(speed)
  speedRef.current = speed

  const lastTimeRef = useRef<number | null>(null)
  const accumulatorRef = useRef<number>(0)
  const userInteractingRef = useRef<boolean>(false)
  const userInteractTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pause auto-scroll briefly when the user manually touches or scrolls, then resume cleanly
  useEffect(() => {
    if (!active) return

    function handleUserScrollOrTouch() {
      userInteractingRef.current = true
      if (userInteractTimerRef.current) clearTimeout(userInteractTimerRef.current)
      // Resume 1.2s after user finishes manual scrolling/touching
      userInteractTimerRef.current = setTimeout(() => {
        userInteractingRef.current = false
        lastTimeRef.current = performance.now()
        accumulatorRef.current = 0
      }, 1200)
    }

    window.addEventListener('wheel', handleUserScrollOrTouch, { passive: true })
    window.addEventListener('touchstart', handleUserScrollOrTouch, { passive: true })
    window.addEventListener('touchmove', handleUserScrollOrTouch, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleUserScrollOrTouch)
      window.removeEventListener('touchstart', handleUserScrollOrTouch)
      window.removeEventListener('touchmove', handleUserScrollOrTouch)
      if (userInteractTimerRef.current) clearTimeout(userInteractTimerRef.current)
    }
  }, [active])

  const tick = useCallback(
    (timestamp: number) => {
      if (!active) return

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }

      const elapsed = Math.min(100, timestamp - lastTimeRef.current) // Cap at 100ms to prevent huge jumps on tab return
      lastTimeRef.current = timestamp

      if (!paused && !userInteractingRef.current) {
        // Base rate: ~35px/sec at 1x speed. Continuous subpixel delta accumulation.
        const pxDelta = (speedRef.current * 35 * elapsed) / 1000
        accumulatorRef.current += pxDelta

        if (accumulatorRef.current >= 1) {
          const step = Math.floor(accumulatorRef.current)
          accumulatorRef.current -= step
          window.scrollBy({ top: step, behavior: 'instant' as ScrollBehavior })

          // Stop if reached bottom
          if (Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 5) {
            setActive(false)
            return
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    },
    [active, paused]
  )

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
      accumulatorRef.current = 0
      return
    }

    lastTimeRef.current = performance.now()
    accumulatorRef.current = 0
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active, tick])

  const start = useCallback(() => {
    setPaused(false)
    userInteractingRef.current = false
    lastTimeRef.current = performance.now()
    accumulatorRef.current = 0
    setActive(true)
  }, [])

  const stop = useCallback(() => {
    setActive(false)
    setPaused(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const togglePause = useCallback(() => {
    setPaused((p) => {
      if (p) {
        lastTimeRef.current = performance.now()
        accumulatorRef.current = 0
      }
      return !p
    })
  }, [])

  return { active, paused, start, stop, togglePause }
}
