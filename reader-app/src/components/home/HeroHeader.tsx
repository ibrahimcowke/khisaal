import { useNavigate } from 'react-router-dom'
import {
  Settings,
  BarChart3,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Sparkles,
  Search,
  Library,
  ArrowRight,
  ArrowLeft,
  Compass,
  Globe,
  Network,
  HeartHandshake,
  Brain,
  Calendar,
  BookOpen,
} from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { formatArabicDate } from '../../lib/format'
import { useBook } from '../../context/BookContext'
import { usePositionStore } from '../../store/positionStore'

export function HeroHeader({ showBack = false }: { showBack?: boolean }) {
  const navigate = useNavigate()
  const { t, lang, setLanguage, isRtl, greetingForHour } = useTranslation()
  const { index } = useBook()
  const position = usePositionStore()
  const hour = new Date().getHours()

  const handleOpenReader = () => {
    if (!index) return
    const chapterId = position.chapterId && index.chapterById.has(position.chapterId) ? position.chapterId : index.chapters[0]?.id || ''
    navigate(`/book/${index.book.id}/read?c=${chapterId}`)
  }

  const getTimeBadge = () => {
    if (hour >= 5 && hour < 11) {
      return {
        icon: <Sunrise className="text-amber-500" size={15} />,
        label: isRtl ? 'صباح البركة والنور' : 'Morning of Blessings',
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      }
    }
    if (hour >= 11 && hour < 17) {
      return {
        icon: <Sun className="text-amber-500" size={15} />,
        label: isRtl ? 'طاب يومك بالقراءة' : 'Good Afternoon',
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      }
    }
    if (hour >= 17 && hour < 21) {
      return {
        icon: <Sunset className="text-orange-500" size={15} />,
        label: isRtl ? 'مساء الحكمة والسكينة' : 'Evening of Peace',
        bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      }
    }
    return {
      icon: <Moon className="text-indigo-400" size={15} />,
      label: isRtl ? 'ليلة هادئة مع المعرفة' : 'Night of Reflection',
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    }
  }

  const timeInfo = getTimeBadge()

  const toggleLang = () => {
    setLanguage(lang === 'ar' ? 'en' : 'ar')
  }

  const formattedDate = isRtl
    ? formatArabicDate()
    : new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <header className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-6 mb-6 sm:mb-8 rounded-b-[2.5rem] bg-linear-to-b from-app-surface via-app-surface/98 to-app-accent/8 border-b border-app-border/80 px-5 sm:px-8 lg:px-10 pt-7 sm:pt-8 pb-6 sm:pb-7 shadow-xs overflow-hidden transition-all duration-300">
      {/* Decorative ambient background glows & calligraphy watermark */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-app-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div
        className={`absolute top-2 ${
          isRtl ? 'left-6' : 'right-6'
        } opacity-[0.035] select-none font-display text-8xl sm:text-9xl text-app-accent pointer-events-none transition-opacity`}
      >
        {isRtl ? 'الخصال' : 'Traits'}
      </div>

      <div className="relative z-10 space-y-5">
        {/* Top Control Bar: Time / Date / Badges + Global Action Icons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                aria-label={t('back')}
                title={t('back')}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text hover:text-app-accent hover:border-app-accent transition-all active:scale-95 shadow-xs"
              >
                {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              </button>
            )}

            {/* Time Capsule Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-xs text-xs font-bold ${timeInfo.bg}`}>
              {timeInfo.icon}
              <span>{timeInfo.label}</span>
            </div>

            {/* Date Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-app-surface border border-app-border/80 text-xs font-semibold text-app-text-secondary shadow-xs">
              <span>{formattedDate}</span>
            </div>

            {/* Encyclopedia Status Pill */}
            <div className="hidden md:flex items-center gap-1 text-[11px] font-bold text-app-accent px-2.5 py-0.5 rounded-full bg-app-accent/10 border border-app-accent/25">
              <Sparkles size={11} />
              <span>{t('encyclopediaBadge')}</span>
            </div>
          </div>

          {/* Quick Header Actions: Unified Sleek Toolbar Capsule */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-app-surface/90 border border-app-border/90 shadow-xs backdrop-blur-md self-end sm:self-center">
            {/* Primary Direct Reading Action Button */}
            <button
              onClick={handleOpenReader}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-app-accent text-white hover:opacity-90 transition-all active:scale-95 shadow-xs text-xs font-bold shrink-0"
              title={isRtl ? 'فتح قارئ الكتاب مباشرة' : 'Open Reader'}
            >
              <BookOpen size={15} />
              <span>{isRtl ? 'اقرأ الآن' : 'Read'}</span>
            </button>

            {/* Language Switch */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-app-accent/10 text-app-text hover:text-app-accent transition-all active:scale-95 text-xs font-bold shrink-0"
              title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe size={14} className="text-app-accent" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-app-border/80 mx-0.5 shrink-0" />

            {/* Library Shortcut */}
            <button
              onClick={() => navigate('/library')}
              className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-app-accent/10 text-app-text-secondary hover:text-app-accent transition-all active:scale-95 shrink-0"
              aria-label={t('library')}
              title={t('library')}
            >
              <Library size={16} />
            </button>

            {/* Stats Shortcut */}
            <button
              onClick={() => navigate('/reading-stats')}
              className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-app-accent/10 text-app-text-secondary hover:text-app-accent transition-all active:scale-95 shrink-0"
              aria-label={t('stats')}
              title={t('stats')}
            >
              <BarChart3 size={16} />
            </button>

            {/* Settings Shortcut */}
            <button
              onClick={() => navigate('/settings')}
              className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-app-accent/10 text-app-text-secondary hover:text-app-accent transition-all active:scale-95 shrink-0"
              aria-label={t('settings')}
              title={t('settings')}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Main Welcome Hero Title & Integrated Fast Search Trigger */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="min-w-0 space-y-1">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-app-text leading-tight tracking-tight">
              {greetingForHour()}
            </h1>
            <p className="text-xs sm:text-sm text-app-text-secondary flex items-center gap-1.5 font-medium">
              <span className="text-app-accent font-display font-bold">❖</span>
              <span className="truncate">{t('proverbQuote')}</span>
            </p>
          </div>

          {/* Quick Search Launch Bar */}
          <div
            onClick={() => navigate('/search')}
            className="w-full lg:w-80 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent/60 hover:shadow-md transition-all cursor-pointer shadow-xs group"
          >
            <Search size={16} className="text-app-muted group-hover:text-app-accent transition-colors shrink-0" />
            <span className="text-xs text-app-muted font-medium truncate flex-1">
              {isRtl ? 'ابحث في نصوص وفصول الموسوعة...' : 'Search encyclopedia & wisdom...'}
            </span>
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-app-muted bg-app-bg rounded-lg border border-app-border">
              /
            </kbd>
          </div>
        </div>

        {/* Quick Tools Header Strip */}
        <div className="pt-3 border-t border-app-border/50">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={handleOpenReader}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-app-accent/15 hover:bg-app-accent text-app-accent hover:text-white border border-app-accent/30 transition-all active:scale-95 shadow-xs text-xs font-bold whitespace-nowrap shrink-0 group"
            >
              <div className="h-5.5 w-5.5 rounded-md bg-app-accent text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen size={13} />
              </div>
              <span>{isRtl ? 'متابعة القراءة' : 'Reading'}</span>
            </button>

            <button
              onClick={() => navigate('/trait-tree')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-app-surface/90 hover:bg-app-accent/10 border border-app-border hover:border-app-accent/50 text-app-text hover:text-app-accent transition-all active:scale-95 shadow-xs text-xs font-bold whitespace-nowrap shrink-0 group"
            >
              <div className="h-5.5 w-5.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass size={13} />
              </div>
              <span>{t('traitTree')}</span>
            </button>

            <button
              onClick={() => navigate('/mindmap')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-app-surface/90 hover:bg-app-accent/10 border border-app-border hover:border-app-accent/50 text-app-text hover:text-app-accent transition-all active:scale-95 shadow-xs text-xs font-bold whitespace-nowrap shrink-0 group"
            >
              <div className="h-5.5 w-5.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Network size={13} />
              </div>
              <span>{t('mindmap')}</span>
            </button>

            <button
              onClick={() => navigate('/habit-tracker')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-app-surface/90 hover:bg-app-accent/10 border border-app-border hover:border-app-accent/50 text-app-text hover:text-app-accent transition-all active:scale-95 shadow-xs text-xs font-bold whitespace-nowrap shrink-0 group"
            >
              <div className="h-5.5 w-5.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HeartHandshake size={13} />
              </div>
              <span>{t('habitTracker')}</span>
            </button>

            <button
              onClick={() => navigate('/flashcards')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-app-surface/90 hover:bg-app-accent/10 border border-app-border hover:border-app-accent/50 text-app-text hover:text-app-accent transition-all active:scale-95 shadow-xs text-xs font-bold whitespace-nowrap shrink-0 group"
            >
              <div className="h-5.5 w-5.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain size={13} />
              </div>
              <span>{t('flashcards')}</span>
            </button>

            <button
              onClick={() => navigate('/reading-plan')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-app-surface/90 hover:bg-app-accent/10 border border-app-border hover:border-app-accent/50 text-app-text hover:text-app-accent transition-all active:scale-95 shadow-xs text-xs font-bold whitespace-nowrap shrink-0 group"
            >
              <div className="h-5.5 w-5.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar size={13} />
              </div>
              <span>{t('readingPlan')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
