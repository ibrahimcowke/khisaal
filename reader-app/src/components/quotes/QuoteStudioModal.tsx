import { useRef, useState } from 'react'
import { Download, Share2, Copy, Check, Layout, Type, Palette } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'

interface QuoteStudioProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  quoteText: string
  sourceChapterTitle?: string
  bookTitle?: string
  author?: string
}

type AspectRatio = '1:1' | '9:16' | '16:9' | '4:5'

interface CardTheme {
  id: string
  name: string
  bg: string
  text: string
  accent: string
  border: string
  canvasBg: string
}

const THEMES: CardTheme[] = [
  {
    id: 'andalusian',
    name: 'أندلسي ملكي 🕌',
    bg: 'linear-gradient(135deg, #2D1E12 0%, #150E08 100%)',
    text: '#F5E6CC',
    accent: '#D4AF37',
    border: '#B8860B',
    canvasBg: '#1C120A',
  },
  {
    id: 'gold-night',
    name: 'ليلي ذهبي 🌙',
    bg: 'linear-gradient(135deg, #111111 0%, #000000 100%)',
    text: '#E5E5E5',
    accent: '#E5C158',
    border: '#333333',
    canvasBg: '#0A0A0A',
  },
  {
    id: 'sepia-manuscript',
    name: 'مخطوطة عتيقة 📜',
    bg: 'linear-gradient(135deg, #F5ECD7 0%, #E8DCBE 100%)',
    text: '#382E22',
    accent: '#7C5B28',
    border: '#D0BC96',
    canvasBg: '#EFE3CA',
  },
  {
    id: 'emerald-luxury',
    name: 'زمردي فاخر 🌿',
    bg: 'linear-gradient(135deg, #0F2D20 0%, #061810 100%)',
    text: '#E2F3EA',
    accent: '#52C794',
    border: '#1E4A35',
    canvasBg: '#091E14',
  },
  {
    id: 'paper-clean',
    name: 'ورقي ناصع 📖',
    bg: 'linear-gradient(135deg, #FFFDF8 0%, #F5EFE0 100%)',
    text: '#222222',
    accent: '#836A42',
    border: '#E2D6C0',
    canvasBg: '#FAF5EA',
  },
]

const FONTS = [
  { id: 'amiri', name: 'الأميري', font: 'Amiri, serif' },
  { id: 'ruqaa', name: 'عارف رقعة', font: '"Aref Ruqaa", serif' },
  { id: 'scheherazade', name: 'شهرزاد', font: '"Scheherazade New", serif' },
  { id: 'kufi', name: 'ريم كوفي', font: '"Reem Kufi", sans-serif' },
  { id: 'cairo', name: 'القاهرة', font: 'Cairo, sans-serif' },
]

export function QuoteStudioModal({
  open,
  onOpenChange,
  quoteText,
  sourceChapterTitle,
  bookTitle = 'موسوعة الخصال المائتان',
  author = 'إبراهيم عوكي',
}: QuoteStudioProps) {
  const [aspect, setAspect] = useState<AspectRatio>('1:1')
  const [activeTheme, setActiveTheme] = useState<CardTheme>(THEMES[0])
  const [activeFont, setActiveFont] = useState(FONTS[0])
  const [fontSize, setFontSize] = useState(24)
  const [showBasmalah, setShowBasmalah] = useState(true)
  const [copied, setCopied] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleDownload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 1080
    let h = 1080
    if (aspect === '9:16') {
      w = 1080
      h = 1920
    } else if (aspect === '16:9') {
      w = 1920
      h = 1080
    } else if (aspect === '4:5') {
      w = 1080
      h = 1350
    }

    canvas.width = w
    canvas.height = h

    // Fill background
    ctx.fillStyle = activeTheme.canvasBg
    ctx.fillRect(0, 0, w, h)

    // Inner decorative border
    ctx.strokeStyle = activeTheme.accent
    ctx.lineWidth = 3
    ctx.strokeRect(36, 36, w - 72, h - 72)

    // Corner accents
    ctx.strokeStyle = activeTheme.accent
    ctx.lineWidth = 6
    const cornerSize = 40
    // Top-left
    ctx.beginPath()
    ctx.moveTo(36, 36 + cornerSize)
    ctx.lineTo(36, 36)
    ctx.lineTo(36 + cornerSize, 36)
    ctx.stroke()
    // Top-right
    ctx.beginPath()
    ctx.moveTo(w - 36 - cornerSize, 36)
    ctx.lineTo(w - 36, 36)
    ctx.lineTo(w - 36, 36 + cornerSize)
    ctx.stroke()
    // Bottom-right
    ctx.beginPath()
    ctx.moveTo(w - 36, h - 36 - cornerSize)
    ctx.lineTo(w - 36, h - 36)
    ctx.lineTo(w - 36 - cornerSize, h - 36)
    ctx.stroke()
    // Bottom-left
    ctx.beginPath()
    ctx.moveTo(36 + cornerSize, h - 36)
    ctx.lineTo(36, h - 36)
    ctx.lineTo(36, h - 36 - cornerSize)
    ctx.stroke()

    // Basmalah if enabled
    if (showBasmalah) {
      ctx.fillStyle = activeTheme.accent
      ctx.font = '32px Amiri, serif'
      ctx.textAlign = 'center'
      ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', w / 2, 110)
    }

    // Quote text
    ctx.fillStyle = activeTheme.text
    const scaleFactor = w / 450
    const realFontSize = Math.round(fontSize * scaleFactor * 0.75)
    ctx.font = `bold ${realFontSize}px ${activeFont.font}`
    ctx.textAlign = 'center'
    ctx.direction = 'rtl'

    // Wrap text into lines
    const words = quoteText.split(' ')
    const lines: string[] = []
    let currentLine = ''
    const maxTextWidth = w - 160

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const testWidth = ctx.measureText(testLine).width
      if (testWidth > maxTextWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    const lineHeight = realFontSize * 1.6
    const totalTextHeight = lines.length * lineHeight
    let startY = (h - totalTextHeight) / 2 + (showBasmalah ? 20 : 0)

    for (const line of lines) {
      ctx.fillText(line, w / 2, startY)
      startY += lineHeight
    }

    // Footer info
    ctx.fillStyle = activeTheme.accent
    ctx.font = `28px Amiri, serif`
    ctx.textAlign = 'center'
    const footerY = h - 90
    ctx.fillText(`❖ ${sourceChapterTitle || bookTitle} ❖`, w / 2, footerY)

    ctx.fillStyle = activeTheme.text
    ctx.font = `20px Amiri, sans-serif`
    ctx.fillText(`جامع الخصال والآداب — ${author}`, w / 2, footerY + 36)

    // Export image
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `iqtibass-${Date.now()}.png`
    a.click()
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(`«${quoteText}»\n— ${sourceChapterTitle || bookTitle} (${author})`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'اقتباس من موسوعة الخصال',
          text: `«${quoteText}»\n— ${sourceChapterTitle || bookTitle} (${author})`,
        })
      } catch {
        // User cancelled
      }
    } else {
      handleCopyText()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="ستوديو تصميم ومشاركة الاقتباسات الفاخرة" className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Preview Card */}
        <div className="flex justify-center p-4 bg-app-bg rounded-3xl border border-app-border overflow-hidden">
          <div
            ref={previewRef}
            style={{
              background: activeTheme.bg,
              color: activeTheme.text,
              fontFamily: activeFont.font,
              aspectRatio: aspect === '1:1' ? '1 / 1' : aspect === '9:16' ? '9 / 16' : aspect === '16:9' ? '16 / 9' : '4 / 5',
            }}
            className="w-full max-w-sm rounded-2xl p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-xl border relative transition-all duration-300 select-none overflow-hidden"
          >
            {/* Border frame */}
            <div
              style={{ borderColor: activeTheme.accent }}
              className="absolute inset-3 border rounded-xl pointer-events-none opacity-60"
            />

            {/* Header */}
            <div className="relative z-10">
              {showBasmalah && (
                <p style={{ color: activeTheme.accent }} className="text-xs sm:text-sm font-display font-bold mb-1 opacity-90">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              )}
            </div>

            {/* Quote Body */}
            <div className="my-auto relative z-10 py-4 px-2">
              <span style={{ color: activeTheme.accent }} className="font-display text-2xl opacity-40 block mb-1">
                ❖
              </span>
              <p
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.65 }}
                className="font-bold leading-relaxed tracking-wide"
              >
                {quoteText}
              </p>
              <span style={{ color: activeTheme.accent }} className="font-display text-2xl opacity-40 block mt-1">
                ❖
              </span>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-center">
              <p style={{ color: activeTheme.accent }} className="text-xs sm:text-sm font-display font-bold truncate">
                {sourceChapterTitle || bookTitle}
              </p>
              <p className="text-[10px] opacity-70 mt-0.5">{author}</p>
            </div>
          </div>
        </div>

        {/* Customization Controls */}
        <div className="space-y-4">
          {/* Aspect Ratio */}
          <div>
            <p className="text-xs font-semibold text-app-text-secondary mb-2 flex items-center gap-1.5">
              <Layout size={14} className="text-app-accent" />
              <span>أبعاد ومقاس البطاقة</span>
            </p>
            <div className="grid grid-cols-4 gap-2">
              {(['1:1', '9:16', '4:5', '16:9'] as AspectRatio[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setAspect(r)}
                  className={cn(
                    'py-2 px-2 rounded-xl text-xs font-bold border transition-all',
                    aspect === r
                      ? 'bg-app-accent text-white border-app-accent shadow-xs'
                      : 'bg-app-surface border-app-border text-app-text-secondary hover:border-app-accent/60'
                  )}
                >
                  {r === '1:1' ? 'مربع 1:1' : r === '9:16' ? 'ستوري 9:16' : r === '4:5' ? 'بورتريه 4:5' : 'عرضي 16:9'}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Palette */}
          <div>
            <p className="text-xs font-semibold text-app-text-secondary mb-2 flex items-center gap-1.5">
              <Palette size={14} className="text-app-accent" />
              <span>طابع ولون البطاقة</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTheme(t)}
                  className={cn(
                    'p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-2',
                    activeTheme.id === t.id
                      ? 'border-app-accent ring-2 ring-app-accent/30 bg-app-surface shadow-xs'
                      : 'border-app-border bg-app-surface/60'
                  )}
                >
                  <span className="text-xs font-bold text-app-text">{t.name}</span>
                  <div
                    style={{ background: t.bg, borderColor: t.border }}
                    className="w-5 h-5 rounded-full border shrink-0"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Font Selector */}
          <div>
            <p className="text-xs font-semibold text-app-text-secondary mb-2 flex items-center gap-1.5">
              <Type size={14} className="text-app-accent" />
              <span>الخط العربي وحجم النص</span>
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFont(f)}
                  style={{ fontFamily: f.font }}
                  className={cn(
                    'py-2 px-2 rounded-xl text-xs font-bold border transition-all',
                    activeFont.id === f.id
                      ? 'bg-app-accent text-white border-app-accent shadow-xs'
                      : 'bg-app-surface border-app-border text-app-text-secondary hover:border-app-accent/60'
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size & Options */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-app-surface border border-app-border gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-app-text-secondary">حجم الخط:</span>
              <button
                onClick={() => setFontSize((s) => Math.max(16, s - 2))}
                className="w-7 h-7 rounded-lg border border-app-border flex items-center justify-center text-xs font-bold hover:bg-app-bg"
              >
                −
              </button>
              <span className="text-xs font-bold text-app-accent px-1">{fontSize}</span>
              <button
                onClick={() => setFontSize((s) => Math.min(42, s + 2))}
                className="w-7 h-7 rounded-lg border border-app-border flex items-center justify-center text-xs font-bold hover:bg-app-bg"
              >
                +
              </button>
            </div>

            <button
              onClick={() => setShowBasmalah((b) => !b)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors',
                showBasmalah ? 'border-app-accent bg-app-accent/15 text-app-accent font-bold' : 'border-app-border text-app-muted'
              )}
            >
              البسملة {showBasmalah ? '✓' : '✕'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-app-border">
          <Button onClick={handleDownload} className="flex-1 gap-2 py-3">
            <Download size={16} />
            <span>تحميل بطاقة 4K (PNG)</span>
          </Button>

          <Button variant="secondary" onClick={handleNativeShare} className="gap-1.5 py-3">
            <Share2 size={16} />
            <span>مشاركة</span>
          </Button>

          <button
            onClick={handleCopyText}
            className="p-3 rounded-2xl border border-app-border bg-app-surface hover:border-app-accent transition-colors"
            title="نسخ النص"
          >
            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
          </button>
        </div>
      </div>
    </Sheet>
  )
}
