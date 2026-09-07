import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Copy,
  Check,
  Sparkles,
  Volume2,
  Tag,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import type { Chapter, ContentBlock } from '../../lib/types'
import { BlockRenderer } from './BlockRenderer'
import { toArabicDigits } from '../../lib/format'
import { useTranslation } from '../../lib/i18n'
import { cn } from '../../lib/cn'

interface CardDeckViewProps {
  chapter: Chapter
  fontFamily: string
  fontSize: number
  lineHeight: number
  onNextChapter?: () => void
  onPrevChapter?: () => void
  onOpenStudio?: (text: string) => void
}

export function CardDeckView({
  chapter,
  fontFamily,
  fontSize,
  lineHeight,
  onNextChapter,
  onPrevChapter,
  onOpenStudio,
}: CardDeckViewProps) {
  const { isRtl } = useTranslation()
  const [cardIndex, setCardIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  // Filter meaningful blocks for card presentation
  const cards: ContentBlock[] = chapter.blocks.filter(
    (b) => b.type !== 'divider' && b.type !== 'page-marker' && (b.text?.trim() || (b.items && b.items.length > 0))
  )

  // Reset card index when chapter changes
  useEffect(() => {
    setCardIndex(0)
  }, [chapter.id])

  const totalCards = Math.max(cards.length, 1)
  const currentBlock = cards[cardIndex] || cards[0]
  const isFirstCard = cardIndex === 0
  const isLastCard = cardIndex === cards.length - 1

  function handleNext() {
    if (!isLastCard) {
      setCardIndex((i) => i + 1)
    } else if (onNextChapter) {
      onNextChapter()
    }
  }

  function handlePrev() {
    if (!isFirstCard) {
      setCardIndex((i) => i - 1)
    } else if (onPrevChapter) {
      onPrevChapter()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        if (isRtl) {
          if (!isLastCard) setCardIndex((i) => i + 1)
          else onNextChapter?.()
        } else {
          if (!isFirstCard) setCardIndex((i) => i - 1)
          else onPrevChapter?.()
        }
      } else if (e.key === 'ArrowRight') {
        if (isRtl) {
          if (!isFirstCard) setCardIndex((i) => i - 1)
          else onPrevChapter?.()
        } else {
          if (!isLastCard) setCardIndex((i) => i + 1)
          else onNextChapter?.()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isLastCard, isFirstCard, isRtl, onNextChapter, onPrevChapter])

  async function handleCopy() {
    const text = currentBlock?.text || (currentBlock?.items ?? []).join('\n')
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  function handleSpeak() {
    const text = currentBlock?.text || (currentBlock?.items ?? []).join(' ')
    if (!text || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ar-SA'
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }

  const PrevIcon = isRtl ? ArrowRight : ArrowLeft
  const NextIcon = isRtl ? ArrowLeft : ArrowRight

  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-20 select-none flex flex-col items-center">
      {/* Top Deck Info Bar */}
      <div className="w-full flex items-center justify-between gap-2 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold px-2.5 py-0.5 rounded-full bg-app-accent/15 text-app-accent">
            بطاقة {toArabicDigits(cardIndex + 1)} من {toArabicDigits(totalCards)}
          </span>
          <span className="text-app-muted truncate max-w-45 sm:max-w-xs font-display">
            {chapter.title}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {chapter.tags?.slice(0, 2).map((t) => (
            <span key={t} className="hidden sm:inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-md bg-app-surface border border-app-border text-app-text-secondary">
              <Tag size={9} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-app-border/60 h-1.5 rounded-full overflow-hidden mb-6">
        <div
          className="bg-app-accent h-full rounded-full transition-all duration-300"
          style={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
        />
      </div>

      {/* Floating Animated Card Container */}
      <div className="w-full relative min-h-95 sm:min-h-105 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${chapter.id}-${cardIndex}`}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) {
                if (isRtl) handleNext()
                else handlePrev()
              } else if (info.offset.x > 50) {
                if (isRtl) handlePrev()
                else handleNext()
              }
            }}
            className="w-full rounded-3xl bg-app-surface border border-app-border/90 shadow-lg p-6 sm:p-9 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Top Ornamental Accent */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-app-border/40">
              <span className="text-xs text-app-accent font-bold">❖ خصلة وحكمة</span>
              <span className="text-[10px] text-app-muted font-mono font-medium">
                {currentBlock?.type === 'quote'
                  ? 'حديث مأثور'
                  : currentBlock?.type === 'callout'
                  ? 'بيان تربوي'
                  : currentBlock?.type === 'verse'
                  ? 'شاهد قرآني'
                  : 'فائدة سلوكية'}
              </span>
            </div>

            {/* Main Content Area */}
            <div
              className="my-auto py-4 text-app-text leading-relaxed"
              style={{ fontFamily, fontSize, lineHeight }}
            >
              {currentBlock && (
                <BlockRenderer
                  block={currentBlock}
                  highlights={[]}
                  activeHighlightId={null}
                  onHighlightClick={() => {}}
                />
              )}
            </div>

            {/* Card Action Ribbon */}
            <div className="pt-4 mt-4 border-t border-app-border/50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSpeak}
                  className="p-2 rounded-xl bg-app-bg hover:bg-app-accent/15 text-app-text-secondary hover:text-app-accent transition-colors cursor-pointer"
                  title="استماع صوتي"
                >
                  <Volume2 size={16} />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-xl bg-app-bg hover:bg-app-accent/15 text-app-text-secondary hover:text-app-accent transition-colors cursor-pointer"
                  title="نسخ النص"
                >
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
                {onOpenStudio && currentBlock?.text && (
                  <button
                    onClick={() => onOpenStudio(currentBlock.text!)}
                    className="p-2 rounded-xl bg-app-bg hover:bg-app-accent/15 text-app-text-secondary hover:text-app-accent transition-colors cursor-pointer"
                    title="تصميم بطاقة مصورة"
                  >
                    <Sparkles size={16} className="text-amber-500" />
                  </button>
                )}
              </div>

              <div className="text-[11px] text-app-muted font-serif">
                صفحة {toArabicDigits(currentBlock?.sourcePage || 1)}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls Bar */}
      <div className="w-full flex items-center justify-between gap-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={isFirstCard && !onPrevChapter}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-sm font-semibold transition-all cursor-pointer shadow-2xs',
            isFirstCard && !onPrevChapter
              ? 'opacity-40 bg-app-surface/50 border-app-border cursor-not-allowed'
              : 'bg-app-surface border-app-border hover:border-app-accent hover:bg-app-accent/10 text-app-text'
          )}
        >
          <PrevIcon size={16} />
          <span>{isFirstCard ? 'الباب السابق' : 'السابقة'}</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-app-accent text-white hover:bg-app-accent/90 text-sm font-semibold transition-all cursor-pointer shadow-xs"
        >
          <span>{isLastCard ? 'الباب التالي' : 'التالية'}</span>
          <NextIcon size={16} />
        </button>
      </div>
    </div>
  )
}
