import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search, Bookmark, SlidersHorizontal, List, MoreVertical } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { AmbientSoundPlayer } from './AmbientSoundPlayer'
import { PomodoroTimer } from './PomodoroTimer'

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

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -75, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -75, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 inset-x-0 z-30 bg-app-surface/95 backdrop-blur-2xl border-b border-app-border pt-[max(env(safe-area-inset-top,0px),0.4rem)] pb-1.5 px-3 sm:px-6 shadow-md"
        >
          <div className="flex items-center justify-between max-w-6xl mx-auto gap-3">
            {/* Back Button with text/pill on desktop & clear touch button on mobile */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-app-bg hover:bg-app-accent/15 border border-app-border text-app-text hover:text-app-accent transition-all active:scale-95 text-xs font-bold group"
                aria-label="رجوع"
                title="رجوع للصفحة السابقة"
              >
                <ArrowRight size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">رجوع</span>
              </button>

              <PomodoroTimer className="hidden md:inline-block" />
              <AmbientSoundPlayer className="hidden lg:inline-block" />
            </div>

            {/* Title & Book Info in Amiri */}
            <div className="flex-1 min-w-0 text-center px-1">
              <h2 className="text-sm sm:text-base md:text-lg font-bold truncate font-display text-app-text leading-tight">
                {title}
              </h2>
              {bookTitle && (
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-app-accent font-semibold truncate max-w-[200px] sm:max-w-xs">
                    {bookTitle}
                  </span>
                </div>
              )}
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-1 shrink-0">
              <IconButton onClick={onOpenToc} aria-label="الفهرس" title="فهرس الأبواب">
                <List size={19} />
              </IconButton>
              <IconButton onClick={onOpenSearch} aria-label="بحث" title="بحث في الكتاب">
                <Search size={19} />
              </IconButton>
              <IconButton
                active={isBookmarked}
                onClick={onToggleBookmark}
                aria-label="علامة مرجعية"
                title="حفظ علامة مرجعية"
                className={isBookmarked ? 'text-app-accent' : ''}
              >
                <Bookmark size={19} fill={isBookmarked ? 'currentColor' : 'none'} />
              </IconButton>
              <IconButton onClick={onOpenSettings} aria-label="إعدادات القراءة" title="تخصيص القراءة والخطوط">
                <SlidersHorizontal size={18} />
              </IconButton>
              <IconButton onClick={onOpenMore} aria-label="المزيد" className="hidden sm:inline-flex">
                <MoreVertical size={19} />
              </IconButton>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  )
}
