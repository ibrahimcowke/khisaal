import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, Compass, Clock } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { cn } from '../../lib/cn'

export function ReaderBottomBar({
  visible = true,
  chapterLabel,
  chapterProgress,
  overallProgress,
  timeRemainingLabel,
  onScrub,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  isPaginated = false,
  pageIndex = 0,
  pageCount = 1,
  onPrevPage,
  onNextPage,
  onPrevChapter,
  onNextChapter,
}: {
  visible?: boolean
  chapterLabel: string
  chapterProgress: number
  overallProgress: number
  timeRemainingLabel: string
  onScrub: (ratio: number) => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
  isPaginated?: boolean
  pageIndex?: number
  pageCount?: number
  onPrevPage?: () => void
  onNextPage?: () => void
  onPrevChapter?: () => void
  onNextChapter?: () => void
}) {
  const { t, isRtl, formatDigits } = useTranslation()

  // In RTL: Previous arrow points Right (backward in text flow), Next arrow points Left (forward)
  const PrevChevron = isRtl ? ChevronRight : ChevronLeft
  const NextChevron = isRtl ? ChevronLeft : ChevronRight
  const PrevDoubleChevron = isRtl ? ChevronsRight : ChevronsLeft
  const NextDoubleChevron = isRtl ? ChevronsLeft : ChevronsRight

  const isFirstPage = pageIndex === 0
  const isLastPage = pageIndex >= Math.max(0, pageCount - 1)

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed bottom-0 inset-x-0 z-50 pointer-events-none select-none sm:bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-115">
          <motion.footer
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto bg-app-surface/96 dark:bg-app-surface/92 backdrop-blur-2xl border-t border-app-border/80 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.5)] px-2.5 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] sm:rounded-3xl sm:border sm:border-app-border/90 sm:shadow-xl sm:px-3 sm:py-1.5 sm:pb-1.5 space-y-1"
          >
            {/* Precision Slim Interactive Scrubber */}
            <div
              className="relative h-1.5 hover:h-2 rounded-full bg-app-border/60 cursor-pointer group transition-all mx-1 touch-none"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const rawRatio = (e.clientX - rect.left) / rect.width
                const ratio = isRtl ? 1 - rawRatio : rawRatio
                onScrub(Math.min(1, Math.max(0, ratio)))
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0]
                if (!touch) return
                const rect = e.currentTarget.getBoundingClientRect()
                const rawRatio = (touch.clientX - rect.left) / rect.width
                const ratio = isRtl ? 1 - rawRatio : rawRatio
                onScrub(Math.min(1, Math.max(0, ratio)))
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0]
                if (!touch) return
                const rect = e.currentTarget.getBoundingClientRect()
                const rawRatio = (touch.clientX - rect.left) / rect.width
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

            {/* Navigation & Status Row */}
            <div className="flex items-center justify-between gap-1 pt-0.5">
              {/* Previous Group (Backward) */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Step to Previous Page / Screen */}
                <button
                  onClick={(e) => {
                    ;(e.currentTarget as HTMLElement)?.blur?.()
                    if (isPaginated) onPrevPage?.()
                    else onPrev?.()
                  }}
                  disabled={isPaginated ? (isFirstPage && !hasPrev) : !hasPrev}
                  className={cn(
                    'h-8 w-8 sm:h-8.5 sm:w-8.5 flex items-center justify-center rounded-xl border border-app-border bg-app-bg/80 text-app-text transition-all active:scale-90 cursor-pointer shadow-xs touch-manipulation',
                    (isPaginated ? (!isFirstPage || hasPrev) : hasPrev)
                      ? 'hover:bg-app-accent/15 hover:border-app-accent/60 hover:text-app-accent text-app-accent'
                      : 'opacity-20 pointer-events-none'
                  )}
                  title={isPaginated && isFirstPage && hasPrev ? t('prevChapter') : t('prevPage')}
                  aria-label={isPaginated && isFirstPage && hasPrev ? t('prevChapter') : t('prevPage')}
                >
                  <PrevChevron size={16} />
                </button>

                {/* Skip to Previous Chapter */}
                <button
                  onClick={(e) => {
                    ;(e.currentTarget as HTMLElement)?.blur?.()
                    onPrevChapter?.()
                  }}
                  disabled={!hasPrev}
                  className={cn(
                    'h-8 w-8 sm:h-8.5 sm:w-8.5 flex items-center justify-center rounded-xl border border-app-border/70 bg-app-bg/60 text-app-muted transition-all active:scale-90 cursor-pointer shadow-2xs touch-manipulation',
                    hasPrev ? 'hover:bg-app-accent/15 hover:border-app-accent/50 hover:text-app-accent' : 'opacity-20 pointer-events-none'
                  )}
                  title={t('prevChapter')}
                  aria-label={t('prevChapter')}
                >
                  <PrevDoubleChevron size={14} />
                </button>
              </div>

              {/* Center Page & Chapter Information */}
              <div className="flex-1 min-w-0 px-1.5 text-center flex flex-col items-center justify-center">
                {isPaginated ? (
                  <>
                    <div className="flex items-center justify-center">
                      <span className="text-[10.5px] font-bold text-app-accent bg-app-accent/10 px-2.5 py-0.2 rounded-full border border-app-accent/20 font-mono shadow-2xs">
                        {t('pageOf', { current: formatDigits(pageIndex + 1), total: formatDigits(pageCount) })}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-[9.5px] text-app-muted mt-0.5 font-sans font-medium w-full max-w-full">
                      <span className="truncate max-w-28 sm:max-w-44 font-bold font-display text-app-text">
                        {chapterLabel}
                      </span>
                      <span>·</span>
                      <span className="text-app-accent font-bold font-mono shrink-0">
                        {formatDigits(chapterProgress)}%
                      </span>
                      <span>·</span>
                      <span className="shrink-0 flex items-center gap-0.5 font-serif">
                        <Clock size={9} className="shrink-0 text-app-muted" />
                        {timeRemainingLabel}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-1 w-full text-[11px] font-bold text-app-text truncate font-display">
                      <Compass size={11} className="text-app-accent shrink-0" />
                      <span className="truncate max-w-36 sm:max-w-56">{chapterLabel}</span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-[9.5px] text-app-muted mt-0.5 font-sans font-medium">
                      <span className="text-app-accent font-bold font-mono">
                        {formatDigits(chapterProgress)}%
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 font-serif">
                        <Clock size={9} className="shrink-0 text-app-muted" />
                        {timeRemainingLabel}
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline font-mono">
                        {t('bookProgress', { percent: formatDigits(overallProgress) })}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Next Group (Forward) */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Skip to Next Chapter */}
                <button
                  onClick={(e) => {
                    ;(e.currentTarget as HTMLElement)?.blur?.()
                    onNextChapter?.()
                  }}
                  disabled={!hasNext}
                  className={cn(
                    'h-8 w-8 sm:h-8.5 sm:w-8.5 flex items-center justify-center rounded-xl border border-app-border/70 bg-app-bg/60 text-app-muted transition-all active:scale-90 cursor-pointer shadow-2xs touch-manipulation',
                    hasNext ? 'hover:bg-app-accent/15 hover:border-app-accent/50 hover:text-app-accent' : 'opacity-20 pointer-events-none'
                  )}
                  title={t('nextChapter')}
                  aria-label={t('nextChapter')}
                >
                  <NextDoubleChevron size={14} />
                </button>

                {/* Step to Next Page / Screen */}
                <button
                  onClick={(e) => {
                    ;(e.currentTarget as HTMLElement)?.blur?.()
                    if (isPaginated) onNextPage?.()
                    else onNext?.()
                  }}
                  disabled={isPaginated ? (isLastPage && !hasNext) : !hasNext}
                  className={cn(
                    'h-8 w-8 sm:h-8.5 sm:w-8.5 flex items-center justify-center rounded-xl border border-app-border bg-app-bg/80 text-app-text transition-all active:scale-90 cursor-pointer shadow-xs touch-manipulation',
                    (isPaginated ? (!isLastPage || hasNext) : hasNext)
                      ? 'hover:bg-app-accent/15 hover:border-app-accent/60 hover:text-app-accent text-app-accent'
                      : 'opacity-20 pointer-events-none'
                  )}
                  title={isPaginated && isLastPage && hasNext ? t('nextChapter') : t('nextPage')}
                  aria-label={isPaginated && isLastPage && hasNext ? t('nextChapter') : t('nextPage')}
                >
                  <NextChevron size={16} />
                </button>
              </div>
            </div>
          </motion.footer>
        </div>
      )}
    </AnimatePresence>
  )
}
