import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Highlighter, Trash2, Star, FolderPlus, Tag } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { formatRelativeDay, toArabicDigits } from '../lib/format'
import type { HighlightColor } from '../lib/types'
import { cn } from '../lib/cn'
import { AddToCollectionSheet } from '../components/collections/AddToCollectionSheet'
import { TagEditorSheet } from '../components/collections/TagEditorSheet'
import { PageHeader } from '../components/layout/PageHeader'

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
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ التحميل...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title="التظليلات والفوائد"
        count={highlights ? toArabicDigits(highlights.length) : undefined}
      />

      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveColor(null)}
          className={cn('shrink-0 text-xs px-3 py-1.5 rounded-full border', !activeColor ? 'border-app-accent text-app-accent bg-app-accent/10' : 'border-app-border text-app-text-secondary')}
        >
          الكل
        </button>
        {HL_COLORS.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveColor((cur) => (cur === c.key ? null : c.key))}
            className={cn('shrink-0 h-7 w-7 rounded-full border-2', activeColor === c.key ? 'border-app-accent' : 'border-transparent')}
            style={{ backgroundColor: c.hex }}
            aria-label={c.key}
          />
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTagFilter((cur) => (cur === t ? null : t))}
              className={cn(
                'shrink-0 text-xs px-3 py-1.5 rounded-full border',
                tagFilter === t ? 'border-app-accent text-app-accent bg-app-accent/10' : 'border-app-border text-app-text-secondary'
              )}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Highlighter size={32} className="mx-auto text-app-muted mb-3" />
          <p className="text-sm text-app-muted">لا توجد تظليلات مطابقة</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((h) => {
            const chapter = index.chapterById.get(h.chapterId)
            return (
              <li key={h.id} className="rounded-2xl bg-app-surface border border-app-border p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: HL_COLORS.find((c) => c.key === h.color)?.hex }} />
                  <button
                    onClick={() => navigate(`/book/${index.book.id}/read?c=${h.chapterId}`)}
                    className="flex-1 min-w-0 text-right"
                  >
                    <p className="text-sm leading-relaxed">{h.text}</p>
                    {(h.tags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {h.tags.map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-app-accent/10 text-app-accent">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-app-muted">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setChapterFilter(h.chapterId)
                        }}
                        className="hover:text-app-accent"
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
                      className={cn('h-8 w-8 rounded-full flex items-center justify-center', h.favorite ? 'text-app-accent' : 'text-app-muted hover:bg-black/5')}
                    >
                      <Star size={14} fill={h.favorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => setCollectionTargetId(h.id)}
                      className="h-8 w-8 rounded-full flex items-center justify-center text-app-muted hover:bg-black/5"
                    >
                      <FolderPlus size={14} />
                    </button>
                    <button
                      onClick={() => setTagTargetId(h.id)}
                      className="h-8 w-8 rounded-full flex items-center justify-center text-app-muted hover:bg-black/5"
                    >
                      <Tag size={14} />
                    </button>
                    <button
                      onClick={() => db.highlights.delete(h.id)}
                      className="h-8 w-8 rounded-full flex items-center justify-center text-app-muted hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
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
          onSave={(tags) => db.highlights.update(tagTargetId, { tags })}
        />
      )}
    </div>
  )
}
