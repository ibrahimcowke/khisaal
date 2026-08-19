import { useState } from 'react'
import { Copy, Share2, Check, ArrowLeft, Sparkles, BookmarkPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { BookIndex } from '../../lib/bookData'
import { db, uid } from '../../lib/db'
import { QuoteCardModal } from '../reader/QuoteCardModal'

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
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cardModalOpen, setCardModalOpen] = useState(false)

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
      <div className="relative rounded-3xl bg-gradient-to-br from-app-accent/15 via-app-surface to-app-surface border-2 border-app-accent/30 p-6 shadow-sm overflow-hidden">
        {/* Decorative Arabesque Corner Mark */}
        <div className="absolute top-2 left-2 text-xs text-app-accent opacity-30 select-none">❖ ❖ ❖</div>

        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-app-accent/15 text-app-accent text-xs font-bold">
            <Sparkles size={13} />
            درة اليوم الأدبية
          </span>
          <span className="text-xs text-app-text-secondary truncate max-w-[150px]">
            {pick.chapter.title}
          </span>
        </div>

        <div className="my-3">
          <p className="font-display text-lg sm:text-xl leading-relaxed text-app-text font-bold text-center px-2">
            «{pick.block.text}»
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-app-border/60">
          <button
            onClick={() => navigate(`/book/${index.book.id}/read?c=${pick!.chapter.id}`)}
            className="text-xs font-medium text-app-accent flex items-center gap-1 hover:underline"
          >
            <span>فتح في السياق</span>
            <ArrowLeft size={13} />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCardModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-app-accent/15 text-app-accent text-xs font-bold flex items-center gap-1 hover:bg-app-accent/25 transition-colors"
              title="تصميم بطاقة اقتباس مصورة"
            >
              <Sparkles size={13} />
              <span>بطاقة</span>
            </button>
            <button
              onClick={handleCopy}
              className="h-8 w-8 rounded-xl flex items-center justify-center border border-app-border text-app-text-secondary hover:text-app-accent hover:border-app-accent transition-colors"
              aria-label="نسخ"
              title="نسخ النص"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
            <button
              onClick={handleShare}
              className="h-8 w-8 rounded-xl flex items-center justify-center border border-app-border text-app-text-secondary hover:text-app-accent hover:border-app-accent transition-colors"
              aria-label="مشاركة"
              title="مشاركة"
            >
              <Share2 size={14} />
            </button>
            <button
              onClick={handleSave}
              disabled={saved}
              className="px-3 py-1.5 rounded-xl bg-app-accent text-white text-xs font-bold flex items-center gap-1 hover:opacity-90 transition-opacity"
            >
              <BookmarkPlus size={13} />
              <span>{saved ? 'تم الحفظ!' : 'حفظ'}</span>
            </button>
          </div>
        </div>
      </div>

      <QuoteCardModal
        open={cardModalOpen}
        onOpenChange={setCardModalOpen}
        quoteText={pick.block.text ?? ''}
        sourceChapterTitle={pick.chapter.title}
      />
    </>
  )
}
