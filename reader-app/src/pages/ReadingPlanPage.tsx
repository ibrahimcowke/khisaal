import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Calendar, CheckCircle2, Circle, Flame, BookOpen, Sparkles, HelpCircle, RotateCcw } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/cn'
import { useTranslation } from '../lib/i18n'

const TOTAL_DAYS = 30

export default function ReadingPlanPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const { t, isRtl, formatDigits } = useTranslation()
  const [activeTab, setActiveTab] = useState<'plan' | 'daily' | 'quiz'>('plan')
  const [quizIdx, setQuizIdx] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  // Live query for completed days
  const progressRecords = useLiveQuery(() => db.readingPlans.where('planId').equals('30-day-plan').toArray(), [])

  const completedMap = useMemo(() => {
    const map = new Map<number, boolean>()
    for (const r of progressRecords ?? []) {
      if (r.completed) map.set(r.day, true)
    }
    return map
  }, [progressRecords])

  const completedCount = completedMap.size
  const percent = Math.round((completedCount / TOTAL_DAYS) * 100)

  // 30 Days mapping of chapters
  const daysPlan = useMemo(() => {
    if (!index) return []
    const totalChapters = index.chapters.length
    const perDay = Math.ceil(totalChapters / TOTAL_DAYS)

    const list = []
    for (let day = 1; day <= TOTAL_DAYS; day++) {
      const startIdx = (day - 1) * perDay
      const endIdx = Math.min(totalChapters, day * perDay)
      const dayChapters = index.chapters.slice(startIdx, endIdx)
      list.push({
        day,
        chapters: dayChapters,
        isCompleted: !!completedMap.get(day),
      })
    }
    return list
  }, [index, completedMap])

  // Daily trait of the day based on day of month
  const todayDayNumber = ((new Date().getDate() - 1) % TOTAL_DAYS) + 1
  const todayPlan = daysPlan.find((d) => d.day === todayDayNumber)

  // Quiz flashcard items
  const quizItems = useMemo(() => {
    if (!index) return []
    return index.chapters.slice(0, 30).map((c, i) => {
      const firstBlock = c.blocks[0]?.text ?? ''
      return {
        id: c.id,
        number: i + 1,
        title: c.title,
        excerpt: firstBlock.slice(0, 160) + '...',
      }
    })
  }, [index])

  const handleToggleDay = async (day: number) => {
    const current = completedMap.get(day)
    if (current) {
      await db.readingPlans.where({ planId: '30-day-plan', day }).delete()
    } else {
      await db.readingPlans.put({
        id: `plan-30-${day}`,
        planId: '30-day-plan',
        day,
        completed: true,
        completedAt: Date.now(),
      })
    }
  }

  const handleResetPlan = async () => {
    if (window.confirm(isRtl ? 'هل تود حقاً إعادة ضبط خطة القراءة والبدء من جديد؟' : 'Reset the 30-day reading plan?')) {
      await db.readingPlans.where('planId').equals('30-day-plan').delete()
    }
  }

  if (loading || !index) {
    return (
      <div className="min-h-screen flex items-center justify-center text-app-text-secondary">
        {t('loading')}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-14 animate-fade-in">
      <PageHeader
        title={t('readingPlanTitle')}
        subtitle={t('readingPlanSubtitle')}
        count={`${formatDigits(percent)}%`}
        actions={
          <button
            onClick={handleResetPlan}
            className="text-xs text-app-text-secondary hover:text-red-600 flex items-center gap-1 p-2 rounded-xl border border-app-border"
            title={isRtl ? 'إعادة ضبط الخطة' : 'Reset Plan'}
          >
            <RotateCcw size={13} />
            <span>{isRtl ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        }
      />

      {/* Progress & Milestone Overview Hero */}
      <div className="bg-linear-to-br from-app-surface via-app-surface to-app-accent/10 border border-app-border rounded-3xl p-5 sm:p-6 mb-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-app-accent/15 text-app-accent flex items-center justify-center font-display text-xl font-bold">
              🏆
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-app-text">{t('readingPlanTitle')}</h2>
              <p className="text-xs text-app-text-secondary mt-0.5">
                {t('completedDays', { count: formatDigits(completedCount) })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-app-accent/10 border border-app-accent/20">
            <Flame size={16} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-app-accent">
              {formatDigits(completedCount)} {isRtl ? 'أيام متتالية' : 'Days Streak'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full bg-app-border/40 overflow-hidden relative">
          <div
            style={{ width: `${percent}%` }}
            className={`h-full ${isRtl ? 'bg-linear-to-l' : 'bg-linear-to-r'} from-app-accent to-amber-500 transition-all duration-500 rounded-full`}
          />
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-6">
        <button
          onClick={() => setActiveTab('plan')}
          className={cn(
            'py-2.5 px-1 sm:px-2 rounded-2xl text-[11px] sm:text-xs font-bold border transition-all flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95 touch-manipulation',
            activeTab === 'plan'
              ? 'bg-app-accent text-white border-app-accent shadow-xs'
              : 'bg-app-surface border-app-border text-app-text hover:border-app-accent/60'
          )}
        >
          <Calendar size={13} className="shrink-0" />
          <span className="truncate">{isRtl ? 'جدول الـ 30 يوماً' : '30-Day Schedule'}</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={cn(
            'py-2.5 px-1 sm:px-2 rounded-2xl text-[11px] sm:text-xs font-bold border transition-all flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95 touch-manipulation',
            activeTab === 'daily'
              ? 'bg-app-accent text-white border-app-accent shadow-xs'
              : 'bg-app-surface border-app-border text-app-text hover:border-app-accent/60'
          )}
        >
          <Sparkles size={13} className="shrink-0" />
          <span className="truncate">{isRtl ? 'خصلة اليوم' : "Today's Trait"}</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={cn(
            'py-2.5 px-1 sm:px-2 rounded-2xl text-[11px] sm:text-xs font-bold border transition-all flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95 touch-manipulation',
            activeTab === 'quiz'
              ? 'bg-app-accent text-white border-app-accent shadow-xs'
              : 'bg-app-surface border-app-border text-app-text hover:border-app-accent/60'
          )}
        >
          <HelpCircle size={13} className="shrink-0" />
          <span className="truncate">{isRtl ? 'بطاقات الاختبار' : 'Flashcards'}</span>
        </button>
      </div>

      {/* Tab Content: 30-Day Plan Grid */}
      {activeTab === 'plan' && (
        <div className="space-y-3">
          {daysPlan.map((d) => (
            <div
              key={d.day}
              className={cn(
                'p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                d.isCompleted
                  ? 'bg-app-accent/10 border-app-accent/60'
                  : 'bg-app-surface border-app-border hover:border-app-accent/50'
              )}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <button
                  onClick={() => handleToggleDay(d.day)}
                  className="mt-0.5 sm:mt-0 text-app-accent transition-transform active:scale-90"
                  aria-label={d.isCompleted ? t('planCompleted') : t('planPending')}
                >
                  {d.isCompleted ? (
                    <CheckCircle2 size={24} className="fill-app-accent text-white" />
                  ) : (
                    <Circle size={24} className="text-app-muted hover:text-app-accent" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm sm:text-base text-app-text">
                      {t('dayPlan', { day: formatDigits(d.day) })}
                    </span>
                    {d.isCompleted && (
                      <span className="text-[10px] bg-app-accent text-white px-2 py-0.2 rounded-full font-bold">
                        {t('planCompleted')} ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-app-text-secondary mt-0.5 truncate">
                    {d.chapters.map((c) => c.title).join(' · ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {d.chapters[0] && (
                  <Button
                    size="sm"
                    variant={d.isCompleted ? 'secondary' : 'primary'}
                    onClick={() => navigate(`/book/${index.book.id}/read?c=${d.chapters[0].id}`)}
                    className="gap-1 text-xs"
                  >
                    <BookOpen size={13} />
                    <span>{t('startReadingDay')}</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Daily Trait & Action */}
      {activeTab === 'daily' && todayPlan && (
        <div className="space-y-4">
          <div className="bg-app-surface p-6 rounded-3xl border border-app-border space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-app-accent">
              <Sparkles size={16} />
              <span>{isRtl ? `الورد اليومي المقترح لليوم ${formatDigits(todayPlan.day)}` : `Recommended Reading for Day ${formatDigits(todayPlan.day)}`}</span>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-app-text">
                {todayPlan.chapters[0]?.title ?? (isRtl ? 'خصلة المروءة وحفظ اللسان' : 'Noble Traits')}
              </h3>
              <p className="text-sm text-app-text-secondary leading-relaxed">
                {todayPlan.chapters[0]?.blocks[0]?.text ?? ''}
              </p>
            </div>

            <div className="pt-4 border-t border-app-border/60 flex items-center justify-between">
              <span className="text-xs text-app-muted">
                {isRtl ? `${formatDigits(todayPlan.chapters.length)} أبواب في ورد اليوم` : `${formatDigits(todayPlan.chapters.length)} chapters in today's reading`}
              </span>
              {todayPlan.chapters[0] && (
                <Button
                  onClick={() => navigate(`/book/${index.book.id}/read?c=${todayPlan.chapters[0].id}`)}
                  className="gap-2"
                >
                  <BookOpen size={16} />
                  <span>{isRtl ? 'قراءة الباب كاملاً' : 'Read Full Chapter'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Quiz & Flashcards */}
      {activeTab === 'quiz' && quizItems.length > 0 && (
        <div className="space-y-4">
          <div className="bg-app-surface p-6 rounded-3xl border border-app-border space-y-5 shadow-xs text-center">
            <div className="flex items-center justify-between text-xs text-app-muted">
              <span>{isRtl ? 'بطاقة استذكار' : 'Flashcard'} {formatDigits(quizIdx + 1)} / {formatDigits(quizItems.length)}</span>
              <span className="font-bold text-app-accent">❖</span>
            </div>

            <div className="py-6 space-y-3">
              <p className="text-xs font-bold text-app-accent">{isRtl ? 'ما هو عنوان هذا الباب من الشاهد؟' : 'What is the title of this chapter from the excerpt?'}</p>
              <p className="font-display text-lg sm:text-xl text-app-text leading-relaxed px-4 italic">
                «{quizItems[quizIdx].excerpt}»
              </p>
            </div>

            {showAnswer ? (
              <div className="p-4 bg-app-accent/15 rounded-2xl border border-app-accent/30 space-y-2 animate-fade-in">
                <p className="text-xs font-bold text-app-accent">{isRtl ? 'الإجابة / عنوان الباب:' : 'Answer / Chapter Title:'}</p>
                <h4 className="font-display text-lg font-bold text-app-text">{quizItems[quizIdx].title}</h4>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setShowAnswer(true)}
                className="w-full max-w-xs mx-auto"
              >
                {isRtl ? 'كشف الإجابة 👁️' : 'Reveal Answer 👁️'}
              </Button>
            )}

            <div className="flex items-center justify-center gap-3 pt-4 border-t border-app-border/60">
              <Button
                variant="ghost"
                disabled={quizIdx === 0}
                onClick={() => {
                  setQuizIdx((q) => Math.max(0, q - 1))
                  setShowAnswer(false)
                }}
              >
                {t('prevPage')}
              </Button>
              <Button
                disabled={quizIdx >= quizItems.length - 1}
                onClick={() => {
                  setQuizIdx((q) => Math.min(quizItems.length - 1, q + 1))
                  setShowAnswer(false)
                }}
              >
                {t('nextPage')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
