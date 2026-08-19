import { useEffect, useMemo, useState } from 'react'
import { Sheet } from '../ui/Sheet'
import { normalizeArabic, highlightMatches } from '../../lib/arabicNormalize'
import type { BookIndex } from '../../lib/bookData'
import { toArabicDigits } from '../../lib/format'
import { Search } from 'lucide-react'

export function ReaderSearchSheet({
  open,
  onOpenChange,
  index,
  currentChapterId,
  onJump,
  initialQuery,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  index: BookIndex
  currentChapterId: string
  onJump: (chapterId: string, blockId: string) => void
  initialQuery?: string
}) {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<'chapter' | 'book'>('chapter')

  useEffect(() => {
    if (open) setQuery(initialQuery ?? '')
    else setQuery('')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    const normQuery = normalizeArabic(q)
    if (!normQuery) return []
    const chapters = scope === 'chapter' ? index.chapters.filter((c) => c.id === currentChapterId) : index.chapters
    const out: { chapterId: string; chapterTitle: string; blockId: string; text: string }[] = []
    for (const c of chapters) {
      for (const b of c.blocks) {
        const text = b.text ?? (b.items ? b.items.join(' ') : '')
        if (!text) continue
        if (normalizeArabic(text).includes(normQuery)) {
          out.push({ chapterId: c.id, chapterTitle: c.title, blockId: b.id, text })
          if (out.length >= 60) return out
        }
      }
    }
    return out
  }, [query, scope, index, currentChapterId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="البحث في الكتاب" className="max-w-lg mx-auto">
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في النص..."
            dir="rtl"
            className="w-full rounded-xl border border-app-border bg-app-bg/40 py-2.5 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setScope('chapter')}
            className={scope === 'chapter' ? 'text-app-accent font-medium' : 'text-app-muted'}
          >
            هذا الفصل
          </button>
          <span className="text-app-border">|</span>
          <button
            onClick={() => setScope('book')}
            className={scope === 'book' ? 'text-app-accent font-medium' : 'text-app-muted'}
          >
            الكتاب كاملاً
          </button>
          {query && <span className="mr-auto text-app-muted">{toArabicDigits(results.length)} نتيجة</span>}
        </div>

        <ul className="max-h-[50vh] overflow-y-auto space-y-1">
          {results.map((r) => {
            const segments = highlightMatches(r.text, query)
            return (
              <li key={r.blockId}>
                <button
                  onClick={() => {
                    onJump(r.chapterId, r.blockId)
                    onOpenChange(false)
                  }}
                  className="w-full text-right rounded-lg px-3 py-2.5 hover:bg-black/5"
                >
                  <p className="text-xs text-app-accent mb-1">{r.chapterTitle}</p>
                  <p className="text-sm leading-relaxed line-clamp-2">
                    {segments.map((s, i) =>
                      s.match ? (
                        <mark key={i} className="bg-app-highlight rounded-[2px]">{s.text}</mark>
                      ) : (
                        <span key={i}>{s.text}</span>
                      )
                    )}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </Sheet>
  )
}
