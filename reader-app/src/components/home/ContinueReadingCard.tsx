import { useNavigate } from 'react-router-dom'
import { BookOpen, Library, Sparkles, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import type { BookIndex } from '../../lib/bookData'
import { estimateMinutes, overallProgress as computeOverallProgress } from '../../lib/bookData'
import { usePositionStore } from '../../store/positionStore'
import { toArabicDigits } from '../../lib/format'
import { Button } from '../ui/Button'
import { useBook } from '../../context/BookContext'
import { useTranslation } from '../../lib/i18n'

export function ContinueReadingCard({ index }: { index: BookIndex }) {
  const navigate = useNavigate()
  const { isRtl } = useTranslation()
  const { allBooks, selectBook } = useBook()
  const position = usePositionStore()
  const chapterId = position.chapterId && index.chapterById.has(position.chapterId) ? position.chapterId : index.chapters[0]?.id || ''
  const chapter = index.chapterById.get(chapterId) || index.chapters[0]
  const progress = computeOverallProgress(index, chapterId)

  const blockIdx = position.blockId ? chapter.blocks.findIndex((b) => b.id === position.blockId) : 0
  const remainingWords = chapter.blocks
    .slice(Math.max(0, blockIdx))
    .reduce((acc, b) => acc + (b.text ?? (b.items ?? []).join(' ')).split(/\s+/).filter(Boolean).length, 0)
  const minutesLeft = estimateMinutes(remainingWords)

  return (
    <div className="space-y-3">
      {/* Book Switcher Header Strip */}
      {allBooks.length > 1 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {allBooks.map((b) => {
              const active = b.book.id === index.book.id
              return (
                <button
                  key={b.book.id}
                  onClick={() => selectBook(b.book.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-xs ${
                    active
                      ? 'bg-app-accent text-white border-app-accent shadow-xs'
                      : 'bg-app-surface text-app-text-secondary border-app-border hover:border-app-accent hover:text-app-accent'
                  }`}
                >
                  <span className="opacity-80">📖</span>
                  <span>{b.book.shortTitle}</span>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => navigate('/library')}
            className="text-xs text-app-accent font-bold hover:underline flex items-center gap-1 shrink-0 mr-2"
          >
            <Library size={13} />
            <span>{isRtl ? 'كل الكتب' : 'All Books'}</span>
          </button>
        </div>
      )}

      {/* Main Flagship Reading Card */}
      <div
        onClick={() => navigate(`/book/${index.book.id}/read?c=${chapterId}`)}
        className="w-full text-right rounded-3xl bg-linear-to-br from-app-surface via-app-surface/98 to-app-accent/10 border-2 border-app-accent/25 p-5 sm:p-7 flex flex-col sm:flex-row gap-5 items-stretch sm:items-center hover:border-app-accent/50 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
      >
        {/* Ambient background ornament */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-app-accent/5 rounded-full blur-3xl pointer-events-none" />

        {/* Book Visual Mockup */}
        <div className="shrink-0 flex sm:flex-col items-center justify-between sm:justify-center gap-3 w-full sm:w-28 sm:h-36 rounded-2xl bg-linear-to-b from-app-accent/20 via-app-surface to-app-accent/10 border border-app-accent/30 p-3 shadow-md relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <span className="text-xs text-app-accent font-bold">❖</span>
            <span className="text-[10px] uppercase font-bold text-app-accent/80 tracking-wider bg-app-accent/15 px-2 py-0.5 rounded-full">
              كتاب
            </span>
          </div>

          <div className="my-auto text-center py-1">
            <span className="font-display text-3xl sm:text-4xl font-bold text-app-accent block">
              {index.book.id === 'alkhisal-al-miatan' ? 'خ' : 'إ'}
            </span>
          </div>

          <span className="text-[10px] text-app-text font-bold text-center truncate w-full">
            {index.book.shortTitle}
          </span>
        </div>

        {/* Book & Chapter Details */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-app-accent/10 text-app-accent text-[11px] font-bold">
              <Sparkles size={11} />
              {isRtl ? 'استئناف القراءة' : 'Continue Reading'}
            </span>
            <span className="text-[11px] text-app-muted flex items-center gap-1 font-serif">
              <Clock size={11} />
              {toArabicDigits(minutesLeft)} دقيقة متبقية
            </span>
          </div>

          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold truncate text-app-text group-hover:text-app-accent transition-colors">
              {index.book.title}
            </h3>
            <p className="text-sm font-semibold text-app-accent truncate mt-0.5 font-serif">
              {chapter.title}
            </p>
          </div>

          {/* Progress Bar & Badges */}
          <div className="space-y-1.5 pt-1">
            <div className="h-2 rounded-full bg-app-border/80 overflow-hidden shadow-inner">
              <div
                className="h-full bg-linear-to-r from-app-accent to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, progress)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-app-text-secondary">
              <span>{toArabicDigits(progress)}٪ منجز من الكتاب</span>
              <span className="text-app-accent font-bold group-hover:underline flex items-center gap-1">
                <span>{isRtl ? 'اقرأ الآن' : 'Read Now'}</span>
                {isRtl ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
              </span>
            </div>
          </div>
        </div>

        {/* CTA Action Button */}
        <div className="shrink-0 hidden md:block">
          <Button size="lg" className="pointer-events-none gap-2 shadow-md group-hover:bg-app-accent/90">
            <BookOpen size={18} />
            <span>{isRtl ? 'متابعة' : 'Resume'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
