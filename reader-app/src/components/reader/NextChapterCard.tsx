import { ChevronLeft, ChevronRight, CheckCircle2, List, BookOpen } from 'lucide-react'
import type { Chapter } from '../../lib/types'
import { Button } from '../ui/Button'
import { useTranslation } from '../../lib/i18n'

export function NextChapterCard({
  nextChapter,
  onNext,
  onOpenToc,
}: {
  nextChapter: Chapter | null
  onNext: () => void
  onOpenToc: () => void
  isLastChapter?: boolean
}) {
  const { isRtl, formatDigits } = useTranslation()
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <div className="mt-12 mb-8 p-6 sm:p-8 rounded-3xl bg-app-surface border border-app-border text-center shadow-xs relative overflow-hidden">
      <div className="w-10 h-10 rounded-2xl bg-app-accent/10 text-app-accent flex items-center justify-center mx-auto mb-3 shadow-2xs">
        <CheckCircle2 size={20} />
      </div>

      <p className="text-xs font-bold text-app-accent mb-1 font-display">
        {isRtl ? 'اكتملت قراءة هذا الباب بحمد الله' : 'Chapter Completed'}
      </p>

      {nextChapter ? (
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <p className="text-xs text-app-text-secondary">{isRtl ? 'الباب التالي:' : 'Next Chapter:'}</p>
            <h3 className="font-display text-lg sm:text-xl font-bold text-app-text mt-1">
              {nextChapter.title}
            </h3>
            <p className="text-[11px] text-app-muted mt-0.5 font-serif">
              {formatDigits(nextChapter.blocks.length)} {isRtl ? 'فقرات' : 'sections'} · {formatDigits(nextChapter.wordCount)} {isRtl ? 'كلمة' : 'words'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Button size="md" onClick={onNext} className="w-full sm:w-auto gap-2">
              <span>{isRtl ? 'الانتقال للباب التالي' : 'Next Chapter'}</span>
              <ChevronIcon size={15} />
            </Button>
            <Button size="md" variant="outline" onClick={onOpenToc} className="w-full sm:w-auto gap-2">
              <List size={15} />
              <span>{isRtl ? 'فهرس الأبواب' : 'Table of Contents'}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-w-md mx-auto">
          <h3 className="font-display text-xl font-bold text-app-text">
            {isRtl ? 'تهانينا! أتممت قراءة الكتاب كاملاً 🎉' : 'Congratulations! Book Completed 🎉'}
          </h3>
          <p className="text-xs text-app-text-secondary">
            {isRtl ? 'نسأل الله أن ينفعك بما قرأت وأن يجعله زاداً مباركاً.' : 'May this knowledge be fruitful and inspiring.'}
          </p>
          <Button size="md" onClick={onOpenToc} className="gap-2 mx-auto">
            <BookOpen size={15} />
            <span>{isRtl ? 'العودة للفهرس' : 'Back to Index'}</span>
          </Button>
        </div>
      )}
    </div>
  )
}
