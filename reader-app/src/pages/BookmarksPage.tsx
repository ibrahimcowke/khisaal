import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Bookmark, Trash2 } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { formatRelativeDay } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { useTranslation } from '../lib/i18n'

export default function BookmarksPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const { t, isRtl, formatDigits } = useTranslation()
  const bookmarks = useLiveQuery(
    () => (index ? db.bookmarks.where('bookId').equals(index.book.id).reverse().sortBy('createdAt') : []),
    [index?.book.id]
  )

  if (loading || !index) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary text-sm">{t('loading')}</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title={t('bookmarks')}
        count={bookmarks ? formatDigits(bookmarks.length) : undefined}
      />

      {!bookmarks || bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={isRtl ? 'لا توجد علامات مرجعية بعد' : 'No Bookmarks Yet'}
          description={isRtl ? 'أضف علامات مرجعية أثناء القراءة لسهولة العودة لأي موضع لاحقاً.' : 'Bookmark your favorite chapters and sections while reading.'}
          actionLabel={t('readBook')}
          onAction={() => navigate(`/book/${index.book.id}/read`)}
        />
      ) : (
        <ul className="space-y-2">
          {bookmarks.map((b) => {
            const chapter = index.chapterById.get(b.chapterId)
            return (
              <li
                key={b.id}
                className="rounded-2xl bg-app-surface border border-app-border p-3.5 flex items-center gap-3 shadow-2xs hover:border-app-accent/50 transition-all group"
              >
                <div className="h-9 w-9 rounded-xl bg-app-accent/10 text-app-accent flex items-center justify-center shrink-0">
                  <Bookmark size={16} fill="currentColor" />
                </div>
                <button
                  onClick={() => navigate(b.chapterId === '__book__' ? `/book/${index.book.id}` : `/book/${index.book.id}/read?c=${b.chapterId}`)}
                  className="flex-1 min-w-0 text-right cursor-pointer"
                >
                  <p className="text-xs sm:text-sm font-semibold truncate group-hover:text-app-accent transition-colors font-display">
                    {chapter?.title ?? b.title}
                  </p>
                  <p className="text-[10px] text-app-muted mt-0.5 font-serif">{formatRelativeDay(b.createdAt)}</p>
                </button>
                <button
                  onClick={() => db.bookmarks.delete(b.id)}
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-app-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  aria-label="حذف"
                  title="حذف"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
