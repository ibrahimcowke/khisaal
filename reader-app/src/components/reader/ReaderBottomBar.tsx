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

  return (
    <AnimatePresence>
      {visible && (
        <motion.footer
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 inset-x-0 z-40 bg-app-surface/90 backdrop-blur-2xl border-t border-app-border/80 pb-[max(env(safe-area-inset-bottom,0px),0.75rem)] shadow-lg transition-all"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-2">
            {/* Chapter info & remaining time header */}
            <div className="flex items-center justify-between text-xs text-app-text-secondary mb-2.5 font-medium">
              <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                <Compass size={14} className="text-app-accent shrink-0" />
                <span className="font-bold text-app-text truncate">{chapterLabel}</span>
              </div>
              <span className="text-[11px] font-semibold text-app-muted shrink-0 bg-app-accent/5 px-2 py-0.5 rounded-md border border-app-border/50">
                {timeRemainingLabel}
              </span>
            </div>

            {/* Precision Scrubber Progress Bar */}
            <div
              className="relative h-2.5 rounded-full bg-app-border/80 cursor-pointer group py-1 -my-1 transition-all"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const rawRatio = (e.clientX - rect.left) / rect.width
                const ratio = isRtl ? 1 - rawRatio : rawRatio
                onScrub(Math.min(1, Math.max(0, ratio)))
              }}
            >
              <div
                className={`absolute inset-y-0 ${isRtl ? 'right-0 bg-linear-to-l' : 'left-0 bg-linear-to-r'} rounded-full from-app-accent to-app-accent/80 transition-all shadow-xs`}
                style={{ width: `${chapterProgress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-app-accent border-2 border-app-surface shadow-md group-hover:scale-125 transition-transform"
                style={isRtl ? { right: `calc(${chapterProgress}% - 8px)` } : { left: `calc(${chapterProgress}% - 8px)` }}
              />
            </div>

            {/* Navigation action buttons */}
            <div className="flex items-center justify-between mt-3 gap-2">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-app-text hover:text-app-accent hover:bg-app-accent/10 border border-app-border disabled:opacity-30 px-3.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-xs"
                title={t('prevChapter')}
              >
                {isRtl ? <ChevronRight size={17} className="text-app-accent" /> : <ChevronLeft size={17} className="text-app-accent" />}
                <span>{t('prevChapter')}</span>
              </button>

              <span className="text-xs font-bold text-app-accent bg-app-accent/10 border border-app-accent/20 px-3 py-1 rounded-full shadow-xs">
                {t('bookProgress', { percent: formatDigits(overallProgress) })}
              </span>

              <button
                onClick={onNext}
                disabled={!hasNext}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-app-text hover:text-app-accent hover:bg-app-accent/10 border border-app-border disabled:opacity-30 px-3.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-xs"
                title={t('nextChapter')}
              >
                <span>{t('nextChapter')}</span>
                {isRtl ? <ChevronLeft size={17} className="text-app-accent" /> : <ChevronRight size={17} className="text-app-accent" />}
              </button>
            </div>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  )
}
