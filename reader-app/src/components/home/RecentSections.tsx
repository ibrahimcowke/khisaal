import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Clock, Highlighter, ChevronLeft, ChevronRight } from 'lucide-react'
import { db } from '../../lib/db'
import type { BookIndex } from '../../lib/bookData'
import { formatRelativeDay } from '../../lib/format'
import { useTranslation } from '../../lib/i18n'

const HL_COLORS: Record<string, string> = {
  yellow: '#F4E7A3',
  green: '#C3E4C6',
  blue: '#C3D9F0',
  pink: '#F3CBDA',
  purple: '#DCC9F0',
  orange: '#F5D3AE',
}

export function RecentlyReadSection({ index }: { index: BookIndex }) {
  const navigate = useNavigate()
  const { isRtl } = useTranslation()
  const history = useLiveQuery(
    () => db.history.where('bookId').equals(index.book.id).reverse().sortBy('visitedAt'),
    [index.book.id]
  )

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

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs sm:text-sm font-bold text-app-text font-display flex items-center gap-1.5">
          <Clock size={14} className="text-app-accent" />
          <span>{isRtl ? 'قرأت مؤخراً' : 'Recently Read'}</span>
        </h2>
        <button
          onClick={() => navigate('/history')}
          className="text-xs text-app-accent font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>{isRtl ? 'السجل الكامل' : 'All History'}</span>
          <ChevronIcon size={13} />
        </button>
      </div>

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {recentChapters.map((h) => {
          const chapter = index.chapterById.get(h.chapterId)
          if (!chapter) return null
          return (
            <button
              key={h.chapterId}
              onClick={() => navigate(`/book/${index.book.id}/read?c=${h.chapterId}`)}
              className="shrink-0 w-44 text-right rounded-2xl bg-app-surface border border-app-border p-3.5 hover:border-app-accent/50 hover:shadow-xs transition-all cursor-pointer shadow-2xs group"
            >
              <p className="text-xs font-bold text-app-text line-clamp-2 mb-2 group-hover:text-app-accent transition-colors font-display">
                {chapter.title}
              </p>
              <p className="text-[10px] text-app-muted font-serif">{formatRelativeDay(h.visitedAt)}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function RecentHighlightsSection({ index }: { index: BookIndex }) {
  const navigate = useNavigate()
  const { isRtl } = useTranslation()
  const highlights = useLiveQuery(
    () => db.highlights.where('bookId').equals(index.book.id).reverse().sortBy('createdAt'),
    [index.book.id]
  )

  if (!highlights || highlights.length === 0) return null

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs sm:text-sm font-bold text-app-text font-display flex items-center gap-1.5">
          <Highlighter size={14} className="text-app-accent" />
          <span>{isRtl ? 'آخر التظليلات والفوائد' : 'Recent Highlights'}</span>
        </h2>
        <button
          onClick={() => navigate('/highlights')}
          className="text-xs text-app-accent font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>{isRtl ? 'كل التظليلات' : 'All Highlights'}</span>
          <ChevronIcon size={13} />
        </button>
      </div>

      <div className="space-y-2">
        {highlights.slice(0, 3).map((h) => (
          <button
            key={h.id}
            onClick={() => navigate(`/book/${index.book.id}/read?c=${h.chapterId}`)}
            className="w-full text-right rounded-2xl bg-app-surface border border-app-border p-3.5 flex items-start gap-3 hover:border-app-accent/50 hover:shadow-xs transition-all cursor-pointer shadow-2xs group"
          >
            <span
              className="mt-1 h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: HL_COLORS[h.color] || '#F4E7A3' }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-app-text line-clamp-2 leading-relaxed group-hover:text-app-accent transition-colors">
                {h.text}
              </p>
              <p className="text-[10px] text-app-muted mt-1 font-serif">
                {index.chapterById.get(h.chapterId)?.title}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
