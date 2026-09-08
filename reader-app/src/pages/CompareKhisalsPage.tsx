import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  ArrowRightLeft,
  Sparkles,
  CheckCircle2,
  Volume2,
  Copy,
  Printer,
  Check,
} from 'lucide-react'
import { useBook } from '../context/BookContext'
import { PageHeader } from '../components/layout/PageHeader'
import { BlockRenderer } from '../components/reader/BlockRenderer'
import { Button } from '../components/ui/Button'
import { toArabicDigits } from '../lib/format'
import { useTranslation } from '../lib/i18n'
import { useToast } from '../context/ToastContext'
import { cn } from '../lib/cn'

export default function CompareKhisalsPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const { isRtl } = useTranslation()
  const toast = useToast()

  const [chapterIdA, setChapterIdA] = useState<string>('')
  const [chapterIdB, setChapterIdB] = useState<string>('')
  const [mobileTab, setMobileTab] = useState<'a' | 'b' | 'summary'>('a')
  const [copiedSummary, setCopiedSummary] = useState(false)

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

  // Extract core bullet items from both chapters
  const listItemsA = useMemo(() => {
    const list = chapterA?.blocks.find((b) => b.type === 'list' && b.items && b.items.length > 0)
    return list?.items?.map((i) => i.replace(/^[•\-\*\d\.]\s*/, '')) || []
  }, [chapterA])

  const listItemsB = useMemo(() => {
    const list = chapterB?.blocks.find((b) => b.type === 'list' && b.items && b.items.length > 0)
    return list?.items?.map((i) => i.replace(/^[•\-\*\d\.]\s*/, '')) || []
  }, [chapterB])

  // Curated Preset Pairs
  const presetPairs = useMemo(() => {
    if (!chapters || chapters.length < 4) return []
    return [
      {
        label: isRtl ? 'القدر vs قوة النفس' : 'Dignity vs Inner Strength',
        idA: chapters[2]?.id || chapters[0]?.id,
        idB: chapters[3]?.id || chapters[1]?.id,
      },
      {
        label: isRtl ? 'فتح القلوب vs الألفة' : 'Opening Hearts vs Harmony',
        idA: chapters[4]?.id || chapters[0]?.id,
        idB: chapters[5]?.id || chapters[1]?.id,
      },
      {
        label: isRtl ? 'بناء المروءة vs كمال الأدب' : 'Nobility vs Character',
        idA: chapters[6]?.id || chapters[0]?.id,
        idB: chapters[7]?.id || chapters[1]?.id,
      },
    ].filter(Boolean)
  }, [chapters, isRtl])

  function swapChapters() {
    const temp = chapterIdA
    setChapterIdA(chapterIdB)
    setChapterIdB(temp)
  }

  function handleSpeak(chapterData: any) {
    if (!chapterData || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const text = chapterData.blocks
      .flatMap((b: any) => (b.text ? b.text.split(/(?<=[.؟!:])\s+/) : b.items ?? []))
      .filter(Boolean)
      .join(' ')
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ar-SA'
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
    toast.info(isRtl ? 'جارٍ الاستماع للباب' : 'Playing audio', chapterData.title)
  }

  async function handleCopySummary() {
    const summary = `⚖️ مقارنة بين بابين في خصال السلوك والمروءة:
1️⃣ ${chapterA?.title}
${listItemsA.length > 0 ? listItemsA.map((t) => `• ${t}`).join('\n') : ''}

2️⃣ ${chapterB?.title}
${listItemsB.length > 0 ? listItemsB.map((t) => `• ${t}`).join('\n') : ''}

🏷️ الوسوم المشتركة: ${sharedTags.join('، ') || 'لا توجد'}
— تطبيق إمتاع القارئ وموسوعة الخصال`

    await navigator.clipboard.writeText(summary)
    setCopiedSummary(true)
    toast.success(isRtl ? 'تم نسخ ملخص المقارنة بنجاح!' : 'Comparison copied!')
    setTimeout(() => setCopiedSummary(false), 2000)
  }

  function handlePrintComparison() {
    window.print()
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
        title={isRtl ? 'مقارنة الخصال والحِكَم' : 'Virtues Comparison Tool'}
        subtitle={isRtl ? 'مقارنة تفاعلية جنباً إلى جنب بين بابين لمعاينة الفروق، الخصال المقابلة، والترابط السلوكي' : 'Side-by-side comparative analysis exploring complementary virtues and themes'}
        backTo="/tools"
      />

      {/* Quick Curated Preset Pairs Bar */}
      {presetPairs.length > 0 && (
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none">
          <span className="font-bold text-app-muted shrink-0 text-[11px] flex items-center gap-1">
            <Sparkles size={12} className="text-app-accent" />
            <span>{isRtl ? 'نماذج مقارنة مقترحة:' : 'Quick Presets:'}</span>
          </span>
          {presetPairs.map((pair, idx) => (
            <button
              key={idx}
              onClick={() => {
                setChapterIdA(pair.idA)
                setChapterIdB(pair.idB)
              }}
              className="px-3 py-1 rounded-xl bg-app-surface border border-app-border hover:border-app-accent/60 text-app-text hover:text-app-accent transition-all cursor-pointer whitespace-nowrap shadow-2xs text-xs font-semibold active:scale-95"
            >
              {pair.label}
            </button>
          ))}
        </div>
      )}

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center mb-6 bg-app-surface p-4 rounded-3xl border border-app-border shadow-2xs">
        {/* Selector A */}
        <div>
          <label className="block text-xs font-semibold text-app-muted mb-1.5">
            {isRtl ? 'الخصلة أو الباب الأول (A):' : 'Chapter / Virtue (A):'}
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
            title={isRtl ? 'تبديل الخصلتين' : 'Swap Chapters'}
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>

        {/* Selector B */}
        <div>
          <label className="block text-xs font-semibold text-app-muted mb-1.5">
            {isRtl ? 'الخصلة أو الباب الثاني (B):' : 'Chapter / Virtue (B):'}
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

      {/* Comparison Metrics & Synthesis Card */}
      <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-linear-to-br from-app-surface via-app-surface to-app-accent/5 border border-app-border space-y-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-app-border/40">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-app-accent/15 text-app-accent">
              <Sparkles size={14} />
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-app-text">
              {isRtl ? 'تحليل المقارنة الموضوعية والدلالية' : 'Comparative Semantic Analysis'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1 rounded-xl bg-app-bg border border-app-border hover:border-app-accent/50 text-app-text hover:text-app-accent transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              title={isRtl ? 'نسخ ملخص المقارنة' : 'Copy comparison summary'}
            >
              {copiedSummary ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{isRtl ? 'نسخ الملخص' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrintComparison}
              className="px-3 py-1 rounded-xl bg-app-bg border border-app-border hover:border-app-accent/50 text-app-text hover:text-app-accent transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              title={isRtl ? 'طباعة تقرير المقارنة' : 'Print comparison sheet'}
            >
              <Printer size={13} />
              <span className="hidden sm:inline">{isRtl ? 'طباعة' : 'Print'}</span>
            </button>
          </div>
        </div>

        {/* Side-by-Side Key Virtue Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-app-accent/8 border border-app-accent/20">
            <span className="text-[11px] font-bold text-app-accent block mb-1.5">
              {chapterA?.title}
            </span>
            {listItemsA.length > 0 ? (
              <ul className="space-y-1 text-xs text-app-text font-serif">
                {listItemsA.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-app-accent font-bold">❖</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-xs text-app-muted italic">شرح سردي منثور</span>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/8 border border-emerald-500/20">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block mb-1.5">
              {chapterB?.title}
            </span>
            {listItemsB.length > 0 ? (
              <ul className="space-y-1 text-xs text-app-text font-serif">
                {listItemsB.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">❖</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-xs text-app-muted italic">شرح سردي منثور</span>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-app-bg/80 border border-app-border/70">
            <span className="text-app-muted block mb-0.5">كلمات الباب A</span>
            <span className="font-display font-bold text-sm text-app-accent">
              {toArabicDigits(chapterA?.wordCount || 0)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-app-bg/80 border border-app-border/70">
            <span className="text-app-muted block mb-0.5">كلمات الباب B</span>
            <span className="font-display font-bold text-sm text-emerald-600 dark:text-emerald-400">
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-app-text">
              {isRtl ? 'الوسوم والمحاور المشتركة:' : 'Shared Topics:'}
            </span>
            {sharedTags.length > 0 ? (
              sharedTags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]"
                >
                  <CheckCircle2 size={11} />
                  {t}
                </span>
              ))
            ) : (
              <span className="text-app-muted italic text-[11px]">
                {isRtl ? 'بابان متكاملان في معاني الفضيلة' : 'Complementary moral chapters'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Segmented Tab Switcher */}
      <div className="flex md:hidden items-center gap-1 p-1 bg-app-surface border border-app-border rounded-2xl mb-4 select-none">
        <button
          onClick={() => setMobileTab('a')}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
            mobileTab === 'a' ? 'bg-app-accent text-white shadow-2xs' : 'text-app-muted'
          )}
        >
          الباب الأول (A)
        </button>
        <button
          onClick={() => setMobileTab('b')}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
            mobileTab === 'b' ? 'bg-app-accent text-white shadow-2xs' : 'text-app-muted'
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
            'p-5 sm:p-6 rounded-3xl bg-app-surface border border-app-border shadow-xs space-y-4 transition-all',
            mobileTab !== 'a' && 'hidden md:block'
          )}
        >
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-app-border">
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-app-accent/15 text-app-accent">
                الباب A
              </span>
              <h3 className="font-display font-bold text-base sm:text-lg text-app-text mt-1 leading-snug">
                {chapterA?.title}
              </h3>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleSpeak(chapterA)}
                className="p-2 rounded-xl hover:bg-app-accent/10 text-app-muted hover:text-app-accent border border-transparent hover:border-app-accent/20 transition-all cursor-pointer active:scale-95"
                title={isRtl ? 'استمع صوتياً لهذا الباب' : 'Listen'}
              >
                <Volume2 size={15} />
              </button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/book/${index.book.id}/read?c=${chapterA.id}`)}
                className="text-xs gap-1"
              >
                <BookOpen size={13} />
                قراءة
              </Button>
            </div>
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
            'p-5 sm:p-6 rounded-3xl bg-app-surface border border-app-border shadow-xs space-y-4 transition-all',
            mobileTab !== 'b' && 'hidden md:block'
          )}
        >
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-app-border">
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                الباب B
              </span>
              <h3 className="font-display font-bold text-base sm:text-lg text-app-text mt-1 leading-snug">
                {chapterB?.title}
              </h3>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleSpeak(chapterB)}
                className="p-2 rounded-xl hover:bg-app-accent/10 text-app-muted hover:text-app-accent border border-transparent hover:border-app-accent/20 transition-all cursor-pointer active:scale-95"
                title={isRtl ? 'استمع صوتياً لهذا الباب' : 'Listen'}
              >
                <Volume2 size={15} />
              </button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/book/${index.book.id}/read?c=${chapterB.id}`)}
                className="text-xs gap-1"
              >
                <BookOpen size={13} />
                قراءة
              </Button>
            </div>
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
