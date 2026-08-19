import { ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function FloatingDesktopNav({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  prevTitle,
  nextTitle,
}: {
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
  prevTitle?: string
  nextTitle?: string
}) {
  return (
    <div className="hidden lg:block pointer-events-none">
      <AnimatePresence>
        {hasPrev && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 0.6, x: 0 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0 }}
            onClick={onPrev}
            className="fixed right-4 xl:right-8 top-1/2 -translate-y-1/2 z-20 pointer-events-auto p-3 rounded-full bg-app-surface/90 backdrop-blur-md border border-app-border text-app-text-secondary hover:text-app-accent hover:border-app-accent shadow-lg transition-all group flex items-center gap-2"
            title={`الفصل السابق: ${prevTitle || ''}`}
          >
            <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-semibold whitespace-nowrap pl-1 text-app-accent">
              السابق
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasNext && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.6, x: 0 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0 }}
            onClick={onNext}
            className="fixed left-4 xl:left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-auto p-3 rounded-full bg-app-surface/90 backdrop-blur-md border border-app-border text-app-text-secondary hover:text-app-accent hover:border-app-accent shadow-lg transition-all group flex items-center gap-2"
            title={`الفصل التالي: ${nextTitle || ''}`}
          >
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-semibold whitespace-nowrap pr-1 text-app-accent">
              التالي
            </span>
            <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
