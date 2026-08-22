import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Library,
  Search,
  Bookmark,
  BarChart3,
  Settings,
  ChevronsRight,
  ChevronsLeft,
  BookOpenText,
  FolderHeart,
  History,
  Star,
  GitBranch,
  CalendarCheck,
  Network,
  HeartHandshake,
  Brain,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { useTranslation } from '../../lib/i18n'

export function Sidebar() {
  const { t, isRtl } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const isReading = /\/book\/[^/]+\/read/.test(location.pathname)
  if (isReading) return null

  const items = [
    { to: '/', label: t('home'), icon: Home, end: true },
    { to: '/library', label: t('library'), icon: Library },
    { to: '/trait-tree', label: t('traitTree'), icon: GitBranch },
    { to: '/mindmap', label: t('mindmap'), icon: Network },
    { to: '/habit-tracker', label: t('habitTracker'), icon: HeartHandshake },
    { to: '/flashcards', label: t('flashcards'), icon: Brain },
    { to: '/reading-plan', label: t('readingPlan'), icon: CalendarCheck },
    { to: '/search', label: t('search'), icon: Search },
    { to: '/bookmarks', label: t('bookmarks'), icon: Bookmark },
    { to: '/favorites', label: isRtl ? 'المفضلة' : 'Favorites', icon: Star },
    { to: '/collections', label: t('collections'), icon: FolderHeart },
    { to: '/history', label: t('history'), icon: History },
    { to: '/reading-stats', label: t('stats'), icon: BarChart3 },
    { to: '/settings', label: t('settings'), icon: Settings },
  ]

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 border-e border-app-border bg-app-surface h-screen sticky top-0 transition-all duration-200 shadow-xs',
        collapsed ? 'w-19' : 'w-64'
      )}
    >
      <div className={cn('flex items-center gap-2.5 px-5 py-5', collapsed && 'justify-center px-0')}>
        <div className="h-9 w-9 rounded-xl bg-app-accent/15 text-app-accent flex items-center justify-center shrink-0 shadow-xs">
          <BookOpenText size={18} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display text-base leading-tight font-bold truncate text-app-text">{t('appTitle')}</p>
            <p className="text-[11px] text-app-text-secondary truncate">{t('encyclopediaBadge')}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-app-text-secondary hover:bg-app-accent/5 hover:text-app-text transition-colors',
                collapsed && 'justify-center px-0',
                isActive && 'bg-app-accent/10 text-app-accent hover:bg-app-accent/15 hover:text-app-accent font-bold'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={19} strokeWidth={1.9} className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-app-border/60">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-app-text-secondary hover:bg-app-accent/10 hover:text-app-text text-xs font-semibold transition-colors"
        >
          {collapsed ? (
            isRtl ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />
          ) : (
            <>
              {isRtl ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
              <span>{isRtl ? 'طي القائمة' : 'Collapse Menu'}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
