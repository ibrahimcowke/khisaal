import { toArabicDigits } from '../../lib/format'
import type { Chapter } from '../../lib/types'

export function ChapterHeaderBanner({ chapter, chapterNumber }: { chapter: Chapter; chapterNumber: number }) {
  return (
    <div className="text-center pt-4 pb-8 mb-8 border-b border-app-border/40 relative">
      {/* Decorative Arabesque Top Ornament */}
      <div className="flex items-center justify-center gap-3 text-app-accent/70 mb-3 select-none">
        <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-app-accent/50 to-transparent" />
        <span className="font-display text-sm">❖ ﷽ ❖</span>
        <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-app-accent/50 to-transparent" />
      </div>

      {/* Chapter Number Badge */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-app-accent/10 border border-app-accent/25 text-app-accent text-xs font-bold mb-3 shadow-xs">
        <span>الفصل {toArabicDigits(chapterNumber)}</span>
        {chapter.wordCount > 0 && (
          <>
            <span className="opacity-40">·</span>
            <span>{toArabicDigits(chapter.wordCount)} كلمة</span>
          </>
        )}
      </div>

      {/* Main Chapter Title */}
      <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-app-text leading-relaxed px-2">
        {chapter.title}
      </h1>

      {/* Bottom Motif */}
      <div className="flex items-center justify-center gap-2 mt-4 text-app-accent/40 text-xs select-none">
        <span>☙</span>
        <span>•</span>
        <span>❧</span>
      </div>
    </div>
  )
}
