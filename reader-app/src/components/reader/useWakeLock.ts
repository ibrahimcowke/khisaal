import { useEffect, useRef } from 'react'

export function useWakeLock(enabled: boolean) {
  const lockRef = useRef<any>(null)

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return

    let cancelled = false

    async function requestLock() {
      try {
        const lock = await (navigator as any).wakeLock.request('screen')
        if (cancelled) {
          lock.release?.()
          return
        }
        lockRef.current = lock
      } catch {
        // permission denied or unsupported in this context; fail silently
      }
    }

    requestLock()

    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && enabled) requestLock()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      lockRef.current?.release?.()
      lockRef.current = null
    }
  }, [enabled])
}
