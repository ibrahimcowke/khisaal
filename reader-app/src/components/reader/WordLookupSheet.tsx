import { useState } from 'react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { Search, Copy, Check, BookOpen } from 'lucide-react'

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

  async function handleCopy() {
    await navigator.clipboard.writeText(word)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="تعريف الكلمة" className="max-w-sm mx-auto">
      <div className="space-y-4">
        <div className="text-center py-3">
          <p className="font-display text-3xl">{word}</p>
        </div>
        <p className="text-xs text-app-muted text-center leading-relaxed">
          لا يتوفر قاموس متصل حالياً لعرض تعريف دقيق، تجنباً لتقديم معلومات غير موثوقة.
          يمكنك البحث عن استخدامات هذه الكلمة داخل الكتاب أو نسخها للبحث عنها في مصدر آخر.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={() => {
              onSearchInBook(word)
              onOpenChange(false)
            }}
          >
            <Search size={15} />
            البحث عن الكلمة داخل الكتاب
          </Button>
          <Button variant="outline" className="w-full" onClick={handleCopy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'تم النسخ' : 'نسخ الكلمة'}
          </Button>
        </div>
        <a
          href={`https://www.almaany.com/ar/dict/ar-ar/${encodeURIComponent(word)}/`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-app-accent pt-1"
        >
          <BookOpen size={13} />
          البحث في قاموس المعاني (رابط خارجي)
        </a>
      </div>
    </Sheet>
  )
}
