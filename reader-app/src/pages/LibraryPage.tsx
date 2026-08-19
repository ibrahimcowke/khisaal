import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, List as ListIcon, BookOpen, ChevronLeft, Sparkles } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { toArabicDigits } from '../lib/format'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/layout/PageHeader'
import type { BookData } from '../lib/types'

export default function LibraryPage() {
  const { allBooks, currentBookId, selectBook, loading } = useBook()
  const navigate = useNavigate()
  const [view, setView] = useState<'grid' | 'list'>('grid')

  if (loading && allBooks.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ تحميل المكتبة...</div>
  }

  const handleOpenBook = async (book: BookData) => {
    await selectBook(book.book.id)
    navigate(`/book/${book.book.id}`)
  }

  const handleReadBook = async (book: BookData, e: React.MouseEvent) => {
    e.stopPropagation()
    await selectBook(book.book.id)
    navigate(`/book/${book.book.id}/read`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-14 animate-fade-in">
      <PageHeader
        title="المكتبة وموسوعات الأدب"
        subtitle="جامع روائع الحكم والمنظومات الأخلاقية والأدبية"
        count={`${toArabicDigits(allBooks.length)} كتب`}
        actions={
          <div className="flex items-center gap-1 rounded-xl border border-app-border p-1 bg-app-surface">
            <button
              onClick={() => setView('grid')}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                view === 'grid' ? 'bg-app-accent text-white' : 'text-app-text-secondary hover:text-app-text'
              }`}
              title="عرض شبكي"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                view === 'list' ? 'bg-app-accent text-white' : 'text-app-text-secondary hover:text-app-text'
              }`}
              title="عرض قائمة"
            >
              <ListIcon size={16} />
            </button>
          </div>
        }
      />

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {allBooks.map((b) => {
            const isCurrent = currentBookId === b.book.id
            return (
              <div
                key={b.book.id}
                onClick={() => handleOpenBook(b)}
                className={`rounded-3xl border p-5 sm:p-6 transition-all cursor-pointer group hover:shadow-xl ${
                  isCurrent
                    ? 'bg-app-surface border-app-accent ring-2 ring-app-accent/20'
                    : 'bg-app-surface border-app-border hover:border-app-accent/60'
                }`}
              >
                <div className="flex gap-5 items-start">
                  {/* Decorative Cover */}
                  <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-2xl bg-gradient-to-br from-app-accent/25 via-app-surface to-app-accent/5 border border-app-border shadow-md flex flex-col items-center justify-between p-3 shrink-0 relative overflow-hidden group-hover:scale-103 transition-transform">
                    <span className="text-[10px] text-app-accent font-bold opacity-60">❖</span>
                    <span className="font-display text-4xl text-app-accent leading-none">
                      {b.book.id === 'alkhisal-al-miatan' ? 'خ' : 'إ'}
                    </span>
                    <span className="text-[9px] text-app-text-secondary font-bold text-center truncate w-full">
                      {b.book.shortTitle}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between h-36 sm:h-40">
                    <div>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-app-accent bg-app-accent/10 px-2 py-0.5 rounded-full mb-1.5">
                          <Sparkles size={11} /> الكتاب النشط
                        </span>
                      )}
                      <h3 className="font-display text-lg sm:text-xl font-bold text-app-text line-clamp-2 leading-snug group-hover:text-app-accent transition-colors">
                        {b.book.title}
                      </h3>
                      <p className="text-xs text-app-accent font-medium mt-1 truncate">
                        {b.book.author}
                      </p>
                      <p className="text-xs text-app-text-secondary line-clamp-2 mt-2 leading-relaxed">
                        {b.book.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-app-muted">
                        {toArabicDigits(b.book.totalSections)} فصول · {toArabicDigits(b.book.totalWords)} كلمة
                      </span>
                      <Button
                        size="sm"
                        onClick={(e) => handleReadBook(b, e)}
                        className="gap-1.5"
                      >
                        <BookOpen size={14} />
                        <span>قراءة</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {allBooks.map((b) => (
            <div
              key={b.book.id}
              onClick={() => handleOpenBook(b)}
              className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-20 rounded-xl bg-gradient-to-br from-app-accent/25 to-app-accent/5 border border-app-border flex items-center justify-center shrink-0 font-display text-2xl text-app-accent">
                  {b.book.id === 'alkhisal-al-miatan' ? 'خ' : 'إ'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-base sm:text-lg font-bold text-app-text truncate group-hover:text-app-accent transition-colors">
                    {b.book.title}
                  </h3>
                  <p className="text-xs text-app-text-secondary truncate mt-0.5">{b.book.author}</p>
                  <p className="text-[11px] text-app-muted mt-1">
                    {toArabicDigits(b.book.totalSections)} فصول · {toArabicDigits(b.book.sourcePageCount)} صفحة
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" onClick={(e) => handleReadBook(b, e)}>
                  <BookOpen size={14} />
                  <span>قراءة</span>
                </Button>
                <ChevronLeft size={16} className="text-app-muted" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
