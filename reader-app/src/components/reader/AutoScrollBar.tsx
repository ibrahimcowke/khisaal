import { motion } from 'framer-motion'
import { Play, Pause, X, Gauge } from 'lucide-react'

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
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 rounded-full bg-[#25221E] text-white px-2 py-2 shadow-xl"
    >
      <button
        onClick={onTogglePause}
        className="h-10 w-10 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
        aria-label={paused ? 'استئناف' : 'إيقاف مؤقت'}
      >
        {paused ? <Play size={17} /> : <Pause size={17} />}
      </button>
      <Gauge size={14} className="mx-1 opacity-70" />
      <select
        value={speed}
        onChange={(e) => onSpeedChange(Number(e.target.value))}
        className="bg-transparent text-xs mx-1 outline-none"
      >
        {[0.5, 1, 1.5, 2, 2.5, 3].map((r) => (
          <option key={r} value={r} className="text-black">
            {r}×
          </option>
        ))}
      </select>
      <button onClick={onStop} className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/10" aria-label="إيقاف التمرير التلقائي">
        <X size={16} />
      </button>
    </motion.div>
  )
}
