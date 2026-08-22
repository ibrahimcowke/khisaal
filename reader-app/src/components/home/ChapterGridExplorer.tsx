import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import type { BookIndex } from '../../lib/bookData'
import { usePositionStore } from '../../store/positionStore'
import { useTranslation } from '../../lib/i18n'

export function ChapterGridExplorer({ index }: { index: BookIndex }) {
  const navigate = useNavigate()
  const { isRtl, formatDigits } = useTranslation()
  const position = usePositionStore()

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs sm:text-sm font-bold text-app-text font-display flex items-center gap-1.5">
          <BookOpen size={15} className="text-app-accent" />
          <span>
            {isRtl
              ? `أبواب وفصول الكتاب (${formatDigits(index.chapters.length)} فصلاً)`
              : `Book Chapters & Sections (${index.chapters.length})`}
          </span>
        </h2>
        <button
          onClick={() => navigate(`/book/${index.book.id}`)}
          className="text-xs text-app-accent font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>{isRtl ? 'الفهرس الشامل' : 'Full Index'}</span>
          <ChevronIcon size={13} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {index.chapters.slice(0, 6).map((chapter, i) => {
          const isCurrent = position.chapterId === chapter.id
          const wordCount = chapter.blocks.reduce(
            (acc, b) =>
              acc +
              (b.text ?? (b.items ?? []).join(' ')).split(/\s+/).filter(Boolean).length,
            0
          )
          const estMinutes = Math.max(1, Math.ceil(wordCount / 160))

          return (
            <button
              key={chapter.id}
              onClick={() => navigate(`/book/${index.book.id}/read?c=${chapter.id}`)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border text-right transition-all duration-150 group hover:shadow-xs active:scale-[0.99] shadow-2xs cursor-pointer ${
                isCurrent
                  ? 'bg-app-accent/10 border-app-accent/60'
                  : 'bg-app-surface border-app-border hover:border-app-accent/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-display text-xs font-bold transition-transform group-hover:scale-105 ${
                    isCurrent
                      ? 'bg-app-accent text-white shadow-2xs'
                      : 'bg-app-bg text-app-text-secondary group-hover:bg-app-accent/15 group-hover:text-app-accent'
                  }`}
                >
                  {formatDigits(i + 1)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-app-text truncate group-hover:text-app-accent transition-colors font-display">
                    {chapter.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-app-muted mt-0.5 font-serif">
                    <span>{formatDigits(chapter.blocks.length)} {isRtl ? 'فقرات' : 'sections'}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={10} />
                      {formatDigits(estMinutes)} {isRtl ? 'د' : 'm'}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronIcon
                size={14}
                className="text-app-muted group-hover:text-app-accent transition-transform shrink-0"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
