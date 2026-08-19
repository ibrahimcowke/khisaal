import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react'
import { motion } from 'framer-motion'
import type { TtsController } from './useTts'

export function TtsBar({ tts, onClose }: { tts: TtsController; onClose: () => void }) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 rounded-full bg-[#25221E] text-white px-2 py-2 shadow-xl"
    >
      <button onClick={tts.next} className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/10">
        <SkipForward size={16} />
      </button>
      <button
        onClick={() => (tts.paused ? tts.resume() : tts.pause())}
        className="h-10 w-10 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
      >
        {tts.paused ? <Play size={17} /> : <Pause size={17} />}
      </button>
      <button onClick={tts.prev} className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/10">
        <SkipBack size={16} />
      </button>
      <select
        value={tts.rate}
        onChange={(e) => tts.setRate(Number(e.target.value))}
        className="bg-transparent text-xs mx-1 outline-none"
      >
        {[0.75, 1, 1.25, 1.5, 2].map((r) => (
          <option key={r} value={r} className="text-black">
            {r}×
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          tts.stop()
          onClose()
        }}
        className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/10"
      >
        <X size={16} />
      </button>
    </motion.div>
  )
}
