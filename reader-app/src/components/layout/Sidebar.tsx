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
  CalendarCheck,
  HeartHandshake,
  Brain,
  Network,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { useTranslation } from '../../lib/i18n'

export function Sidebar() {
  const { t, isRtl } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const isReading = /\/book\/[^/]+\/read/.test(location.pathname) || location.pathname === '/editor'
  if (isReading) return null

  const mainNav = [
    { to: '/', label: t('home'), icon: Home, end: true },
    { to: '/library', label: t('library'), icon: Library },
    { to: '/search', label: t('search'), icon: Search },
    { to: '/reading-plan', label: t('readingPlan'), icon: CalendarCheck },
  ]

  const studyNav = [
    { to: '/habit-tracker', label: isRtl ? 'سجل الخصال' : 'Habit Tracker', icon: HeartHandshake },
    { to: '/flashcards', label: isRtl ? 'بطاقات الحفظ' : 'Flashcards', icon: Brain },
    { to: '/mindmap', label: isRtl ? 'خريطة الخصال' : 'Mind Map', icon: Network },
  ]

  const userNav = [
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
        'hidden md:flex flex-col shrink-0 border-e border-app-border bg-app-surface/95 backdrop-blur-md h-screen sticky top-0 transition-all duration-200 z-30',
        collapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className={cn('flex items-center gap-3 px-5 py-5 border-b border-app-border/40', collapsed && 'justify-center px-0')}>
        <div className="h-9 w-9 rounded-xl bg-app-accent/15 text-app-accent flex items-center justify-center shrink-0 shadow-2xs">
          <BookOpenText size={19} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-display text-sm font-bold truncate text-app-text tracking-wide">{t('appTitle')}</h1>
            <p className="text-[10px] text-app-muted font-medium truncate">{t('encyclopediaBadge')}</p>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
        {/* Main Section */}
        <div className="space-y-1">
          {mainNav.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </div>

        {/* Study Tools Section */}
        <div className="pt-2 border-t border-app-border/40 space-y-1">
          {!collapsed && (
            <span className="px-3 text-[10px] font-bold text-app-muted uppercase tracking-wider block mb-1">
              {isRtl ? 'المدارسة والتطبيق' : 'Study & Practice'}
            </span>
          )}
          {studyNav.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </div>

        {/* User Library & History */}
        <div className="pt-2 border-t border-app-border/40 space-y-1">
          {!collapsed && (
            <span className="px-3 text-[10px] font-bold text-app-muted uppercase tracking-wider block mb-1">
              {isRtl ? 'المكتبة الشخصية' : 'Personal Library'}
            </span>
          )}
          {userNav.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* Footer Collapse Button */}
      <div className="p-3 border-t border-app-border/60">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-app-text-secondary hover:bg-black/5 hover:text-app-text text-xs font-semibold transition-colors cursor-pointer"
          title={collapsed ? (isRtl ? 'توسيع القائمة' : 'Expand Menu') : (isRtl ? 'طي القائمة' : 'Collapse Menu')}
        >
          {collapsed ? (
            isRtl ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />
          ) : (
            <>
              {isRtl ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
              <span>{isRtl ? 'طي القائمة' : 'Collapse Menu'}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

function NavItem({
  item,
  collapsed,
}: {
  item: { to: string; label: string; icon: any; end?: boolean }
  collapsed: boolean
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-app-text-secondary hover:bg-black/5 hover:text-app-text transition-all',
          collapsed && 'justify-center px-0 py-2.5',
          isActive && 'bg-app-accent/10 text-app-accent font-bold hover:bg-app-accent/15 hover:text-app-accent shadow-2xs'
        )
      }
      title={collapsed ? item.label : undefined}
    >
      <item.icon size={17} strokeWidth={1.85} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}
