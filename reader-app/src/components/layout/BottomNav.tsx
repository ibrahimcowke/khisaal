import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Library,
  Search,
  Sparkles,
  LayoutGrid,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { useTranslation } from '../../lib/i18n'

export function BottomNav() {
  const { isRtl } = useTranslation()
  const location = useLocation()

  const isReading = /\/book\/[^/]+\/(read|chapter)/.test(location.pathname) || location.pathname === '/editor'
  if (isReading) return null

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
    {
      to: '/more',
      label: isRtl ? 'المزيد' : 'More',
      icon: LayoutGrid,
      active: isMoreActive,
    },
  ]

  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-40 bg-app-surface/96 dark:bg-[#12161f]/96 backdrop-blur-2xl border-t border-app-border/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_28px_rgba(0,0,0,0.45)] pb-[max(env(safe-area-inset-bottom,0px),0.35rem)] select-none transition-all',
        'sm:bottom-5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:min-w-fit sm:max-w-2xl sm:rounded-full sm:border sm:border-app-border/80 sm:shadow-2xl sm:pb-1.5 sm:px-4 sm:py-1.5'
      )}
      aria-label={isRtl ? 'شريط التنقل الرئيسي' : 'Main Navigation'}
    >
      <ul className="flex items-center justify-around sm:justify-center sm:gap-2 px-1 pt-1 sm:pt-0">
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
      </ul>
    </nav>
  )
}
