import { useNavigate } from 'react-router-dom'
import { Settings, BarChart3, Sun, Moon, Sunrise, Sunset, Sparkles, Search, Library, ArrowRight, ArrowLeft, Compass, Globe } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { formatArabicDate } from '../../lib/format'

export function HeroHeader({ showBack = false }: { showBack?: boolean }) {
  const navigate = useNavigate()
  const { t, lang, setLanguage, isRtl, greetingForHour } = useTranslation()
  const hour = new Date().getHours()

  const getTimeIcon = () => {
    if (hour >= 5 && hour < 11) return <Sunrise className="text-amber-500" size={17} />
    if (hour >= 11 && hour < 17) return <Sun className="text-amber-400" size={17} />
    if (hour >= 17 && hour < 21) return <Sunset className="text-orange-400" size={17} />
    return <Moon className="text-indigo-400" size={17} />
  }

  const toggleLang = () => {
    setLanguage(lang === 'ar' ? 'en' : 'ar')
  }

  const formattedDate = isRtl
    ? formatArabicDate()
    : new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <header className="relative -mx-4 sm:-mx-6 -mt-6 sm:-mt-8 mb-7 rounded-b-[2.5rem] bg-linear-to-b from-app-surface via-app-surface/95 to-app-accent/10 border-b border-app-border/80 px-5 sm:px-8 pt-8 pb-7 shadow-xs overflow-hidden transition-all">
      {/* Decorative background watermark */}
      <div className={`absolute top-1 ${isRtl ? 'left-3' : 'right-3'} opacity-[0.03] select-none font-display text-9xl text-app-accent pointer-events-none`}>
        {isRtl ? 'الخصال' : 'Traits'}
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          {/* Top Status & Date Pill */}
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
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
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-app-accent/10 border border-app-accent/20 shadow-xs">
              {getTimeIcon()}
              <span className="text-xs font-bold text-app-accent tracking-wide">
                {formattedDate}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-app-muted px-2.5 py-0.5 rounded-full bg-app-surface border border-app-border">
              <Sparkles size={11} className="text-app-accent" />
              <span>{t('encyclopediaBadge')}</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-app-text leading-tight tracking-tight">
            {greetingForHour()}
          </h1>

          <p className="text-xs sm:text-sm text-app-text-secondary mt-1.5 flex items-center gap-1.5 font-medium">
            <span className="text-app-accent font-display font-bold">❖</span>
            <span className="truncate">{t('proverbQuote')}</span>
          </p>
        </div>

        {/* Dashboard Quick Action Bar */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
          {/* Language Switch Button */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent/60 hover:bg-app-accent/10 text-app-text hover:text-app-accent transition-all active:scale-95 shadow-xs text-xs font-bold"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe size={15} className="text-app-accent" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent/60 hover:bg-app-accent/10 text-app-text hover:text-app-accent transition-all active:scale-95 shadow-xs text-xs font-bold"
            title={t('search')}
          >
            <Search size={16} className="text-app-accent" />
            <span className="hidden md:inline">{t('search')}</span>
          </button>

          <button
            onClick={() => navigate('/library')}
            className="h-10 w-10 flex items-center justify-center rounded-2xl bg-app-surface border border-app-border hover:border-app-accent/60 hover:bg-app-accent/10 text-app-text hover:text-app-accent transition-all active:scale-95 shadow-xs"
            aria-label={t('library')}
            title={t('library')}
          >
            <Library size={18} />
          </button>

          <button
            onClick={() => navigate('/trait-tree')}
            className="h-10 w-10 flex items-center justify-center rounded-2xl bg-app-surface border border-app-border hover:border-app-accent/60 hover:bg-app-accent/10 text-app-text hover:text-app-accent transition-all active:scale-95 shadow-xs"
            aria-label={t('traitTree')}
            title={t('traitTree')}
          >
            <Compass size={18} />
          </button>

          <button
            onClick={() => navigate('/reading-stats')}
            className="h-10 w-10 flex items-center justify-center rounded-2xl bg-app-surface border border-app-border hover:border-app-accent/60 hover:bg-app-accent/10 text-app-text hover:text-app-accent transition-all active:scale-95 shadow-xs"
            aria-label={t('stats')}
            title={t('stats')}
          >
            <BarChart3 size={18} />
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="h-10 w-10 flex items-center justify-center rounded-2xl bg-app-surface border border-app-border hover:border-app-accent/60 hover:bg-app-accent/10 text-app-text hover:text-app-accent transition-all active:scale-95 shadow-xs"
            aria-label={t('settings')}
            title={t('settings')}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
