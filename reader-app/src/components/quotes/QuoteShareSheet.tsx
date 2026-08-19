import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Loader2 } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { QuoteCard, QUOTE_LAYOUTS, type QuoteCardLayout } from './QuoteCard'
import { cn } from '../../lib/cn'

export function QuoteShareSheet({
  open,
  onOpenChange,
  text,
  bookTitle,
  author,
  sourcePage,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  text: string
  bookTitle: string
  author: string
  sourcePage?: number
}) {
  const [layout, setLayout] = useState<QuoteCardLayout>('minimal-paper')
  const [exporting, setExporting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  async function handleExport() {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'quote.png'
      a.click()
    } catch {
      // export can fail if fonts haven't finished loading; ignore silently
    } finally {
      setExporting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="مشاركة الاقتباس" className="max-w-lg mx-auto">
      <div className="space-y-4">
        <div className="flex justify-center overflow-hidden rounded-xl border border-app-border" style={{ maxHeight: 320 }}>
          <div style={{ transform: 'scale(0.5)', transformOrigin: 'top center', marginBottom: -338 }}>
            <QuoteCard ref={cardRef} text={text} bookTitle={bookTitle} author={author} sourcePage={sourcePage} layout={layout} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {QUOTE_LAYOUTS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLayout(l.key)}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs',
                layout === l.key ? 'border-app-accent bg-app-accent/10 text-app-accent' : 'border-app-border text-app-text-secondary'
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        <Button className="w-full" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          تنزيل كصورة
        </Button>
      </div>
    </Sheet>
  )
}
