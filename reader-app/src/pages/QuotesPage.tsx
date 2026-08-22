import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Quote, Star, Trash2, Share2, FolderPlus } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import type { Quote as QuoteType } from '../lib/types'
import { formatRelativeDay } from '../lib/format'
import { QuoteShareSheet } from '../components/quotes/QuoteShareSheet'
import { AddToCollectionSheet } from '../components/collections/AddToCollectionSheet'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { useTranslation } from '../lib/i18n'

export default function QuotesPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const { t, isRtl, formatDigits } = useTranslation()
  const quotes = useLiveQuery(() => (index ? db.quotes.where('bookId').equals(index.book.id).reverse().sortBy('createdAt') : []), [index?.book.id])
  const [shareTarget, setShareTarget] = useState<QuoteType | null>(null)
  const [collectionTargetId, setCollectionTargetId] = useState<string | null>(null)

  if (loading || !index) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary text-sm">{t('loading')}</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title={t('quotes')}
        count={quotes ? formatDigits(quotes.length) : undefined}
      />

      {!quotes || quotes.length === 0 ? (
        <EmptyState
          icon={Quote}
          title={isRtl ? 'لا توجد اقتباسات محفوظة بعد' : 'No Saved Quotes Yet'}
          description={isRtl ? 'حدد أي نص أثناء القراءة واختر "اقتباس" لتصميمه ومشاركته وحفظه هنا.' : 'Save memorable quotes while reading to design cards and share them.'}
          actionLabel={t('readBook')}
          onAction={() => navigate(`/book/${index.book.id}/read`)}
        />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {quotes.map((q) => {
            const chapter = index.chapterById.get(q.chapterId)
            return (
              <li key={q.id} className="rounded-2xl bg-app-surface border border-app-border p-4 flex flex-col shadow-2xs hover:border-app-accent/50 transition-all">
                <button onClick={() => navigate(`/book/${index.book.id}/read?c=${q.chapterId}`)} className="text-right flex-1 cursor-pointer">
                  <p className="font-display text-sm sm:text-base leading-relaxed mb-2 text-app-text font-bold">«{q.text}»</p>
                  <p className="text-[10px] text-app-muted font-serif">{chapter?.title} · {formatRelativeDay(q.createdAt)}</p>
                </button>
                <div className="flex items-center justify-end gap-1 mt-3 pt-2.5 border-t border-app-border/40">
                  <button
                    onClick={() => db.quotes.update(q.id, { favorite: !q.favorite })}
                    className={q.favorite ? 'h-7 w-7 rounded-xl flex items-center justify-center text-app-accent bg-app-accent/10 cursor-pointer' : 'h-7 w-7 rounded-xl flex items-center justify-center text-app-muted hover:bg-black/5 cursor-pointer'}
                    aria-label={isRtl ? 'مفضلة' : 'Favorite'}
                    title={isRtl ? 'مفضلة' : 'Favorite'}
                  >
                    <Star size={13} fill={q.favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => setCollectionTargetId(q.id)}
                    className="h-7 w-7 rounded-xl flex items-center justify-center text-app-muted hover:bg-black/5 cursor-pointer"
                    aria-label={isRtl ? 'إضافة إلى مجموعة' : 'Add to Collection'}
                    title={isRtl ? 'إضافة إلى مجموعة' : 'Add to Collection'}
                  >
                    <FolderPlus size={13} />
                  </button>
                  <button
                    onClick={() => setShareTarget(q)}
                    className="h-7 w-7 rounded-xl flex items-center justify-center text-app-muted hover:bg-black/5 cursor-pointer"
                    aria-label={isRtl ? 'مشاركة' : 'Share'}
                    title={isRtl ? 'مشاركة' : 'Share'}
                  >
                    <Share2 size={13} />
                  </button>
                  <button
                    onClick={() => db.quotes.delete(q.id)}
                    className="h-7 w-7 rounded-xl flex items-center justify-center text-app-muted hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    aria-label={isRtl ? 'حذف' : 'Delete'}
                    title={isRtl ? 'حذف' : 'Delete'}
                  >
                    <Trash2 size={13} />
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
