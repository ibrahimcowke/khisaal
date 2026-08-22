import { NavLink, useLocation } from 'react-router-dom'
import { Home, Library, Search, Bookmark, Grid } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useTranslation } from '../../lib/i18n'

export function BottomNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const isReading = /\/book\/[^/]+\/read/.test(location.pathname) || location.pathname === '/editor'
  if (isReading) return null

  const items = [
    { to: '/', label: t('home'), icon: Home, end: true },
    { to: '/library', label: t('library'), icon: Library },
    { to: '/search', label: t('search'), icon: Search },
    { to: '/bookmarks', label: t('bookmarks'), icon: Bookmark },
    { to: '/more', label: t('more'), icon: Grid },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-app-surface/95 backdrop-blur-lg border-t border-app-border/80 pb-[max(env(safe-area-inset-bottom,0px),0.25rem)] shadow-lg">
      <ul className="flex items-center justify-around px-2 pt-1">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 py-1.5 px-1 min-h-[44px] text-[10.5px] font-medium transition-all rounded-xl active:scale-95 select-none',
                  isActive
                    ? 'text-app-accent font-bold'
                    : 'text-app-text-secondary hover:text-app-text'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'p-1 rounded-xl transition-all',
                      isActive ? 'bg-app-accent/10 text-app-accent shadow-2xs' : 'text-app-text-secondary'
                    )}
                  >
                    <item.icon size={19} strokeWidth={isActive ? 2.3 : 1.75} />
                  </div>
                  <span className="truncate leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
