import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Library,
  Search,
  Bookmark,
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

  // Hide on reader and editor views for full immersive focus
  const isReading = /\/book\/[^/]+\/read/.test(location.pathname) || location.pathname === '/editor'

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

  if (isReading) return null

  // Route active checkers
  const isToolsActive =
    ['/tools', '/quiz', '/compare', '/khisal-assessment', '/mindmap', '/habit-tracker', '/flashcards', '/speed-reader'].some(
      (path) => location.pathname.startsWith(path)
    )
  const isSavedActive =
    ['/bookmarks', '/favorites', '/collections', '/notes', '/highlights', '/quotes', '/history'].some((path) =>
      location.pathname.startsWith(path)
    )
  const isMoreActive = location.pathname === '/more' || menuOpen

  const navItems = [
    {
      to: '/',
      label: isRtl ? 'الرئيسية' : 'Home',
      icon: Home,
      end: true,
      active: location.pathname === '/',
    },
    {
      to: '/library',
      label: isRtl ? 'المكتبة' : 'Library',
      icon: Library,
      active: location.pathname.startsWith('/library') || (location.pathname.startsWith('/book/') && !isReading),
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
      active: location.pathname === '/search',
    },
    {
      to: '/bookmarks',
      label: isRtl ? 'المحفوظات' : 'Saved',
      icon: Bookmark,
      active: isSavedActive,
    },
  ]

  const quickTools: QuickAction[] = [
    {
      to: '/quiz',
      labelAr: 'تحدي الخصال',
      labelEn: 'Virtue Quiz',
      descAr: 'أسئلة سريعة ممتعة وتحديات',
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
      to: '/favorites',
      labelAr: 'المفضلة',
      labelEn: 'Favorites',
      descAr: 'الخصال التي نالت إعجابك',
      descEn: 'Starred virtues & chapters',
      icon: Star,
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
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
    <nav
      className="fixed bottom-3 sm:bottom-5 inset-x-0 z-40 pointer-events-none flex flex-col items-center px-3"
      aria-label={isRtl ? 'شريط التنقل الرئيسي' : 'Main Navigation'}
    >
      {/* Quick Launcher Popover Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto mb-3 w-[calc(100vw-1.5rem)] max-w-xl bg-app-surface/95 dark:bg-[#151921]/95 backdrop-blur-2xl border border-app-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.22)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.65)] ring-1 ring-white/10 dark:ring-white/5 rounded-3xl p-4 sm:p-5 overflow-hidden"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-app-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-app-accent/15 text-app-accent flex items-center justify-center">
                  <LayoutGrid size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-app-text">
                    {isRtl ? 'القائمة السريعة والأدوات' : 'Quick Menu & Tools'}
                  </h3>
                  <p className="text-[11px] text-app-muted">
                    {isRtl ? 'وصول سريع ومباشر لكافة الخصائص' : 'Instant access to all features'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/more')
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-app-accent hover:bg-app-accent/10 rounded-lg transition-colors cursor-pointer"
                >
                  {isRtl ? 'عرض الكل' : 'View All'}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[55vh] overflow-y-auto custom-scrollbar p-0.5">
              {quickTools.map((tool) => (
                <NavLink
                  key={tool.to}
                  to={tool.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-start gap-2.5 p-2.5 rounded-2xl border transition-all duration-200 text-right active:scale-[0.98]',
                      isActive
                        ? 'bg-app-accent/10 border-app-accent/40 shadow-xs'
                        : 'bg-app-surface/60 hover:bg-app-surface border-app-border/40 hover:border-app-border hover:shadow-xs'
                    )
                  }
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-110',
                      tool.color
                    )}
                  >
                    <tool.icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 justify-between">
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
        )}
      </AnimatePresence>

      {/* Floating Capsule Navigation Bar */}
      <div className="pointer-events-auto w-[calc(100vw-1.25rem)] sm:w-auto max-w-lg sm:max-w-none bg-app-surface/90 dark:bg-[#151921]/92 backdrop-blur-2xl border border-app-border/80 shadow-[0_12px_40px_rgba(0,0,0,0.14)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/15 dark:ring-white/5 rounded-2xl sm:rounded-full p-1.5 sm:px-2.5 sm:py-1.5 transition-all select-none">
        <div className="flex items-center justify-between sm:justify-center sm:gap-1.5">
          {/* Main Navigation Links */}
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive: directActive }) => {
                  const isActive = item.active !== undefined ? item.active : directActive
                  return cn(
                    'relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full transition-all duration-200 cursor-pointer min-w-12 sm:min-w-0 active:scale-95 group',
                    isActive
                      ? 'text-white font-bold'
                      : 'text-app-text-secondary hover:text-app-text hover:bg-black/5 dark:hover:bg-white/5'
                  )
                }}
              >
                {({ isActive: directActive }) => {
                  const isActive = item.active !== undefined ? item.active : directActive
                  return (
                    <>
                      {/* Active Indicator Pill */}
                      {isActive && (
                        <motion.div
                          layoutId="floatingNavActivePill"
                          className="absolute inset-0 bg-gradient-to-r from-app-accent to-emerald-600 rounded-xl sm:rounded-full shadow-md shadow-app-accent/25 z-0"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}

                      {/* Icon */}
                      <span className="relative z-10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                        <Icon
                          size={19}
                          strokeWidth={isActive ? 2.4 : 1.9}
                          className={cn(
                            'transition-colors',
                            isActive ? 'text-white' : item.highlight ? 'text-app-accent' : ''
                          )}
                        />
                        {item.highlight && !isActive && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-app-accent ring-2 ring-app-surface animate-pulse" />
                        )}
                      </span>

                      {/* Label */}
                      <span
                        className={cn(
                          'relative z-10 text-[10px] sm:text-xs tracking-tight transition-all truncate leading-none',
                          isActive ? 'text-white font-bold' : 'text-app-text-secondary group-hover:text-app-text'
                        )}
                      >
                        {item.label}
                      </span>
                    </>
                  )
                }}
              </NavLink>
            )
          })}

          {/* Divider */}
          <div className="h-5 w-px bg-app-border/70 mx-0.5 sm:mx-1" />

          {/* More / Quick Menu Toggle Button */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className={cn(
              'relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full transition-all duration-200 cursor-pointer min-w-12 sm:min-w-0 active:scale-95 group',
              isMoreActive
                ? 'text-white font-bold'
                : 'text-app-text-secondary hover:text-app-text hover:bg-black/5 dark:hover:bg-white/5'
            )}
            aria-label={isRtl ? 'المزيد والأدوات السريعة' : 'More & Quick Tools'}
            title={isRtl ? 'القائمة السريعة' : 'Quick Menu'}
          >
            {isMoreActive && (
              <motion.div
                layoutId="floatingNavActivePill"
                className="absolute inset-0 bg-gradient-to-r from-app-accent to-emerald-600 rounded-xl sm:rounded-full shadow-md shadow-app-accent/25 z-0"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}

            <span className="relative z-10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <LayoutGrid size={19} strokeWidth={isMoreActive ? 2.4 : 1.9} />
            </span>

            <span
              className={cn(
                'relative z-10 text-[10px] sm:text-xs tracking-tight transition-all truncate leading-none',
                isMoreActive ? 'text-white font-bold' : 'text-app-text-secondary group-hover:text-app-text'
              )}
            >
              {isRtl ? 'المزيد' : 'More'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  )
}
