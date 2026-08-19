import { useLiveQuery } from 'dexie-react-hooks'
import { Flame, Award, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../lib/db'
import { usePositionStore } from '../../store/positionStore'
import { useSettingsStore } from '../../store/settingsStore'
import { toArabicDigits } from '../../lib/format'

export function DailyGoalCard({ bookId }: { bookId: string }) {
  const navigate = useNavigate()
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

  // Streak badge determination
  const getBadgeTitle = (streak: number) => {
    if (streak >= 30) return 'خاتم الأبواب 👑'
    if (streak >= 14) return 'عاشق البلاغة 📜'
    if (streak >= 7) return 'قارئ مواظب 🌟'
    if (streak >= 3) return 'قارئ مثابر ⚡'
    return 'قارئ شغوف ✨'
  }

  const radius = 32
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <div className="rounded-3xl bg-app-surface border border-app-border p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-app-accent/15 text-app-accent flex items-center justify-center">
            <Award size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-app-text">إنجاز القراءة اليومي</h3>
            <p className="text-xs text-app-text-secondary">{getBadgeTitle(position.streakDays)}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/reading-stats')}
          className="text-xs text-app-accent font-medium hover:underline flex items-center gap-0.5"
        >
          <span>التفاصيل</span>
          <ChevronLeft size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Daily Goal Ring Card */}
        <div className="flex items-center gap-4 bg-app-bg/50 rounded-2xl p-3.5 border border-app-border">
          <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
            <svg className="w-18 h-18 -rotate-90" viewBox="0 0 76 76">
              <circle
                cx="38"
                cy="38"
                r={radius}
                className="text-app-border stroke-current"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="38"
                cy="38"
                r={radius}
                className="text-app-accent stroke-current transition-all duration-700 ease-out"
                strokeWidth="6"
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

          <div>
            <p className="text-xs text-app-text-secondary">الهدف: {toArabicDigits(dailyGoalMinutes)} دقيقة</p>
            <p className="text-lg font-bold font-display text-app-text mt-0.5">
              {toArabicDigits(minutes)} دقيقة
            </p>
            <p className="text-[11px] text-app-muted mt-0.5">
              {progressPercent >= 100 ? 'تم تحقيق الهدف اليوم! 🎉' : `متبقي ${toArabicDigits(Math.max(0, dailyGoalMinutes - minutes))} د`}
            </p>
          </div>
        </div>

        {/* Streak & Stats Card */}
        <div className="flex items-center gap-4 bg-app-bg/50 rounded-2xl p-3.5 border border-app-border">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
            <Flame size={28} className={position.streakDays > 0 ? 'animate-bounce' : ''} />
          </div>
          <div>
            <p className="text-xs text-app-text-secondary">سلسلة القراءة</p>
            <p className="text-lg font-bold font-display text-app-text mt-0.5">
              {toArabicDigits(position.streakDays)} يوماً متتالياً
            </p>
            <p className="text-[11px] text-app-muted mt-0.5">
              واصل القراءة للحفاظ على السلسلة
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
