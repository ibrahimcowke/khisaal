import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { StickyNote, Trash2, Search, Star, FolderPlus, Tag } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { normalizeArabic } from '../lib/arabicNormalize'
import { formatRelativeDay, toArabicDigits } from '../lib/format'
import { cn } from '../lib/cn'
import { AddToCollectionSheet } from '../components/collections/AddToCollectionSheet'
import { TagEditorSheet } from '../components/collections/TagEditorSheet'
import { PageHeader } from '../components/layout/PageHeader'

export default function NotesPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [chapterFilter, setChapterFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [collectionTargetId, setCollectionTargetId] = useState<string | null>(null)
  const [tagTargetId, setTagTargetId] = useState<string | null>(null)

  const notes = useLiveQuery(
    () => (index ? db.notes.where('bookId').equals(index.book.id).reverse().sortBy('updatedAt') : []),
    [index?.book.id]
  )

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const n of notes ?? []) for (const t of n.tags ?? []) set.add(t)
    return [...set].sort()
  }, [notes])

  const filtered = useMemo(() => {
    let list = notes ?? []
    if (chapterFilter) list = list.filter((n) => n.chapterId === chapterFilter)
    if (tagFilter) list = list.filter((n) => (n.tags ?? []).includes(tagFilter))
    if (query.trim()) {
      const q = normalizeArabic(query)
      list = list.filter((n) => normalizeArabic(n.body).includes(q) || normalizeArabic(n.selectedText).includes(q))
    }
    return list
  }, [notes, query, chapterFilter, tagFilter])

  if (loading || !index) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ التحميل...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title="الملاحظات والتدوينات"
        count={notes ? toArabicDigits(notes.length) : undefined}
      />

      <div className="relative mb-5">
        <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في الملاحظات..."
          dir="rtl"
          className="w-full rounded-xl border border-app-border bg-app-surface py-2.5 pr-10 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40"
        />
      </div>

      {allTags.length > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
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

      {chapterFilter && (
        <button onClick={() => setChapterFilter(null)} className="text-xs text-app-accent mb-4 block">
          إزالة تصفية: {index.chapterById.get(chapterFilter)?.title} ×
        </button>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <StickyNote size={32} className="mx-auto text-app-muted mb-3" />
          <p className="text-sm text-app-muted">لا توجد ملاحظات مطابقة</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((n) => {
            const chapter = index.chapterById.get(n.chapterId)
            return (
              <li key={n.id} className="rounded-2xl bg-app-surface border border-app-border p-4">
                <button onClick={() => navigate(`/book/${index.book.id}/read?c=${n.chapterId}`)} className="w-full text-right">
                  <p className="text-xs text-app-text-secondary italic line-clamp-1 mb-1.5">"{n.selectedText}"</p>
                  <p className="text-sm leading-relaxed mb-2">{n.body}</p>
                  {(n.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {n.tags.map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-app-accent/10 text-app-accent">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-app-muted">
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setChapterFilter(n.chapterId)
                      }}
                      className="hover:text-app-accent cursor-pointer"
                    >
                      {chapter?.title}
                    </span>
                    <span>•</span>
                    <span>{formatRelativeDay(n.updatedAt)}</span>
                  </div>
                </button>
                <div className="flex items-center justify-end gap-1 mt-2">
                  <button
                    onClick={() => db.notes.update(n.id, { favorite: !n.favorite })}
                    className={n.favorite ? 'h-7 w-7 rounded-full flex items-center justify-center text-app-accent' : 'h-7 w-7 rounded-full flex items-center justify-center text-app-muted hover:bg-black/5'}
                  >
                    <Star size={13} fill={n.favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => setCollectionTargetId(n.id)}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-app-muted hover:bg-black/5"
                  >
                    <FolderPlus size={13} />
                  </button>
                  <button
                    onClick={() => setTagTargetId(n.id)}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-app-muted hover:bg-black/5"
                  >
                    <Tag size={13} />
                  </button>
                  <button
                    onClick={() => db.notes.delete(n.id)}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-app-muted hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </button>
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
          initialTags={notes?.find((n) => n.id === tagTargetId)?.tags ?? []}
          suggestions={allTags}
          onSave={(tags) => db.notes.update(tagTargetId, { tags })}
        />
      )}
    </div>
  )
}
