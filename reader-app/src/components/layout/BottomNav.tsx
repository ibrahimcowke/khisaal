import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Library,
  Search,
  Sparkles,
  LayoutGrid,
  X,
  Award,
  HeartHandshake,
  Brain,
  Network,
  BarChart3,
  Settings,
  Star,
  Zap,
  BookOpen,
  Bookmark,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/cn'
import { useTranslation } from '../../lib/i18n'

interface QuickAction {
  to: string
  labelAr: string
  labelEn: string
  descAr: string
  descEn: string
  icon: any
  badge?: string
  color: string
}

export function BottomNav() {
  const { isRtl } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isReading = /\/book\/[^/]+\/(read|chapter)/.test(location.pathname) || location.pathname === '/editor'
  if (isReading) return null

  // Close popup menu when route changes
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Close popup menu on outside click or escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  // Route active checkers
  const isHomeActive = location.pathname === '/'
  const isLibraryActive =
    location.pathname.startsWith('/library') || location.pathname.startsWith('/book/')
  const isToolsActive = [
    '/tools',
    '/quiz',
    '/compare',
    '/khisal-assessment',
    '/mindmap',
    '/habit-tracker',
    '/flashcards',
    '/speed-reader',
  ].some((path) => location.pathname.startsWith(path))
  const isSearchActive = location.pathname === '/search'
  const isMoreActive =
    location.pathname === '/more' ||
    menuOpen ||
    [
      '/bookmarks',
      '/favorites',
      '/collections',
      '/notes',
      '/highlights',
      '/quotes',
      '/history',
      '/reading-stats',
      '/settings',
      '/about',
    ].some((path) => location.pathname.startsWith(path))

  const navItems = [
    {
      to: '/',
      label: isRtl ? 'الرئيسية' : 'Home',
      icon: Home,
      end: true,
      active: isHomeActive,
    },
    {
      to: '/library',
      label: isRtl ? 'المكتبة' : 'Library',
      icon: Library,
      active: isLibraryActive,
    },
    {
      to: '/tools',
      label: isRtl ? 'الأدوات' : 'Tools',
      icon: Sparkles,
      active: isToolsActive,
      highlight: true,
    },
    {
      to: '/search',
      label: isRtl ? 'البحث' : 'Search',
      icon: Search,
      active: isSearchActive,
    },
  ]

  const quickTools: QuickAction[] = [
    {
      to: '/bookmarks',
      labelAr: 'المحفوظات والعلامات',
      labelEn: 'Saved & Bookmarks',
      descAr: 'الآيات والفقرات المحفوظة',
      descEn: 'Saved chapters & passages',
      icon: Bookmark,
      color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    },
    {
      to: '/favorites',
      labelAr: 'المفضلة',
      labelEn: 'Favorites',
      descAr: 'الخصال التي نالت إعجابك',
      descEn: 'Starred virtues & chapters',
      icon: Star,
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    {
      to: '/quiz',
      labelAr: 'تحدي الخصال',
      labelEn: 'Virtue Quiz',
      descAr: 'أسئلة سريعة وتحديات ذكية',
      descEn: 'Quick interactive questions',
      icon: Award,
      badge: isRtl ? 'جديد' : 'New',
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    {
      to: '/compare',
      labelAr: 'مقارنة الخصال',
      labelEn: 'Compare Virtues',
      descAr: 'مقارنة دقيقة جنبًا إلى جنب',
      descEn: 'Side-by-side virtue comparison',
      icon: Sparkles,
      badge: isRtl ? 'جديد' : 'New',
      color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    },
    {
      to: '/khisal-assessment',
      labelAr: 'مقياس الخصال',
      labelEn: 'Virtue Gauge',
      descAr: 'قياس تمثل الخصال في حياتك',
      descEn: 'Comprehensive virtue rating',
      icon: BookOpen,
      color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    },
    {
      to: '/mindmap',
      labelAr: 'خريطة الخصال',
      labelEn: 'Mind Map',
      descAr: 'تشجير مرئي لخصال الإيمان',
      descEn: 'Visual virtue hierarchy',
      icon: Network,
      color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    },
    {
      to: '/habit-tracker',
      labelAr: 'سجل الخصال',
      labelEn: 'Habit Tracker',
      descAr: 'متابعة الورد والعمل اليومي',
      descEn: 'Daily virtue habit tracker',
      icon: HeartHandshake,
      color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    },
    {
      to: '/flashcards',
      labelAr: 'بطاقات الحفظ',
      labelEn: 'Flashcards',
      descAr: 'مراجعة وتكرار متباعد ذكي',
      descEn: 'Spaced repetition cards',
      icon: Brain,
      color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    },
    {
      to: '/speed-reader',
      labelAr: 'القارئ السريع',
      labelEn: 'Speed Reader',
      descAr: 'تدريب التركيز وسرعة القراءة',
      descEn: 'Focused RSVP reading',
      icon: Zap,
      color: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    },
    {
      to: '/reading-stats',
      labelAr: 'إحصائيات القراءة',
      labelEn: 'Reading Stats',
      descAr: 'تتبع تقدمك وإنجازاتك',
      descEn: 'Progress and analytics',
      icon: BarChart3,
      color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    },
    {
      to: '/settings',
      labelAr: 'الإعدادات والمظهر',
      labelEn: 'Settings & Theme',
      descAr: 'الخطوط، الألوان، والأصوات',
      descEn: 'Preferences, typography, audio',
      icon: Settings,
      color: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30',
    },
  ]

  return (
    <>
      {/* Quick Launcher Popover Menu */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="w-full max-w-xl bg-app-surface/98 dark:bg-[#141822]/98 backdrop-blur-2xl border border-app-border/80 shadow-[0_20px_60px_rgba(0,0,0,0.3)] ring-1 ring-white/10 dark:ring-white/5 rounded-3xl p-4 sm:p-5 overflow-hidden mb-16 sm:mb-0"
            >
              {/* Popover Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-app-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-app-accent/15 text-app-accent flex items-center justify-center shadow-2xs">
                    <LayoutGrid size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-app-text leading-none">
                      {isRtl ? 'القائمة السريعة والأدوات' : 'Quick Menu & Tools'}
                    </h3>
                    <p className="text-[11px] text-app-muted mt-1 leading-none">
                      {isRtl ? 'وصول فوري لكافة أقسام وخصائص التطبيق' : 'Instant access to all features'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/more')
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-app-accent hover:bg-app-accent/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>{isRtl ? 'صفحة المزيد' : 'More Page'}</span>
                    {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-app-muted hover:text-app-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    aria-label={isRtl ? 'إغلاق' : 'Close'}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto custom-scrollbar p-0.5">
                {quickTools.map((tool) => (
                  <NavLink
                    key={tool.to}
                    to={tool.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-start gap-2.5 p-2.5 rounded-2xl border transition-all duration-150 text-right active:scale-[0.98]',
                        isActive
                          ? 'bg-app-accent/10 border-app-accent/40 shadow-xs'
                          : 'bg-app-surface/60 hover:bg-app-surface border-app-border/40 hover:border-app-border hover:shadow-xs'
                      )
                    }
                  >
                    <div
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-150 group-hover:scale-105',
                        tool.color
                      )}
                    >
                      <tool.icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 justify-between">
                        <span className="text-xs font-bold text-app-text group-hover:text-app-accent transition-colors truncate">
                          {isRtl ? tool.labelAr : tool.labelEn}
                        </span>
                        {tool.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-app-accent/15 text-app-accent border border-app-accent/25 shrink-0">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-app-muted truncate mt-0.5">
                        {isRtl ? tool.descAr : tool.descEn}
                      </p>
                    </div>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Primary Bottom Navigation Bar - Active Always across all views */}
      <nav
        className={cn(
          'fixed bottom-0 inset-x-0 z-40 bg-app-surface/96 dark:bg-[#12161f]/96 backdrop-blur-2xl border-t border-app-border/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_28px_rgba(0,0,0,0.45)] pb-[max(env(safe-area-inset-bottom,0px),0.35rem)] select-none transition-all',
          'sm:bottom-5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:min-w-fit sm:max-w-2xl sm:rounded-full sm:border sm:border-app-border/80 sm:shadow-2xl sm:pb-1.5 sm:px-4 sm:py-1.5'
        )}
        aria-label={isRtl ? 'شريط التنقل الرئيسي' : 'Main Navigation'}
      >
        <ul className="flex items-center justify-around sm:justify-center sm:gap-2 px-1 pt-1 sm:pt-0">
          {/* Main Destination Links */}
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.active
            return (
              <li key={item.to} className="flex-1 sm:flex-initial">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={cn(
                    'relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-1 px-1 sm:px-3 min-h-12 sm:min-h-9 rounded-xl sm:rounded-full transition-all duration-150 active:scale-95 touch-manipulation group select-none cursor-pointer',
                    isActive
                      ? 'text-app-accent font-bold'
                      : 'text-app-text-secondary hover:text-app-text hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  {/* Icon & Active Accent Pill */}
                  <div
                    className={cn(
                      'relative px-2.5 py-1 rounded-full transition-all duration-150 flex items-center justify-center',
                      isActive
                        ? 'bg-app-accent/15 text-app-accent shadow-2xs'
                        : 'text-app-text-secondary group-hover:bg-black/5 dark:group-hover:bg-white/5'
                    )}
                  >
                    <Icon size={19} strokeWidth={isActive ? 2.4 : 1.9} />
                    {item.highlight && !isActive && (
                      <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-app-accent ring-2 ring-app-surface animate-pulse" />
                    )}
                  </div>

                  {/* Clean text label */}
                  <span
                    className={cn(
                      'text-[10px] sm:text-xs leading-none tracking-tight transition-colors truncate max-w-full text-center',
                      isActive ? 'font-bold text-app-accent' : 'text-app-text-secondary group-hover:text-app-text'
                    )}
                  >
                    {item.label}
                  </span>
                </NavLink>
              </li>
            )
          })}

          {/* More / Quick Action Launcher Tab */}
          <li className="flex-1 sm:flex-initial">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className={cn(
                'w-full relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-1 px-1 sm:px-3 min-h-12 sm:min-h-9 rounded-xl sm:rounded-full transition-all duration-150 active:scale-95 touch-manipulation group select-none cursor-pointer',
                isMoreActive
                  ? 'text-app-accent font-bold'
                  : 'text-app-text-secondary hover:text-app-text hover:bg-black/5 dark:hover:bg-white/5'
              )}
              aria-label={isRtl ? 'المزيد والأدوات' : 'More & Tools'}
              title={isRtl ? 'القائمة السريعة' : 'Quick Menu'}
            >
              <div
                className={cn(
                  'relative px-2.5 py-1 rounded-full transition-all duration-150 flex items-center justify-center',
                  isMoreActive
                    ? 'bg-app-accent/15 text-app-accent shadow-2xs'
                    : 'text-app-text-secondary group-hover:bg-black/5 dark:group-hover:bg-white/5'
                )}
              >
                <LayoutGrid size={19} strokeWidth={isMoreActive ? 2.4 : 1.9} />
              </div>

              <span
                className={cn(
                  'text-[10px] sm:text-xs leading-none tracking-tight transition-colors truncate max-w-full text-center',
                  isMoreActive ? 'font-bold text-app-accent' : 'text-app-text-secondary group-hover:text-app-text'
                )}
              >
                {isRtl ? 'المزيد' : 'More'}
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
