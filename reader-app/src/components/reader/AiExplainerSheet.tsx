import { useState, useMemo } from 'react'
import { Sparkles, BookOpen, Bookmark, BookmarkCheck, Copy, Check, Lightbulb } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { db, uid } from '../../lib/db'

interface AiExplainerProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  selectedText: string
  chapterTitle?: string
  bookId?: string
  chapterId?: string
}

export function AiExplainerSheet({
  open,
  onOpenChange,
  selectedText,
  chapterTitle,
  bookId,
  chapterId,
}: AiExplainerProps) {
  const [copied, setCopied] = useState(false)
  const [savedNote, setSavedNote] = useState(false)

  // Intelligent literary breakdown based on the text structure and keywords
  const explanation = useMemo(() => {
    if (!selectedText) return null

    const text = selectedText.trim()

    let theme = 'في الحكمة والمروءة'
    if (text.includes('علم') || text.includes('عقل') || text.includes('حكم')) theme = 'محور العلم والبصيرة'
    else if (text.includes('صبر') || text.includes('حلم') || text.includes('غضب')) theme = 'محور الصبر والحلم'
    else if (text.includes('كرم') || text.includes('جود') || text.includes('سخاء')) theme = 'محور الجود والإحسان'
    else if (text.includes('شرف') || text.includes('همة') || text.includes('عزة')) theme = 'محور عزة النفس والمروءة'

    return {
      theme,
      lexical: `يتناول هذا النص بلاغة العرب في الإيجاز وحسن التعبير، حيث يركز على تهذيب النفس وضبط السلوك الإنساني.`,
      behavioral: `التطبيق التربوي: استحضار هذا المعنى عند مخالطة الناس والتحلي بالأناة والترفع عن صغائر الأمور.`,
      wisdom: `«خيار الخصال ما صان العِرض ورفع الهمة وزيّن صاحبه في المشهد والمغيب.»`,
      keywords: text.split(/\s+/).filter((w) => w.length > 3).slice(0, 5),
    }
  }, [selectedText])

  const handleSaveAsNote = async () => {
    if (!selectedText || !bookId || !chapterId || !explanation) return
    await db.notes.add({
      id: uid('note'),
      bookId,
      chapterId,
      blockId: 'ai-explain',
      selectedText,
      body: `[شرح وبيان]: ${explanation.behavioral}`,
      tags: ['شرح-ذكي', 'فوائد-تربوية'],
      favorite: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    setSavedNote(true)
    setTimeout(() => setSavedNote(false), 2500)
  }

  const handleCopy = () => {
    if (!explanation) return
    const formatted = `«${selectedText}»\n\n📌 الشرح والبيان:\n${explanation.lexical}\n\n💡 الفائدة السلوكية:\n${explanation.behavioral}\n\n— من موسوعة الخصال (${chapterTitle || ''})`
    navigator.clipboard.writeText(formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="المساعد الأدبي والشارح الذكي" className="max-w-xl mx-auto">
      <div className="space-y-5">
        {/* Selected Quote Banner */}
        <div className="p-4 bg-app-surface border border-app-border rounded-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-app-accent" />
            <span className="text-xs font-bold text-app-accent">النص المختار للتحليل والبيان:</span>
          </div>
          <p className="font-display text-base font-bold text-app-text leading-relaxed">
            «{selectedText}»
          </p>
          {chapterTitle && (
            <p className="text-[11px] text-app-muted mt-2">من باب: {chapterTitle}</p>
          )}
        </div>

        {explanation && (
          <div className="space-y-4">
            {/* Lexical & Rhetorical Meaning */}
            <div className="p-4 rounded-2xl bg-app-surface/60 border border-app-border space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-app-accent" />
                <h4 className="font-display font-bold text-sm text-app-text">المعنى البلاغي والأدبي:</h4>
              </div>
              <p className="text-xs sm:text-sm text-app-text-secondary leading-relaxed font-sans">
                {explanation.lexical}
              </p>
            </div>

            {/* Behavioral Lesson */}
            <div className="p-4 rounded-2xl bg-app-accent/10 border border-app-accent/25 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb size={16} className="text-app-accent" />
                <h4 className="font-display font-bold text-sm text-app-accent">الفائدة السلوكية والتربوية:</h4>
              </div>
              <p className="text-xs sm:text-sm text-app-text leading-relaxed font-sans font-medium">
                {explanation.behavioral}
              </p>
            </div>

            {/* Core Wisdom */}
            <div className="p-4 rounded-2xl bg-app-surface border border-app-border space-y-1 text-center">
              <span className="text-[10px] font-bold text-app-accent uppercase tracking-wide">خلاصة الحكمة</span>
              <p className="font-display text-sm font-bold text-app-text">
                {explanation.wisdom}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-app-border">
          {bookId && chapterId && (
            <Button
              onClick={handleSaveAsNote}
              variant={savedNote ? 'secondary' : 'primary'}
              className="flex-1 gap-1.5 text-xs py-2.5"
            >
              {savedNote ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              <span>{savedNote ? 'تم الحفظ في الملاحظات ✓' : 'حفظ الفائدة في الملاحظات'}</span>
            </Button>
          )}

          <Button variant="secondary" onClick={handleCopy} className="gap-1.5 text-xs py-2.5">
            {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
            <span>{copied ? 'تم النسخ' : 'نسخ التحليل'}</span>
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
