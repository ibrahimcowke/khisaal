import { describe, it, expect } from 'vitest'
import { createAnchor, locateAnchor, splitTextWithRanges } from './textAnchor'

const SAMPLE = 'القلوب الجامدة الرقيقة كيف تفارق من كنت بالأمس لهم رفيقاً ومشاركاً'

describe('createAnchor', () => {
  it('captures the exact substring plus surrounding context', () => {
    const start = SAMPLE.indexOf('الرقيقة')
    const end = start + 'الرقيقة'.length
    const anchor = createAnchor(SAMPLE, start, end)
    expect(anchor.text).toBe('الرقيقة')
    expect(anchor.startOffset).toBe(start)
    expect(anchor.endOffset).toBe(end)
    expect(SAMPLE.slice(anchor.startOffset - anchor.prefix.length, anchor.startOffset)).toBe(anchor.prefix)
  })
})

describe('locateAnchor', () => {
  it('relocates via the fast exact-offset path when text is unchanged', () => {
    const start = SAMPLE.indexOf('تفارق')
    const end = start + 'تفارق'.length
    const anchor = createAnchor(SAMPLE, start, end)
    const loc = locateAnchor(SAMPLE, anchor)
    expect(loc).toEqual({ start, end })
  })

  it('relocates via prefix+suffix context when preceding text shifted', () => {
    const start = SAMPLE.indexOf('تفارق')
    const end = start + 'تفارق'.length
    const anchor = createAnchor(SAMPLE, start, end)
    // Simulate an edit earlier in the text that shifts all subsequent offsets
    const edited = 'زيادة ' + SAMPLE
    const loc = locateAnchor(edited, anchor)
    expect(loc).not.toBeNull()
    expect(edited.slice(loc!.start, loc!.end)).toBe('تفارق')
  })

  it('falls back to plain text search when context no longer matches', () => {
    const anchor = createAnchor(SAMPLE, 0, 'القلوب'.length)
    const edited = 'مقدمة جديدة تماماً ' + SAMPLE
    const loc = locateAnchor(edited, anchor)
    expect(loc).not.toBeNull()
    expect(edited.slice(loc!.start, loc!.end)).toBe('القلوب')
  })

  it('returns null when the anchored text no longer exists at all', () => {
    const anchor = createAnchor(SAMPLE, 0, 'القلوب'.length)
    const loc = locateAnchor('نص مختلف تماماً لا علاقة له', anchor)
    expect(loc).toBeNull()
  })
})

describe('splitTextWithRanges', () => {
  it('returns the full text unsplit when there are no ranges', () => {
    expect(splitTextWithRanges('نص بسيط', [])).toEqual([{ text: 'نص بسيط' }])
  })

  it('splits around a single highlighted range', () => {
    const text = 'أول وسط آخر'
    const start = text.indexOf('وسط')
    const end = start + 'وسط'.length
    const segments = splitTextWithRanges(text, [{ start, end, color: 'yellow', highlightId: 'h1' }])
    expect(segments.map((s) => s.text).join('')).toBe(text)
    const highlighted = segments.find((s) => s.highlightId === 'h1')
    expect(highlighted?.text).toBe('وسط')
  })

  it('handles multiple non-overlapping ranges in order', () => {
    const text = 'أ ب ج د هـ'
    const ranges = [
      { start: 0, end: 1, color: 'yellow', highlightId: 'a' },
      { start: 4, end: 5, color: 'green', highlightId: 'b' },
    ]
    const segments = splitTextWithRanges(text, ranges)
    expect(segments.map((s) => s.text).join('')).toBe(text)
    expect(segments.filter((s) => s.highlightId)).toHaveLength(2)
  })
})
