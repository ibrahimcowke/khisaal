import { useLiveQuery } from 'dexie-react-hooks'
import { Flame, Award, ChevronLeft, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../lib/db'
import { usePositionStore } from '../../store/positionStore'
import { useSettingsStore } from '../../store/settingsStore'
import { toArabicDigits } from '../../lib/format'
import { useTranslation } from '../../lib/i18n'

export function DailyGoalCard({ bookId }: { bookId: string }) {
  const navigate = useNavigate()
  const { isRtl } = useTranslation()
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

  const radius = 30
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <div className="rounded-3xl bg-app-surface border border-app-border p-5 sm:p-6 shadow-xs space-y-4 hover:border-app-accent/40 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-app-accent/15 text-app-accent flex items-center justify-center shadow-xs">
            <Award size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-app-text">
              {isRtl ? 'الهدف وسلسلة الإنجاز' : 'Daily Goal & Streak'}
            </h3>
            <p className="text-xs font-semibold text-app-accent">{getBadgeTitle(position.streakDays)}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/reading-stats')}
          className="text-xs text-app-accent font-bold hover:underline flex items-center gap-0.5"
        >
          <span>{isRtl ? 'الإحصائيات' : 'Stats'}</span>
          <ChevronLeft size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 pt-1">
        {/* Daily Goal Ring Card */}
        <div className="flex items-center gap-3.5 bg-app-bg/60 rounded-2xl p-3.5 border border-app-border">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={radius}
                className="text-app-border stroke-current"
                strokeWidth="5.5"
                fill="transparent"
              />
              <circle
                cx="36"
                cy="36"
                r={radius}
                className="text-app-accent stroke-current transition-all duration-700 ease-out"
                strokeWidth="5.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold text-app-text">
              {toArabicDigits(progressPercent)}٪
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] text-app-text-secondary">
              {isRtl ? `الهدف: ${toArabicDigits(dailyGoalMinutes)} دقيقة` : `Goal: ${dailyGoalMinutes}m`}
            </p>
            <p className="text-base font-bold font-display text-app-text mt-0.5">
              {toArabicDigits(minutes)} {isRtl ? 'دقيقة' : 'mins'}
            </p>
            <p className="text-[10px] text-app-muted mt-0.5 truncate">
              {progressPercent >= 100
                ? (isRtl ? 'اكتمل الهدف اليوم! 🎉' : 'Goal Achieved! 🎉')
                : (isRtl ? `متبقي ${toArabicDigits(Math.max(0, dailyGoalMinutes - minutes))} د` : `${Math.max(0, dailyGoalMinutes - minutes)}m left`)}
            </p>
          </div>
        </div>

        {/* Streak & Flame Card */}
        <div className="flex items-center gap-3.5 bg-app-bg/60 rounded-2xl p-3.5 border border-app-border">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <Flame size={26} className={position.streakDays > 0 ? 'animate-bounce text-amber-500' : 'text-amber-500/60'} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-app-text-secondary">{isRtl ? 'سلسلة القراءة' : 'Reading Streak'}</p>
            <p className="text-base font-bold font-display text-app-text mt-0.5">
              {toArabicDigits(position.streakDays)} {isRtl ? 'يوماً متتالياً' : 'Days Streak'}
            </p>
            <p className="text-[10px] text-app-muted mt-0.5 truncate flex items-center gap-1">
              <Sparkles size={10} className="text-amber-500" />
              <span>{isRtl ? 'واصل القراءة اليومية' : 'Keep daily streak'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
