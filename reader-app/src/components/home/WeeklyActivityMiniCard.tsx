import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BarChart3, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../lib/db'
import { useTranslation } from '../../lib/i18n'

export function WeeklyActivityMiniCard({ bookId }: { bookId: string }) {
  const navigate = useNavigate()
  const { isRtl, formatDigits } = useTranslation()

  const sessions = useLiveQuery(
    () => db.sessions.where('bookId').equals(bookId).toArray(),
    [bookId]
  )

  const weekdayLabels = useMemo(
    () => (isRtl ? ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']),
    [isRtl]
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
    <div className="rounded-3xl bg-app-surface border border-app-border p-5 shadow-2xs space-y-3 hover:border-app-accent/40 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-app-accent/10 text-app-accent flex items-center justify-center shadow-2xs">
            <BarChart3 size={15} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-app-text font-display">
              {isRtl ? 'نشاط القراءة الأسبوعي' : 'Weekly Reading Activity'}
            </h3>
            <p className="text-[11px] text-app-text-secondary">
              {isRtl ? `المجموع: ${formatDigits(totalWeekMins)} دقيقة` : `Total: ${formatDigits(totalWeekMins)} mins`}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/reading-stats')}
          className="text-xs text-app-accent font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>{isRtl ? 'التفاصيل' : 'Details'}</span>
          <ChevronLeft size={13} />
        </button>
      </div>

      <div className="flex items-end justify-between gap-2 h-18 pt-2 px-1">
        {weeklyMinutes.map((m, i) => {
          const heightPercent = Math.max(10, Math.round((m / maxWeekly) * 100))
          const isToday = i === 6

          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group relative">
              <div
                className={`w-full rounded-md transition-all duration-200 ${
                  isToday
                    ? 'bg-app-accent shadow-2xs'
                    : m > 0
                    ? 'bg-app-accent/40 group-hover:bg-app-accent/70'
                    : 'bg-app-border/50'
                }`}
                style={{ height: `${heightPercent}%` }}
                title={`${weekdayLabels[i]}: ${formatDigits(Math.round(m))} ${isRtl ? 'دقيقة' : 'mins'}`}
              />
              <span className={`text-[10px] ${isToday ? 'font-bold text-app-accent' : 'text-app-muted'}`}>
                {weekdayLabels[i]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
