import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppShell() {
  const location = useLocation()
  const isReading = /\/book\/[^/]+\/read/.test(location.pathname)

  return (
    <div
      className="flex min-h-dvh bg-app-bg text-app-text pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
      dir="rtl"
    >
      <Sidebar />
      <main className={isReading ? 'flex-1 min-w-0' : 'flex-1 min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0'}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
