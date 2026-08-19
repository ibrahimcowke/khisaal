import { ChevronLeft, CheckCircle2, List, BookOpen } from 'lucide-react'
import type { Chapter } from '../../lib/types'
import { toArabicDigits } from '../../lib/format'
import { Button } from '../ui/Button'

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
  return (
    <div className="mt-16 mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-app-surface via-app-surface to-app-accent/10 border-2 border-app-border/80 text-center shadow-sm relative overflow-hidden">
      {/* Decorative background mark */}
      <div className="absolute top-2 left-2 text-xs text-app-accent/20 select-none">❖ ❖ ❖</div>

      <div className="w-12 h-12 rounded-full bg-app-accent/15 text-app-accent flex items-center justify-center mx-auto mb-3">
        <CheckCircle2 size={24} />
      </div>

      <p className="text-xs font-bold text-app-accent mb-1">اكتمل قراءة هذا الفصل بحمد الله</p>

      {nextChapter ? (
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <p className="text-xs text-app-text-secondary">الفصل التالي:</p>
            <h3 className="font-display text-lg sm:text-xl font-bold text-app-text mt-1">
              {nextChapter.title}
            </h3>
            <p className="text-[11px] text-app-muted mt-0.5">
              {toArabicDigits(nextChapter.blocks.length)} فقرات · {toArabicDigits(nextChapter.wordCount)} كلمة
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Button size="lg" onClick={onNext} className="w-full sm:w-auto gap-2">
              <span>الانتقال للفصل التالي</span>
              <ChevronLeft size={16} />
            </Button>
            <Button size="lg" variant="outline" onClick={onOpenToc} className="w-full sm:w-auto gap-2">
              <List size={16} />
              <span>فهرس الأبواب</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-w-md mx-auto">
          <h3 className="font-display text-xl font-bold text-app-text">
            تهانينا! أتممت قراءة الكتاب كاملاً 🎉
          </h3>
          <p className="text-xs text-app-text-secondary">
            نسأل الله أن ينفعك بما قرأت وأن يجعله حجة لك لا عليك.
          </p>
          <Button size="md" onClick={onOpenToc} className="gap-2 mx-auto">
            <BookOpen size={16} />
            <span>العودة للفهرس</span>
          </Button>
        </div>
      )}
    </div>
  )
}
