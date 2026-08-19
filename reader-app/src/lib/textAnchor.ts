export interface TextAnchor {
  text: string
  prefix: string
  suffix: string
  startOffset: number
  endOffset: number
}

const CONTEXT_LEN = 24

export function createAnchor(blockText: string, startOffset: number, endOffset: number): TextAnchor {
  return {
    text: blockText.slice(startOffset, endOffset),
    prefix: blockText.slice(Math.max(0, startOffset - CONTEXT_LEN), startOffset),
    suffix: blockText.slice(endOffset, endOffset + CONTEXT_LEN),
    startOffset,
    endOffset,
  }
}

/**
 * Re-locate an anchor inside (possibly changed) block text.
 * Falls back gracefully: exact offset match -> prefix+suffix search -> text-only search -> null.
 */
export function locateAnchor(blockText: string, anchor: TextAnchor): { start: number; end: number } | null {
  // 1. exact offset match (fast path, valid for unedited content)
  if (
    anchor.startOffset >= 0 &&
    anchor.endOffset <= blockText.length &&
    blockText.slice(anchor.startOffset, anchor.endOffset) === anchor.text
  ) {
    return { start: anchor.startOffset, end: anchor.endOffset }
  }

  // 2. contextual search using prefix + text + suffix
  const needle = anchor.prefix + anchor.text + anchor.suffix
  const idx = blockText.indexOf(needle)
  if (idx !== -1) {
    const start = idx + anchor.prefix.length
    return { start, end: start + anchor.text.length }
  }

  // 3. plain text search (may match wrong occurrence, best effort)
  const plainIdx = blockText.indexOf(anchor.text)
  if (plainIdx !== -1) {
    return { start: plainIdx, end: plainIdx + anchor.text.length }
  }

  return null
}

/** Splits text into segments around one or more anchors for rendering <mark> spans. */
export interface TextSegment {
  text: string
  ranges: { color?: string; highlightId?: string }[]
}

export function splitTextWithRanges<T extends { start: number; end: number; color: string; highlightId: string }>(
  text: string,
  ranges: T[]
): { text: string; color?: string; highlightId?: string }[] {
  if (ranges.length === 0) return [{ text }]
  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  const out: { text: string; color?: string; highlightId?: string }[] = []
  let cursor = 0
  for (const r of sorted) {
    if (r.start > cursor) out.push({ text: text.slice(cursor, r.start) })
    out.push({ text: text.slice(r.start, r.end), color: r.color, highlightId: r.highlightId })
    cursor = Math.max(cursor, r.end)
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor) })
  return out
}
