import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { BookOpen, Bookmark, List, ChevronLeft } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { usePositionStore } from '../store/positionStore'
import { overallProgress, estimateMinutes } from '../lib/bookData'
import { db, uid } from '../lib/db'
import { Button } from '../components/ui/Button'
import { toArabicDigits } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'

export default function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const { index, currentBookId, selectBook, loading } = useBook()
  const navigate = useNavigate()
  const position = usePositionStore()
  const [showFullToc, setShowFullToc] = useState(false)

  useEffect(() => {
    if (bookId && bookId !== currentBookId) {
      selectBook(bookId)
    }
  }, [bookId, currentBookId, selectBook])

  const bookmarked = useLiveQuery(
    () => (index ? db.bookmarks.where({ bookId: index.book.id, chapterId: '__book__' }).count() : 0),
    [index?.book.id]
  )

  if (loading || !index) {
    return (
      <div className="min-h-screen flex items-center justify-center text-app-text-secondary">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-app-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-app-muted">جارٍ تحميل بيانات الكتاب...</p>
        </div>
      </div>
    )
  }

  const { book, chapters } = index
  const progress = position.chapterId ? overallProgress(index, position.chapterId) : 0
  const minutesTotal = estimateMinutes(book.totalWords)
  const visibleChapters = showFullToc ? chapters : chapters.slice(0, 15)

  async function toggleBookBookmark() {
    if ((bookmarked ?? 0) > 0) {
      const existing = await db.bookmarks.where({ bookId: index!.book.id, chapterId: '__book__' }).toArray()
      await db.bookmarks.bulkDelete(existing.map((b) => b.id))
    } else {
      await db.bookmarks.add({
        id: uid('bm'),
        bookId: index!.book.id,
        chapterId: '__book__',
        blockId: '',
        title: index!.book.title,
        createdAt: Date.now(),
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-14 animate-fade-in">
      <PageHeader
        title="تفاصيل الكتاب والموسوعة"
        backTo="/library"
      />

      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-right mb-8 bg-app-surface p-6 rounded-3xl border border-app-border">
        {/* Cover */}
        <div className="w-36 h-52 sm:w-44 sm:h-60 shrink-0 rounded-2xl bg-gradient-to-br from-app-accent/25 via-app-surface to-app-accent/5 border border-app-border shadow-lg flex flex-col items-center justify-between p-4 relative overflow-hidden">
          <span className="text-xs text-app-accent font-bold opacity-60">❖</span>
          <span className="font-display text-5xl sm:text-6xl text-app-accent leading-none">
            {book.id === 'alkhisal-al-miatan' ? 'خ' : 'إ'}
          </span>
          <span className="text-[10px] text-app-text font-bold text-center truncate w-full">
            {book.shortTitle}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-app-text">{book.title}</h1>
          <p className="text-sm text-app-text-secondary mt-1.5">{book.subtitle}</p>
          <p className="text-sm text-app-accent font-bold mt-2.5">{book.author}</p>

          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4 text-xs text-app-text-secondary bg-app-bg/60 p-3 rounded-xl border border-app-border">
            <span>{toArabicDigits(book.totalSections)} فصول</span>
            <span>{toArabicDigits(book.sourcePageCount)} صفحة</span>
            <span>{toArabicDigits(minutesTotal)} دقيقة قراءة</span>
            <span>{toArabicDigits(book.totalWords)} كلمة</span>
          </div>

          {progress > 0 && (
            <div className="mt-4 max-w-xs mx-auto sm:mx-0">
              <div className="h-1.5 rounded-full bg-app-border overflow-hidden">
                <div className="h-full bg-app-accent" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-app-muted mt-1">{toArabicDigits(progress)}٪ مكتمل</p>
            </div>
          )}

          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-5">
            <Button onClick={() => navigate(`/book/${book.id}/read`)}>
              <BookOpen size={16} />
              اقرأ الآن
            </Button>
            <Button variant="outline" onClick={toggleBookBookmark}>
              <Bookmark size={16} fill={(bookmarked ?? 0) > 0 ? 'currentColor' : 'none'} />
              {(bookmarked ?? 0) > 0 ? 'محفوظ' : 'حفظ في المفضلة'}
            </Button>
          </div>
        </div>
      </div>

      <section className="mb-8 bg-app-surface p-6 rounded-3xl border border-app-border">
        <h2 className="text-sm font-bold text-app-text mb-2">نبذة عن الكتاب والموسوعة</h2>
        <p className="text-sm text-app-text-secondary leading-relaxed">{book.description}</p>
      </section>

      <section className="bg-app-surface p-6 rounded-3xl border border-app-border">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-app-border">
          <h2 className="text-sm font-bold text-app-text flex items-center gap-2">
            <List size={16} className="text-app-accent" />
            <span>فهرس الأبواب والفصول</span>
          </h2>
          <span className="text-xs text-app-muted">{toArabicDigits(chapters.length)} فصلاً</span>
        </div>
        <div className="rounded-2xl border border-app-border divide-y divide-app-border overflow-hidden bg-app-bg/30">
          {visibleChapters.map((c, i) => (
            <button
              key={c.id}
              onClick={() => navigate(`/book/${book.id}/read?c=${c.id}`)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-sm hover:bg-app-accent/5 transition-colors text-right group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-xs text-app-muted font-bold w-5 text-center shrink-0">
                  {toArabicDigits(i + 1)}
                </span>
                <span className="truncate group-hover:text-app-accent transition-colors font-medium">
                  {c.title}
                </span>
              </div>
              <span className="text-app-muted text-xs shrink-0 flex items-center gap-1">
                {toArabicDigits(c.sourcePageStart)}
                <ChevronLeft size={13} />
              </span>
            </button>
          ))}
        </div>
        {!showFullToc && chapters.length > 15 && (
          <button
            onClick={() => setShowFullToc(true)}
            className="w-full text-center text-sm text-app-accent py-3.5 font-bold hover:underline"
          >
            عرض كل الأبواب ({toArabicDigits(chapters.length)})
          </button>
        )}
      </section>
    </div>
  )
}
