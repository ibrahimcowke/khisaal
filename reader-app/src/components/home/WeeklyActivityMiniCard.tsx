import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BarChart3, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../lib/db'
import { toArabicDigits } from '../../lib/format'

const WEEKDAY_LABELS = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج']

export function WeeklyActivityMiniCard({ bookId }: { bookId: string }) {
  const navigate = useNavigate()

  const sessions = useLiveQuery(
    () => db.sessions.where('bookId').equals(bookId).toArray(),
    [bookId]
  )

  const weeklyMinutes = useMemo(() => {
    const days = Array(7).fill(0)
    const now = new Date()
    for (const s of sessions ?? []) {
      const d = new Date(s.startedAt)
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
      if (diffDays >= 0 && diffDays < 7) {
        days[6 - diffDays] += s.durationSeconds / 60
      }
    }
    return days
  }, [sessions])

  const maxWeekly = Math.max(1, ...weeklyMinutes)
  const totalWeekMins = Math.round(weeklyMinutes.reduce((a, b) => a + b, 0))

  return (
    <div className="rounded-3xl bg-app-surface border border-app-border p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-app-text">نشاط القراءة الأسبوعي</h3>
            <p className="text-[11px] text-app-text-secondary">
              مجموع هذا الأسبوع: {toArabicDigits(totalWeekMins)} دقيقة
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/reading-stats')}
          className="text-xs text-app-accent font-medium hover:underline flex items-center gap-0.5"
        >
          <span>المزيد</span>
          <ChevronLeft size={14} />
        </button>
      </div>

      <div className="flex items-end justify-between gap-2.5 h-20 pt-2 px-1">
        {weeklyMinutes.map((m, i) => {
          const heightPercent = Math.max(8, Math.round((m / maxWeekly) * 100))
          const isToday = i === 6

          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group relative">
              <div
                className={`w-full rounded-md transition-all ${
                  isToday
                    ? 'bg-app-accent shadow-sm'
                    : m > 0
                    ? 'bg-app-accent/60 hover:bg-app-accent'
                    : 'bg-app-border/60'
                }`}
                style={{ height: `${heightPercent}%` }}
                title={`${WEEKDAY_LABELS[i]}: ${toArabicDigits(Math.round(m))} دقيقة`}
              />
              <span className={`text-[10px] ${isToday ? 'font-bold text-app-accent' : 'text-app-muted'}`}>
                {WEEKDAY_LABELS[i]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
