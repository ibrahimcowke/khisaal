import { useLiveQuery } from 'dexie-react-hooks'
import { Flame } from 'lucide-react'
import { db } from '../../lib/db'
import { usePositionStore } from '../../store/positionStore'
import { toArabicDigits } from '../../lib/format'

export function TodayReadingCard({ bookId }: { bookId: string }) {
  const position = usePositionStore()

  const todaySessions = useLiveQuery(async () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const all = await db.sessions.where('bookId').equals(bookId).toArray()
    return all.filter((sess) => sess.startedAt >= start.getTime())
  }, [bookId])

  const totalSeconds = (todaySessions ?? []).reduce((acc, s) => acc + s.durationSeconds, 0) + position.todaySeconds
  const minutes = Math.max(0, Math.round(totalSeconds / 60))

  const sectionsToday = useLiveQuery(async () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const hist = await db.history.where('bookId').equals(bookId).toArray()
    const todays = hist.filter((h) => h.visitedAt >= start.getTime())
    return new Set(todays.map((h) => h.chapterId)).size
  }, [bookId])

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-app-surface border border-app-border p-4">
        <p className="text-xs text-app-text-secondary mb-1.5">قرأت اليوم</p>
        <p className="font-display text-2xl font-bold">{toArabicDigits(minutes)} دقيقة</p>
        <p className="text-xs text-app-muted mt-0.5">{toArabicDigits(sectionsToday ?? 0)} أقسام</p>
      </div>
      <div className="rounded-2xl bg-app-surface border border-app-border p-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Flame size={14} className="text-app-accent" />
          <p className="text-xs text-app-text-secondary">سلسلة القراءة</p>
        </div>
        <p className="font-display text-2xl font-bold">{toArabicDigits(position.streakDays)} يوماً</p>
        <p className="text-xs text-app-muted mt-0.5">استمر في القراءة يومياً</p>
      </div>
    </div>
  )
}
