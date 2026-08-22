import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { History, Trash2, Clock } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { formatRelativeDay, formatDuration } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { useTranslation } from '../lib/i18n'

export default function HistoryPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const { t, isRtl } = useTranslation()
  const history = useLiveQuery(() => (index ? db.history.where('bookId').equals(index.book.id).reverse().sortBy('visitedAt') : []), [index?.book.id])

  const grouped = useMemo(() => {
    const groups = new Map<string, { label: string; entries: NonNullable<typeof history> }>()
    for (const h of history ?? []) {
      const label = formatRelativeDay(h.visitedAt)
      if (!groups.has(label)) groups.set(label, { label, entries: [] })
      groups.get(label)!.entries.push(h)
    }
    return [...groups.values()]
  }, [history])

  async function handleClear() {
    await db.history.clear()
  }

  if (loading || !index) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary text-sm">{t('loading')}</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title={t('history')}
        actions={
          history && history.length > 0 ? (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-app-border text-xs text-app-text-secondary hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>{isRtl ? 'مسح السجل' : 'Clear History'}</span>
            </button>
          ) : undefined
        }
      />

      {!history || history.length === 0 ? (
        <EmptyState
          icon={History}
          title={isRtl ? 'لا يوجد سجل قراءة بعد' : 'No Reading History Yet'}
          description={isRtl ? 'سيبدأ تسجيل الفصول التي تقرؤها والوقت المستغرق تلقائياً بمجرد بدء القراءة.' : 'Your reading history and session time will automatically appear here.'}
          actionLabel={t('readBook')}
          onAction={() => navigate(`/book/${index.book.id}/read`)}
        />
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <section key={group.label}>
              <h2 className="text-xs font-bold text-app-text-secondary mb-2 font-display">{group.label}</h2>
              <div className="rounded-2xl bg-app-surface border border-app-border divide-y divide-app-border/60 overflow-hidden shadow-2xs">
                {group.entries.map((h) => {
                  const chapter = index.chapterById.get(h.chapterId)
                  return (
                    <button
                      key={h.id}
                      onClick={() => navigate(`/book/${index.book.id}/read?c=${h.chapterId}`)}
                      className="w-full flex items-center justify-between px-4 py-3 text-xs sm:text-sm hover:bg-black/5 transition-colors text-right cursor-pointer group"
                    >
                      <span className="truncate text-app-text font-medium group-hover:text-app-accent transition-colors font-display">
                        {chapter?.title ?? h.chapterId}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-app-muted shrink-0 font-serif">
                        <Clock size={11} />
                        {formatDuration(h.durationSeconds)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
