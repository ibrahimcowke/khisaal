import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  ArrowRightLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { useBook } from '../context/BookContext'
import { PageHeader } from '../components/layout/PageHeader'
import { BlockRenderer } from '../components/reader/BlockRenderer'
import { Button } from '../components/ui/Button'
import { toArabicDigits } from '../lib/format'
import { cn } from '../lib/cn'

export default function CompareKhisalsPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()

  const [chapterIdA, setChapterIdA] = useState<string>('')
  const [chapterIdB, setChapterIdB] = useState<string>('')
  const [mobileTab, setMobileTab] = useState<'a' | 'b' | 'metrics'>('a')

  const chapters = index?.chapters || []

  // Initialize selected chapters once index is ready
  useEffect(() => {
    if (chapters.length >= 2 && !chapterIdA && !chapterIdB) {
      setChapterIdA(chapters[0].id)
      setChapterIdB(chapters[1].id)
    }
  }, [chapters, chapterIdA, chapterIdB])

  const chapterA = useMemo(
    () => chapters.find((c) => c.id === chapterIdA) || chapters[0],
    [chapters, chapterIdA]
  )
  const chapterB = useMemo(
    () => chapters.find((c) => c.id === chapterIdB) || chapters[1] || chapters[0],
    [chapters, chapterIdB]
  )

  // Calculate shared tags
  const tagsB = new Set(chapterB?.tags || [])
  const sharedTags = (chapterA?.tags || []).filter((t) => tagsB.has(t))

  function swapChapters() {
    const temp = chapterIdA
    setChapterIdA(chapterIdB)
    setChapterIdB(temp)
  }

  if (loading || !index || chapters.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-app-text-secondary">
        جارٍ التحميل...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16 animate-fade-in">
      <PageHeader
        title="مقارنة الخصال والحِكَم"
        subtitle="مقارنة تفاعلية جنباً إلى جنب بين بابين لمعاينة الفروق والترابط السلوكي"
        backTo="/tools"
      />

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center mb-6 bg-app-surface p-4 rounded-3xl border border-app-border shadow-2xs">
        {/* Selector A */}
        <div>
          <label className="block text-xs font-semibold text-app-muted mb-1.5">
            الخصلة أو الباب الأول (A):
          </label>
          <select
            value={chapterIdA}
            onChange={(e) => setChapterIdA(e.target.value)}
            dir="rtl"
            className="w-full p-2.5 rounded-xl border border-app-border bg-app-bg text-sm font-display font-bold text-app-text focus:outline-none focus:ring-1 focus:ring-app-accent"
          >
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapChapters}
            className="p-2.5 rounded-2xl bg-app-bg hover:bg-app-accent/15 border border-app-border text-app-accent transition-all hover:rotate-180 cursor-pointer shadow-2xs"
            title="تبديل الخصلتين"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>

        {/* Selector B */}
        <div>
          <label className="block text-xs font-semibold text-app-muted mb-1.5">
            الخصلة أو الباب الثاني (B):
          </label>
          <select
            value={chapterIdB}
            onChange={(e) => setChapterIdB(e.target.value)}
            dir="rtl"
            className="w-full p-2.5 rounded-xl border border-app-border bg-app-bg text-sm font-display font-bold text-app-text focus:outline-none focus:ring-1 focus:ring-app-accent"
          >
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Metrics Card */}
      <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-linear-to-br from-app-surface via-app-surface to-app-accent/5 border border-app-border space-y-3.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-app-accent/15 text-app-accent">
            <Sparkles size={14} />
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-app-text">
            تحليل المقارنة الموضوعية والدلالية
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-app-bg/80 border border-app-border/70">
            <span className="text-app-muted block mb-0.5">كلمات الباب A</span>
            <span className="font-display font-bold text-sm text-app-accent">
              {toArabicDigits(chapterA?.wordCount || 0)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-app-bg/80 border border-app-border/70">
            <span className="text-app-muted block mb-0.5">كلمات الباب B</span>
            <span className="font-display font-bold text-sm text-app-accent">
              {toArabicDigits(chapterB?.wordCount || 0)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-app-bg/80 border border-app-border/70">
            <span className="text-app-muted block mb-0.5">فقرات الباب A</span>
            <span className="font-display font-bold text-sm text-app-text">
              {toArabicDigits(chapterA?.blocks?.length || 0)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-app-bg/80 border border-app-border/70">
            <span className="text-app-muted block mb-0.5">فقرات الباب B</span>
            <span className="font-display font-bold text-sm text-app-text">
              {toArabicDigits(chapterB?.blocks?.length || 0)}
            </span>
          </div>
        </div>

        {/* Tags Overlap Analysis */}
        <div className="pt-2 border-t border-app-border/50 text-xs">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-semibold text-app-text">الوسوم المشتركة ({toArabicDigits(sharedTags.length)}):</span>
            {sharedTags.length > 0 ? (
              sharedTags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]"
                >
                  <CheckCircle2 size={10} />
                  {t}
                </span>
              ))
            ) : (
              <span className="text-app-muted italic">لا توجد وسوم مشتركة مباشرة</span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden items-center gap-1 p-1 bg-app-surface border border-app-border rounded-2xl mb-4">
        <button
          onClick={() => setMobileTab('a')}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold transition-colors',
            mobileTab === 'a' ? 'bg-app-accent text-white' : 'text-app-muted'
          )}
        >
          الباب الأول (A)
        </button>
        <button
          onClick={() => setMobileTab('b')}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold transition-colors',
            mobileTab === 'b' ? 'bg-app-accent text-white' : 'text-app-muted'
          )}
        >
          الباب الثاني (B)
        </button>
      </div>

      {/* Side-by-Side Chapters Comparison View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column A */}
        <div
          className={cn(
            'p-5 sm:p-6 rounded-3xl bg-app-surface border border-app-border shadow-xs space-y-4',
            mobileTab !== 'a' && 'hidden md:block'
          )}
        >
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-app-border">
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-app-accent/15 text-app-accent">
                الباب A
              </span>
              <h3 className="font-display font-bold text-lg text-app-text mt-1">
                {chapterA?.title}
              </h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/book/${index.book.id}/read?c=${chapterA.id}`)}
              className="text-xs shrink-0 gap-1"
            >
              <BookOpen size={13} />
              قراءة
            </Button>
          </div>

          <div className="space-y-4 pt-2">
            {chapterA?.blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                highlights={[]}
                activeHighlightId={null}
                onHighlightClick={() => {}}
              />
            ))}
          </div>
        </div>

        {/* Column B */}
        <div
          className={cn(
            'p-5 sm:p-6 rounded-3xl bg-app-surface border border-app-border shadow-xs space-y-4',
            mobileTab !== 'b' && 'hidden md:block'
          )}
        >
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-app-border">
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                الباب B
              </span>
              <h3 className="font-display font-bold text-lg text-app-text mt-1">
                {chapterB?.title}
              </h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/book/${index.book.id}/read?c=${chapterB.id}`)}
              className="text-xs shrink-0 gap-1"
            >
              <BookOpen size={13} />
              قراءة
            </Button>
          </div>

          <div className="space-y-4 pt-2">
            {chapterB?.blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                highlights={[]}
                activeHighlightId={null}
                onHighlightClick={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
