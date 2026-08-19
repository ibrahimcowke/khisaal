import { useMemo } from 'react'
import type { ContentBlock, Highlight } from '../../lib/types'
import { splitTextWithRanges } from '../../lib/textAnchor'
import { locateAnchor } from '../../lib/textAnchor'
import { useSettingsStore } from '../../store/settingsStore'
import { toArabicDigits } from '../../lib/format'
import { cn } from '../../lib/cn'

const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: '#F4E7A3',
  green: '#C3E4C6',
  blue: '#C3D9F0',
  pink: '#F3CBDA',
  purple: '#DCC9F0',
  orange: '#F5D3AE',
}

function HighlightedText({
  text,
  highlights,
  activeHighlightId,
  onHighlightClick,
}: {
  text: string
  highlights: Highlight[]
  activeHighlightId: string | null
  onHighlightClick: (id: string) => void
}) {
  const ranges = useMemo(() => {
    const out: { start: number; end: number; color: string; highlightId: string }[] = []
    for (const h of highlights) {
      const loc = locateAnchor(text, { text: h.text, prefix: h.prefix, suffix: h.suffix, startOffset: h.startOffset, endOffset: h.endOffset })
      if (loc) out.push({ start: loc.start, end: loc.end, color: h.color, highlightId: h.id })
    }
    return out
  }, [text, highlights])

  if (ranges.length === 0) return <>{text}</>

  const segments = splitTextWithRanges(text, ranges)
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlightId ? (
          <mark
            key={i}
            onClick={(e) => {
              e.stopPropagation()
              onHighlightClick(seg.highlightId!)
            }}
            style={{
              backgroundColor: HIGHLIGHT_COLORS[seg.color ?? 'yellow'],
              boxShadow: activeHighlightId === seg.highlightId ? '0 0 0 2px var(--rt-accent)' : undefined,
            }}
            className="rounded-[3px] px-0.5 -mx-0.5 cursor-pointer transition-shadow"
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  )
}

export function BlockRenderer({
  block,
  highlights,
  activeHighlightId,
  onHighlightClick,
  isCurrent,
  dimmed,
}: {
  block: ContentBlock
  highlights: Highlight[]
  activeHighlightId: string | null
  onHighlightClick: (id: string) => void
  isCurrent?: boolean
  dimmed?: boolean
}) {
  const showSourcePages = useSettingsStore((s) => s.showSourcePages)
  const textAlign = useSettingsStore((s) => s.textAlign)
  const paragraphSpacing = useSettingsStore((s) => s.paragraphSpacing)
  const softenTashkeel = useSettingsStore((s) => s.softenTashkeel)

  const wrapperStyle = {
    marginBottom: `${paragraphSpacing}em`,
    textAlign: block.type === 'heading' ? ('center' as const) : textAlign === 'justify' ? ('justify' as const) : ('right' as const),
    opacity: dimmed ? 0.35 : 1,
    transition: 'opacity 0.3s ease',
  }

  const sourceMark = showSourcePages && (
    <span className="select-none text-[0.55em] align-super text-app-muted mx-1" contentEditable={false}>
      {toArabicDigits(block.sourcePage)}
    </span>
  )

  const body = (
    <span className={cn(softenTashkeel ? 'soft-tashkeel' : '', textAlign === 'justify' ? 'arabic-kashida' : '')}>
      <HighlightedText
        text={block.text ?? ''}
        highlights={highlights}
        activeHighlightId={activeHighlightId}
        onHighlightClick={onHighlightClick}
      />
    </span>
  )

  switch (block.type) {
    case 'heading':
      return (
        <h2
          data-block-id={block.id}
          style={wrapperStyle}
          className="font-display font-bold leading-snug pt-4 pb-2 text-xl sm:text-2xl text-app-accent border-b border-app-border/40 mb-6"
        >
          {body}
          {sourceMark}
        </h2>
      )
    case 'quote':
      return (
        <blockquote
          data-block-id={block.id}
          style={wrapperStyle}
          className="border-r-4 border-app-accent/60 bg-app-surface/60 rounded-l-2xl py-3 pr-5 pl-4 my-4 italic text-app-text-secondary"
        >
          <span className="font-display text-app-accent text-xl opacity-60 ml-1">«</span>
          {body}
          <span className="font-display text-app-accent text-xl opacity-60 mr-1">»</span>
          {block.attribution && <footer className="mt-1.5 text-sm not-italic text-app-accent font-semibold">— {block.attribution}</footer>}
          {sourceMark}
        </blockquote>
      )
    case 'list':
    case 'numbered-list':
      return (
        <ul
          data-block-id={block.id}
          style={{ marginBottom: `${paragraphSpacing}em`, textAlign: textAlign === 'justify' ? 'justify' : 'right' }}
          className={block.type === 'numbered-list' ? 'list-decimal pr-6 space-y-2' : 'list-none space-y-2'}
        >
          {(block.items ?? []).map((item, i) => (
            <li key={i} className={block.type === 'list' ? 'relative pr-5 before:content-["❖"] before:absolute before:right-0 before:text-app-accent before:text-xs' : ''}>
              {item}
            </li>
          ))}
          {sourceMark}
        </ul>
      )
    case 'divider':
      return (
        <div data-block-id={block.id} className="my-8 flex items-center justify-center gap-3 text-app-accent/60">
          <span className="h-[1px] w-12 bg-app-border" />
          <span className="text-sm">❖ ❖ ❖</span>
          <span className="h-[1px] w-12 bg-app-border" />
        </div>
      )
    case 'verse':
    case 'poetry':
      return (
        <div data-block-id={block.id} style={wrapperStyle} className="my-5 py-3 px-4 bg-app-accent/5 rounded-2xl border border-app-accent/15 text-center font-display text-lg leading-loose text-app-accent">
          {body}
          {sourceMark}
        </div>
      )
    case 'callout':
      return (
        <div data-block-id={block.id} style={{ marginBottom: `${paragraphSpacing}em` }} className="rounded-2xl bg-app-accent/10 border border-app-accent/25 px-5 py-4 my-4 shadow-sm">
          {body}
          {sourceMark}
        </div>
      )
    default:
      return (
        <p
          data-block-id={block.id}
          style={wrapperStyle}
          className={cn(isCurrent ? 'relative' : undefined, 'leading-relaxed')}
        >
          {body}
          {sourceMark}
        </p>
      )
  }
}
