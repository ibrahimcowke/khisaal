import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowLeft,
  Flame,
  Trophy,
} from 'lucide-react'
import { useBook } from '../context/BookContext'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { toArabicDigits } from '../lib/format'
import { useTranslation } from '../lib/i18n'
import { cn } from '../lib/cn'

interface Question {
  snippetText: string
  snippetType: string
  correctChapterId: string
  correctChapterTitle: string
  options: { id: string; title: string }[]
}

export default function QuizPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const { isRtl } = useTranslation()

  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  const [answered, setAnswered] = useState(false)
  const totalQuestions = 10

  // Generate 10 randomized questions from index chapters
  const questions = useMemo<Question[]>(() => {
    if (!index || index.chapters.length < 5) return []

    // Eligible chapters with good text blocks
    const eligible = index.chapters.filter((c) =>
      c.blocks.some((b) => (b.text?.length ?? 0) >= 30 && b.type !== 'heading')
    )

    // Shuffle chapters
    const shuffled = [...eligible].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, totalQuestions)

    return selected.map((correct) => {
      // Pick a representative block
      const goodBlocks = correct.blocks.filter(
        (b) => (b.text?.length ?? 0) >= 30 && b.type !== 'heading'
      )
      const block = goodBlocks[Math.floor(Math.random() * goodBlocks.length)] || correct.blocks[0]
      const snippet = block?.text || ''

      // Pick 3 random distractor chapters
      const distractors = index.chapters
        .filter((c) => c.id !== correct.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

      const options = [
        { id: correct.id, title: correct.title },
        ...distractors.map((d) => ({ id: d.id, title: d.title })),
      ].sort(() => Math.random() - 0.5)

      return {
        snippetText: snippet,
        snippetType: block?.type || 'quote',
        correctChapterId: correct.id,
        correctChapterTitle: correct.title,
        options,
      }
    })
  }, [index, totalQuestions])

  const currentQ = questions[currentQIndex]

  function handleSelectOption(optionId: string) {
    if (answered || !currentQ) return
    setSelectedOptionId(optionId)
    setAnswered(true)

    const isCorrect = optionId === currentQ.correctChapterId
    if (isCorrect) {
      setScore((s) => s + 1)
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > bestStreak) setBestStreak(newStreak)
    } else {
      setStreak(0)
    }
  }

  function handleNext() {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((i) => i + 1)
      setSelectedOptionId(null)
      setAnswered(false)
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
  }

  if (loading || !index) {
    return (
      <div className="min-h-screen flex items-center justify-center text-app-text-secondary">
        جارٍ التحميل...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16 animate-fade-in">
      <PageHeader
        title="اختبار الخصال والآداب"
        subtitle="اختبر حصيلتك ومعرفتك بمضامين الحكم والخصال الإسلامية"
        backTo="/tools"
      />

      {/* Quiz Progress & Stats Bar */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-app-surface border border-app-border mb-6 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs text-app-muted">السؤال</span>
          <span className="font-display font-bold text-sm text-app-accent">
            {toArabicDigits(Math.min(currentQIndex + 1, totalQuestions))} / {toArabicDigits(totalQuestions)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Trophy size={14} />
            <span>{toArabicDigits(score)} نقاط</span>
          </div>

          <div className="flex items-center gap-1 text-amber-500">
            <Flame size={14} />
            <span>{toArabicDigits(streak)} متتالية</span>
          </div>
        </div>
      </div>

      {!quizFinished && currentQ ? (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-app-border/70 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-app-accent h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl bg-gradient-to-br from-app-surface via-app-surface to-app-accent/5 border border-app-border p-6 sm:p-8 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-app-accent/15 text-app-accent">
                <HelpCircle size={16} />
              </span>
              <span className="text-xs font-bold text-app-accent uppercase tracking-wider">
                خمن الخصلة أو الباب الذي ينتمي إليه هذا النص:
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-app-bg/80 border border-app-border/80 my-4 text-right">
              <p className="font-serif text-base sm:text-lg leading-relaxed text-app-text italic">
                «{currentQ.snippetText}»
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mt-6">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOptionId === opt.id
                const isCorrect = opt.id === currentQ.correctChapterId

                let stateClasses = 'bg-app-surface border-app-border hover:border-app-accent/60 text-app-text'
                if (answered) {
                  if (isCorrect) {
                    stateClasses = 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                  } else if (isSelected) {
                    stateClasses = 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs'
                  } else {
                    stateClasses = 'bg-app-surface/50 border-app-border/40 text-app-muted opacity-60'
                  }
                }

                return (
                  <button
                    key={opt.id}
                    disabled={answered}
                    onClick={() => handleSelectOption(opt.id)}
                    className={cn(
                      'w-full text-right p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 text-sm cursor-pointer',
                      stateClasses
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-app-bg flex items-center justify-center text-xs font-mono font-bold text-app-muted shrink-0">
                        {toArabicDigits(i + 1)}
                      </span>
                      <span className="font-display font-medium leading-snug">{opt.title}</span>
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

            {/* Feedback & Next Action */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-5 border-t border-app-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/book/${index.book.id}/read?c=${currentQ.correctChapterId}`)
                      }
                      className="text-xs gap-1.5"
                    >
                      <BookOpen size={14} />
                      قراءة هذا الباب
                    </Button>
                  </div>

                  <Button onClick={handleNext} className="gap-2">
                    <span>السؤال التالي</span>
                    <ArrowLeft size={16} className={isRtl ? '' : 'rotate-180'} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : (
        /* Quiz Finished View */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-app-surface border border-app-border p-8 text-center space-y-6 shadow-sm"
        >
          <div className="w-16 h-16 rounded-3xl bg-app-accent/15 text-app-accent mx-auto flex items-center justify-center shadow-inner">
            <Trophy size={32} />
          </div>

          <div>
            <h3 className="font-display text-2xl font-bold text-app-text mb-2">
              اكتمل الاختبار بنجاح!
            </h3>
            <p className="text-sm text-app-text-secondary">
              نتيجتك النهائية في مسابقة الخصال والآداب:
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-app-bg border border-app-border inline-block min-w-56">
            <span className="font-display text-5xl font-bold text-app-accent leading-none">
              {toArabicDigits(score)}
            </span>
            <span className="text-lg text-app-muted font-display mr-2">
              / {toArabicDigits(totalQuestions)}
            </span>
            <p className="text-xs text-app-muted mt-2 font-medium">
              نسبة الصواب: {toArabicDigits(Math.round((score / totalQuestions) * 100))}٪
            </p>
          </div>

          <p className="font-serif text-sm text-app-text-secondary max-w-md mx-auto italic">
            {score >= 8
              ? '«ما شاء الله! معرفة عميقة وراسخة بالمنظومات الأخلاقية والأبواب التربوية.»'
              : score >= 5
              ? '«أداء طيب ومبارك! استمر في القراءة والمراجعة لترسيخ هذه الخصال الحميدة.»'
              : '«بداية جيدة! تفضل بمراجعة أبواب الموسوعة لزيادة رصيدك من الحِكم والخصال.»'}
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Button onClick={handleRestart} className="gap-2">
              <RotateCcw size={16} />
              إعادة الاختبار
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/book/${index.book.id}/read`)}
              className="gap-2"
            >
              <BookOpen size={16} />
              متابعة القراءة
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
