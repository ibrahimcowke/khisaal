import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { toArabicDigits } from '../../lib/format'

export function ReaderBottomBar({
  visible,
  chapterLabel,
  chapterProgress,
  overallProgress,
  timeRemainingLabel,
  onScrub,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  visible: boolean
  chapterLabel: string
  chapterProgress: number
  overallProgress: number
  timeRemainingLabel: string
  onScrub: (ratio: number) => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.footer
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 inset-x-0 z-30 bg-app-surface/92 backdrop-blur-xl border-t border-app-border pb-[max(env(safe-area-inset-bottom,0px),0.75rem)] shadow-lg"
        >
          <div className="max-w-3xl mx-auto px-4 pt-3 pb-2">
            <div className="flex items-center justify-between text-xs text-app-text-secondary mb-2 font-medium">
              <span className="font-semibold">{chapterLabel}</span>
              <span className="text-[11px] text-app-muted">{timeRemainingLabel}</span>
            </div>

            {/* Scrubber Progress Bar */}
            <div
              className="relative h-2 rounded-full bg-app-border/80 cursor-pointer group py-1 -my-1"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const ratio = 1 - (e.clientX - rect.left) / rect.width // rtl
                onScrub(Math.min(1, Math.max(0, ratio)))
              }}
            >
              <div
                className="absolute inset-y-0 right-0 rounded-full bg-app-accent transition-all shadow-xs"
                style={{ width: `${chapterProgress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-app-accent border-2 border-app-surface shadow-md group-hover:scale-125 transition-transform"
                style={{ right: `calc(${chapterProgress}% - 8px)` }}
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-app-text-secondary hover:text-app-accent disabled:opacity-30 px-3 py-1.5 rounded-xl hover:bg-app-bg transition-colors"
              >
                <ChevronRight size={17} />
                <span>الفصل السابق</span>
              </button>

              <span className="text-xs font-semibold text-app-accent bg-app-accent/10 px-2.5 py-0.5 rounded-full">
                {toArabicDigits(overallProgress)}٪ من الكتاب
              </span>

              <button
                onClick={onNext}
                disabled={!hasNext}
                className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-app-text-secondary hover:text-app-accent disabled:opacity-30 px-3 py-1.5 rounded-xl hover:bg-app-bg transition-colors"
              >
                <span>الفصل التالي</span>
                <ChevronLeft size={17} />
              </button>
            </div>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  )
}
