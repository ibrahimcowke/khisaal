import { useEffect, useState } from 'react'
import { Timer, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { toArabicDigits } from '../../lib/format'
import { cn } from '../../lib/cn'

export function PomodoroTimer({ className }: { className?: string }) {
  const { pomodoroMinutes } = useSettingsStore()
  const [timeLeft, setTimeLeft] = useState(pomodoroMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // Reset when default pomodoro minutes change
  useEffect(() => {
    setTimeLeft(pomodoroMinutes * 60)
    setIsRunning(false)
    setIsCompleted(false)
  }, [pomodoroMinutes])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsCompleted(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const handleReset = () => {
    setTimeLeft(pomodoroMinutes * 60)
    setIsRunning(false)
    setIsCompleted(false)
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
          isRunning
            ? 'bg-app-accent text-white border-app-accent shadow-sm'
            : isCompleted
            ? 'bg-emerald-600 text-white border-emerald-600'
            : 'bg-app-surface border-app-border text-app-text-secondary hover:border-app-accent'
        )}
        title="مؤقت جلسة القراءة والتركيز"
      >
        <Timer size={14} className={isRunning ? 'animate-spin' : ''} />
        <span>{toArabicDigits(formatted)}</span>
      </button>

      {expanded && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />
          <div className="absolute left-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-64 rounded-2xl bg-app-surface border border-app-border shadow-xl p-4 z-50 animate-fade-in space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-app-text">
                <Timer size={14} className="text-app-accent" />
                <span>جلسة تركيز ({toArabicDigits(pomodoroMinutes)} دقيقة)</span>
              </div>
            </div>

            <div className="text-center py-2">
              <span className="font-mono text-3xl font-bold tracking-wider text-app-text">
                {toArabicDigits(formatted)}
              </span>
              {isCompleted && (
                <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs font-bold mt-1">
                  <CheckCircle2 size={14} />
                  <span>اكتملت جلسة القراءة! 🎉</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-app-accent text-white font-bold text-xs hover:opacity-90 transition-opacity"
              >
                {isRunning ? (
                  <>
                    <Pause size={14} /> إيقاف مؤقت
                  </>
                ) : (
                  <>
                    <Play size={14} /> بدء الجلسة
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-xl border border-app-border text-app-text-secondary hover:bg-app-bg transition-colors"
                title="إعادة ضبط"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
