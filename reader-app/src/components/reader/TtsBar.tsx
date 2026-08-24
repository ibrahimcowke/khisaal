import { Play, Pause, SkipBack, SkipForward, X, Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { TtsController } from './useTts'
import { useTranslation } from '../../lib/i18n'

export function TtsBar({
  tts,
  onClose,
  currentBlockIndex = 0,
  totalBlocks = 1,
}: {
  tts: TtsController
  onClose: () => void
  currentBlockIndex?: number
  totalBlocks?: number
}) {
  const { isRtl, formatDigits } = useTranslation()

  return (
    <motion.div
      initial={{ y: 40, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 40, opacity: 0, scale: 0.95 }}
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-2xl bg-app-surface/95 backdrop-blur-xl border border-app-accent/40 text-app-text px-4 py-2.5 shadow-2xl select-none"
    >
      {/* Sound Waves & Block indicator */}
      <div className="flex items-center gap-2 pr-1 border-r border-app-border/80">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-app-accent/15 text-app-accent">
          <Volume2 size={16} className={tts.speaking && !tts.paused ? 'animate-pulse' : ''} />
        </div>
        <div className="hidden sm:flex flex-col text-[11px] leading-tight">
          <span className="font-bold text-app-accent">
            {isRtl ? 'الاستماع الصوتي' : 'Audio Narration'}
          </span>
          <span className="text-app-muted">
            {formatDigits(currentBlockIndex + 1)} / {formatDigits(totalBlocks)}
          </span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={tts.prev}
          aria-label="Previous block"
          className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-app-bg text-app-text transition-colors"
        >
          <SkipBack size={15} />
        </button>

        <button
          onClick={() => (tts.paused ? tts.resume() : tts.pause())}
          aria-label={tts.paused ? 'Play' : 'Pause'}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-app-accent text-white hover:opacity-90 active:scale-95 transition-all shadow-md"
        >
          {tts.paused ? <Play size={17} className="fill-white" /> : <Pause size={17} className="fill-white" />}
        </button>

        <button
          onClick={tts.next}
          aria-label="Next block"
          className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-app-bg text-app-text transition-colors"
        >
          <SkipForward size={15} />
        </button>
      </div>

      {/* Speed Rate Selector */}
      <div className="flex items-center gap-1 pl-1 border-l border-app-border/80">
        <select
          value={tts.rate}
          onChange={(e) => tts.setRate(Number(e.target.value))}
          className="bg-app-bg text-app-text text-xs px-2 py-1 rounded-lg border border-app-border outline-none font-semibold cursor-pointer"
        >
          {[0.75, 1, 1.25, 1.5, 2].map((r) => (
            <option key={r} value={r}>
              {r}×
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            tts.stop()
            onClose()
          }}
          aria-label="Close audio player"
          className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-app-muted hover:text-red-500 transition-colors ml-1"
        >
          <X size={15} />
        </button>
      </div>
    </motion.div>
  )
}
