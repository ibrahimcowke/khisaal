import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Highlighter, Trash2, Star, FolderPlus, Tag } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { formatRelativeDay } from '../lib/format'
import type { HighlightColor } from '../lib/types'
import { cn } from '../lib/cn'
import { AddToCollectionSheet } from '../components/collections/AddToCollectionSheet'
import { TagEditorSheet } from '../components/collections/TagEditorSheet'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { useTranslation } from '../lib/i18n'

const HL_COLORS: { key: HighlightColor; hex: string }[] = [
  { key: 'yellow', hex: '#F4E7A3' },
  { key: 'green', hex: '#C3E4C6' },
  { key: 'blue', hex: '#C3D9F0' },
  { key: 'pink', hex: '#F3CBDA' },
  { key: 'purple', hex: '#DCC9F0' },
  { key: 'orange', hex: '#F5D3AE' },
]

export default function HighlightsPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const { t, isRtl, formatDigits } = useTranslation()
  const [activeColor, setActiveColor] = useState<HighlightColor | null>(null)
  const [chapterFilter, setChapterFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [collectionTargetId, setCollectionTargetId] = useState<string | null>(null)
  const [tagTargetId, setTagTargetId] = useState<string | null>(null)

  const highlights = useLiveQuery(
    () => (index ? db.highlights.where('bookId').equals(index.book.id).reverse().sortBy('createdAt') : []),
    [index?.book.id]
  )

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const h of highlights ?? []) for (const t of h.tags ?? []) set.add(t)
    return [...set].sort()
  }, [highlights])

  const filtered = useMemo(() => {
    let list = highlights ?? []
    if (activeColor) list = list.filter((h) => h.color === activeColor)
    if (chapterFilter) list = list.filter((h) => h.chapterId === chapterFilter)
    if (tagFilter) list = list.filter((h) => (h.tags ?? []).includes(tagFilter))
    return list
  }, [highlights, activeColor, chapterFilter, tagFilter])

  if (loading || !index) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary text-sm">{t('loading')}</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title={t('highlights')}
        count={highlights ? formatDigits(highlights.length) : undefined}
      />

      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveColor(null)}
          className={cn(
            'shrink-0 text-xs px-3 py-1 rounded-full border transition-all cursor-pointer',
            !activeColor
              ? 'border-app-accent text-app-accent bg-app-accent/10 font-bold'
              : 'border-app-border text-app-text-secondary hover:border-app-accent/50'
          )}
        >
          {isRtl ? 'الكل' : 'All'}
        </button>
        {HL_COLORS.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveColor((cur) => (cur === c.key ? null : c.key))}
            className={cn(
              'shrink-0 h-6.5 w-6.5 rounded-full border-2 transition-all cursor-pointer',
              activeColor === c.key ? 'border-app-text ring-2 ring-app-accent/40 scale-110' : 'border-black/10'
            )}
            style={{ backgroundColor: c.hex }}
            aria-label={c.key}
          />
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto no-scrollbar pb-1">
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTagFilter((cur) => (cur === t ? null : t))}
              className={cn(
                'shrink-0 text-xs px-3 py-1 rounded-full border transition-all cursor-pointer',
                tagFilter === t ? 'border-app-accent text-app-accent bg-app-accent/10 font-bold' : 'border-app-border text-app-text-secondary hover:border-app-accent/50'
              )}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Highlighter}
          title={isRtl ? 'لا توجد تظليلات مطابقة' : 'No Highlights Found'}
          description={isRtl ? 'حدد أي نص أثناء القراءة لتظليله بألوان مختلفة وحفظه.' : 'Highlight memorable quotes and passages while reading.'}
          actionLabel={t('readBook')}
          onAction={() => navigate(`/book/${index.book.id}/read`)}
        />
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((h) => {
            const chapter = index.chapterById.get(h.chapterId)
            return (
              <li key={h.id} className="rounded-2xl bg-app-surface border border-app-border p-4 shadow-2xs hover:border-app-accent/50 transition-all">
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: HL_COLORS.find((c) => c.key === h.color)?.hex }} />
                  <button
                    onClick={() => navigate(`/book/${index.book.id}/read?c=${h.chapterId}`)}
                    className="flex-1 min-w-0 text-right cursor-pointer"
                  >
                    <p className="text-xs sm:text-sm leading-relaxed text-app-text font-medium">{h.text}</p>
                    {(h.tags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {h.tags.map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-app-accent/10 text-app-accent font-semibold">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-app-muted font-serif">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setChapterFilter(h.chapterId)
                        }}
                        className="hover:text-app-accent cursor-pointer"
                      >
                        {chapter?.title}
                      </button>
                      <span>•</span>
                      <span>{formatRelativeDay(h.createdAt)}</span>
                    </div>
                  </button>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => db.highlights.update(h.id, { favorite: !h.favorite })}
                      className={cn('h-7 w-7 rounded-xl flex items-center justify-center cursor-pointer', h.favorite ? 'text-app-accent bg-app-accent/10' : 'text-app-muted hover:bg-black/5')}
                      title={isRtl ? 'المفضلة' : 'Favorite'}
                    >
                      <Star size={13} fill={h.favorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => setCollectionTargetId(h.id)}
                      className="h-7 w-7 rounded-xl flex items-center justify-center text-app-muted hover:bg-black/5 cursor-pointer"
                      title={isRtl ? 'إضافة لمجموعة' : 'Add to Collection'}
                    >
                      <FolderPlus size={13} />
                    </button>
                    <button
                      onClick={() => setTagTargetId(h.id)}
                      className="h-7 w-7 rounded-xl flex items-center justify-center text-app-muted hover:bg-black/5 cursor-pointer"
                      title={isRtl ? 'الوسوم' : 'Tags'}
                    >
                      <Tag size={13} />
                    </button>
                    <button
                      onClick={() => db.highlights.delete(h.id)}
                      className="h-7 w-7 rounded-xl flex items-center justify-center text-app-muted hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title={isRtl ? 'حذف' : 'Delete'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {collectionTargetId && (
        <AddToCollectionSheet open={!!collectionTargetId} onOpenChange={(v) => !v && setCollectionTargetId(null)} itemId={collectionTargetId} />
      )}
      {tagTargetId && (
        <TagEditorSheet
          open={!!tagTargetId}
          onOpenChange={(v) => !v && setTagTargetId(null)}
          initialTags={highlights?.find((h) => h.id === tagTargetId)?.tags ?? []}
          suggestions={allTags}
          onSave={(tags) => {
            db.highlights.update(tagTargetId, { tags })
            setTagTargetId(null)
          }}
        />
      )}
    </div>
  )
}
