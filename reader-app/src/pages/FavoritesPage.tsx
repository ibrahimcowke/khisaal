import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Star, Highlighter, StickyNote, Quote as QuoteIcon } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { cn } from '../lib/cn'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { useTranslation } from '../lib/i18n'

type Filter = 'all' | 'highlight' | 'note' | 'quote'

const HL_COLORS: Record<string, string> = {
  yellow: '#F4E7A3',
  green: '#C3E4C6',
  blue: '#C3D9F0',
  pink: '#F3CBDA',
  purple: '#DCC9F0',
  orange: '#F5D3AE',
}

export default function FavoritesPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const { t, isRtl, formatDigits } = useTranslation()
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
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary text-sm">{t('loading')}</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title={isRtl ? 'المفضلة والدرر' : 'Favorites & Gems'}
        count={formatDigits(items.length)}
      />

      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto no-scrollbar pb-1">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label={isRtl ? 'الكل' : 'All'} />
        <FilterChip active={filter === 'highlight'} onClick={() => setFilter('highlight')} label={isRtl ? 'تظليلات' : 'Highlights'} icon={<Highlighter size={12} />} />
        <FilterChip active={filter === 'note'} onClick={() => setFilter('note')} label={isRtl ? 'ملاحظات' : 'Notes'} icon={<StickyNote size={12} />} />
        <FilterChip active={filter === 'quote'} onClick={() => setFilter('quote')} label={isRtl ? 'اقتباسات' : 'Quotes'} icon={<QuoteIcon size={12} />} />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Star}
          title={isRtl ? 'لا توجد عناصر مفضلة بعد' : 'No Favorites Yet'}
          description={isRtl ? 'اضغط على أيقونة النجمة عند أي تظليل أو ملاحظة أو اقتباس لإضافته إلى قائمة المفضلة.' : 'Star your favorite notes, quotes, and highlights to access them quickly.'}
          actionLabel={t('readBook')}
          onAction={() => navigate(`/book/${index.book.id}/read`)}
        />
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => {
            const chapter = index.chapterById.get(item.chapterId)
            const Icon = item.type === 'highlight' ? Highlighter : item.type === 'note' ? StickyNote : QuoteIcon
            return (
              <li key={`${item.type}-${item.id}`}>
                <button
                  onClick={() => navigate(`/book/${index.book.id}/read?c=${item.chapterId}`)}
                  className="w-full text-right rounded-2xl bg-app-surface border border-app-border p-4 flex items-start gap-3 hover:border-app-accent/50 hover:shadow-2xs transition-all shadow-2xs group cursor-pointer"
                >
                  {item.type === 'highlight' ? (
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: HL_COLORS[(item as any).color] }} />
                  ) : (
                    <div className="p-1 rounded-lg bg-app-accent/10 text-app-accent shrink-0 mt-0.5">
                      <Icon size={14} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm leading-relaxed line-clamp-3 text-app-text font-medium group-hover:text-app-accent transition-colors">{item.text}</p>
                    <p className="text-[10px] text-app-muted mt-1.5 font-serif">{chapter?.title}</p>
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
        'shrink-0 flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all cursor-pointer',
        active ? 'border-app-accent text-app-accent bg-app-accent/10 font-bold shadow-2xs' : 'border-app-border text-app-text-secondary hover:border-app-accent/50'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
