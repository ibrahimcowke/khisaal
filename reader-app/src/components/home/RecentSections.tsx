import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Clock, Highlighter } from 'lucide-react'
import { db } from '../../lib/db'
import type { BookIndex } from '../../lib/bookData'
import { formatRelativeDay } from '../../lib/format'

const HL_COLORS: Record<string, string> = {
  yellow: '#F4E7A3', green: '#C3E4C6', blue: '#C3D9F0', pink: '#F3CBDA', purple: '#DCC9F0', orange: '#F5D3AE',
}

export function RecentlyReadSection({ index }: { index: BookIndex }) {
  const navigate = useNavigate()
  const history = useLiveQuery(() => db.history.where('bookId').equals(index.book.id).reverse().sortBy('visitedAt'), [index.book.id])

  const recentChapters = (() => {
    const seen = new Set<string>()
    const out: { chapterId: string; visitedAt: number }[] = []
    for (const h of history ?? []) {
      if (seen.has(h.chapterId)) continue
      seen.add(h.chapterId)
      out.push(h)
      if (out.length >= 5) break
    }
    return out
  })()

  if (recentChapters.length === 0) return null

  return (
    <section>
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Clock size={15} className="text-app-accent" />قرأت مؤخراً</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {recentChapters.map((h) => {
          const chapter = index.chapterById.get(h.chapterId)
          if (!chapter) return null
          return (
            <button
              key={h.chapterId}
              onClick={() => navigate(`/book/${index.book.id}/read?c=${h.chapterId}`)}
              className="shrink-0 w-40 text-right rounded-xl bg-app-surface border border-app-border p-3.5 hover:shadow-md transition-shadow"
            >
              <p className="text-sm font-medium line-clamp-2 mb-2">{chapter.title}</p>
              <p className="text-[11px] text-app-muted">{formatRelativeDay(h.visitedAt)}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function RecentHighlightsSection({ index }: { index: BookIndex }) {
  const navigate = useNavigate()
  const highlights = useLiveQuery(
    () => db.highlights.where('bookId').equals(index.book.id).reverse().sortBy('createdAt'),
    [index.book.id]
  )

  if (!highlights || highlights.length === 0) return null

  return (
    <section>
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Highlighter size={15} className="text-app-accent" />آخر التظليلات</h2>
      <div className="space-y-2">
        {highlights.slice(0, 3).map((h) => (
          <button
            key={h.id}
            onClick={() => navigate(`/book/${index.book.id}/read?c=${h.chapterId}`)}
            className="w-full text-right rounded-xl bg-app-surface border border-app-border p-3.5 flex items-start gap-3 hover:shadow-md transition-shadow"
          >
            <span className="mt-1 h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: HL_COLORS[h.color] }} />
            <div className="min-w-0">
              <p className="text-sm line-clamp-2">{h.text}</p>
              <p className="text-[11px] text-app-muted mt-1">{index.chapterById.get(h.chapterId)?.title}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
