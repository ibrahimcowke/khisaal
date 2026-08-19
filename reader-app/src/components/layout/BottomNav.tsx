import { NavLink, useLocation } from 'react-router-dom'
import { Home, Library, Search, Bookmark, Menu } from 'lucide-react'
import { cn } from '../../lib/cn'

const items = [
  { to: '/', label: 'الرئيسية', icon: Home, end: true },
  { to: '/library', label: 'المكتبة', icon: Library },
  { to: '/search', label: 'البحث', icon: Search },
  { to: '/bookmarks', label: 'العلامات', icon: Bookmark },
  { to: '/more', label: 'المزيد', icon: Menu },
]

export function BottomNav() {
  const location = useLocation()
  const isReading = /\/book\/[^/]+\/read/.test(location.pathname) || location.pathname === '/editor'
  if (isReading) return null

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-app-surface/95 backdrop-blur border-t border-app-border pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-stretch justify-between px-1">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-app-text-secondary transition-colors',
                  isActive && 'text-app-accent'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
