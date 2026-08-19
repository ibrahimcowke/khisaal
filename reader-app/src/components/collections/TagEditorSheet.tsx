import { useMemo, useState } from 'react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'

export function TagEditorSheet({
  open,
  onOpenChange,
  initialTags,
  suggestions,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialTags: string[]
  suggestions: string[]
  onSave: (tags: string[]) => void
}) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [input, setInput] = useState('')

  const filteredSuggestions = useMemo(() => {
    const q = input.trim().replace(/^#/, '')
    return suggestions.filter((s) => !tags.includes(s) && (q === '' || s.includes(q))).slice(0, 8)
  }, [suggestions, tags, input])

  function addTag(raw?: string) {
    const t = (raw ?? input).trim().replace(/^#/, '')
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setInput('')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="الوسوم" className="max-w-sm mx-auto">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {tags.length === 0 && <p className="text-xs text-app-muted">لا توجد وسوم بعد</p>}
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTags(tags.filter((x) => x !== t))}
              className="text-xs px-2.5 py-1 rounded-full bg-app-accent/10 text-app-accent flex items-center gap-1"
            >
              #{t} ×
            </button>
          ))}
        </div>

        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              addTag()
            }
          }}
          placeholder="أضف وسماً جديداً..."
          dir="rtl"
          className="w-full rounded-xl border border-app-border bg-app-bg/40 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40"
        />

        {filteredSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => addTag(s)}
                className="text-xs px-2.5 py-1 rounded-full border border-app-border text-app-text-secondary hover:border-app-accent hover:text-app-accent"
              >
                + {s}
              </button>
            ))}
          </div>
        )}

        <Button
          className="w-full"
          onClick={() => {
            onSave(tags)
            onOpenChange(false)
          }}
        >
          حفظ الوسوم
        </Button>
      </div>
    </Sheet>
  )
}
