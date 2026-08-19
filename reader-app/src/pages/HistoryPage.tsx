import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { History, Trash2, Clock } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { formatRelativeDay, formatDuration } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'

export default function HistoryPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
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
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ التحميل...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title="سجل القراءة والجلسات"
        actions={
          history && history.length > 0 ? (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-app-border text-xs text-app-text-secondary hover:text-red-600 hover:border-red-300 transition-colors"
            >
              <Trash2 size={13} />
              <span>مسح السجل</span>
            </button>
          ) : undefined
        }
      />

      {!history || history.length === 0 ? (
        <div className="text-center py-20">
          <History size={32} className="mx-auto text-app-muted mb-3" />
          <p className="text-sm text-app-muted">لا يوجد سجل قراءة بعد</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <section key={group.label}>
              <h2 className="text-xs font-semibold text-app-text-secondary mb-2.5">{group.label}</h2>
              <div className="rounded-2xl bg-app-surface border border-app-border divide-y divide-app-border overflow-hidden">
                {group.entries.map((h) => {
                  const chapter = index.chapterById.get(h.chapterId)
                  return (
                    <button
                      key={h.id}
                      onClick={() => navigate(`/book/${index.book.id}/read?c=${h.chapterId}`)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-black/5 transition-colors text-right"
                    >
                      <span className="truncate">{chapter?.title ?? h.chapterId}</span>
                      <span className="flex items-center gap-1 text-xs text-app-muted shrink-0">
                        <Clock size={12} />
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
