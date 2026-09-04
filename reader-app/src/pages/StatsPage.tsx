import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Clock, Flame, Highlighter, StickyNote, Bookmark, BookOpenCheck, Target, Activity } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { usePositionStore } from '../store/positionStore'
import { useSettingsStore } from '../store/settingsStore'
import { toArabicDigits, formatDuration } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'
import { cn } from '../lib/cn'

const WEEKDAY_LABELS = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج']

export default function StatsPage() {
  const { index, loading } = useBook()
  const position = usePositionStore()
  const dailyGoalMinutes = useSettingsStore((s) => s.dailyGoalMinutes)

  const sessions = useLiveQuery(() => (index ? db.sessions.where('bookId').equals(index.book.id).toArray() : []), [index?.book.id])
  const highlightsCount = useLiveQuery(() => (index ? db.highlights.where('bookId').equals(index.book.id).count() : 0), [index?.book.id])
  const notesCount = useLiveQuery(() => (index ? db.notes.where('bookId').equals(index.book.id).count() : 0), [index?.book.id])
  const bookmarksCount = useLiveQuery(() => (index ? db.bookmarks.where('bookId').equals(index.book.id).count() : 0), [index?.book.id])
  const history = useLiveQuery(() => (index ? db.history.where('bookId').equals(index.book.id).toArray() : []), [index?.book.id])
  const virtueLogs = useLiveQuery(() => db.virtueLogs.toArray()) || []

  const totalSeconds = useMemo(() => (sessions ?? []).reduce((acc, s) => acc + s.durationSeconds, 0) + position.todaySeconds, [sessions, position.todaySeconds])

  const todaySeconds = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const todays = (sessions ?? []).filter((s) => s.startedAt >= start.getTime())
    return todays.reduce((acc, s) => acc + s.durationSeconds, 0) + position.todaySeconds
  }, [sessions, position.todaySeconds])
  const todayMinutes = Math.round(todaySeconds / 60)
  const goalProgress = Math.min(100, Math.round((todayMinutes / Math.max(1, dailyGoalMinutes)) * 100))

  const heatmap30Days = useMemo(() => {
    const days: {
      dateStr: string
      dayNum: number
      readMinutes: number
      virtuesCount: number
      level: number
    }[] = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dStr = d.toISOString().split('T')[0]
      const startMs = new Date(dStr + 'T00:00:00').getTime()
      const endMs = startMs + 86400000

      const daySessions = (sessions ?? []).filter((s) => s.startedAt >= startMs && s.startedAt < endMs)
      const readSecs = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0)
      const readMins = Math.round(readSecs / 60)
      const virtuesCount = (virtueLogs ?? []).filter((v) => v.date === dStr && v.completed).length

      let level = 0
      if (readMins > 30 || virtuesCount >= 2) level = 4
      else if (readMins > 15 || virtuesCount === 1) level = 3
      else if (readMins > 5) level = 2
      else if (readMins > 0) level = 1

      days.push({
        dateStr: dStr,
        dayNum: d.getDate(),
        readMinutes: readMins,
        virtuesCount,
        level,
      })
    }
    return days
  }, [sessions, virtueLogs])

  const activeDaysCount = useMemo(() => heatmap30Days.filter((d) => d.level > 0).length, [heatmap30Days])

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

  const mostReadChapters = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sessions ?? []) map.set(s.chapterId, (map.get(s.chapterId) ?? 0) + s.durationSeconds)
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [sessions])

  const sectionsCompleted = useMemo(() => new Set((history ?? []).map((h) => h.chapterId)).size, [history])

  const typicalHour = useMemo(() => {
    const buckets = Array(24).fill(0)
    for (const s of sessions ?? []) buckets[new Date(s.startedAt).getHours()] += s.durationSeconds
    let max = 0, idx = 9
    buckets.forEach((v, i) => { if (v > max) { max = v; idx = i } })
    return idx
  }, [sessions])

  if (loading || !index) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ التحميل...</div>
  }

  const maxWeekly = Math.max(1, ...weeklyMinutes)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader title="إحصائيات القراءة والتقدم" />

      <section className="rounded-2xl bg-app-surface border border-app-border p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold flex items-center gap-1.5">
            <Target size={15} className="text-app-accent" />
            هدف القراءة اليومي
          </p>
          <span className="text-xs text-app-muted">
            {toArabicDigits(todayMinutes)} / {toArabicDigits(dailyGoalMinutes)} دقيقة
          </span>
        </div>
        <div className="h-2 rounded-full bg-app-border overflow-hidden">
          <div className="h-full bg-app-accent rounded-full transition-all" style={{ width: `${goalProgress}%` }} />
        </div>
        <p className="text-xs text-app-muted mt-2">
          {goalProgress >= 100 ? 'أحسنت! لقد حققت هدفك لليوم 🎉' : `تبقى ${toArabicDigits(Math.max(0, dailyGoalMinutes - todayMinutes))} دقيقة لتحقيق هدفك`}
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={<Clock size={16} />} label="إجمالي وقت القراءة" value={formatDuration(totalSeconds)} />
        <StatCard icon={<Flame size={16} />} label="سلسلة القراءة" value={`${toArabicDigits(position.streakDays)} يوماً`} />
        <StatCard icon={<Highlighter size={16} />} label="التظليلات" value={toArabicDigits(highlightsCount ?? 0)} />
        <StatCard icon={<StickyNote size={16} />} label="الملاحظات" value={toArabicDigits(notesCount ?? 0)} />
        <StatCard icon={<Bookmark size={16} />} label="العلامات" value={toArabicDigits(bookmarksCount ?? 0)} />
        <StatCard icon={<BookOpenCheck size={16} />} label="أقسام مقروءة" value={`${toArabicDigits(sectionsCompleted)} / ${toArabicDigits(index.book.totalSections)}`} />
      </div>

      <section className="rounded-2xl bg-app-surface border border-app-border p-5 mb-6">
        <p className="text-sm font-semibold mb-4">نشاط الأسبوع (بالدقائق)</p>
        <div className="flex items-end justify-between gap-2 h-28">
          {weeklyMinutes.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
              <div
                className="w-full rounded-t-md bg-app-accent/70 transition-all"
                style={{ height: `${Math.max(4, (m / maxWeekly) * 100)}%` }}
              />
              <span className="text-[10px] text-app-muted">{WEEKDAY_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 30-Day Activity & Virtue Heatmap */}
      <section className="rounded-2xl bg-app-surface border border-app-border p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold flex items-center gap-1.5">
            <Activity size={15} className="text-app-accent" />
            خريطة التقدم الأخلاقي والقراءة (آخر 30 يوماً)
          </p>
          <span className="text-xs text-app-accent font-semibold px-2 py-0.5 rounded-full bg-app-accent/15">
            {toArabicDigits(activeDaysCount)} يوماً نشطاً
          </span>
        </div>

        <p className="text-xs text-app-text-secondary mb-4 leading-relaxed">
          مصفوفة يومية توضح كثافة جلسات القراءة ومقدار الخصال السلوكية التي تم تدبرها وتطبيقها:
        </p>

        <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
          {heatmap30Days.map((d) => {
            const colors = [
              'bg-app-bg/80 border-app-border/40 text-app-muted/60',
              'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
              'bg-emerald-500/35 border-emerald-500/50 text-emerald-800 dark:text-emerald-200',
              'bg-emerald-500/65 border-emerald-500 text-white font-bold',
              'bg-emerald-600 border-emerald-400 text-white font-bold shadow-xs',
            ]
            return (
              <div
                key={d.dateStr}
                title={`${d.dateStr}: ${d.readMinutes} دقيقة قراءة، ${d.virtuesCount} خصال مطبقة`}
                className={cn(
                  'aspect-square rounded-xl border flex flex-col items-center justify-center text-[10px] p-1 transition-all group relative cursor-pointer hover:scale-105',
                  colors[d.level]
                )}
              >
                <span className="font-mono">{toArabicDigits(d.dayNum)}</span>
                {d.virtuesCount > 0 && (
                  <span className="text-[8px] opacity-90 leading-none">★{toArabicDigits(d.virtuesCount)}</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-app-muted mt-3 pt-3 border-t border-app-border/60">
          <div className="flex items-center gap-1.5">
            <span>أقل نشاط</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-app-bg border border-app-border inline-block" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/15 inline-block" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/35 inline-block" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/65 inline-block" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
            <span>أعلى نشاط</span>
          </div>
          <span>★ = خصال مطبقة ومسجلة في العادات</span>
        </div>
      </section>

      <section className="rounded-2xl bg-app-surface border border-app-border p-5 mb-6">
        <p className="text-sm font-semibold mb-3">الأقسام الأكثر قراءة</p>
        {mostReadChapters.length === 0 ? (
          <p className="text-sm text-app-muted">لا توجد بيانات كافية بعد</p>
        ) : (
          <ul className="space-y-2.5">
            {mostReadChapters.map(([chapterId, seconds]) => (
              <li key={chapterId} className="flex items-center justify-between text-sm">
                <span className="truncate">{index.chapterById.get(chapterId)?.title}</span>
                <span className="text-app-muted text-xs shrink-0">{formatDuration(seconds)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl bg-app-surface border border-app-border p-5">
        <p className="text-sm font-semibold mb-1">الوقت المعتاد للقراءة</p>
        <p className="text-xs text-app-text-secondary">
          تقرأ عادة في حدود الساعة {toArabicDigits(typicalHour % 12 || 12)}:00 {typicalHour < 12 ? 'صباحاً' : 'مساءً'}
        </p>
      </section>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-app-surface border border-app-border p-4">
      <div className="text-app-accent mb-2">{icon}</div>
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-xs text-app-text-secondary mt-0.5">{label}</p>
    </div>
  )
}
