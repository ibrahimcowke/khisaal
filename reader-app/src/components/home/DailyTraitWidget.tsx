import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { HeartHandshake, CheckCircle2, Circle, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { db, uid } from '../../lib/db'
import { useBook } from '../../context/BookContext'
import { useTranslation } from '../../lib/i18n'

export function DailyTraitWidget() {
  const { isRtl } = useTranslation()
  const { index } = useBook()
  const navigate = useNavigate()

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const logs = useLiveQuery(() => db.virtueLogs.toArray()) || []
  const todayLog = useMemo(() => logs.find((l) => l.date === todayStr), [logs, todayStr])

  const todayTrait = useMemo(() => {
    if (!index || index.chapters.length === 0) return null
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const chapterIdx = dayOfYear % index.chapters.length
    const chapter = index.chapters[chapterIdx]
    const block = chapter.blocks.find((b) => (b.text?.length ?? 0) > 20) || chapter.blocks[0]
    return {
      id: chapter.id,
      title: chapter.title,
      text: block?.text || '',
    }
  }, [index])

  const toggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!todayTrait) return
    if (todayLog) {
      await db.virtueLogs.update(todayLog.id, { completed: !todayLog.completed })
    } else {
      await db.virtueLogs.add({
        id: uid('vl'),
        date: todayStr,
        traitId: todayTrait.id,
        traitTitle: todayTrait.title,
        category: 'الخصال والآداب',
        completed: true,
        createdAt: Date.now(),
      })
    }
  }

  if (!todayTrait) return null

  return (
    <div
      onClick={() => navigate('/habit-tracker')}
      className="p-5 sm:p-6 rounded-3xl bg-linear-to-br from-app-surface via-app-surface/95 to-amber-500/10 border border-amber-500/25 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <HeartHandshake size={16} />
          </span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            {isRtl ? 'خصلة وفضيلة اليوم' : 'Trait of the Day'}
          </span>
        </div>

        <button
          onClick={toggleComplete}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all active:scale-95 ${
            todayLog?.completed
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-app-surface border-app-border text-app-muted hover:text-app-text hover:border-amber-500'
          }`}
        >
          {todayLog?.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          <span>{todayLog?.completed ? (isRtl ? 'تم التطبيق' : 'Practiced') : (isRtl ? 'تأكيد التطبيق' : 'Mark Done')}</span>
        </button>
      </div>

      <h3 className="font-display text-lg sm:text-xl font-bold text-app-text mb-2 group-hover:text-app-accent transition-colors">
        {todayTrait.title}
      </h3>

      <p className="text-xs sm:text-sm text-app-text-secondary font-serif line-clamp-2 leading-relaxed mb-4">
        {todayTrait.text}
      </p>

      <div className="flex items-center justify-between text-xs text-app-muted pt-3 border-t border-app-border/60">
        <span className="flex items-center gap-1 text-[11px] text-app-accent font-semibold">
          <Sparkles size={12} />
          {isRtl ? 'افتح سجل التطبيق والتأمل' : 'Open Practice Journal'}
        </span>
        <span className="flex items-center gap-1 text-app-accent font-semibold group-hover:translate-x-1 transition-transform">
          {isRtl ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
        </span>
      </div>
    </div>
  )
}
