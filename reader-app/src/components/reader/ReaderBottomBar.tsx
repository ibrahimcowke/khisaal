import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Compass } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'

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
  const { t, isRtl, formatDigits } = useTranslation()

  const PrevChevron = isRtl ? ChevronRight : ChevronLeft
  const NextChevron = isRtl ? ChevronLeft : ChevronRight

  return (
    <AnimatePresence>
      {visible && (
        <motion.footer
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 inset-x-0 z-40 bg-app-surface/95 backdrop-blur-xl border-t border-app-border/80 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] shadow-lg"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-2.5 pb-2">
            {/* Chapter info & remaining time header */}
            <div className="flex items-center justify-between text-xs text-app-text-secondary mb-2 font-medium">
              <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                <Compass size={13} className="text-app-accent shrink-0" />
                <span className="font-bold text-app-text truncate font-display">{chapterLabel}</span>
              </div>
              <span className="text-[11px] font-semibold text-app-muted shrink-0 bg-app-bg px-2 py-0.5 rounded-lg border border-app-border/60 font-serif">
                {timeRemainingLabel}
              </span>
            </div>

            {/* Precision Scrubber Progress Bar */}
            <div
              className="relative h-2 rounded-full bg-app-border/70 cursor-pointer group py-1 -my-1 transition-all"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const rawRatio = (e.clientX - rect.left) / rect.width
                const ratio = isRtl ? 1 - rawRatio : rawRatio
                onScrub(Math.min(1, Math.max(0, ratio)))
              }}
            >
              <div
                className={`absolute inset-y-0 ${isRtl ? 'right-0' : 'left-0'} rounded-full bg-app-accent transition-all`}
                style={{ width: `${chapterProgress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-app-accent border-2 border-app-surface shadow-xs group-hover:scale-125 transition-transform"
                style={isRtl ? { right: `calc(${chapterProgress}% - 7px)` } : { left: `calc(${chapterProgress}% - 7px)` }}
              />
            </div>

            {/* Navigation action buttons */}
            <div className="flex items-center justify-between mt-2.5 gap-2">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className="flex items-center gap-1 text-xs font-semibold text-app-text hover:text-app-accent hover:bg-app-accent/5 border border-app-border disabled:opacity-30 px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-2xs cursor-pointer disabled:pointer-events-none"
                title={t('prevChapter')}
              >
                <PrevChevron size={15} className="text-app-accent" />
                <span>{t('prevChapter')}</span>
              </button>

              <span className="text-[11px] font-bold text-app-accent bg-app-accent/10 border border-app-accent/20 px-2.5 py-0.5 rounded-full shadow-2xs font-mono">
                {t('bookProgress', { percent: formatDigits(overallProgress) })}
              </span>

              <button
                onClick={onNext}
                disabled={!hasNext}
                className="flex items-center gap-1 text-xs font-semibold text-app-text hover:text-app-accent hover:bg-app-accent/5 border border-app-border disabled:opacity-30 px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-2xs cursor-pointer disabled:pointer-events-none"
                title={t('nextChapter')}
              >
                <span>{t('nextChapter')}</span>
                <NextChevron size={15} className="text-app-accent" />
              </button>
            </div>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  )
}
