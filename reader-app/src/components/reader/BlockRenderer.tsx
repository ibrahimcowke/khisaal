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
          className="font-display font-bold leading-relaxed pt-5 pb-3 text-xl sm:text-2xl text-app-accent border-b border-app-accent/20 mb-6 flex items-center justify-center gap-2 text-center"
        >
          <span className="text-app-accent/50 text-base">❖</span>
          <span>{body}</span>
          <span className="text-app-accent/50 text-base">❖</span>
          {sourceMark}
        </h2>
      )
    case 'quote':
      return (
        <blockquote
          data-block-id={block.id}
          style={wrapperStyle}
          className="border-r-4 border-app-accent bg-linear-to-l from-app-accent/10 to-transparent rounded-l-2xl py-4 pr-6 pl-5 my-5 italic text-app-text font-serif shadow-xs"
        >
          <div className="flex items-start gap-1">
            <span className="font-display text-app-accent text-2xl opacity-70 leading-none select-none">«</span>
            <div className="flex-1 leading-loose">{body}</div>
            <span className="font-display text-app-accent text-2xl opacity-70 leading-none select-none">»</span>
          </div>
          {block.attribution && (
            <footer className="mt-2.5 text-xs not-italic text-app-accent font-bold tracking-wide flex items-center gap-1">
              <span>—</span>
              <span>{block.attribution}</span>
            </footer>
          )}
          {sourceMark}
        </blockquote>
      )
    case 'list':
    case 'numbered-list':
      return (
        <ul
          data-block-id={block.id}
          style={{ marginBottom: `${paragraphSpacing}em`, textAlign: textAlign === 'justify' ? 'justify' : 'right' }}
          className={block.type === 'numbered-list' ? 'list-decimal pr-6 space-y-3 font-serif' : 'list-none space-y-3 font-serif'}
        >
          {(block.items ?? []).map((item, i) => {
            const cleanItem = item.replace(/^[•\-\*]\s*/, '')
            return (
              <li
                key={i}
                className={cn(
                  'leading-loose',
                  block.type === 'list'
                    ? 'reader-list-item relative pr-6 before:absolute before:right-0 before:text-app-accent before:text-xs before:top-1'
                    : ''
                )}
              >
                {cleanItem}
              </li>
            )
          })}
          {sourceMark}
        </ul>
      )
    case 'divider':
      return (
        <div data-block-id={block.id} className="my-10 flex items-center justify-center gap-4 text-app-accent/50 select-none">
          <span className="h-px w-16 sm:w-24 bg-linear-to-l from-app-accent/40 to-transparent" />
          <span className="text-xs font-display tracking-widest">❖ ❖ ❖</span>
          <span className="h-px w-16 sm:w-24 bg-linear-to-r from-app-accent/40 to-transparent" />
        </div>
      )
    case 'verse':
    case 'poetry':
      return (
        <div
          data-block-id={block.id}
          style={wrapperStyle}
          className="my-6 py-4 px-6 bg-app-accent/5 rounded-3xl border border-app-accent/20 text-center font-display text-lg sm:text-xl leading-loose text-app-accent shadow-xs relative overflow-hidden"
        >
          <div className="absolute top-1 right-2 text-app-accent/20 text-xs select-none">❧</div>
          <div className="absolute bottom-1 left-2 text-app-accent/20 text-xs select-none">☙</div>
          {body}
          {sourceMark}
        </div>
      )
    case 'callout':
      return (
        <div
          data-block-id={block.id}
          style={{ marginBottom: `${paragraphSpacing}em` }}
          className="rounded-3xl bg-linear-to-br from-app-accent/10 to-app-surface border border-app-accent/30 px-6 py-5 my-5 shadow-xs leading-relaxed"
        >
          {body}
          {sourceMark}
        </div>
      )
    default:
      return (
        <p
          data-block-id={block.id}
          style={wrapperStyle}
          className={cn(isCurrent ? 'relative' : undefined, 'leading-loose font-serif')}
        >
          {body}
          {sourceMark}
        </p>
      )
  }
}
