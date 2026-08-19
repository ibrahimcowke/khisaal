import { forwardRef } from 'react'

export type QuoteCardLayout = 'minimal-paper' | 'elegant-dark' | 'arabic-editorial' | 'warm-sepia'

export const QUOTE_LAYOUTS: { key: QuoteCardLayout; label: string }[] = [
  { key: 'minimal-paper', label: 'ورقي بسيط' },
  { key: 'elegant-dark', label: 'داكن أنيق' },
  { key: 'arabic-editorial', label: 'تحريري عربي' },
  { key: 'warm-sepia', label: 'سيبيا دافئ' },
]

const LAYOUT_STYLES: Record<QuoteCardLayout, { bg: string; text: string; accent: string; font: string; border?: string }> = {
  'minimal-paper': { bg: '#FFFDF8', text: '#25221E', accent: '#836A42', font: '"Noto Naskh Arabic", serif', border: '1px solid #E8E2D8' },
  'elegant-dark': { bg: '#181815', text: '#DDD8CE', accent: '#BDA47A', font: '"Amiri", serif' },
  'arabic-editorial': { bg: '#F8F5EE', text: '#25221E', accent: '#836A42', font: '"Aref Ruqaa", serif', border: '2px solid #836A42' },
  'warm-sepia': { bg: '#EDE1C8', text: '#382E22', accent: '#7A5A2E', font: '"Scheherazade New", serif' },
}

interface Props {
  text: string
  bookTitle: string
  author: string
  sourcePage?: number
  layout: QuoteCardLayout
}

export const QuoteCard = forwardRef<HTMLDivElement, Props>(({ text, bookTitle, author, sourcePage, layout }, ref) => {
  const style = LAYOUT_STYLES[layout]
  return (
    <div
      ref={ref}
      dir="rtl"
      style={{
        width: 540,
        height: 675,
        background: style.bg,
        color: style.text,
        border: style.border,
        fontFamily: style.font,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px 48px',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <span style={{ color: style.accent, fontSize: 48, lineHeight: 1, marginBottom: 20, fontFamily: 'Georgia, serif' }}>"</span>
      <p style={{ fontSize: 27, lineHeight: 1.9, textAlign: 'center', margin: 0 }}>{text}</p>
      <div style={{ marginTop: 36, width: 48, height: 2, background: style.accent }} />
      <p style={{ marginTop: 18, fontSize: 15, color: style.accent, fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}>{bookTitle}</p>
      <p style={{ marginTop: 2, fontSize: 12, opacity: 0.65, fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}>
        {author}
        {sourcePage ? ` · صفحة ${sourcePage}` : ''}
      </p>
    </div>
  )
})
QuoteCard.displayName = 'QuoteCard'
