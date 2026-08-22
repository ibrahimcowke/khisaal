import { useNavigate } from 'react-router-dom'
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Globe,
  Settings,
  Sun,
  Moon,
  Sunrise,
  Sunset,
} from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { formatArabicDate } from '../../lib/format'

export function HeroHeader({ showBack = false }: { showBack?: boolean }) {
  const navigate = useNavigate()
  const { t, lang, setLanguage, isRtl, greetingForHour } = useTranslation()
  const hour = new Date().getHours()

  const getTimeIcon = () => {
    if (hour >= 5 && hour < 11) return <Sunrise size={14} className="text-amber-500" />
    if (hour >= 11 && hour < 17) return <Sun size={14} className="text-amber-500" />
    if (hour >= 17 && hour < 21) return <Sunset size={14} className="text-orange-400" />
    return <Moon size={14} className="text-indigo-400" />
  }

  const toggleLang = () => {
    setLanguage(lang === 'ar' ? 'en' : 'ar')
  }

  const formattedDate = isRtl
    ? formatArabicDate()
    : new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })

  return (
    <header className="relative mb-2 sm:mb-4 pt-1 sm:pt-2">
      {/* Top Bar: Context & Global Actions */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-app-border/60">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              aria-label={t('back')}
              title={t('back')}
              className="h-8 w-8 flex items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text hover:text-app-accent hover:border-app-accent transition-all active:scale-95 shadow-2xs shrink-0 cursor-pointer"
            >
              {isRtl ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-app-surface border border-app-border/80 text-[11px] font-medium text-app-text-secondary shadow-2xs">
            {getTimeIcon()}
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-app-surface border border-app-border hover:border-app-accent/60 text-app-text-secondary hover:text-app-text transition-all text-xs font-medium shadow-2xs cursor-pointer"
            title={t('search')}
          >
            <Search size={13} className="text-app-accent" />
            <span className="hidden sm:inline">{isRtl ? 'بحث...' : 'Search...'}</span>
          </button>

          <button
            onClick={toggleLang}
            className="flex items-center gap-1 h-8 px-2.5 rounded-xl bg-app-surface border border-app-border hover:border-app-accent/60 text-app-text hover:text-app-accent transition-all text-xs font-semibold shadow-2xs cursor-pointer"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe size={13} className="text-app-accent" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="h-8 w-8 flex items-center justify-center rounded-xl bg-app-surface border border-app-border hover:border-app-accent/60 text-app-text-secondary hover:text-app-accent transition-all shadow-2xs cursor-pointer"
            title={t('settings')}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Hero Greeting Section */}
      <div className="pt-4 sm:pt-6 pb-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-app-text tracking-tight">
            {greetingForHour()}
          </h1>
          <p className="text-xs sm:text-sm text-app-text-secondary mt-1 max-w-xl font-normal leading-relaxed">
            {t('proverbQuote')}
          </p>
        </div>
      </div>
    </header>
  )
}
