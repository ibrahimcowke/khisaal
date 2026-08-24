import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, LayoutDashboard, Search, Bookmark, SlidersHorizontal, List, Sparkles } from 'lucide-react'
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

  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -70, opacity: 0 }}
          className="fixed top-0 inset-x-0 z-40 bg-app-surface/95 backdrop-blur-xl border-b border-app-border/80 pt-[max(env(safe-area-inset-top,0px),0.65rem)] pb-2.5 pl-[max(env(safe-area-inset-left,0px),0.75rem)] pr-[max(env(safe-area-inset-right,0px),0.75rem)] shadow-sm select-none"
        >
          <div className="flex items-center justify-between max-w-5xl mx-auto gap-1.5 sm:gap-4">
            {/* Start Side: Back & Dashboard Icons + Ambient Tools */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                onClick={() => navigate(-1)}
                className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text hover:text-app-accent hover:border-app-accent/60 transition-all active:scale-95 shadow-2xs cursor-pointer group"
                aria-label={t('back')}
                title={t('back')}
              >
                <BackIcon size={17} className="text-app-text group-hover:text-app-accent transition-colors" />
              </button>

              <button
                onClick={() => navigate('/')}
                className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text hover:text-app-accent hover:border-app-accent/60 transition-all active:scale-95 shadow-2xs cursor-pointer group"
                aria-label={t('home')}
                title={t('home')}
              >
                <LayoutDashboard size={17} className="text-app-accent group-hover:scale-110 transition-transform" />
              </button>

              <div className="hidden md:flex items-center gap-1.5">
                <PomodoroTimer />
                <AmbientSoundPlayer />
              </div>
            </div>

            {/* Center: Chapter and Book Title */}
            <div className="flex-1 min-w-0 text-center px-2">
              <h2 className="text-xs sm:text-sm md:text-base font-bold truncate font-display text-app-text">
                {title}
              </h2>
              {bookTitle && (
                <p className="text-[10px] sm:text-[11px] text-app-muted truncate font-serif">
                  {bookTitle}
                </p>
              )}
            </div>

            {/* End Side: Reader Action Hub */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={onOpenToc}
                className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text-secondary hover:text-app-accent hover:border-app-accent/60 transition-all active:scale-95 shadow-2xs cursor-pointer"
                aria-label={t('toc')}
                title={t('toc')}
              >
                <List size={17} />
              </button>

              <button
                onClick={onOpenSearch}
                className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text-secondary hover:text-app-accent hover:border-app-accent/60 transition-all active:scale-95 shadow-2xs cursor-pointer"
                aria-label={t('searchInBook')}
                title={t('searchInBook')}
              >
                <Search size={16} />
              </button>

              <button
                onClick={onToggleBookmark}
                className={`h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl border transition-all active:scale-95 shadow-2xs cursor-pointer ${
                  isBookmarked
                    ? 'bg-app-accent text-white border-app-accent shadow-xs'
                    : 'bg-app-surface border-app-border text-app-text-secondary hover:text-app-accent hover:border-app-accent/60'
                }`}
                aria-label={t('bookmarks')}
                title={isBookmarked ? t('bookmarkRemoved') : t('bookmarkAdded')}
              >
                <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={onOpenSettings}
                className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text-secondary hover:text-app-accent hover:border-app-accent/60 transition-all active:scale-95 shadow-2xs cursor-pointer"
                aria-label={t('readerSettings')}
                title={t('readerSettings')}
              >
                <SlidersHorizontal size={16} />
              </button>

              <button
                onClick={onOpenMore}
                className="hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text-secondary hover:text-app-accent hover:border-app-accent/60 transition-all active:scale-95 shadow-2xs cursor-pointer"
                aria-label={t('more')}
                title={t('more')}
              >
                <Sparkles size={16} className="text-app-accent" />
              </button>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  )
}
