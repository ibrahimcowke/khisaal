import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Calendar, CheckCircle2, Circle, Flame, BookOpen, Sparkles, HelpCircle, RotateCcw } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db } from '../lib/db'
import { toArabicDigits } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/cn'

const TOTAL_DAYS = 30

export default function ReadingPlanPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
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
    if (window.confirm('هل تود حقاً إعادة ضبط خطة القراءة والبدء من جديد؟')) {
      await db.readingPlans.where('planId').equals('30-day-plan').delete()
    }
  }

  if (loading || !index) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ تجهيز خطة القراءة...</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-14 animate-fade-in">
      <PageHeader
        title="وِرد الخصال وخطط الختم"
        subtitle="خطة الـ 30 يوماً لختم واستيعاب موسوعة الخصال والآداب"
        count={`إنجاز ${toArabicDigits(percent)}٪`}
        actions={
          <button
            onClick={handleResetPlan}
            className="text-xs text-app-text-secondary hover:text-red-600 flex items-center gap-1 p-2 rounded-xl border border-app-border"
            title="إعادة ضبط الخطة"
          >
            <RotateCcw size={13} />
            <span>إعادة ضبط</span>
          </button>
        }
      />

      {/* Progress & Milestone Overview Hero */}
      <div className="bg-gradient-to-br from-app-surface via-app-surface to-app-accent/10 border border-app-border rounded-3xl p-5 sm:p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-app-accent/15 text-app-accent flex items-center justify-center font-display text-xl font-bold">
              🏆
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-app-text">ختمة الخصال في ٣٠ يوماً</h2>
              <p className="text-xs text-app-text-secondary mt-0.5">
                أنجزت {toArabicDigits(completedCount)} من {toArabicDigits(TOTAL_DAYS)} يوماً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-app-accent/10 border border-app-accent/20">
            <Flame size={16} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-app-accent">
              {toArabicDigits(completedCount)} أيام متتالية
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full bg-app-border/40 overflow-hidden relative">
          <div
            style={{ width: `${percent}%` }}
            className="h-full bg-gradient-to-l from-app-accent to-amber-500 transition-all duration-500 rounded-full"
          />
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          onClick={() => setActiveTab('plan')}
          className={cn(
            'py-2.5 px-2 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5',
            activeTab === 'plan'
              ? 'bg-app-accent text-white border-app-accent shadow-xs'
              : 'bg-app-surface border-app-border text-app-text hover:border-app-accent/60'
          )}
        >
          <Calendar size={14} />
          <span>جدول الـ 30 يوماً</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={cn(
            'py-2.5 px-2 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5',
            activeTab === 'daily'
              ? 'bg-app-accent text-white border-app-accent shadow-xs'
              : 'bg-app-surface border-app-border text-app-text hover:border-app-accent/60'
          )}
        >
          <Sparkles size={14} />
          <span>خصلة اليوم والتطبيق</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={cn(
            'py-2.5 px-2 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5',
            activeTab === 'quiz'
              ? 'bg-app-accent text-white border-app-accent shadow-xs'
              : 'bg-app-surface border-app-border text-app-text hover:border-app-accent/60'
          )}
        >
          <HelpCircle size={14} />
          <span>بطاقات الاختبار 🧠</span>
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
                  aria-label="تحديد كمنجز"
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
                      اليوم {toArabicDigits(d.day)}
                    </span>
                    {d.isCompleted && (
                      <span className="text-[10px] bg-app-accent text-white px-2 py-0.2 rounded-full font-bold">
                        تم الإنجاز ✓
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
                    <span>قراءة الورد</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Daily Trait & Action */}
      {activeTab === 'daily' && todayPlan && (
        <div className="space-y-6">
          <div className="bg-app-surface p-6 sm:p-8 rounded-3xl border border-app-accent/40 shadow-md text-center space-y-4">
            <span className="text-xs font-bold text-app-accent bg-app-accent/15 px-3 py-1 rounded-full inline-block">
              ❖ وِرد وخصلة اليوم (اليوم {toArabicDigits(todayDayNumber)}) ❖
            </span>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-app-text leading-snug">
              {todayPlan.chapters[0]?.title ?? 'في الحكمة والمروءة'}
            </h3>

            <div className="p-4 bg-app-accent/5 rounded-2xl border border-app-accent/15 text-right space-y-2">
              <p className="text-xs font-bold text-app-accent">💡 التطبيق السلوكي المقترح لهذا اليوم:</p>
              <p className="text-xs sm:text-sm text-app-text-secondary leading-relaxed">
                «احرص اليوم على استحضار هذه الخصلة في تعاملك مع أهلك وزملائك، واجعل من الحِلم وضبط النفس شعارك في كل موضع يثير الغضب أو العجلة.»
              </p>
            </div>

            <div className="pt-2">
              {todayPlan.chapters[0] && (
                <Button
                  onClick={() => navigate(`/book/${index.book.id}/read?c=${todayPlan.chapters[0].id}`)}
                  className="gap-2 px-6 py-3"
                >
                  <BookOpen size={16} />
                  <span>قراءة الباب والتأمل فيه</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Flashcard Quiz */}
      {activeTab === 'quiz' && quizItems.length > 0 && (
        <div className="space-y-6">
          {(() => {
            const currentItem = quizItems[quizIdx]
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-app-muted px-1">
                  <span>بطاقة {toArabicDigits(quizIdx + 1)} من {toArabicDigits(quizItems.length)}</span>
                  <span>اختبر حفظك ومعرفتك بالخصال</span>
                </div>

                <div
                  onClick={() => setShowAnswer((a) => !a)}
                  className="p-8 sm:p-10 rounded-3xl bg-app-surface border-2 border-app-accent/40 shadow-lg text-center cursor-pointer transition-all hover:border-app-accent min-h-[220px] flex flex-col justify-between items-center"
                >
                  <span className="text-xs font-bold text-app-accent bg-app-accent/10 px-3 py-1 rounded-full">
                    {showAnswer ? 'البيان والشرح' : 'السؤال والمفهوم (اضغط للكشف)'}
                  </span>

                  <div className="my-auto">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-app-text leading-snug">
                      {currentItem.title}
                    </h3>

                    {showAnswer && (
                      <p className="text-xs sm:text-sm text-app-text-secondary mt-3 leading-relaxed animate-fade-in font-display">
                        {currentItem.excerpt}
                      </p>
                    )}
                  </div>

                  <p className="text-[11px] text-app-muted">
                    {showAnswer ? 'اضغط لإخفاء الشرح' : '💡 اضغط على البطاقة لإظهار الشرح والتفصيل'}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button
                    variant="secondary"
                    disabled={quizIdx === 0}
                    onClick={() => {
                      setShowAnswer(false)
                      setQuizIdx((i) => Math.max(0, i - 1))
                    }}
                  >
                    السابق
                  </Button>

                  <Button
                    onClick={() => {
                      setShowAnswer(false)
                      setQuizIdx((i) => (i + 1) % quizItems.length)
                    }}
                  >
                    البطاقة التالية
                  </Button>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
