import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Compass, Clock } from 'lucide-react'
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
          initial={{ y: 60, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-5 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 w-auto sm:w-120 z-40 pointer-events-auto select-none"
        >
          <div className="rounded-2xl sm:rounded-3xl bg-app-surface/95 dark:bg-app-surface/90 backdrop-blur-2xl border border-app-border/80 shadow-2xl p-2.5 sm:p-3 space-y-2">
            {/* Precision Interactive Scrubber */}
            <div
              className="relative h-1.5 hover:h-2 rounded-full bg-app-border/60 cursor-pointer group transition-all mx-1"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const rawRatio = (e.clientX - rect.left) / rect.width
                const ratio = isRtl ? 1 - rawRatio : rawRatio
                onScrub(Math.min(1, Math.max(0, ratio)))
              }}
            >
              <div
                className={`absolute inset-y-0 ${isRtl ? 'right-0' : 'left-0'} rounded-full bg-app-accent transition-all duration-100`}
                style={{ width: `${chapterProgress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-app-accent border-2 border-app-surface shadow-xs group-hover:scale-125 transition-transform"
                style={isRtl ? { right: `calc(${chapterProgress}% - 6px)` } : { left: `calc(${chapterProgress}% - 6px)` }}
              />
            </div>

            {/* Navigation & Status Capsule */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              {/* Previous Chapter Button */}
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className="h-8 px-2.5 sm:px-3 rounded-xl border border-app-border bg-app-bg/80 hover:bg-app-accent/10 hover:border-app-accent/60 text-app-text disabled:opacity-25 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer disabled:pointer-events-none"
                title={t('prevChapter')}
              >
                <PrevChevron size={15} className="text-app-accent shrink-0" />
                <span className="hidden xs:inline text-[11px] sm:text-xs">{isRtl ? 'السابق' : 'Prev'}</span>
              </button>

              {/* Center Chapter Info & Metrics */}
              <div className="flex-1 min-w-0 px-2 text-center flex flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-1.5 w-full text-xs font-bold text-app-text truncate font-display">
                  <Compass size={12} className="text-app-accent shrink-0" />
                  <span className="truncate">{chapterLabel}</span>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-app-muted mt-0.5 font-sans font-medium">
                  <span className="text-app-accent font-bold font-mono">
                    {formatDigits(chapterProgress)}%
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-serif">
                    <Clock size={10} className="shrink-0 text-app-muted" />
                    {timeRemainingLabel}
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline font-mono">
                    {t('bookProgress', { percent: formatDigits(overallProgress) })}
                  </span>
                </div>
              </div>

              {/* Next Chapter Button */}
              <button
                onClick={onNext}
                disabled={!hasNext}
                className="h-8 px-2.5 sm:px-3 rounded-xl border border-app-border bg-app-bg/80 hover:bg-app-accent/10 hover:border-app-accent/60 text-app-text disabled:opacity-25 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer disabled:pointer-events-none"
                title={t('nextChapter')}
              >
                <span className="hidden xs:inline text-[11px] sm:text-xs">{isRtl ? 'التالي' : 'Next'}</span>
                <NextChevron size={15} className="text-app-accent shrink-0" />
              </button>
            </div>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  )
}
