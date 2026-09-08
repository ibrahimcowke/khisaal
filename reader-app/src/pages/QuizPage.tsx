import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowLeft,
  Flame,
  Trophy,
  Volume2,
  Clock,
  Zap,
  Sparkles,
  Share2,
  Check,
  Award,
} from 'lucide-react'
import { useBook } from '../context/BookContext'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { toArabicDigits } from '../lib/format'
import { useTranslation } from '../lib/i18n'
import { useToast } from '../context/ToastContext'
import { db, uid } from '../lib/db'
import { cn } from '../lib/cn'

type Difficulty = 'easy' | 'standard' | 'timed'

interface Question {
  id: string
  categoryBadge: string
  questionText: string
  contextSnippet?: string
  correctOptionId: string
  explanation: string
  correctChapterId: string
  correctChapterTitle: string
  options: { id: string; text: string }[]
}

export default function QuizPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const { isRtl } = useTranslation()
  const toast = useToast()

  const [difficulty, setDifficulty] = useState<Difficulty>('standard')
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [userAnswers, setUserAnswers] = useState<{ qIndex: number; selectedId: string; isCorrect: boolean }[]>([])
  const [copiedShare, setCopiedShare] = useState(false)

  // Timer countdown for 'timed' challenge mode (15 seconds per question)
  const QUESTION_TIME = 15
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalQuestions = difficulty === 'easy' ? 5 : 10

  // Curated generator for SHORT, PRETTY, FOCUSED questions
  const questions = useMemo<Question[]>(() => {
    if (!index || index.chapters.length < 5) return []

    const qList: Question[] = []

    // 1. Generate questions from numbered chapters with list items (clean trait definitions)
    const listChapters = index.chapters.filter((c) =>
      c.blocks.some((b) => b.type === 'list' && b.items && b.items.length >= 2)
    )

    listChapters.forEach((ch, idx) => {
      const listBlock = ch.blocks.find((b) => b.type === 'list' && b.items && b.items.length >= 2)
      if (!listBlock || !listBlock.items) return

      const cleanItems = listBlock.items.map((i) => i.replace(/^[•\-\*\d\.]\s*/, '').trim())
      const cleanTitle = ch.title.replace(/^\d+[\.\-]\s*/, '').trim()

      // Question Type A: Identify the traits for a given chapter title
      const correctAnsA = cleanItems.slice(0, 2).join('، و')
      const distractorsA = listChapters
        .filter((other) => other.id !== ch.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, difficulty === 'easy' ? 2 : 3)
        .map((other) => {
          const ob = other.blocks.find((b) => b.type === 'list' && b.items && b.items.length >= 2)
          return ob?.items?.slice(0, 2).map((i) => i.replace(/^[•\-\*\d\.]\s*/, '').trim()).join('، و') || other.title
        })

      const optionsA = [
        { id: ch.id, text: correctAnsA },
        ...distractorsA.map((d, i) => ({ id: `dist-a-${idx}-${i}`, text: d })),
      ].sort(() => Math.random() - 0.5)

      qList.push({
        id: `q-traits-${ch.id}`,
        categoryBadge: '🎯 معرفة الخصال',
        questionText: `ما هما الخصلتان اللتان قيل فيهما: «${cleanTitle}»؟`,
        correctOptionId: ch.id,
        explanation: `الخصال المأثورة في هذا الباب هي: ${cleanItems.join(' · ')}.`,
        correctChapterId: ch.id,
        correctChapterTitle: ch.title,
        options: optionsA,
      })

      // Question Type B: Given bullet traits, identify which noble trait/chapter it belongs to
      const shortSnippet = cleanItems.slice(0, 2).join(' · ')
      const distractorsB = index.chapters
        .filter((other) => other.id !== ch.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, difficulty === 'easy' ? 2 : 3)

      const optionsB = [
        { id: ch.id, text: cleanTitle },
        ...distractorsB.map((d) => ({ id: d.id, text: d.title.replace(/^\d+[\.\-]\s*/, '').trim() })),
      ].sort(() => Math.random() - 0.5)

      qList.push({
        id: `q-title-${ch.id}`,
        categoryBadge: '💎 تمييز الحكمة',
        questionText: `«${shortSnippet}» — أي خصال المروءة والآداب تمثلها؟`,
        correctOptionId: ch.id,
        explanation: `هذه الخصال تجمع باب: «${ch.title}».`,
        correctChapterId: ch.id,
        correctChapterTitle: ch.title,
        options: optionsB,
      })
    })

    // 2. Generate questions from concise quotes & maxims
    const quoteChapters = index.chapters.filter((c) =>
      c.blocks.some((b) => b.type === 'quote' && (b.text?.length ?? 0) >= 15 && (b.text?.length ?? 0) <= 90)
    )

    quoteChapters.forEach((ch) => {
      const qBlock = ch.blocks.find((b) => b.type === 'quote' && (b.text?.length ?? 0) >= 15 && (b.text?.length ?? 0) <= 90)
      if (!qBlock?.text) return

      const distractors = index.chapters
        .filter((other) => other.id !== ch.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, difficulty === 'easy' ? 2 : 3)

      const options = [
        { id: ch.id, text: ch.title.replace(/^\d+[\.\-]\s*/, '').trim() },
        ...distractors.map((d) => ({ id: d.id, text: d.title.replace(/^\d+[\.\-]\s*/, '').trim() })),
      ].sort(() => Math.random() - 0.5)

      qList.push({
        id: `q-quote-${ch.id}`,
        categoryBadge: '📖 روائع الكلم',
        questionText: `«${qBlock.text.trim()}» — في أي أبواب الحكم ورد هذا النص؟`,
        correctOptionId: ch.id,
        explanation: qBlock.attribution ? `مأثور من: ${qBlock.attribution}. يندرج تحت باب «${ch.title}».` : `ورد في باب «${ch.title}».`,
        correctChapterId: ch.id,
        correctChapterTitle: ch.title,
        options,
      })
    })

    // Shuffle and pick target count
    return [...qList].sort(() => Math.random() - 0.5).slice(0, totalQuestions)
  }, [index, totalQuestions, difficulty])

  const currentQ = questions[currentQIndex]

  // Countdown timer for 'timed' mode
  useEffect(() => {
    if (difficulty !== 'timed' || answered || quizFinished) return

    setTimeLeft(QUESTION_TIME)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentQIndex, answered, quizFinished, difficulty])

  function handleTimeout() {
    if (answered || !currentQ) return
    setSelectedOptionId('TIMEOUT')
    setAnswered(true)
    setStreak(0)
    setUserAnswers((prev) => [...prev, { qIndex: currentQIndex, selectedId: 'TIMEOUT', isCorrect: false }])
    toast.warning(isRtl ? 'انتهى الوقت المحدد للسؤال!' : 'Time up for this question!')
  }

  function handleSelectOption(optionId: string) {
    if (answered || !currentQ) return
    if (timerRef.current) clearInterval(timerRef.current)

    setSelectedOptionId(optionId)
    setAnswered(true)

    const isCorrect = optionId === currentQ.correctOptionId
    setUserAnswers((prev) => [...prev, { qIndex: currentQIndex, selectedId: optionId, isCorrect }])

    if (isCorrect) {
      setScore((s) => s + 1)
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > bestStreak) setBestStreak(newStreak)
      toast.success(isRtl ? 'إجابة صحيحة وموفقة! 🎯' : 'Correct answer! 🎯')
    } else {
      setStreak(0)
      toast.warning(isRtl ? 'إجابة غير صحيحة، راجع الحكمة' : 'Incorrect answer')
    }
  }

  function handleNext() {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((i) => i + 1)
      setSelectedOptionId(null)
      setAnswered(false)
      setTimeLeft(QUESTION_TIME)
    } else {
      setQuizFinished(true)
    }
  }

  function handleRestart() {
    setCurrentQIndex(0)
    setSelectedOptionId(null)
    setScore(0)
    setStreak(0)
    setAnswered(false)
    setQuizFinished(false)
    setUserAnswers([])
    setTimeLeft(QUESTION_TIME)
  }

  function handleSpeakQuestion() {
    if (!currentQ || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(currentQ.questionText)
    utterance.lang = 'ar-SA'
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }

  async function handleShareScore() {
    const accuracy = Math.round((score / totalQuestions) * 100)
    const text = `🏆 حققت ${score} من ${totalQuestions} (${accuracy}٪) في مسابقة الخصال والحِكَم العربية عبر تطبيق إمتاع القارئ وموسوعة الخصال!`
    await navigator.clipboard.writeText(text)
    setCopiedShare(true)
    toast.success(isRtl ? 'تم نسخ نتيجتك للمشاركة!' : 'Result copied to clipboard!')
    setTimeout(() => setCopiedShare(false), 2000)
  }

  if (loading || !index) {
    return (
      <div className="min-h-screen flex items-center justify-center text-app-text-secondary">
        جارٍ التحميل...
      </div>
    )
  }

  const accuracyPct = Math.round((score / Math.max(1, totalQuestions)) * 100)
  const rankBadge =
    accuracyPct >= 90
      ? { title: 'فارس المروءة وحافظ الخصال 🌟', desc: 'إحاطة نادرة واستحضار باهر لأدق معاني السلوك والآداب.' }
      : accuracyPct >= 70
      ? { title: 'حكيم متأمل وطالب فضل 🌿', desc: 'أداء ممتاز ورصيد طيب من مكارم الأخلاق والسنن المأثورة.' }
      : accuracyPct >= 50
      ? { title: 'مستفتح لباب الفضائل 📖', desc: 'بداية مباركة، احرص على تكرار الاختبار ومراجعة أبواب الموسوعة.' }
      : { title: 'باحث عن الحكمة والموعظة 💡', desc: 'فرصة طيبة للرجوع إلى قراءة فصول الخصال وتغذية القلب بنورها.' }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16 animate-fade-in">
      <PageHeader
        title={isRtl ? 'تحدي واختبار الخصال والحِكَم' : 'Virtue Quiz Challenge'}
        subtitle={isRtl ? 'أسئلة قصيرة ومركزة لاختبار استيعاب مكارم الأخلاق والحكم المأثورة' : 'Concise interactive quiz testing moral traits & classical maxims'}
        backTo="/tools"
      />

      {/* Difficulty & Mode Selector (Before Quiz Starts or In Header) */}
      {!quizFinished && currentQIndex === 0 && !answered && (
        <div className="mb-6 p-4 rounded-3xl bg-app-surface border border-app-border shadow-2xs">
          <label className="block text-xs font-bold text-app-muted mb-2.5">
            {isRtl ? 'اختر مستوى التحدي ونمط الاختبار:' : 'Select Quiz Challenge Level:'}
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs font-bold">
            <button
              onClick={() => setDifficulty('easy')}
              className={cn(
                'py-2 px-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-1',
                difficulty === 'easy'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                  : 'bg-app-bg border-app-border text-app-muted hover:border-app-accent/40'
              )}
            >
              <Sparkles size={14} />
              <span>{isRtl ? 'سهل (5 أسئلة)' : 'Easy (5 Qs)'}</span>
            </button>

            <button
              onClick={() => setDifficulty('standard')}
              className={cn(
                'py-2 px-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-1',
                difficulty === 'standard'
                  ? 'bg-app-accent text-white shadow-xs'
                  : 'bg-app-bg border-app-border text-app-muted hover:border-app-accent/40'
              )}
            >
              <Award size={14} />
              <span>{isRtl ? 'قياسي (10 أسئلة)' : 'Standard (10 Qs)'}</span>
            </button>

            <button
              onClick={() => setDifficulty('timed')}
              className={cn(
                'py-2 px-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-1',
                difficulty === 'timed'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 shadow-2xs'
                  : 'bg-app-bg border-app-border text-app-muted hover:border-app-accent/40'
              )}
            >
              <Zap size={14} />
              <span>{isRtl ? 'مؤقت 15 ثانية ⚡' : 'Timed 15s ⚡'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Progress & Live Stats Bar */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-3xl bg-app-surface border border-app-border mb-6 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs text-app-muted font-medium">{isRtl ? 'السؤال' : 'Question'}</span>
          <span className="font-display font-bold text-sm text-app-accent">
            {toArabicDigits(Math.min(currentQIndex + 1, totalQuestions))} / {toArabicDigits(totalQuestions)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          {difficulty === 'timed' && !answered && !quizFinished && (
            <div className={cn('flex items-center gap-1 px-2.5 py-1 rounded-full border', timeLeft <= 5 ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 animate-pulse' : 'bg-app-bg border-app-border text-app-muted')}>
              <Clock size={13} />
              <span className="font-mono">{toArabicDigits(timeLeft)}ث</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Trophy size={14} />
            <span>{toArabicDigits(score)} {isRtl ? 'نقاط' : 'pts'}</span>
          </div>

          {streak > 1 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full"
            >
              <Flame size={14} className="fill-amber-500" />
              <span>{toArabicDigits(streak)}</span>
            </motion.div>
          )}
        </div>
      </div>

      {!quizFinished && currentQ ? (
        <div className="space-y-6">
          {/* Animated Progress Bar */}
          <div className="w-full bg-app-border/70 h-2 rounded-full overflow-hidden">
            <div
              className="bg-app-accent h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Short & Pretty Question Card */}
          <motion.div
            key={currentQIndex}
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22 }}
            className="rounded-3xl bg-linear-to-br from-app-surface via-app-surface to-app-accent/5 border border-app-border p-5 sm:p-7 shadow-xs relative overflow-hidden"
          >
            {/* Category Badge & Audio Prompt */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-app-border/40">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-app-accent/10 border border-app-accent/25 text-app-accent text-xs font-bold shadow-2xs">
                {currentQ.categoryBadge}
              </span>

              <button
                onClick={handleSpeakQuestion}
                className="p-1.5 rounded-xl hover:bg-app-accent/10 text-app-muted hover:text-app-accent transition-all cursor-pointer active:scale-95"
                title={isRtl ? 'استمع للسؤال' : 'Listen to question'}
              >
                <Volume2 size={16} />
              </button>
            </div>

            {/* Concise Question Title */}
            <h3 className="font-display text-lg sm:text-xl font-bold text-app-text leading-relaxed text-right">
              {currentQ.questionText}
            </h3>

            {/* Short Answer Options */}
            <div className="space-y-2.5 mt-6">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOptionId === opt.id
                const isCorrect = opt.id === currentQ.correctOptionId

                let stateClasses = 'bg-app-surface border-app-border hover:border-app-accent/60 text-app-text hover:bg-app-accent/5'
                if (answered) {
                  if (isCorrect) {
                    stateClasses = 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold shadow-xs'
                  } else if (isSelected) {
                    stateClasses = 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200 shadow-xs'
                  } else {
                    stateClasses = 'bg-app-surface/50 border-app-border/40 text-app-muted opacity-50'
                  }
                }

                return (
                  <button
                    key={opt.id}
                    disabled={answered}
                    onClick={() => handleSelectOption(opt.id)}
                    className={cn(
                      'w-full text-right p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 text-sm cursor-pointer active:scale-[0.99]',
                      stateClasses
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-app-bg border border-app-border/80 flex items-center justify-center text-xs font-mono font-bold text-app-muted shrink-0">
                        {toArabicDigits(i + 1)}
                      </span>
                      <span className="font-display font-medium leading-snug">{opt.text}</span>
                    </div>

                    {answered && (
                      <span className="shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : isSelected ? (
                          <XCircle size={18} className="text-rose-500" />
                        ) : null}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Explanation & Instant Actions */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-5 border-t border-app-border space-y-4"
                >
                  <div className="p-3.5 rounded-2xl bg-app-accent/8 border border-app-accent/20 text-xs text-app-text-secondary leading-relaxed font-serif">
                    <span className="font-bold text-app-accent block mb-1">💡 الإيضاح والحكمة:</span>
                    {currentQ.explanation}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/book/${index.book.id}/read?c=${currentQ.correctChapterId}`)}
                        className="text-xs gap-1.5"
                      >
                        <BookOpen size={14} />
                        قراءة هذا الباب
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const todayStr = new Date().toISOString().split('T')[0]
                          await db.virtueLogs.add({
                            id: uid('vlog'),
                            date: todayStr,
                            traitId: currentQ.correctChapterId,
                            traitTitle: currentQ.correctChapterTitle,
                            category: 'اختبار الخصال',
                            completed: true,
                            createdAt: Date.now(),
                          })
                          toast.habit(isRtl ? 'سُجلت الخصلة في جدول عاداتك اليومية!' : 'Habit logged!', currentQ.correctChapterTitle)
                        }}
                        className="text-xs gap-1.5 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check size={14} />
                        تطبيق الخصلة
                      </Button>
                    </div>

                    <Button onClick={handleNext} className="gap-2">
                      <span>{currentQIndex + 1 < questions.length ? 'السؤال التالي' : 'عرض النتيجة النهائية'}</span>
                      <ArrowLeft size={16} className={isRtl ? '' : 'rotate-180'} />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : (
        /* Rich Final Certificate & Scorecard */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-app-surface border border-app-border p-6 sm:p-8 text-center space-y-6 shadow-sm"
        >
          <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-app-accent/25 to-app-accent/10 border border-app-accent/30 text-app-accent mx-auto flex items-center justify-center shadow-inner">
            <Trophy size={36} />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-app-accent/10 text-app-accent text-xs font-bold mb-2">
              {rankBadge.title}
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-app-text">
              {isRtl ? 'اكتمل التحدي بنجاح!' : 'Quiz Finished Successfully!'}
            </h3>
            <p className="text-xs sm:text-sm text-app-text-secondary mt-1.5 font-serif max-w-md mx-auto">
              {rankBadge.desc}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto text-center">
            <div className="p-3 rounded-2xl bg-app-bg border border-app-border">
              <span className="text-[11px] text-app-muted block mb-1">النقاط</span>
              <span className="font-display text-xl font-bold text-app-accent">
                {toArabicDigits(score)} / {toArabicDigits(totalQuestions)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-app-bg border border-app-border">
              <span className="text-[11px] text-app-muted block mb-1">نسبة الإتقان</span>
              <span className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {toArabicDigits(accuracyPct)}٪
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-app-bg border border-app-border">
              <span className="text-[11px] text-app-muted block mb-1">أعلى متتالية</span>
              <span className="font-display text-xl font-bold text-amber-500">
                {toArabicDigits(bestStreak)} 🔥
              </span>
            </div>
          </div>

          {/* Quick Review of answers */}
          <div className="text-right border-t border-app-border/40 pt-4">
            <h4 className="text-xs font-bold text-app-muted mb-2">ملخص إجابات الأسئلة:</h4>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {userAnswers.map((ans, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-8 rounded-xl border flex items-center justify-center text-xs font-bold',
                    ans.isCorrect
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/50 text-rose-700 dark:text-rose-300'
                  )}
                  title={`السؤال ${i + 1}: ${ans.isCorrect ? 'صحيح' : 'خطأ'}`}
                >
                  {toArabicDigits(i + 1)}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button onClick={handleRestart} className="gap-2">
              <RotateCcw size={16} />
              {isRtl ? 'إعادة التحدي' : 'Restart Quiz'}
            </Button>

            <Button variant="outline" onClick={handleShareScore} className="gap-2">
              {copiedShare ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
              {isRtl ? 'مشاركة النتيجة' : 'Share Result'}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(`/book/${index.book.id}/read`)}
              className="gap-2"
            >
              <BookOpen size={16} />
              {isRtl ? 'متابعة القراءة' : 'Back to Reading'}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
