import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Library,
  Search,
  Bookmark,
  Highlighter,
  StickyNote,
  BarChart3,
  Settings,
  ChevronsRight,
  ChevronsLeft,
  BookOpenText,
  FolderHeart,
  Quote,
  History,
  Star,
} from 'lucide-react'
import { cn } from '../../lib/cn'

const items = [
  { to: '/', label: 'الرئيسية', icon: Home, end: true },
  { to: '/library', label: 'المكتبة', icon: Library },
  { to: '/search', label: 'البحث', icon: Search },
  { to: '/bookmarks', label: 'العلامات المرجعية', icon: Bookmark },
  { to: '/highlights', label: 'التظليلات', icon: Highlighter },
  { to: '/notes', label: 'الملاحظات', icon: StickyNote },
  { to: '/quotes', label: 'الاقتباسات', icon: Quote },
  { to: '/favorites', label: 'المفضلة', icon: Star },
  { to: '/collections', label: 'المجموعات', icon: FolderHeart },
  { to: '/history', label: 'سجل القراءة', icon: History },
  { to: '/reading-stats', label: 'الإحصائيات', icon: BarChart3 },
  { to: '/settings', label: 'الإعدادات', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const isReading = /\/book\/[^/]+\/read/.test(location.pathname)
  if (isReading) return null

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 border-l border-app-border bg-app-surface h-screen sticky top-0 transition-all duration-200',
        collapsed ? 'w-[76px]' : 'w-64'
      )}
    >
      <div className={cn('flex items-center gap-2.5 px-5 py-5', collapsed && 'justify-center px-0')}>
        <div className="h-9 w-9 rounded-lg bg-app-accent/15 text-app-accent flex items-center justify-center shrink-0">
          <BookOpenText size={18} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display text-base leading-tight truncate">إمتاع القارئ</p>
            <p className="text-[11px] text-app-text-secondary truncate">الجزء الأول</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-app-text-secondary hover:bg-black/5 hover:text-app-text transition-colors',
                collapsed && 'justify-center px-0',
                isActive && 'bg-app-accent/10 text-app-accent hover:bg-app-accent/10 hover:text-app-accent'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={19} strokeWidth={1.9} className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-app-text-secondary hover:bg-black/5 text-sm"
        >
          {collapsed ? <ChevronsLeft size={18} /> : (
            <>
              <ChevronsRight size={18} />
              <span>طي القائمة</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
