import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronLeft } from 'lucide-react'
import type { BookIndex } from '../../lib/bookData'
import { toArabicDigits } from '../../lib/format'
import { usePositionStore } from '../../store/positionStore'

export function ChapterGridExplorer({ index }: { index: BookIndex }) {
  const navigate = useNavigate()
  const position = usePositionStore()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-app-text-secondary flex items-center gap-1.5">
          <BookOpen size={16} className="text-app-accent" />
          <span>أبواب وفصول الكتاب ({toArabicDigits(index.chapters.length)} فصلاً)</span>
        </h2>
        <button
          onClick={() => navigate(`/book/${index.book.id}`)}
          className="text-xs text-app-accent font-medium hover:underline flex items-center gap-0.5"
        >
          <span>عرض الفهرس الكامل</span>
          <ChevronLeft size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {index.chapters.slice(0, 6).map((chapter, i) => {
          const isCurrent = position.chapterId === chapter.id
          const wordCount = chapter.blocks.reduce(
            (acc, b) => acc + (b.text ?? (b.items ?? []).join(' ')).split(/\s+/).filter(Boolean).length,
            0
          )

          return (
            <button
              key={chapter.id}
              onClick={() => navigate(`/book/${index.book.id}/read?c=${chapter.id}`)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border text-right transition-all group hover:shadow-md ${
                isCurrent
                  ? 'bg-app-accent/10 border-app-accent'
                  : 'bg-app-surface border-app-border hover:border-app-accent/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-display text-sm font-bold ${
                    isCurrent
                      ? 'bg-app-accent text-white'
                      : 'bg-app-bg text-app-text-secondary group-hover:bg-app-accent/20 group-hover:text-app-accent'
                  }`}
                >
                  {toArabicDigits(i + 1)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-app-text truncate group-hover:text-app-accent transition-colors">
                    {chapter.title}
                  </h4>
                  <p className="text-[11px] text-app-text-secondary mt-0.5">
                    {toArabicDigits(chapter.blocks.length)} فقرات · {toArabicDigits(wordCount)} كلمة
                  </p>
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
