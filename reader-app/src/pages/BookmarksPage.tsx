import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Bookmark, Trash2 } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { formatRelativeDay, toArabicDigits } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'

export default function BookmarksPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const bookmarks = useLiveQuery(
    () => (index ? db.bookmarks.where('bookId').equals(index.book.id).reverse().sortBy('createdAt') : []),
    [index?.book.id]
  )

  if (loading || !index) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ التحميل...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title="العلامات المرجعية"
        count={bookmarks ? toArabicDigits(bookmarks.length) : undefined}
      />

      {!bookmarks || bookmarks.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-2.5">
          {bookmarks.map((b) => {
            const chapter = index.chapterById.get(b.chapterId)
            return (
              <li key={b.id} className="rounded-2xl bg-app-surface border border-app-border p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-app-accent/10 text-app-accent flex items-center justify-center shrink-0">
                  <Bookmark size={17} fill="currentColor" />
                </div>
                <button
                  onClick={() => navigate(b.chapterId === '__book__' ? `/book/${index.book.id}` : `/book/${index.book.id}/read?c=${b.chapterId}`)}
                  className="flex-1 min-w-0 text-right"
                >
                  <p className="text-sm font-medium truncate">{chapter?.title ?? b.title}</p>
                  <p className="text-xs text-app-muted mt-0.5">{formatRelativeDay(b.createdAt)}</p>
                </button>
                <button
                  onClick={() => db.bookmarks.delete(b.id)}
                  className="h-9 w-9 rounded-full flex items-center justify-center text-app-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="حذف"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-app-surface/60 rounded-3xl border border-app-border">
      <Bookmark size={32} className="mx-auto text-app-muted mb-3" />
      <p className="text-sm text-app-muted">لا توجد علامات مرجعية بعد</p>
    </div>
  )
}
