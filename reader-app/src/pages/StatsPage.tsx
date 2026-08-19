import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Clock, Flame, Highlighter, StickyNote, Bookmark, BookOpenCheck, Target } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { usePositionStore } from '../store/positionStore'
import { useSettingsStore } from '../store/settingsStore'
import { toArabicDigits, formatDuration } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'

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

  const totalSeconds = useMemo(() => (sessions ?? []).reduce((acc, s) => acc + s.durationSeconds, 0) + position.todaySeconds, [sessions, position.todaySeconds])

  const todaySeconds = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const todays = (sessions ?? []).filter((s) => s.startedAt >= start.getTime())
    return todays.reduce((acc, s) => acc + s.durationSeconds, 0) + position.todaySeconds
  }, [sessions, position.todaySeconds])
  const todayMinutes = Math.round(todaySeconds / 60)
  const goalProgress = Math.min(100, Math.round((todayMinutes / Math.max(1, dailyGoalMinutes)) * 100))

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
