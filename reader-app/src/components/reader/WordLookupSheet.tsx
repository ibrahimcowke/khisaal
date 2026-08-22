import { useState, useMemo } from 'react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { Search, Copy, Check, BookOpen, Layers, Sparkles, PlusCircle } from 'lucide-react'
import { lookupWordInLexicon } from '../../lib/arabicLexicon'
import { db, uid } from '../../lib/db'

export function WordLookupSheet({
  open,
  onOpenChange,
  word,
  onSearchInBook,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  word: string
  onSearchInBook: (word: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const [cardAdded, setCardAdded] = useState(false)

  const entry = useMemo(() => {
    if (!word) return null
    return lookupWordInLexicon(word)
  }, [word])

  async function handleCopy() {
    await navigator.clipboard.writeText(word)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  async function handleAddToFlashcards() {
    if (!entry) return
    const today = new Date().toISOString().split('T')[0]
    await db.flashcards.add({
      id: uid('fc'),
      front: entry.word || word,
      back: `الجذر: (${entry.root})\n\nالمعنى: ${entry.meaning}${entry.source ? `\n\nالمصدر: ${entry.source}` : ''}`,
      category: 'مفردات ولغة',
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: today,
      createdAt: Date.now(),
    })
    setCardAdded(true)
    setTimeout(() => setCardAdded(false), 1800)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="المعجم والتحليل اللغوي" className="max-w-md mx-auto">
      <div className="space-y-4">
        {/* Word and Root Header Card */}
        <div className="p-4 rounded-2xl bg-linear-to-b from-app-accent/10 via-app-surface to-app-surface border border-app-accent/20 text-center relative overflow-hidden">
          <p className="font-display text-3xl font-bold text-app-text mb-2 tracking-wide">{entry?.word || word}</p>
          
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {entry?.root && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-app-accent/15 text-app-accent border border-app-accent/30">
                <Layers size={12} />
                الجذر: {entry.root}
              </span>
            )}
            {entry?.pattern && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-app-surface border border-app-border text-app-muted">
                الوزن: {entry.pattern}
              </span>
            )}
          </div>
        </div>

        {/* Definition Section */}
        {entry && (
          <div className="p-4 rounded-2xl bg-app-surface border border-app-border/80 space-y-3">
            <div>
              <p className="text-xs font-bold text-app-accent mb-1 flex items-center gap-1">
                <Sparkles size={13} />
                البيان والمعنى اللغوي:
              </p>
              <p className="text-sm text-app-text leading-relaxed font-serif">{entry.meaning}</p>
            </div>

            {entry.source && (
              <p className="text-[11px] text-app-muted border-t border-app-border/50 pt-2">
                المصدر: <span className="font-medium text-app-text-secondary">{entry.source}</span>
              </p>
            )}

            {entry.synonyms && entry.synonyms.length > 0 && (
              <div className="pt-2 border-t border-app-border/50">
                <p className="text-[11px] font-bold text-app-muted mb-1">المرادفات والنظائر:</p>
                <div className="flex flex-wrap gap-1.5">
                  {entry.synonyms.map((s, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-app-bg border border-app-border text-app-text-secondary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {entry.examples && entry.examples.length > 0 && (
              <div className="pt-2 border-t border-app-border/50">
                <p className="text-[11px] font-bold text-app-muted mb-1">الشواهد والأمثلة:</p>
                <div className="space-y-1">
                  {entry.examples.map((ex, i) => (
                    <p key={i} className="text-xs italic text-app-accent font-serif bg-app-accent/5 p-2 rounded-lg border border-app-accent/10">
                      {ex}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <Button
            variant="primary"
            className="w-full justify-center gap-1.5"
            onClick={handleAddToFlashcards}
            disabled={cardAdded}
          >
            {cardAdded ? <Check size={15} className="text-emerald-400" /> : <PlusCircle size={15} />}
            {cardAdded ? 'تمت الإضافة إلى بطاقات الحفظ ✅' : 'إضافة إلى بطاقات المراجعة (Flashcards)'}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="w-full text-xs justify-center gap-1.5"
              onClick={() => {
                onSearchInBook(word)
                onOpenChange(false)
              }}
            >
              <Search size={14} />
              البحث في الكتاب
            </Button>
            <Button variant="outline" className="w-full text-xs justify-center gap-1.5" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'تم النسخ' : 'نسخ الكلمة'}
            </Button>
          </div>
        </div>

        <a
          href={`https://www.almaany.com/ar/dict/ar-ar/${encodeURIComponent(word)}/`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-app-accent hover:underline pt-1"
        >
          <BookOpen size={13} />
          البحث الموسع في قاموس المعاني (رابط خارجي)
        </a>
      </div>
    </Sheet>
  )
}
