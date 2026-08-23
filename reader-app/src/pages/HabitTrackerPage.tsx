import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Circle,
  Flame,
  Calendar,
  Sparkles,
  BookOpen,
  Send,
  Check,
  HeartHandshake,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { db, uid } from '../lib/db'
import { useBook } from '../context/BookContext'
import { useTranslation } from '../lib/i18n'
import { Button } from '../components/ui/Button'

export default function HabitTrackerPage() {
  const { isRtl, formatDigits } = useTranslation()
  const { index, currentBookId, selectBook } = useBook()
  const navigate = useNavigate()

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const logs = useLiveQuery(() => db.virtueLogs.toArray()) || []

  const todayLog = useMemo(() => {
    return logs.find((l) => l.date === todayStr)
  }, [logs, todayStr])

  const [reflectionInput, setReflectionInput] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // Rotating trait of the day from index chapters
  const todayTrait = useMemo(() => {
    if (!index || index.chapters.length === 0) return null
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const chapterIdx = dayOfYear % index.chapters.length
    const chapter = index.chapters[chapterIdx]
    const block = chapter.blocks.find((b) => (b.text?.length ?? 0) > 25) || chapter.blocks[0]
    return {
      id: chapter.id,
      title: chapter.title,
      text: block?.text || '',
      category: chapter.tags[0] || 'الخصال والآداب',
    }
  }, [index])

  // Calculate Streak
  const streak = useMemo(() => {
    if (logs.length === 0) return 0
    const sortedDates = [...new Set(logs.filter((l) => l.completed).map((l) => l.date))].sort().reverse()
    let count = 0
    let checkDate = new Date()

    for (let i = 0; i < 365; i++) {
      const dStr = checkDate.toISOString().split('T')[0]
      if (sortedDates.includes(dStr)) {
        count++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (i === 0) {
        // If not logged today yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return count
  }, [logs])

  const toggleTodayComplete = async () => {
    if (!todayTrait) return
    if (todayLog) {
      await db.virtueLogs.update(todayLog.id, {
        completed: !todayLog.completed,
      })
    } else {
      await db.virtueLogs.add({
        id: uid('vl'),
        date: todayStr,
        traitId: todayTrait.id,
        traitTitle: todayTrait.title,
        category: todayTrait.category,
        completed: true,
        reflectionText: reflectionInput,
        createdAt: Date.now(),
      })
    }
  }

  const handleSaveReflection = async () => {
    if (!todayTrait) return
    setSavingNote(true)
    if (todayLog) {
      await db.virtueLogs.update(todayLog.id, {
        reflectionText: reflectionInput,
      })
    } else {
      await db.virtueLogs.add({
        id: uid('vl'),
        date: todayStr,
        traitId: todayTrait.id,
        traitTitle: todayTrait.title,
        category: todayTrait.category,
        completed: true,
        reflectionText: reflectionInput,
        createdAt: Date.now(),
      })
    }
    setTimeout(() => setSavingNote(false), 800)
  }

  // Recent 7 Days history
  const recentDays = useMemo(() => {
    const arr = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dStr = d.toISOString().split('T')[0]
      const log = logs.find((l) => l.date === dStr)
      arr.push({
        dateStr: dStr,
        dayName: d.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { weekday: 'narrow' }),
        dayNum: d.getDate(),
        completed: !!log?.completed,
        traitTitle: log?.traitTitle,
      })
    }
    return arr
  }, [logs, isRtl])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <HeartHandshake size={22} />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-app-text">
              {isRtl ? 'سجل تطبيق الخصال والأخلاق' : 'Daily Virtue Practice & Habit Tracker'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-app-text-secondary">
            {isRtl
              ? 'حوّل الحكم والمكارم إلى سلوك عملي يومي مع متابعة الالتزام والتأمل.'
              : 'Transform literary wisdom and virtues into daily practical actions and reflections.'}
          </p>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 self-start sm:self-auto shadow-xs">
          <Flame size={20} className="text-amber-500 animate-pulse" />
          <div>
            <p className="text-[10px] font-bold text-app-muted uppercase tracking-wider">{isRtl ? 'سلسلة الالتزام' : 'Current Streak'}</p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {formatDigits(streak)} {isRtl ? 'أيام متتالية' : 'Days'}
            </p>
          </div>
        </div>
      </div>

      {/* Book Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-app-surface border border-app-border mb-6 shadow-xs">
        <button
          onClick={() => selectBook('alkhisal-al-miatan')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            currentBookId === 'alkhisal-al-miatan'
              ? 'bg-app-accent text-white shadow-xs'
              : 'text-app-text-secondary hover:text-app-text hover:bg-black/5'
          }`}
        >
          <BookOpen size={14} />
          <span>{isRtl ? 'الخصال المائتان (200 خصلة)' : '200 Khisals Book'}</span>
        </button>

        <button
          onClick={() => selectBook('imtaa-al-qari-vol-1')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            currentBookId === 'imtaa-al-qari-vol-1'
              ? 'bg-app-accent text-white shadow-xs'
              : 'text-app-text-secondary hover:text-app-text hover:bg-black/5'
          }`}
        >
          <BookOpen size={14} />
          <span>{isRtl ? 'إمتاع القارئ (المجلد 1)' : 'Imtaa Al-Qari (Vol 1)'}</span>
        </button>
      </div>

      {/* Main Focus Card: Trait of the Day */}
      {todayTrait && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 sm:p-8 rounded-3xl bg-linear-to-b from-app-surface via-app-surface/95 to-app-accent/10 border-2 border-app-accent/30 shadow-md relative overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-app-accent text-white shadow-xs">
              <Sparkles size={13} />
              {isRtl ? 'خصلة وفضيلة اليوم' : 'Trait of the Day'}
            </span>
            <span className="text-xs text-app-muted font-medium">
              {todayStr}
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-app-text mb-3">
            {todayTrait.title}
          </h2>

          <p className="text-sm sm:text-base text-app-text-secondary font-serif leading-relaxed mb-6 bg-app-bg/50 p-4 rounded-2xl border border-app-border/60">
            {todayTrait.text}
          </p>

          {/* Action Checkbox and Jump to Book */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-app-border/80">
            <button
              onClick={toggleTodayComplete}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all active:scale-95 text-sm font-bold shadow-xs ${
                todayLog?.completed
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-app-surface border-app-border text-app-text hover:border-app-accent'
              }`}
            >
              {todayLog?.completed ? <CheckCircle size={20} className="text-white" /> : <Circle size={20} className="text-app-muted" />}
              <span>{todayLog?.completed ? (isRtl ? 'تم تطبيق الخصلة اليوم بنجاح 🎉' : 'Practiced Today!') : (isRtl ? 'أكد تطبيق هذه الخصلة اليوم' : 'Mark Practiced Today')}</span>
            </button>

            <Button
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={() => navigate(`/book/${index?.book.id || 'imtaa-al-qari-vol-1'}/read?c=${todayTrait.id}`)}
            >
              <BookOpen size={14} />
              {isRtl ? 'قراءة الشرح الكامل في الكتاب' : 'Read Full Chapter'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Reflection & Practice Journal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Reflection Box */}
        <div className="p-6 rounded-3xl bg-app-surface border border-app-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-app-accent" />
              <h3 className="font-display text-base font-bold text-app-text">
                {isRtl ? 'تأمل وملاحظة اليوم' : 'Daily Reflection Note'}
              </h3>
            </div>
            <p className="text-xs text-app-muted mb-2 leading-relaxed">
              {isRtl
                ? 'كيف طبقت هذه الفضيلة في تعاملك اليوم مع أهلك أو عملك أو مجتمعك؟'
                : 'How did you embody this trait in your interactions, family, or work today?'}
            </p>

            {/* Guided Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                isRtl ? '💡 ما الموقف الذي مارست فيه هذا الخلق اليوم؟' : 'What situation tested this virtue?',
                isRtl ? '🌱 كيف يمكنك ترسيخ هذه الخصلة غداً؟' : 'How can you apply this tomorrow?',
                isRtl ? '✨ ما الأثر الإيجابي الذي لاحظته؟' : 'What positive impact did you notice?',
              ].map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => {
                    const current = reflectionInput || todayLog?.reflectionText || ''
                    setReflectionInput(current ? `${current}\n${prompt} ` : `${prompt} `)
                  }}
                  className="px-2.5 py-1 rounded-xl bg-app-accent/10 hover:bg-app-accent/20 border border-app-accent/20 text-[11px] text-app-accent font-medium transition-colors text-right"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={reflectionInput || todayLog?.reflectionText || ''}
              onChange={(e) => setReflectionInput(e.target.value)}
              placeholder={isRtl ? 'سجل ملاحظتك وتأملك الشخصي هنا...' : 'Write your personal reflection...'}
              className="w-full p-3.5 rounded-2xl border border-app-border bg-app-bg text-app-text text-sm focus:border-app-accent outline-none font-serif leading-relaxed"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="primary"
              className="gap-1.5 text-xs"
              onClick={handleSaveReflection}
              disabled={savingNote}
            >
              {savingNote ? <Check size={14} /> : <Send size={14} />}
              {savingNote ? (isRtl ? 'تم الحفظ' : 'Saved') : (isRtl ? 'حفظ التأمل' : 'Save Reflection')}
            </Button>
          </div>
        </div>

        {/* 7-Day Completion Tracker */}
        <div className="p-6 rounded-3xl bg-app-surface border border-app-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-app-accent" />
              <h3 className="font-display text-base font-bold text-app-text">
                {isRtl ? 'سجل الأيام السبعة الأخيرة' : 'Last 7 Days Progress'}
              </h3>
            </div>
            <p className="text-xs text-app-muted mb-5">
              {isRtl ? 'نظرة سريعة على التزامك خلال الأسبوع الجاري' : 'A quick overview of your weekly virtue practice'}
            </p>

            <div className="grid grid-cols-7 gap-2 text-center">
              {recentDays.map((d, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between gap-1 transition-all ${
                    d.completed
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'bg-app-bg/50 border-app-border/70 text-app-muted'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase">{d.dayName}</span>
                  <span className="font-display text-sm font-bold">{formatDigits(d.dayNum)}</span>
                  {d.completed ? (
                    <CheckCircle size={14} className="text-emerald-500 mt-1" />
                  ) : (
                    <Circle size={14} className="text-app-border mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-app-border/60 flex items-center justify-between text-xs text-app-muted">
            <span>{isRtl ? 'مجموع الخصال المطبقة:' : 'Total Completed:'}</span>
            <span className="font-display font-bold text-app-accent text-sm">
              {formatDigits(logs.filter((l) => l.completed).length)} {isRtl ? 'خصلة' : 'Virtues'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
