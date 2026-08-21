import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'

interface FlipHandNavProps {
  onNextPage: () => void
  onPrevPage: () => void
  canGoNext: boolean
  canGoPrev: boolean
  currentPage: number
  totalPages: number
  readingMode: string
}

export function FlipHandNav({
  onNextPage,
  onPrevPage,
  canGoNext,
  canGoPrev,
  currentPage,
  totalPages,
  readingMode,
}: FlipHandNavProps) {
  const { t, isRtl, formatDigits } = useTranslation()

  if (readingMode !== 'paginated' || totalPages <= 1) return null

  // In RTL: turning forward is to the left (👈), turning back is to the right (👉)
  // In LTR: turning forward is to the right (👉), turning back is to the left (👈)
  const isLastPage = currentPage >= totalPages - 1
  const isFirstPage = currentPage <= 0

  return (
    <div className="fixed inset-y-0 inset-x-0 pointer-events-none z-30 flex items-center justify-between px-2 sm:px-4 md:px-6">
      {/* Left Edge Flip Hand Button */}
      <AnimatePresence>
        {((isRtl && (canGoNext || !isLastPage)) || (!isRtl && (canGoPrev || !isFirstPage))) && (
          <motion.button
            initial={{ opacity: 0, x: -30, scale: 0.8 }}
            animate={{ opacity: 0.85, x: 0, scale: 1 }}
            whileHover={{ opacity: 1, scale: 1.08, x: isRtl ? -4 : 4 }}
            whileTap={{ scale: 0.95 }}
            exit={{ opacity: 0, x: -30, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={(e) => {
              e.stopPropagation()
              if (isRtl) {
                onNextPage()
              } else {
                onPrevPage()
              }
            }}
            className="pointer-events-auto group relative flex items-center gap-2 py-2.5 px-3 rounded-full bg-app-surface/90 backdrop-blur-xl border border-app-border/90 text-app-text hover:text-app-accent hover:border-app-accent shadow-md transition-all active:scale-95"
            title={isRtl ? t('nextPage') : t('prevPage')}
            aria-label={isRtl ? t('nextPage') : t('prevPage')}
          >
            {/* Animated Flip Hand Gesture Icon */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-app-accent/15 text-app-accent group-hover:bg-app-accent group-hover:text-white transition-colors">
              <span className="text-base select-none group-hover:scale-125 transition-transform duration-200">
                {isRtl ? '👈' : '👈'}
              </span>
            </div>

            {/* Label and Page Peek Hint */}
            <div className="hidden sm:flex flex-col items-start text-start max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
              <span className="text-xs font-bold text-app-accent">
                {isRtl ? t('nextPage') : t('prevPage')}
              </span>
              <span className="text-[10px] text-app-muted font-medium">
                {isRtl
                  ? `${formatDigits(currentPage + 2)} / ${formatDigits(totalPages)}`
                  : `${formatDigits(currentPage)} / ${formatDigits(totalPages)}`}
              </span>
            </div>

            {/* Subtle Chevron indicator */}
            <ChevronLeft size={16} className="text-app-muted group-hover:text-app-accent group-hover:-translate-x-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Right Edge Flip Hand Button */}
      <AnimatePresence>
        {((isRtl && (canGoPrev || !isFirstPage)) || (!isRtl && (canGoNext || !isLastPage))) && (
          <motion.button
            initial={{ opacity: 0, x: 30, scale: 0.8 }}
            animate={{ opacity: 0.85, x: 0, scale: 1 }}
            whileHover={{ opacity: 1, scale: 1.08, x: isRtl ? 4 : -4 }}
            whileTap={{ scale: 0.95 }}
            exit={{ opacity: 0, x: 30, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={(e) => {
              e.stopPropagation()
              if (isRtl) {
                onPrevPage()
              } else {
                onNextPage()
              }
            }}
            className="pointer-events-auto group relative flex items-center gap-2 py-2.5 px-3 rounded-full bg-app-surface/90 backdrop-blur-xl border border-app-border/90 text-app-text hover:text-app-accent hover:border-app-accent shadow-md transition-all active:scale-95 ml-auto"
            title={isRtl ? t('prevPage') : t('nextPage')}
            aria-label={isRtl ? t('prevPage') : t('nextPage')}
          >
            {/* Subtle Chevron indicator */}
            <ChevronRight size={16} className="text-app-muted group-hover:text-app-accent group-hover:translate-x-0.5 transition-transform" />

            {/* Label and Page Peek Hint */}
            <div className="hidden sm:flex flex-col items-end text-end max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
              <span className="text-xs font-bold text-app-accent">
                {isRtl ? t('prevPage') : t('nextPage')}
              </span>
              <span className="text-[10px] text-app-muted font-medium">
                {isRtl
                  ? `${formatDigits(currentPage)} / ${formatDigits(totalPages)}`
                  : `${formatDigits(currentPage + 2)} / ${formatDigits(totalPages)}`}
              </span>
            </div>

            {/* Animated Flip Hand Gesture Icon */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-app-accent/15 text-app-accent group-hover:bg-app-accent group-hover:text-white transition-colors">
              <span className="text-base select-none group-hover:scale-125 transition-transform duration-200">
                {isRtl ? '👉' : '👉'}
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
