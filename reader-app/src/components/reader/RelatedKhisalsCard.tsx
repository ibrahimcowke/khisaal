import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowLeft, Tag, ChevronDown } from 'lucide-react'
import type { Chapter } from '../../lib/types'
import { toArabicDigits } from '../../lib/format'
import { useTranslation } from '../../lib/i18n'
import { cn } from '../../lib/cn'

interface RelatedKhisalsCardProps {
  currentChapter: Chapter
  allChapters: Chapter[]
  onSelectChapter: (chapterId: string) => void
}

export function RelatedKhisalsCard({
  currentChapter,
  allChapters,
  onSelectChapter,
}: RelatedKhisalsCardProps) {
  const { isRtl } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  // Keep collapsed by default on every chapter change unless explicitly toggled by user
  useEffect(() => {
    setExpanded(false)
  }, [currentChapter.id])

  const related = useMemo(() => {
    if (!currentChapter || !allChapters || allChapters.length <= 1) return []

    const currentTags = new Set(currentChapter.tags || [])

    // Score each other chapter by overlapping tags
    const scored = allChapters
      .filter((c) => c.id !== currentChapter.id)
      .map((c) => {
        let score = 0
        const matchedTags: string[] = []
        for (const tag of c.tags || []) {
          if (currentTags.has(tag)) {
            score++
            matchedTags.push(tag)
          }
        }
        return { chapter: c, score, matchedTags }
      })

    // Sort by highest score
    scored.sort((a, b) => b.score - a.score)

    // Take top 3 with positive score, or fallback to nearest chapters if no tag matches
    let top = scored.filter((s) => s.score > 0).slice(0, 3)
    if (top.length < 3) {
      const remaining = 3 - top.length
      const currentIdx = allChapters.findIndex((c) => c.id === currentChapter.id)
      const nearby = allChapters
        .filter((c, idx) => c.id !== currentChapter.id && !top.some((t) => t.chapter.id === c.id) && Math.abs(idx - currentIdx) <= 3)
        .slice(0, remaining)
        .map((c) => ({ chapter: c, score: 0, matchedTags: (c.tags || []).slice(0, 2) }))
      top = [...top, ...nearby]
    }

    return top
  }, [currentChapter, allChapters])

  if (related.length === 0) return null

  return (
    <div className="my-6 rounded-2xl sm:rounded-3xl bg-linear-to-br from-app-accent/5 via-app-surface to-app-accent/10 border border-app-accent/20 p-3.5 sm:p-5 shadow-2xs transition-all">
      {/* Collapsed Header / Toggle Trigger */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-right cursor-pointer select-none group focus:outline-none"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-app-accent/15 text-app-accent shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Sparkles size={16} />
          </span>
          <div className="text-right">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-sm sm:text-base text-app-text group-hover:text-app-accent transition-colors">
                {isRtl ? 'خصال وحِكَم ذات صلة' : 'Related Virtues & Wisdom'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-app-accent/10 text-app-accent font-semibold border border-app-accent/20">
                {isRtl ? `${toArabicDigits(related.length)} مقترحات` : `${related.length} suggestions`}
              </span>
            </div>
            {!expanded && (
              <p className="text-[11px] text-app-muted truncate mt-0.5 max-w-xs sm:max-w-md font-sans">
                {isRtl
                  ? 'انقر لاستعراض الأبواب المشتركة في المعاني التربوية'
                  : 'Click to explore chapters sharing similar themes'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-app-accent font-medium shrink-0 bg-app-accent/10 group-hover:bg-app-accent/20 px-2.5 py-1.5 rounded-xl border border-app-accent/20 transition-all">
          <span className="hidden min-[380px]:inline text-[11px] font-semibold">
            {expanded ? (isRtl ? 'إخفاء' : 'Hide') : (isRtl ? 'عرض' : 'Show')}
          </span>
          <ChevronDown
            size={15}
            className={cn('transition-transform duration-200 text-app-accent', expanded && 'rotate-180')}
          />
        </div>
      </button>

      {/* Expandable Content Container */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-app-accent/15 space-y-3">
              <p className="text-xs text-app-text-secondary leading-relaxed">
                {isRtl
                  ? 'أبواب تشترك في المعاني الأخلاقية والتربوية نفسها لمزيد من الفائدة والتدبر'
                  : 'Chapters sharing related ethical themes and educational values'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {related.map(({ chapter, matchedTags }) => (
                  <button
                    key={chapter.id}
                    onClick={() => onSelectChapter(chapter.id)}
                    className="group flex flex-col justify-between text-right p-3.5 rounded-2xl bg-app-surface/90 hover:bg-app-accent/10 border border-app-border/80 hover:border-app-accent/50 transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-98"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-app-accent/15 text-app-accent">
                          {isRtl ? `باب ${toArabicDigits(chapter.order)}` : `Ch. ${chapter.order}`}
                        </span>
                        <span className="text-[10px] text-app-muted">
                          {isRtl ? `${toArabicDigits(chapter.blocks?.length || 0)} فقرات` : `${chapter.blocks?.length || 0} blocks`}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-xs sm:text-sm text-app-text group-hover:text-app-accent transition-colors line-clamp-2 leading-snug mb-2">
                        {chapter.title}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-app-border/50 flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1">
                        {(matchedTags.length > 0 ? matchedTags : (chapter.tags || []).slice(0, 2)).map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-md bg-app-bg text-app-text-secondary"
                          >
                            <Tag size={8} className="opacity-60" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-end gap-1 text-xs text-app-accent font-medium group-hover:-translate-x-0.5 transition-transform">
                        <span>{isRtl ? 'قراءة الخصلة' : 'Read'}</span>
                        <ArrowLeft size={12} className={isRtl ? '' : 'rotate-180'} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
