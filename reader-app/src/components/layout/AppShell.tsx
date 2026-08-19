import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppShell() {
  const location = useLocation()
  const isReading = /\/book\/[^/]+\/read/.test(location.pathname)

  return (
    <div className="flex min-h-screen bg-app-bg text-app-text" dir="rtl">
      <Sidebar />
      <main className={isReading ? 'flex-1 min-w-0' : 'flex-1 min-w-0 pb-20 md:pb-0'}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
