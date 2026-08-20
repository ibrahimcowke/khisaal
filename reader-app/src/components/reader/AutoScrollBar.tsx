import { motion } from 'framer-motion'
import { Play, Pause, X, Gauge, ChevronUp, ChevronDown } from 'lucide-react'

export function AutoScrollBar({
  paused,
  speed,
  onSpeedChange,
  onTogglePause,
  onStop,
}: {
  paused: boolean
  speed: number
  onSpeedChange: (v: number) => void
  onTogglePause: () => void
  onStop: () => void
}) {
  const speeds = [0.5, 0.75, 1, 1.5, 2, 2.5, 3]

  const handleStepSpeed = (delta: number) => {
    const currentIdx = speeds.indexOf(speed)
    if (currentIdx === -1) {
      onSpeedChange(Math.max(0.5, Math.min(3, +(speed + delta * 0.25).toFixed(2))))
      return
    }
    const nextIdx = Math.max(0, Math.min(speeds.length - 1, currentIdx + delta))
    onSpeedChange(speeds[nextIdx])
  }

  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 50, opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-2xl bg-zinc-950/90 dark:bg-zinc-900/95 text-white px-3.5 py-2.5 shadow-2xl backdrop-blur-2xl border border-white/15"
      dir="rtl"
    >
      {/* Play/Pause Button */}
      <button
        onClick={onTogglePause}
        className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all active:scale-95 shadow-sm ${
          paused
            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 hover:bg-amber-500/40'
            : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/40'
        }`}
        aria-label={paused ? 'استئناف التمرير' : 'إيقاف مؤقت'}
        title={paused ? 'استئناف التمرير التلقائي' : 'إيقاف التمرير التلقائي مؤقتاً'}
      >
        {paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
      </button>

      {/* Status indicator dot and label */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 select-none">
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            paused ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
          }`}
        />
        <span className="text-xs font-bold text-white/90">
          {paused ? 'موقوف' : 'تمرير سلس'}
        </span>
      </div>

      {/* Speed Controls */}
      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1">
        <Gauge size={14} className="text-app-accent opacity-80" />
        <span className="text-xs font-bold text-white font-mono min-w-7 text-center">
          {speed}×
        </span>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => handleStepSpeed(1)}
            disabled={speed >= 3}
            className="hover:text-app-accent disabled:opacity-30 transition-colors p-0.5"
            title="زيادة السرعة"
          >
            <ChevronUp size={12} />
          </button>
          <button
            onClick={() => handleStepSpeed(-1)}
            disabled={speed <= 0.5}
            className="hover:text-app-accent disabled:opacity-30 transition-colors p-0.5"
            title="تقليل السرعة"
          >
            <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* Stop / Close Button */}
      <button
        onClick={onStop}
        className="h-8 w-8 flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 ml-1"
        aria-label="إغلاق التمرير التلقائي"
        title="إنهاء وإغلاق"
      >
        <X size={17} />
      </button>
    </motion.div>
  )
}
