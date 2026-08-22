import { useLiveQuery } from 'dexie-react-hooks'
import { Award, ChevronLeft, Sparkles, Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../lib/db'
import { usePositionStore } from '../../store/positionStore'
import { useSettingsStore } from '../../store/settingsStore'
import { toArabicDigits } from '../../lib/format'
import { useTranslation } from '../../lib/i18n'

export function DailyGoalCard({ bookId }: { bookId: string }) {
  const navigate = useNavigate()
  const { isRtl, formatDigits } = useTranslation()
  const position = usePositionStore()
  const dailyGoalMinutes = useSettingsStore((s) => s.dailyGoalMinutes)

  const todaySessions = useLiveQuery(async () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const all = await db.sessions.where('bookId').equals(bookId).toArray()
    return all.filter((sess) => sess.startedAt >= start.getTime())
  }, [bookId])

  const totalSeconds = (todaySessions ?? []).reduce((acc, s) => acc + s.durationSeconds, 0) + position.todaySeconds
  const minutes = Math.max(0, Math.round(totalSeconds / 60))
  const progressPercent = Math.min(100, Math.round((minutes / Math.max(1, dailyGoalMinutes)) * 100))

  const getBadgeTitle = (streak: number) => {
    if (streak >= 30) return isRtl ? 'خاتم الأبواب 👑' : 'Master Reader 👑'
    if (streak >= 14) return isRtl ? 'عاشق البلاغة 📜' : 'Avid Scholar 📜'
    if (streak >= 7) return isRtl ? 'قارئ مواظب 🌟' : 'Dedicated Reader 🌟'
    if (streak >= 3) return isRtl ? 'قارئ مثابر ⚡' : 'Streak Builder ⚡'
    return isRtl ? 'قارئ شغوف ✨' : 'Enthusiast ✨'
  }

  const radius = 26
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <div className="rounded-3xl bg-app-surface border border-app-border p-5 shadow-2xs space-y-4 hover:border-app-accent/40 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-app-accent/10 text-app-accent flex items-center justify-center shadow-2xs">
            <Award size={16} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-app-text font-display">
              {isRtl ? 'الهدف اليومي وسلسلة القراءة' : 'Daily Goal & Streak'}
            </h3>
            <p className="text-[11px] font-semibold text-app-accent">{getBadgeTitle(position.streakDays)}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/reading-stats')}
          className="text-xs text-app-accent font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>{isRtl ? 'الإحصائيات' : 'Stats'}</span>
          <ChevronLeft size={13} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 pt-0.5">
        {/* Progress Ring Card */}
        <div className="flex items-center gap-3 bg-app-bg/50 rounded-2xl p-3 border border-app-border/70">
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="text-app-border stroke-current"
                strokeWidth="4.5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="text-app-accent stroke-current transition-all duration-500 ease-out"
                strokeWidth="4.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-app-text font-mono">
              {formatDigits(progressPercent)}%
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] text-app-text-secondary">
              {isRtl ? `الهدف: ${toArabicDigits(dailyGoalMinutes)} د` : `Goal: ${dailyGoalMinutes}m`}
            </p>
            <p className="text-sm font-bold font-display text-app-text mt-0.5">
              {formatDigits(minutes)} {isRtl ? 'دقيقة' : 'mins'}
            </p>
            <p className="text-[10px] text-app-muted mt-0.5 truncate">
              {progressPercent >= 100
                ? (isRtl ? 'اكتمل الهدف! 🎉' : 'Completed! 🎉')
                : (isRtl ? `متبقي ${toArabicDigits(Math.max(0, dailyGoalMinutes - minutes))} د` : `${Math.max(0, dailyGoalMinutes - minutes)}m left`)}
            </p>
          </div>
        </div>

        {/* Streak Metric Card */}
        <div className="flex items-center gap-3 bg-app-bg/50 rounded-2xl p-3 border border-app-border/70">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Flame size={22} className={position.streakDays > 0 ? 'text-amber-500' : 'text-amber-500/60'} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-app-text-secondary">{isRtl ? 'سلسلة الأيام' : 'Day Streak'}</p>
            <p className="text-sm font-bold font-display text-app-text mt-0.5">
              {formatDigits(position.streakDays)} {isRtl ? 'يوماً متتالياً' : 'Days'}
            </p>
            <p className="text-[10px] text-app-muted mt-0.5 truncate flex items-center gap-1">
              <Sparkles size={10} className="text-amber-500" />
              <span>{isRtl ? 'واصل المواظبة' : 'Keep it up'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
