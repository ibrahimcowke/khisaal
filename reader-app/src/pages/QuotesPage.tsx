import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Quote, Star, Trash2, Share2, FolderPlus } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import type { Quote as QuoteType } from '../lib/types'
import { toArabicDigits, formatRelativeDay } from '../lib/format'
import { QuoteShareSheet } from '../components/quotes/QuoteShareSheet'
import { AddToCollectionSheet } from '../components/collections/AddToCollectionSheet'
import { PageHeader } from '../components/layout/PageHeader'

export default function QuotesPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const quotes = useLiveQuery(() => (index ? db.quotes.where('bookId').equals(index.book.id).reverse().sortBy('createdAt') : []), [index?.book.id])
  const [shareTarget, setShareTarget] = useState<QuoteType | null>(null)
  const [collectionTargetId, setCollectionTargetId] = useState<string | null>(null)

  if (loading || !index) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ التحميل...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title="الاقتباسات والدرر"
        count={quotes ? toArabicDigits(quotes.length) : undefined}
      />

      {!quotes || quotes.length === 0 ? (
        <div className="text-center py-20">
          <Quote size={32} className="mx-auto text-app-muted mb-3" />
          <p className="text-sm text-app-muted mb-1">لا توجد اقتباسات محفوظة بعد</p>
          <p className="text-xs text-app-muted">حدد أي نص أثناء القراءة واختر "اقتباس" لحفظه هنا</p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {quotes.map((q) => {
            const chapter = index.chapterById.get(q.chapterId)
            return (
              <li key={q.id} className="rounded-2xl bg-app-surface border border-app-border p-4 flex flex-col">
                <button onClick={() => navigate(`/book/${index.book.id}/read?c=${q.chapterId}`)} className="text-right flex-1">
                  <p className="font-display text-base leading-relaxed mb-2">"{q.text}"</p>
                  <p className="text-[11px] text-app-muted">{chapter?.title} · {formatRelativeDay(q.createdAt)}</p>
                </button>
                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-app-border">
                  <button
                    onClick={() => db.quotes.update(q.id, { favorite: !q.favorite })}
                    className={q.favorite ? 'h-8 w-8 rounded-full flex items-center justify-center text-app-accent' : 'h-8 w-8 rounded-full flex items-center justify-center text-app-muted hover:bg-black/5'}
                    aria-label="مفضلة"
                  >
                    <Star size={14} fill={q.favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => setCollectionTargetId(q.id)}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-app-muted hover:bg-black/5"
                    aria-label="إضافة إلى مجموعة"
                  >
                    <FolderPlus size={14} />
                  </button>
                  <button
                    onClick={() => setShareTarget(q)}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-app-muted hover:bg-black/5"
                    aria-label="مشاركة"
                  >
                    <Share2 size={14} />
                  </button>
                  <button
                    onClick={() => db.quotes.delete(q.id)}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-app-muted hover:text-red-600 hover:bg-red-50"
                    aria-label="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {shareTarget && (
        <QuoteShareSheet
          open={!!shareTarget}
          onOpenChange={(v) => !v && setShareTarget(null)}
          text={shareTarget.text}
          bookTitle={index.book.shortTitle}
          author={index.book.author}
          sourcePage={shareTarget.sourcePage}
        />
      )}
      {collectionTargetId && (
        <AddToCollectionSheet open={!!collectionTargetId} onOpenChange={(v) => !v && setCollectionTargetId(null)} itemId={collectionTargetId} />
      )}
    </div>
  )
}
