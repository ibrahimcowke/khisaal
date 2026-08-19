import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight, Trash2, Highlighter, StickyNote, Quote as QuoteIcon } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { toArabicDigits } from '../lib/format'

export default function CollectionDetailPage() {
  const { collectionId } = useParams()
  const navigate = useNavigate()
  const { index, loading } = useBook()
  const collection = useLiveQuery(() => (collectionId ? db.collections.get(collectionId) : undefined), [collectionId])
  const highlights = useLiveQuery(() => db.highlights.toArray(), [])
  const notes = useLiveQuery(() => db.notes.toArray(), [])
  const quotes = useLiveQuery(() => db.quotes.toArray(), [])

  const items = useMemo(() => {
    if (!collection) return []
    const ids = new Set(collection.itemIds)
    const out: { type: 'highlight' | 'note' | 'quote'; id: string; text: string; chapterId: string }[] = []
    for (const h of highlights ?? []) if (ids.has(h.id)) out.push({ type: 'highlight', id: h.id, text: h.text, chapterId: h.chapterId })
    for (const n of notes ?? []) if (ids.has(n.id)) out.push({ type: 'note', id: n.id, text: n.body, chapterId: n.chapterId })
    for (const q of quotes ?? []) if (ids.has(q.id)) out.push({ type: 'quote', id: q.id, text: q.text, chapterId: q.chapterId })
    return out
  }, [collection, highlights, notes, quotes])

  async function removeItem(id: string) {
    if (!collection) return
    await db.collections.update(collection.id, { itemIds: collection.itemIds.filter((i) => i !== id) })
  }

  if (loading || !index || !collection) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ التحميل...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-8 pb-10">
      <button onClick={() => navigate('/collections')} className="flex items-center gap-1.5 text-sm text-app-text-secondary mb-4">
        <ArrowRight size={15} />
        المجموعات
      </button>
      <header className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">{collection.name}</h1>
        <span className="text-xs text-app-muted">{toArabicDigits(items.length)} عنصر</span>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-app-muted text-center py-16">لا توجد عناصر في هذه المجموعة بعد</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => {
            const chapter = index.chapterById.get(item.chapterId)
            const Icon = item.type === 'highlight' ? Highlighter : item.type === 'note' ? StickyNote : QuoteIcon
            return (
              <li key={`${item.type}-${item.id}`} className="rounded-2xl bg-app-surface border border-app-border p-4 flex items-start gap-3">
                <Icon size={16} className="text-app-accent shrink-0 mt-1" />
                <button
                  onClick={() => navigate(`/book/${index.book.id}/read?c=${item.chapterId}`)}
                  className="flex-1 min-w-0 text-right"
                >
                  <p className="text-sm leading-relaxed line-clamp-3">{item.text}</p>
                  <p className="text-[11px] text-app-muted mt-1.5">{chapter?.title}</p>
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-app-muted hover:text-red-600 hover:bg-red-50 shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
