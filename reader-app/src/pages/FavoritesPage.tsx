import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Star, Highlighter, StickyNote, Quote as QuoteIcon } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { cn } from '../lib/cn'
import { toArabicDigits } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'

type Filter = 'all' | 'highlight' | 'note' | 'quote'

const HL_COLORS: Record<string, string> = {
  yellow: '#F4E7A3', green: '#C3E4C6', blue: '#C3D9F0', pink: '#F3CBDA', purple: '#DCC9F0', orange: '#F5D3AE',
}

export default function FavoritesPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')

  const allHighlights = useLiveQuery(() => (index ? db.highlights.where('bookId').equals(index.book.id).toArray() : []), [index?.book.id])
  const allNotes = useLiveQuery(() => (index ? db.notes.where('bookId').equals(index.book.id).toArray() : []), [index?.book.id])
  const allQuotes = useLiveQuery(() => (index ? db.quotes.where('bookId').equals(index.book.id).toArray() : []), [index?.book.id])

  const favHighlights = (allHighlights ?? []).filter((h) => h.favorite)
  const favNotes = (allNotes ?? []).filter((n) => n.favorite)
  const favQuotes = (allQuotes ?? []).filter((q) => q.favorite)

  const items = [
    ...favHighlights.map((h) => ({ type: 'highlight' as const, id: h.id, text: h.text, chapterId: h.chapterId, color: h.color })),
    ...favNotes.map((n) => ({ type: 'note' as const, id: n.id, text: n.body, chapterId: n.chapterId })),
    ...favQuotes.map((q) => ({ type: 'quote' as const, id: q.id, text: q.text, chapterId: q.chapterId })),
  ].filter((i) => filter === 'all' || i.type === filter)

  if (loading || !index) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ التحميل...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title="المفضلة والدرر"
        count={toArabicDigits(items.length)}
      />

      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="الكل" />
        <FilterChip active={filter === 'highlight'} onClick={() => setFilter('highlight')} label="تظليلات" icon={<Highlighter size={12} />} />
        <FilterChip active={filter === 'note'} onClick={() => setFilter('note')} label="ملاحظات" icon={<StickyNote size={12} />} />
        <FilterChip active={filter === 'quote'} onClick={() => setFilter('quote')} label="اقتباسات" icon={<QuoteIcon size={12} />} />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Star size={32} className="mx-auto text-app-muted mb-3" />
          <p className="text-sm text-app-muted">لا توجد عناصر مفضلة بعد</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => {
            const chapter = index.chapterById.get(item.chapterId)
            const Icon = item.type === 'highlight' ? Highlighter : item.type === 'note' ? StickyNote : QuoteIcon
            return (
              <li key={`${item.type}-${item.id}`}>
                <button
                  onClick={() => navigate(`/book/${index.book.id}/read?c=${item.chapterId}`)}
                  className="w-full text-right rounded-2xl bg-app-surface border border-app-border p-4 flex items-start gap-3 hover:shadow-md transition-shadow"
                >
                  {item.type === 'highlight' ? (
                    <span className="mt-1.5 h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: HL_COLORS[(item as any).color] }} />
                  ) : (
                    <Icon size={16} className="text-app-accent shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm leading-relaxed line-clamp-3">{item.text}</p>
                    <p className="text-[11px] text-app-muted mt-1.5">{chapter?.title}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function FilterChip({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border',
        active ? 'border-app-accent text-app-accent bg-app-accent/10' : 'border-app-border text-app-text-secondary'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
