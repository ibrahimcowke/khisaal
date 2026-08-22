import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronLeft, Clock } from 'lucide-react'
import type { BookIndex } from '../../lib/bookData'
import { toArabicDigits } from '../../lib/format'
import { usePositionStore } from '../../store/positionStore'
import { useTranslation } from '../../lib/i18n'

export function ChapterGridExplorer({ index }: { index: BookIndex }) {
  const navigate = useNavigate()
  const { isRtl } = useTranslation()
  const position = usePositionStore()

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-app-text flex items-center gap-1.5">
          <BookOpen size={16} className="text-app-accent" />
          <span>{isRtl ? `أبواب وفصول الموسوعة (${toArabicDigits(index.chapters.length)} فصلاً)` : `Chapters & Sections (${index.chapters.length})`}</span>
        </h2>
        <button
          onClick={() => navigate(`/book/${index.book.id}`)}
          className="text-xs text-app-accent font-bold hover:underline flex items-center gap-0.5"
        >
          <span>{isRtl ? 'الفهرس الشامل' : 'Full Index'}</span>
          <ChevronLeft size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {index.chapters.slice(0, 6).map((chapter, i) => {
          const isCurrent = position.chapterId === chapter.id
          const wordCount = chapter.blocks.reduce(
            (acc, b) => acc + (b.text ?? (b.items ?? []).join(' ')).split(/\s+/).filter(Boolean).length,
            0
          )
          const estMinutes = Math.max(1, Math.ceil(wordCount / 160))

          return (
            <button
              key={chapter.id}
              onClick={() => navigate(`/book/${index.book.id}/read?c=${chapter.id}`)}
              className={`flex items-center justify-between p-4 rounded-2xl border text-right transition-all duration-200 group hover:shadow-md active:scale-98 shadow-xs ${
                isCurrent
                  ? 'bg-app-accent/10 border-app-accent/60 shadow-xs'
                  : 'bg-app-surface border-app-border hover:border-app-accent/50'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-display text-sm font-bold shadow-xs transition-transform group-hover:scale-105 ${
                    isCurrent
                      ? 'bg-app-accent text-white'
                      : 'bg-app-bg text-app-text-secondary group-hover:bg-app-accent/20 group-hover:text-app-accent'
                  }`}
                >
                  {toArabicDigits(i + 1)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-app-text truncate group-hover:text-app-accent transition-colors font-display">
                    {chapter.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-app-muted mt-0.5 font-serif">
                    <span>{toArabicDigits(chapter.blocks.length)} فقرات</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={10} />
                      {toArabicDigits(estMinutes)} د
                    </span>
                  </div>
                </div>
              </div>

              <ChevronLeft
                size={16}
                className="text-app-muted group-hover:text-app-accent group-hover:-translate-x-1 transition-all shrink-0 mr-1"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
