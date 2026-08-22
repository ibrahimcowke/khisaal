import { useState } from 'react'
import { Copy, Share2, Check, ArrowLeft, ArrowRight, Sparkles, BookmarkPlus, Palette } from 'lucide-react'
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
      <div className="relative rounded-3xl bg-linear-to-br from-app-surface via-app-surface/98 to-rose-500/10 border-2 border-rose-500/25 p-5 sm:p-6 shadow-xs hover:border-rose-500/45 hover:shadow-md transition-all overflow-hidden space-y-3.5">
        {/* Decorative Arabesque Corner Mark */}
        <div className="absolute top-2 left-3 text-xs text-rose-500/40 select-none">❖ ❖ ❖</div>

        <div className="flex items-center justify-between mb-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-bold shadow-xs">
            <Sparkles size={13} />
            {isRtl ? 'درة اليوم الأدبية' : 'Literary Gem of the Day'}
          </span>
          <span className="text-xs text-app-text-secondary truncate max-w-44 font-serif">
            {pick.chapter.title}
          </span>
        </div>

        <div className="my-2 py-1">
          <p className="font-display text-lg sm:text-xl leading-relaxed text-app-text font-bold text-center px-2">
            «{pick.block.text}»
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-app-border/60 flex-wrap gap-2">
          <button
            onClick={() => navigate(`/book/${index.book.id}/read?c=${pick!.chapter.id}`)}
            className="text-xs font-bold text-app-accent flex items-center gap-1 hover:underline"
          >
            <span>{isRtl ? 'فتح في السياق' : 'Read in Context'}</span>
            {isRtl ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
          </button>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStudioOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-500 hover:text-white transition-all shadow-xs"
              title="تصميم ومشاركة بطاقة 4K فاخرة"
            >
              <Palette size={13} />
              <span>{isRtl ? 'استوديو البطاقات' : 'Design Poster'}</span>
            </button>
            <button
              onClick={handleCopy}
              className="h-8 w-8 rounded-xl flex items-center justify-center border border-app-border bg-app-surface text-app-text-secondary hover:text-app-accent hover:border-app-accent transition-colors shadow-xs"
              aria-label="نسخ"
              title="نسخ النص"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
            <button
              onClick={handleShare}
              className="h-8 w-8 rounded-xl flex items-center justify-center border border-app-border bg-app-surface text-app-text-secondary hover:text-app-accent hover:border-app-accent transition-colors shadow-xs"
              aria-label="مشاركة"
              title="مشاركة"
            >
              <Share2 size={14} />
            </button>
            <button
              onClick={handleSave}
              disabled={saved}
              className="px-3 py-1.5 rounded-xl bg-app-accent text-white text-xs font-bold flex items-center gap-1 hover:opacity-90 transition-opacity shadow-xs"
            >
              <BookmarkPlus size={13} />
              <span>{saved ? (isRtl ? 'تم الحفظ!' : 'Saved!') : (isRtl ? 'حفظ' : 'Save')}</span>
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
