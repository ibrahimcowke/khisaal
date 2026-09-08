import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppShell() {
  const location = useLocation()
  const isReading = /\/book\/[^/]+\/(read|chapter)/.test(location.pathname) || location.pathname === '/editor'

  return (
    <div
      className="flex min-h-dvh bg-app-bg text-app-text pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
      dir="rtl"
    >
      <Sidebar />
      <main className={isReading ? 'flex-1 min-w-0' : 'flex-1 min-w-0 pt-[env(safe-area-inset-top,0px)] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]'}>
        <Outlet />
      </main>
      {!isReading && <BottomNav />}
    </div>
  )
}
