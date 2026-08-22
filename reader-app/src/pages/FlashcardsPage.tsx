import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  RotateCw,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Calendar,
} from 'lucide-react'
import { db, uid, type Flashcard } from '../lib/db'
import { useBook } from '../context/BookContext'
import { useTranslation } from '../lib/i18n'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import { cn } from '../lib/cn'

export default function FlashcardsPage() {
  const { isRtl, formatDigits } = useTranslation()
  const { index } = useBook()
  const cards = useLiveQuery(() => db.flashcards.toArray()) || []
  
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const dueCards = useMemo(() => {
    return cards.filter((c) => !c.dueDate || c.dueDate <= todayStr)
  }, [cards, todayStr])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [newCardOpen, setNewCardOpen] = useState(false)
  const [frontText, setFrontText] = useState('')
  const [backText, setBackText] = useState('')
  const [cardCategory, setCardCategory] = useState('الخصال والحِكَم')
  const [generatingDecks, setGeneratingDecks] = useState(false)

  const activeDeck = dueCards

  const currentCard: Flashcard | undefined = activeDeck[currentIndex]

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ar-SA'
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }

  // 30-Day Activity Heatmap Data
  const heatmapDays = useMemo(() => {
    const days: { dateStr: string; dayNum: number; count: number }[] = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dStr = d.toISOString().split('T')[0]
      const count = cards.filter((c) => c.lastReviewedAt && new Date(c.lastReviewedAt).toISOString().split('T')[0] === dStr).length
      days.push({ dateStr: dStr, dayNum: d.getDate(), count })
    }
    return days
  }, [cards])

  // SuperMemo SM-2 Interval Calculation
  const handleRate = async (card: Flashcard, rating: 'again' | 'hard' | 'good' | 'easy') => {
    let nextInterval = 1
    let nextRep = card.repetition || 0
    let nextEase = card.easeFactor || 2.5

    if (rating === 'again') {
      nextRep = 0
      nextInterval = 1
      nextEase = Math.max(1.3, nextEase - 0.2)
    } else if (rating === 'hard') {
      nextRep = nextRep + 1
      nextInterval = Math.max(1, Math.floor((card.interval || 1) * 1.2))
      nextEase = Math.max(1.3, nextEase - 0.15)
    } else if (rating === 'good') {
      nextRep = nextRep + 1
      nextInterval = nextRep === 1 ? 1 : nextRep === 2 ? 6 : Math.round((card.interval || 1) * nextEase)
    } else if (rating === 'easy') {
      nextRep = nextRep + 1
      nextInterval = nextRep === 1 ? 4 : Math.round((card.interval || 1) * nextEase * 1.3)
      nextEase = nextEase + 0.15
    }

    const nextDueDate = new Date()
    nextDueDate.setDate(nextDueDate.getDate() + nextInterval)
    const dueDateStr = nextDueDate.toISOString().split('T')[0]

    await db.flashcards.update(card.id, {
      interval: nextInterval,
      repetition: nextRep,
      easeFactor: nextEase,
      dueDate: dueDateStr,
      lastReviewedAt: Date.now(),
    })

    setIsFlipped(false)
    if (currentIndex >= activeDeck.length - 1) {
      setCurrentIndex(0)
    }
  }

  const handleCreateCard = async () => {
    if (!frontText.trim() || !backText.trim()) return
    await db.flashcards.add({
      id: uid('fc'),
      front: frontText.trim(),
      back: backText.trim(),
      category: cardCategory,
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: todayStr,
      createdAt: Date.now(),
    })
    setFrontText('')
    setBackText('')
    setNewCardOpen(false)
  }

  const handleGenerateVirtueDeck = async () => {
    if (!index) return
    setGeneratingDecks(true)
    try {
      const existingFronts = new Set(cards.map((c) => c.front))
      const newItems: Flashcard[] = []

      for (const ch of index.chapters.slice(0, 30)) {
        if (!existingFronts.has(ch.title) && ch.blocks.length > 0) {
          const sampleBlock = ch.blocks.find((b) => (b.text?.length ?? 0) > 20 && (b.text?.length ?? 0) < 250) || ch.blocks[0]
          newItems.push({
            id: uid('fc'),
            front: ch.title,
            back: sampleBlock?.text || ch.title,
            category: 'الخصال والحِكَم',
            source: ch.title,
            interval: 1,
            repetition: 0,
            easeFactor: 2.5,
            dueDate: todayStr,
            createdAt: Date.now(),
          })
        }
      }

      if (newItems.length > 0) {
        await db.flashcards.bulkAdd(newItems)
      }
    } finally {
      setGeneratingDecks(false)
    }
  }

  const handleDeleteCurrentCard = async () => {
    if (!currentCard) return
    await db.flashcards.delete(currentCard.id)
    setIsFlipped(false)
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-app-accent/15 text-app-accent flex items-center justify-center">
              <Brain size={18} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-app-text">
              {isRtl ? 'بطاقات الحفظ والمراجعة' : 'Smart Flashcards'}
            </h1>
          </div>
          <p className="text-xs text-app-text-secondary">
            {isRtl
              ? 'نظام التكرار المتباعد الذكي (SuperMemo SM-2) لتثبيت الحكم والخصال في الذاكرة'
              : 'Spaced repetition system for long-term memorization of virtues & wisdom'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className="text-xs gap-1.5"
            title={autoSpeak ? 'تعطيل النطق التلقائي' : 'تفعيل النطق التلقائي عند القلب'}
          >
            {autoSpeak ? <Volume2 size={14} className="text-emerald-500" /> : <VolumeX size={14} />}
            <span>{autoSpeak ? (isRtl ? 'النطق مفعل' : 'TTS On') : (isRtl ? 'نطق صوتي' : 'TTS')}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateVirtueDeck}
            className="text-xs gap-1.5"
            disabled={generatingDecks}
          >
            <Sparkles size={14} className="text-amber-500" />
            {isRtl ? 'توليد حزمة الخصال' : 'Generate Deck'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setNewCardOpen(true)}
          >
            <Plus size={14} />
            {isRtl ? 'إضافة بطاقة' : 'Add Card'}
          </Button>
        </div>
      </div>

      {/* Stats Ribbon & 30-Day Activity Heatmap */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-app-surface border border-app-border text-center">
            <p className="text-xs text-app-muted font-medium mb-1">{isRtl ? 'المستحقة اليوم' : 'Due Today'}</p>
            <p className="font-display text-2xl font-bold text-app-accent">
              {formatDigits(dueCards.length)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-app-surface border border-app-border text-center">
            <p className="text-xs text-app-muted font-medium mb-1">{isRtl ? 'إجمالي البطاقات' : 'Total Cards'}</p>
            <p className="font-display text-2xl font-bold text-app-text">
              {formatDigits(cards.length)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-app-surface border border-app-border text-center">
            <p className="text-xs text-app-muted font-medium mb-1">{isRtl ? 'المتقنة (تكرار > 3)' : 'Mastered'}</p>
            <p className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatDigits(cards.filter((c) => c.repetition >= 3).length)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-app-surface border border-app-border text-center">
            <p className="text-xs text-app-muted font-medium mb-1">{isRtl ? 'معدل الحفظ' : 'Retention'}</p>
            <p className="font-display text-2xl font-bold text-indigo-500">
              {cards.length > 0
                ? `${Math.round((cards.filter((c) => c.repetition >= 1).length / cards.length) * 100)}%`
                : '0%'}
            </p>
          </div>
        </div>

        {/* Monthly Activity Heatmap Grid */}
        <div className="p-3.5 rounded-2xl bg-app-surface border border-app-border/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs text-app-muted font-semibold">
            <Calendar size={13} className="text-app-accent" />
            <span>{isRtl ? 'نشاط المراجعة (آخر ٣٠ يوماً):' : '30-Day Activity Heatmap:'}</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
            {heatmapDays.map((d) => (
              <div
                key={d.dateStr}
                title={`${d.dateStr}: ${d.count} مراجعات`}
                className={cn(
                  'w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] transition-all',
                  d.count === 0
                    ? 'bg-app-border/50'
                    : d.count < 3
                    ? 'bg-emerald-400'
                    : d.count < 8
                    ? 'bg-emerald-600'
                    : 'bg-emerald-700 shadow-xs'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Flashcard View */}
      {activeDeck.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-3xl bg-app-surface border border-app-border/80 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="font-display text-xl font-bold text-app-text mb-2">
            {isRtl ? 'أحسنت! لا توجد بطاقات مستحقة للمراجعة اليوم 🎉' : 'All done for today! 🎉'}
          </h2>
          <p className="text-xs text-app-muted max-w-md mx-auto mb-6 leading-relaxed">
            {isRtl
              ? 'لقد راجعت جميع البطاقات المقررة لهذا اليوم. يمكنك إضافة بطاقات جديدة أو توليد حزمة خصال إضافية.'
              : 'You have completed all scheduled cards for today. Add new cards or generate virtue decks.'}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" onClick={handleGenerateVirtueDeck} className="gap-1.5 text-xs">
              <Sparkles size={14} />
              {isRtl ? 'استيراد حزمة من الكتاب' : 'Generate Cards from Book'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Card Counter & Delete Header */}
          <div className="w-full max-w-xl flex items-center justify-between mb-3 text-xs text-app-muted px-2">
            <span className="font-semibold text-app-accent flex items-center gap-1.5">
              <Layers size={14} />
              {isRtl ? 'البطاقة' : 'Card'} {formatDigits(currentIndex + 1)} / {formatDigits(activeDeck.length)}
            </span>
            <button
              onClick={handleDeleteCurrentCard}
              className="text-app-muted hover:text-red-500 transition-colors p-1"
              title={isRtl ? 'حذف هذه البطاقة' : 'Delete Card'}
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* 3D Flip Card Container */}
          <div
            className="w-full max-w-xl min-h-80 sm:min-h-90 perspective-1000 cursor-pointer select-none"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="w-full h-full min-h-80 sm:min-h-90 rounded-3xl bg-linear-to-b from-app-surface via-app-surface/95 to-app-accent/5 border-2 border-app-accent/30 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative preserve-3d"
            >
              {/* Card Face */}
              {!isFlipped ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-app-muted">
                    <span className="px-2.5 py-1 rounded-full bg-app-accent/10 text-app-accent font-bold">
                      {currentCard?.category || 'عام'}
                    </span>
                    <span className="text-[11px] flex items-center gap-1">
                      <RotateCw size={12} /> {isRtl ? 'انقر للقلب والكشف' : 'Click to flip'}
                    </span>
                  </div>

                  <div className="my-auto py-6 text-center relative">
                    <p className="font-display text-2xl sm:text-3xl font-bold text-app-text leading-snug px-6">
                      {currentCard?.front}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (currentCard) speakText(currentCard.front)
                      }}
                      className="mt-3 p-1.5 rounded-xl bg-app-accent/10 text-app-accent hover:bg-app-accent hover:text-white transition-all shadow-xs inline-flex items-center gap-1 text-xs"
                      title={isRtl ? 'استماع للنطق' : 'Listen'}
                    >
                      <Volume2 size={13} />
                      <span>{isRtl ? 'استماع' : 'Listen'}</span>
                    </button>
                  </div>

                  <div className="text-center text-xs text-app-muted">
                    {currentCard?.source && (
                      <span className="italic font-serif">المصدر: {currentCard.source}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between rotate-y-180">
                  <div className="flex items-center justify-between text-xs text-app-muted">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      {isRtl ? 'البيان والإجابة' : 'Answer / Meaning'}
                    </span>
                    <span className="text-[11px] flex items-center gap-1">
                      <RotateCw size={12} /> {isRtl ? 'انقر للعودة' : 'Click to flip back'}
                    </span>
                  </div>

                  <div className="my-auto py-4 text-center">
                    <p className="text-base sm:text-lg text-app-text leading-relaxed font-serif whitespace-pre-line px-4">
                      {currentCard?.back}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (currentCard) speakText(currentCard.back)
                      }}
                      className="mt-3 p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-xs inline-flex items-center gap-1 text-xs"
                      title={isRtl ? 'استماع للنص' : 'Listen'}
                    >
                      <Volume2 size={13} />
                      <span>{isRtl ? 'استماع' : 'Listen'}</span>
                    </button>
                  </div>

                  <div className="text-center text-xs text-app-muted">
                    <span>
                      {isRtl ? 'التكرار السابق:' : 'Repetitions:'} {formatDigits(currentCard?.repetition || 0)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Rating Response Buttons */}
          <AnimatePresence>
            {isFlipped && currentCard && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full max-w-xl mt-6 grid grid-cols-4 gap-2"
              >
                <button
                  onClick={() => handleRate(currentCard, 'again')}
                  className="flex flex-col items-center py-2.5 px-1 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
                >
                  <span className="text-xs font-bold">{isRtl ? 'أعد مجدداً' : 'Again'}</span>
                  <span className="text-[10px] text-red-500/80 mt-0.5">{isRtl ? '١ يوم' : '1d'}</span>
                </button>
                <button
                  onClick={() => handleRate(currentCard, 'hard')}
                  className="flex flex-col items-center py-2.5 px-1 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all"
                >
                  <span className="text-xs font-bold">{isRtl ? 'صعب' : 'Hard'}</span>
                  <span className="text-[10px] text-amber-500/80 mt-0.5">{isRtl ? '٢ يوم' : '2d'}</span>
                </button>
                <button
                  onClick={() => handleRate(currentCard, 'good')}
                  className="flex flex-col items-center py-2.5 px-1 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 active:scale-95 transition-all"
                >
                  <span className="text-xs font-bold">{isRtl ? 'جيد' : 'Good'}</span>
                  <span className="text-[10px] text-blue-500/80 mt-0.5">{isRtl ? '٤ أيام' : '4d'}</span>
                </button>
                <button
                  onClick={() => handleRate(currentCard, 'easy')}
                  className="flex flex-col items-center py-2.5 px-1 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all"
                >
                  <span className="text-xs font-bold">{isRtl ? 'سهل جداً' : 'Easy'}</span>
                  <span className="text-[10px] text-emerald-500/80 mt-0.5">{isRtl ? '٧ أيام' : '7d'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls when not flipped */}
          {!isFlipped && (
            <div className="flex items-center gap-4 mt-6">
              <Button
                variant="outline"
                className="gap-1 text-xs"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
              >
                {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                {isRtl ? 'السابق' : 'Previous'}
              </Button>
              <Button
                variant="outline"
                className="gap-1 text-xs"
                onClick={() => setCurrentIndex((i) => Math.min(activeDeck.length - 1, i + 1))}
                disabled={currentIndex >= activeDeck.length - 1}
              >
                {isRtl ? 'التالي' : 'Next'}
                {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add New Card Sheet */}
      <Sheet open={newCardOpen} onOpenChange={setNewCardOpen} title={isRtl ? 'إضافة بطاقة حفظ جديدة' : 'Add Flashcard'}>
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-app-text mb-1.5">
              {isRtl ? 'الوجه الأمامي (السؤال أو الخصلة)' : 'Front (Question / Virtue)'}
            </label>
            <input
              type="text"
              value={frontText}
              onChange={(e) => setFrontText(e.target.value)}
              placeholder={isRtl ? 'مثال: خصلة الإنصاف من النفس...' : 'e.g. Trait of Self-Fairness...'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-app-border bg-app-surface text-app-text text-sm focus:border-app-accent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-app-text mb-1.5">
              {isRtl ? 'الوجه الخلفي (البيان والشرح أو المعنى)' : 'Back (Explanation / Meaning)'}
            </label>
            <textarea
              rows={4}
              value={backText}
              onChange={(e) => setBackText(e.target.value)}
              placeholder={isRtl ? 'اكتب الشرح أو المعنى أو الشاهد...' : 'Write definition or quotes...'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-app-border bg-app-surface text-app-text text-sm focus:border-app-accent outline-none font-serif leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-app-text mb-1.5">
              {isRtl ? 'التصنيف' : 'Category'}
            </label>
            <select
              value={cardCategory}
              onChange={(e) => setCardCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-app-border bg-app-surface text-app-text text-sm focus:border-app-accent outline-none"
            >
              <option value="الخصال والحِكَم">{isRtl ? 'الخصال والحِكَم' : 'Virtues & Wisdom'}</option>
              <option value="مفردات ولغة">{isRtl ? 'مفردات ولغة' : 'Vocabulary & Lexicon'}</option>
              <option value="أبيات شعرية">{isRtl ? 'أبيات شعرية' : 'Poetry Verses'}</option>
              <option value="أقوال مأثورة">{isRtl ? 'أقوال مأثورة' : 'Famous Quotes'}</option>
            </select>
          </div>

          <Button className="w-full justify-center mt-2" onClick={handleCreateCard}>
            {isRtl ? 'حفظ وإضافة البطاقة' : 'Save Flashcard'}
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
