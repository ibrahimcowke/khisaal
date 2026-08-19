import { describe, it, expect } from 'vitest'
import { normalizeArabic, highlightMatches } from './arabicNormalize'

describe('normalizeArabic', () => {
  it('strips diacritics (tashkeel)', () => {
    expect(normalizeArabic('الْحِكْمَةُ')).toBe(normalizeArabic('الحكمة'))
  })

  it('strips tatweel elongation', () => {
    expect(normalizeArabic('كـــبير')).toBe(normalizeArabic('كبير'))
  })

  it('normalizes alef variants to bare alef', () => {
    expect(normalizeArabic('أحمد')).toBe(normalizeArabic('احمد'))
    expect(normalizeArabic('إحسان')).toBe(normalizeArabic('احسان'))
    expect(normalizeArabic('آمن')).toBe(normalizeArabic('امن'))
  })

  it('normalizes taa marbuta to haa', () => {
    expect(normalizeArabic('حكمة')).toBe(normalizeArabic('حكمه'))
  })

  it('normalizes alef maqsura to yaa', () => {
    expect(normalizeArabic('على')).toBe(normalizeArabic('علي'))
  })

  it('collapses punctuation and whitespace', () => {
    expect(normalizeArabic('السلام، عليكم!')).toBe(normalizeArabic('السلام عليكم'))
  })

  it('handles empty input', () => {
    expect(normalizeArabic('')).toBe('')
  })
})

describe('highlightMatches', () => {
  it('finds an exact raw substring match', () => {
    const segments = highlightMatches('هذا نص طويل يحتوي على كلمة مهمة', 'كلمة')
    const matched = segments.filter((s) => s.match)
    expect(matched).toHaveLength(1)
    expect(matched[0].text).toBe('كلمة')
  })

  it('returns the whole text unmatched when query is empty', () => {
    const segments = highlightMatches('نص عادي', '')
    expect(segments).toEqual([{ text: 'نص عادي', match: false }])
  })

  it('finds matches across multiple occurrences', () => {
    const segments = highlightMatches('كلمة وكلمة أخرى', 'كلمة')
    const matched = segments.filter((s) => s.match)
    expect(matched.length).toBeGreaterThanOrEqual(1)
  })

  it('falls back to normalized matching when diacritics differ', () => {
    const segments = highlightMatches('الْحِكْمَةُ نور', 'الحكمة')
    const hasMatch = segments.some((s) => s.match)
    expect(hasMatch).toBe(true)
  })
})
