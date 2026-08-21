import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Search, Bookmark, SlidersHorizontal, List, Sparkles, BookOpen } from 'lucide-react'
import { AmbientSoundPlayer } from './AmbientSoundPlayer'
import { PomodoroTimer } from './PomodoroTimer'
import { useTranslation } from '../../lib/i18n'

export function ReaderTopBar({
  visible,
  title,
  bookTitle,
  isBookmarked,
  onToggleBookmark,
  onOpenToc,
  onOpenSearch,
  onOpenSettings,
  onOpenMore,
}: {
  visible: boolean
  title: string
  bookTitle?: string
  isBookmarked: boolean
  onToggleBookmark: () => void
  onOpenToc: () => void
  onOpenSearch: () => void
  onOpenSettings: () => void
  onOpenMore: () => void
}) {
  const navigate = useNavigate()
  const { t, isRtl } = useTranslation()

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 inset-x-0 z-40 bg-app-surface/90 backdrop-blur-2xl border-b border-app-border/80 pt-[max(env(safe-area-inset-top,0px),0.5rem)] pb-2 px-3 sm:px-6 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between max-w-6xl mx-auto gap-2 sm:gap-4">
            {/* Start Side: Back Button & Productivity Tools */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-app-surface border border-app-border text-app-text hover:text-app-accent hover:border-app-accent/50 hover:bg-app-accent/10 transition-all active:scale-95 text-xs font-bold shadow-xs group"
                aria-label={t('back')}
                title={t('back')}
              >
                {isRtl ? (
                  <ArrowRight size={17} className="group-hover:-translate-x-0.5 transition-transform text-app-accent" />
                ) : (
                  <ArrowLeft size={17} className="group-hover:-translate-x-0.5 transition-transform text-app-accent" />
                )}
                <span className="hidden sm:inline">{t('home')}</span>
              </button>

              <div className="hidden md:flex items-center gap-1.5">
                <PomodoroTimer />
                <AmbientSoundPlayer />
              </div>
            </div>

            {/* Center: Chapter and Book Title Dashboard Badge */}
            <div className="flex-1 min-w-0 text-center px-1 sm:px-3">
              <div className="inline-flex flex-col items-center justify-center max-w-full">
                <h2 className="text-sm sm:text-base md:text-lg font-bold truncate font-display text-app-text leading-tight drop-shadow-xs">
                  {title}
                </h2>
                {bookTitle && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-app-accent/10 border border-app-accent/20 text-[10px] sm:text-[11px] font-bold text-app-accent tracking-wide truncate max-w-50 sm:max-w-xs">
                      <BookOpen size={11} className="shrink-0" />
                      <span className="truncate">{bookTitle}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* End Side: Reader Action Hub with High-Visibility Styled Icons */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* TOC / Index Button */}
              <button
                onClick={onOpenToc}
                className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text hover:text-app-accent hover:border-app-accent/50 hover:bg-app-accent/10 transition-all active:scale-95 shadow-xs"
                aria-label={t('toc')}
                title={t('toc')}
              >
                <List size={18} />
              </button>

              {/* Search Button */}
              <button
                onClick={onOpenSearch}
                className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text hover:text-app-accent hover:border-app-accent/50 hover:bg-app-accent/10 transition-all active:scale-95 shadow-xs"
                aria-label={t('searchInBook')}
                title={t('searchInBook')}
              >
                <Search size={17} />
              </button>

              {/* Bookmark Button */}
              <button
                onClick={onToggleBookmark}
                className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl border transition-all active:scale-95 shadow-xs ${
                  isBookmarked
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-amber-500/10'
                    : 'bg-app-surface border-app-border text-app-text hover:text-app-accent hover:border-app-accent/50 hover:bg-app-accent/10'
                }`}
                aria-label={t('bookmarks')}
                title={isBookmarked ? t('bookmarkRemoved') : t('bookmarkAdded')}
              >
                <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>

              {/* Reader Settings Button */}
              <button
                onClick={onOpenSettings}
                className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text hover:text-app-accent hover:border-app-accent/50 hover:bg-app-accent/10 transition-all active:scale-95 shadow-xs"
                aria-label={t('readerSettings')}
                title={t('readerSettings')}
              >
                <SlidersHorizontal size={17} />
              </button>

              {/* Extra Tools Button */}
              <button
                onClick={onOpenMore}
                className="hidden sm:flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text hover:text-app-accent hover:border-app-accent/50 hover:bg-app-accent/10 transition-all active:scale-95 shadow-xs"
                aria-label={t('more')}
                title={t('more')}
              >
                <Sparkles size={17} className="text-app-accent" />
              </button>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  )
}
