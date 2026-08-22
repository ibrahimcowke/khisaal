import { useState } from 'react'
import { Copy, Share2, Check, ArrowLeft, ArrowRight, BookmarkPlus, Palette, Quote } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { BookIndex } from '../../lib/bookData'
import { db, uid } from '../../lib/db'
import { QuoteStudioModal } from '../quotes/QuoteStudioModal'
import { useTranslation } from '../../lib/i18n'

function pickDailyBlock(index: BookIndex) {
  const paragraphs = index.chapters.flatMap((c) =>
    c.blocks
      .filter((b) => b.type === 'paragraph' && (b.text?.length ?? 0) > 40 && (b.text?.length ?? 0) < 260)
      .map((b) => ({ block: b, chapter: c }))
  )
  if (paragraphs.length === 0) return null
  const dayNumber = Math.floor(Date.now() / 86400000)
  const idx = dayNumber % paragraphs.length
  return paragraphs[idx]
}

export function QuoteOfDayCard({ index }: { index: BookIndex }) {
  const navigate = useNavigate()
  const { isRtl } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [studioOpen, setStudioOpen] = useState(false)

  const pick = pickDailyBlock(index)
  if (!pick) return null

  async function handleCopy() {
    await navigator.clipboard.writeText(pick!.block.text ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: `«${pick!.block.text}»\n— ${index.book.title}` })
      } catch {
        /* cancelled */
      }
    } else {
      handleCopy()
    }
  }

  async function handleSave() {
    await db.quotes.add({
      id: uid('quote'),
      bookId: index.book.id,
      chapterId: pick!.chapter.id,
      text: pick!.block.text ?? '',
      sourcePage: pick!.block.sourcePage,
      tags: ['حكمة اليوم'],
      favorite: true,
      createdAt: Date.now(),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <div className="relative rounded-3xl bg-app-surface border border-app-border p-5 sm:p-6 shadow-2xs hover:border-app-accent/50 transition-all space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-app-accent/10 text-app-accent text-xs font-bold">
            <Quote size={12} />
            {isRtl ? 'حكمة ودرّة أدبية' : 'Daily Literary Gem'}
          </span>
          <span className="text-xs text-app-text-secondary truncate max-w-48 font-serif font-medium">
            {pick.chapter.title}
          </span>
        </div>

        <div className="my-2 py-1 text-center">
          <p className="font-display text-base sm:text-lg leading-relaxed text-app-text font-bold px-2 max-w-2xl mx-auto">
            «{pick.block.text}»
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-app-border/50 flex-wrap gap-2">
          <button
            onClick={() => navigate(`/book/${index.book.id}/read?c=${pick!.chapter.id}`)}
            className="text-xs font-semibold text-app-accent flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>{isRtl ? 'قراءة في السياق' : 'Read in Context'}</span>
            {isRtl ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
          </button>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStudioOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-app-accent/10 text-app-accent text-xs font-semibold flex items-center gap-1 hover:bg-app-accent/20 transition-all cursor-pointer"
              title="تصميم ومشاركة بطاقة"
            >
              <Palette size={12} />
              <span>{isRtl ? 'تصميم بطاقة' : 'Card Poster'}</span>
            </button>
            <button
              onClick={handleCopy}
              className="h-7 w-7 rounded-xl flex items-center justify-center border border-app-border bg-app-surface text-app-text-secondary hover:text-app-accent hover:border-app-accent transition-colors cursor-pointer"
              aria-label="نسخ"
              title="نسخ"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
            <button
              onClick={handleShare}
              className="h-7 w-7 rounded-xl flex items-center justify-center border border-app-border bg-app-surface text-app-text-secondary hover:text-app-accent hover:border-app-accent transition-colors cursor-pointer"
              aria-label="مشاركة"
              title="مشاركة"
            >
              <Share2 size={13} />
            </button>
            <button
              onClick={handleSave}
              disabled={saved}
              className="px-2.5 py-1 rounded-xl bg-app-accent text-white text-xs font-semibold flex items-center gap-1 hover:bg-app-accent-hover transition-opacity cursor-pointer disabled:opacity-50"
            >
              <BookmarkPlus size={12} />
              <span>{saved ? (isRtl ? 'تم الحفظ' : 'Saved') : (isRtl ? 'حفظ' : 'Save')}</span>
            </button>
          </div>
        </div>
      </div>

      <QuoteStudioModal
        open={studioOpen}
        onOpenChange={setStudioOpen}
        quoteText={pick.block.text ?? ''}
        sourceChapterTitle={pick.chapter.title}
        bookTitle={index.book.title}
      />
    </>
  )
}
