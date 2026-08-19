import { useState } from 'react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'

export function NoteEditorSheet({
  open,
  onOpenChange,
  selectedText,
  initialBody,
  initialTags,
  onSave,
  onDelete,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  selectedText: string
  initialBody?: string
  initialTags?: string[]
  onSave: (body: string, tags: string[]) => void
  onDelete?: () => void
}) {
  const [body, setBody] = useState(initialBody ?? '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(initialTags ?? [])

  function addTag() {
    const t = tagInput.trim().replace(/^#/, '')
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="ملاحظة" className="max-w-lg mx-auto">
      <div className="space-y-4">
        <blockquote className="border-r-2 border-app-accent/50 pr-3 text-sm text-app-text-secondary leading-relaxed max-h-24 overflow-y-auto">
          "{selectedText}"
        </blockquote>
        <textarea
          autoFocus
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="اكتب ملاحظتك هنا..."
          rows={5}
          dir="rtl"
          className="w-full resize-none rounded-xl border border-app-border bg-app-bg/40 px-3.5 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-app-accent/40"
        />
        <div>
          <div className="flex flex-wrap gap-1.5 mb-2">
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
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                addTag()
              }
            }}
            onBlur={addTag}
            placeholder="أضف وسماً واضغط Enter"
            dir="rtl"
            className="w-full rounded-xl border border-app-border bg-app-bg/40 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-app-accent/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="flex-1"
            disabled={!body.trim()}
            onClick={() => {
              onSave(body.trim(), tags)
              onOpenChange(false)
            }}
          >
            حفظ الملاحظة
          </Button>
          {onDelete && (
            <Button variant="destructive" onClick={() => { onDelete(); onOpenChange(false) }}>
              حذف
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  )
}
