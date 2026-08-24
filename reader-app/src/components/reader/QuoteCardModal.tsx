import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Copy, Check, BookOpen } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { useBook } from '../../context/BookContext'

interface QuoteCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quoteText: string
  sourceChapterTitle?: string
}

const CARD_STYLES = [
  { id: 'gold', name: 'أندلسي ذهبي', bg: 'bg-[#FAF6EE] text-[#2C241B] border-[#D4C3A3]' },
  { id: 'coffee', name: 'قهوة دافئة ☕', bg: 'bg-[#EFE7DC] text-[#2C1E14] border-[#DCCFBF]' },
  { id: 'sage', name: 'أخضر عشبي 🌿', bg: 'bg-[#E3ECE3] text-[#1A2B20] border-[#C7D9C9]' },
  { id: 'emerald', name: 'زمردي فاخر', bg: 'bg-[#0E2E20] text-[#E0EFE6] border-[#2E6043]' },
  { id: 'night', name: 'ليلي مذهب', bg: 'bg-[#141412] text-[#E8E2D5] border-[#4A4232]' },
  { id: 'sepia', name: 'مخطوطة عتيقة', bg: 'bg-[#F2E5CE] text-[#3D2E1B] border-[#C8B084]' },
  { id: 'indigo', name: 'سماء نيلية', bg: 'bg-[#152338] text-[#E2EAF4] border-[#2C4A70]' },
]

const CARD_FONTS = [
  { id: 'amiri', name: 'أميري', font: 'var(--font-reading-amiri)' },
  { id: 'ruqaa', name: 'رقعة', font: 'var(--font-display)' },
  { id: 'naskh', name: 'نسخ', font: 'var(--font-reading-naskh)' },
]

export function QuoteCardModal({ open, onOpenChange, quoteText, sourceChapterTitle }: QuoteCardModalProps) {
  const { index } = useBook()
  const cardRef = useRef<HTMLDivElement>(null)
  const [selectedStyle, setSelectedStyle] = useState(CARD_STYLES[0])
  const [selectedFont, setSelectedFont] = useState(CARD_FONTS[0])
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDownloadImage = async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.98, pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `imtaa-quote-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch {
      // Fallback
    } finally {
      setDownloading(false)
    }
  }

  const handleCopyText = () => {
    const fullText = `«${quoteText}»\n\n— كتاب: ${index?.book.title || 'إمتاع القارئ'}${sourceChapterTitle ? ` (${sourceChapterTitle})` : ''}`
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="بطاقة اقتباس فاخرة" className="max-w-lg mx-auto">
      <div className="space-y-5 pb-6">
        {/* Preview Card */}
        <div className="flex justify-center p-2 bg-app-bg/50 rounded-2xl border border-app-border">
          <div
            ref={cardRef}
            style={{ fontFamily: selectedFont.font }}
            className={`w-full max-w-sm rounded-2xl p-7 border-2 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${selectedStyle.bg}`}
          >
            {/* Islamic decorative corner motif */}
            <div className="absolute top-2 right-2 text-xs opacity-40 select-none">❖</div>
            <div className="absolute top-2 left-2 text-xs opacity-40 select-none">❖</div>
            <div className="absolute bottom-2 right-2 text-xs opacity-40 select-none">❖</div>
            <div className="absolute bottom-2 left-2 text-xs opacity-40 select-none">❖</div>

            <div className="text-center mb-4">
              <span className="text-xl opacity-50 block leading-none mb-2">«</span>
              <p className="text-lg sm:text-xl font-bold leading-relaxed px-2">{quoteText}</p>
              <span className="text-xl opacity-50 block leading-none mt-2">»</span>
            </div>

            <div className="pt-4 mt-2 border-t border-current/20 flex items-center justify-between text-xs opacity-75 font-sans">
              <div className="flex items-center gap-1.5">
                <BookOpen size={12} />
                <span className="font-semibold">{index?.book.shortTitle || 'إمتاع القارئ'}</span>
              </div>
              {sourceChapterTitle && <span className="truncate max-w-[130px]">{sourceChapterTitle}</span>}
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div>
          <p className="text-xs font-semibold text-app-text-secondary mb-2">نمط البطاقة واللون</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {CARD_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style)}
                className={`py-2 px-1 text-center rounded-xl text-xs border transition-all ${
                  selectedStyle.id === style.id
                    ? 'border-app-accent font-bold bg-app-accent/15 text-app-accent'
                    : 'border-app-border hover:bg-app-surface text-app-text-secondary'
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-app-text-secondary mb-2">نوع الخط</p>
          <div className="grid grid-cols-3 gap-2">
            {CARD_FONTS.map((font) => (
              <button
                key={font.id}
                onClick={() => setSelectedFont(font)}
                style={{ fontFamily: font.font }}
                className={`py-2 text-center rounded-xl text-sm border transition-all ${
                  selectedFont.id === font.id
                    ? 'border-app-accent font-bold bg-app-accent/15 text-app-accent'
                    : 'border-app-border hover:bg-app-surface text-app-text-secondary'
                }`}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleDownloadImage} disabled={downloading} className="flex-1">
            <Download size={16} />
            <span>{downloading ? 'جارٍ التحميل...' : 'حفظ كصورة (PNG)'}</span>
          </Button>
          <Button variant="secondary" onClick={handleCopyText}>
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
