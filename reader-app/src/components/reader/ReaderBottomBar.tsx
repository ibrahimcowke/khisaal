import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, Compass, Clock } from 'lucide-react'
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
  visible: boolean
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

  const PrevChevron = isRtl ? ChevronRight : ChevronLeft
  const NextChevron = isRtl ? ChevronLeft : ChevronRight
  const PrevDoubleChevron = isRtl ? ChevronsRight : ChevronsLeft
  const NextDoubleChevron = isRtl ? ChevronsLeft : ChevronsRight

  const isFirstPage = pageIndex === 0
  const isLastPage = pageIndex >= Math.max(0, pageCount - 1)

  return (
    <AnimatePresence>
      {visible && (
        <motion.footer
          initial={{ y: 60, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-[max(env(safe-area-inset-bottom,0px),0.9rem)] sm:bottom-6 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 w-auto sm:w-125 z-40 pointer-events-auto select-none"
        >
          <div className="rounded-2xl sm:rounded-3xl bg-app-surface/95 dark:bg-app-surface/90 backdrop-blur-2xl border border-app-border/90 shadow-2xl shadow-black/10 dark:shadow-black/40 p-2.5 sm:p-3 space-y-2">
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
                className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-app-accent border-2 border-app-surface shadow-xs group-hover:scale-125 transition-transform"
                style={isRtl ? { right: `calc(${chapterProgress}% - 7px)` } : { left: `calc(${chapterProgress}% - 7px)` }}
              />
            </div>

            {/* Navigation & Status Capsule */}
            {isPaginated ? (
              /* === Paginated Mode Unified Bottom Bar === */
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                {/* Previous Navigation (Page / Chapter) */}
                <div className="flex items-center gap-1 shrink-0">
                  {hasPrev && (
                    <button
                      onClick={onPrevChapter || onPrev}
                      className="hidden min-[400px]:flex h-8 w-7 sm:w-8 items-center justify-center rounded-xl border border-app-border/80 bg-app-bg/60 hover:bg-app-accent/10 hover:border-app-accent/60 text-app-muted hover:text-app-accent transition-all active:scale-95 cursor-pointer shadow-2xs"
                      title={t('prevChapter')}
                      aria-label={t('prevChapter')}
                    >
                      <PrevDoubleChevron size={14} />
                    </button>
                  )}

                  <button
                    onClick={onPrevPage}
                    disabled={isFirstPage && !hasPrev}
                    className="h-8 px-2.5 sm:px-3.5 rounded-xl border border-app-border bg-app-bg/80 hover:bg-app-accent/10 hover:border-app-accent/60 text-app-text hover:text-app-accent disabled:opacity-25 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer disabled:pointer-events-none shadow-xs group"
                    title={isFirstPage && hasPrev ? t('prevChapter') : t('prevPage')}
                  >
                    <PrevChevron size={15} className="text-app-accent shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                    <span>{isFirstPage && hasPrev ? t('prevChapter') : t('prevPage')}</span>
                  </button>
                </div>

                {/* Center Page & Chapter Information */}
                <div className="flex-1 min-w-0 px-1 text-center flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs font-bold text-app-accent bg-app-accent/10 px-3 py-0.5 rounded-full border border-app-accent/20 font-mono shadow-2xs">
                      {t('pageOf', { current: formatDigits(pageIndex + 1), total: formatDigits(pageCount) })}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-app-muted mt-0.5 font-sans font-medium">
                    <span className="truncate max-w-30 sm:max-w-45 font-bold font-display text-app-text">
                      {chapterLabel}
                    </span>
                    <span>·</span>
                    <span className="text-app-accent font-bold font-mono">
                      {formatDigits(chapterProgress)}%
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 font-serif">
                      <Clock size={10} className="shrink-0 text-app-muted" />
                      {timeRemainingLabel}
                    </span>
                  </div>
                </div>

                {/* Next Navigation (Page / Chapter) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={onNextPage}
                    disabled={isLastPage && !hasNext}
                    className="h-8 px-2.5 sm:px-3.5 rounded-xl border border-app-border bg-app-bg/80 hover:bg-app-accent/10 hover:border-app-accent/60 text-app-text hover:text-app-accent disabled:opacity-25 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer disabled:pointer-events-none shadow-xs group"
                    title={isLastPage && hasNext ? t('nextChapter') : t('nextPage')}
                  >
                    <span>{isLastPage && hasNext ? t('nextChapter') : t('nextPage')}</span>
                    <NextChevron size={15} className="text-app-accent shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {hasNext && (
                    <button
                      onClick={onNextChapter || onNext}
                      className="hidden min-[400px]:flex h-8 w-7 sm:w-8 items-center justify-center rounded-xl border border-app-border/80 bg-app-bg/60 hover:bg-app-accent/10 hover:border-app-accent/60 text-app-muted hover:text-app-accent transition-all active:scale-95 cursor-pointer shadow-2xs"
                      title={t('nextChapter')}
                      aria-label={t('nextChapter')}
                    >
                      <NextDoubleChevron size={14} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* === Continuous Scroll / Focus Mode Chapter Navigation Bar === */
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                {/* Previous Chapter Button */}
                <button
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className="h-8 px-2.5 sm:px-3.5 rounded-xl border border-app-border bg-app-bg/80 hover:bg-app-accent/10 hover:border-app-accent/60 text-app-text disabled:opacity-25 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer disabled:pointer-events-none shadow-xs"
                  title={t('prevChapter')}
                >
                  <PrevChevron size={15} className="text-app-accent shrink-0" />
                  <span className="hidden sm:inline text-xs">{isRtl ? 'السابق' : 'Prev'}</span>
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
                  className="h-8 px-2.5 sm:px-3.5 rounded-xl border border-app-border bg-app-bg/80 hover:bg-app-accent/10 hover:border-app-accent/60 text-app-text disabled:opacity-25 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer disabled:pointer-events-none shadow-xs"
                  title={t('nextChapter')}
                >
                  <span className="hidden sm:inline text-xs">{isRtl ? 'التالي' : 'Next'}</span>
                  <NextChevron size={15} className="text-app-accent shrink-0" />
                </button>
              </div>
            )}
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  )
}
