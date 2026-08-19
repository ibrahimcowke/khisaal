import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Highlighter, StickyNote, Copy, Share2, Search, BookText, Quote, Check, Sparkles } from 'lucide-react'
import type { ActiveSelection } from './useTextSelection'
import type { HighlightColor } from '../../lib/types'

const COLORS: { key: HighlightColor; hex: string }[] = [
  { key: 'yellow', hex: '#F4E7A3' },
  { key: 'green', hex: '#C3E4C6' },
  { key: 'blue', hex: '#C3D9F0' },
  { key: 'pink', hex: '#F3CBDA' },
  { key: 'purple', hex: '#DCC9F0' },
  { key: 'orange', hex: '#F5D3AE' },
]

export function SelectionToolbar({
  selection,
  onHighlight,
  onNote,
  onSearchSelected,
  onSaveQuote,
  onLookup,
  onCardQuote,
  onDismiss,
}: {
  selection: ActiveSelection
  onHighlight: (color: HighlightColor) => void
  onNote: () => void
  onSearchSelected: () => void
  onSaveQuote: () => void
  onLookup: () => void
  onCardQuote?: () => void
  onDismiss: () => void
}) {
  const [showColors, setShowColors] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setShowColors(false)
    setCopied(false)
  }, [selection])

  const toolbarWidth = Math.min(310, typeof window !== 'undefined' ? window.innerWidth - 24 : 310)
  const top = Math.max(12, selection.rect.top - 62)
  const left = Math.max(
    12,
    Math.min(
      selection.rect.left + selection.rect.width / 2 - toolbarWidth / 2,
      (typeof window !== 'undefined' ? window.innerWidth : 360) - toolbarWidth - 12
    )
  )

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(selection.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // clipboard unavailable; ignore silently
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: selection.text })
      } catch {
        // user cancelled share
      }
    } else {
      handleCopy()
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{ position: 'fixed', top, left, width: toolbarWidth }}
      className="z-50 rounded-2xl bg-[#25221E]/95 backdrop-blur-md text-white shadow-2xl px-2 py-2 border border-white/10"
      onMouseDown={(e) => e.preventDefault()}
    >
      <AnimatePresence mode="wait">
        {showColors ? (
          <motion.div
            key="colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-around px-1 py-1"
          >
            {COLORS.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  onHighlight(c.key)
                  onDismiss()
                }}
                className="h-7 w-7 rounded-full border-2 border-white/40 hover:scale-110 active:scale-95 transition-transform"
                style={{ backgroundColor: c.hex }}
                aria-label={c.key}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-4 gap-1 text-[11px]"
          >
            <ToolbarAction icon={<Highlighter size={16} />} label="تظليل" onClick={() => setShowColors(true)} />
            <ToolbarAction icon={<StickyNote size={16} />} label="ملاحظة" onClick={() => { onNote(); onDismiss() }} />
            <ToolbarAction
              icon={copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              label={copied ? 'تم' : 'نسخ'}
              onClick={handleCopy}
            />
            <ToolbarAction icon={<Share2 size={16} />} label="مشاركة" onClick={handleShare} />
            <ToolbarAction icon={<Search size={16} />} label="بحث" onClick={() => { onSearchSelected(); onDismiss() }} />
            <ToolbarAction icon={<BookText size={16} />} label="معنى" onClick={() => { onLookup(); onDismiss() }} />
            <ToolbarAction icon={<Quote size={16} />} label="اقتباس" onClick={() => { onSaveQuote(); onDismiss() }} />
            {onCardQuote && (
              <ToolbarAction icon={<Sparkles size={16} className="text-amber-300" />} label="بطاقة" onClick={() => { onCardQuote(); onDismiss() }} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ToolbarAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 rounded-xl py-1.5 hover:bg-white/10 active:bg-white/20 transition-colors">
      {icon}
      <span>{label}</span>
    </button>
  )
}
