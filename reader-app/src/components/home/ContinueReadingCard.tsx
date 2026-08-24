import { useNavigate } from 'react-router-dom'
import { BookOpen, Library, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import type { BookIndex } from '../../lib/bookData'
import { estimateMinutes, overallProgress as computeOverallProgress } from '../../lib/bookData'
import { usePositionStore } from '../../store/positionStore'
import { toArabicDigits } from '../../lib/format'
import { Button } from '../ui/Button'
import { useBook } from '../../context/BookContext'
import { useTranslation } from '../../lib/i18n'

export function ContinueReadingCard({ index }: { index: BookIndex }) {
  const navigate = useNavigate()
  const { isRtl, formatDigits } = useTranslation()
  const { allBooks, selectBook } = useBook()
  const position = usePositionStore()
  const chapterId =
    position.chapterId && index.chapterById.has(position.chapterId)
      ? position.chapterId
      : index.chapters[0]?.id || ''
  const chapter = index.chapterById.get(chapterId) || index.chapters[0]
  const progress = computeOverallProgress(index, chapterId)

  const blockIdx = position.blockId
    ? chapter.blocks.findIndex((b) => b.id === position.blockId)
    : 0
  const remainingWords = chapter.blocks
    .slice(Math.max(0, blockIdx))
    .reduce(
      (acc, b) =>
        acc +
        (b.text ?? (b.items ?? []).join(' ')).split(/\s+/).filter(Boolean).length,
      0
    )
  const minutesLeft = estimateMinutes(remainingWords)

  const handleOpenReader = () => {
    navigate(`/book/${index.book.id}/read?c=${chapterId}`)
  }

  return (
    <section className="space-y-3">
      {/* Book Switcher Tabs */}
      {allBooks.length > 1 && (
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-app-surface border border-app-border/80 shadow-2xs overflow-x-auto no-scrollbar">
            {allBooks.map((b) => {
              const active = b.book.id === index.book.id
              return (
                <button
                  key={b.book.id}
                  onClick={() => selectBook(b.book.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-app-accent text-white font-bold shadow-xs'
                      : 'text-app-text-secondary hover:text-app-text hover:bg-app-accent/10'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} className={active ? 'text-white' : 'text-app-accent'} />
                    <span>{b.book.shortTitle}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                        active ? 'bg-white/20 text-white' : 'bg-app-accent/10 text-app-accent'
                      }`}
                    >
                      {formatDigits(b.chapters.length)}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => navigate('/library')}
            className="text-xs text-app-accent font-semibold hover:underline flex items-center gap-1 shrink-0 cursor-pointer px-2 py-1 rounded-xl hover:bg-app-accent/10 transition-colors"
          >
            <Library size={13} />
            <span>{isRtl ? 'المكتبة' : 'Library'}</span>
          </button>
        </div>
      )}

      {/* Flagship Hero Card */}
      <div
        onClick={handleOpenReader}
        className="w-full text-right rounded-3xl bg-app-surface border-2 border-app-accent/30 p-5 sm:p-7 flex flex-col sm:flex-row gap-5 sm:gap-6 items-stretch sm:items-center hover:border-app-accent hover:shadow-md transition-all duration-200 cursor-pointer group shadow-xs relative overflow-hidden"
      >
        {/* Editorial Book Spine Visual */}
        <div className="shrink-0 flex sm:flex-col items-center justify-between sm:justify-center gap-2 w-full sm:w-24 sm:h-32 rounded-2xl bg-linear-to-b from-app-accent/15 via-app-surface to-app-accent/5 border border-app-accent/25 p-3 shadow-2xs group-hover:scale-[1.02] transition-transform duration-200">
          <span className="text-xs text-app-accent font-bold font-display">❖</span>
          <span className="font-display text-3xl sm:text-4xl font-bold text-app-accent my-auto">
            {index.book.id === 'alkhisal-al-miatan' ? 'خ' : 'إ'}
          </span>
          <span className="text-[10px] text-app-text-secondary font-medium text-center truncate w-full">
            {index.book.shortTitle}
          </span>
        </div>

        {/* Book Context & Chapter Info */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-app-accent/10 text-app-accent border border-app-accent/20">
              {isRtl ? 'الكتاب المفتوح' : 'Active Book'}
            </span>
            <span className="text-[11px] text-app-muted flex items-center gap-1 font-serif">
              <Clock size={11} />
              {formatDigits(minutesLeft)} {isRtl ? 'دقيقة متبقية' : 'mins remaining'}
            </span>
          </div>

          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-app-text group-hover:text-app-accent transition-colors truncate">
              {index.book.title}
            </h2>
            <p className="text-sm font-semibold text-app-accent truncate mt-0.5">
              {chapter.title}
            </p>
          </div>

          {/* Progress Bar & Reading Metric */}
          <div className="space-y-1.5 pt-1">
            <div className="h-2 rounded-full bg-app-border/80 overflow-hidden">
              <div
                className="h-full bg-app-accent rounded-full transition-all duration-300"
                style={{ width: `${Math.max(4, progress)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-app-text-secondary">
              <span>{isRtl ? `${toArabicDigits(progress)}٪ منجز من الكتاب` : `${progress}% completed`}</span>
              <span className="text-app-accent font-semibold group-hover:underline flex items-center gap-1">
                <span>{isRtl ? 'اقرأ الآن' : 'Read Now'}</span>
                {isRtl ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="shrink-0 hidden md:block">
          <Button size="lg" className="pointer-events-none gap-2 shadow-xs group-hover:bg-app-accent-hover">
            <BookOpen size={17} />
            <span>{isRtl ? 'متابعة القراءة' : 'Continue'}</span>
          </Button>
        </div>
      </div>
    </section>
  )
}
