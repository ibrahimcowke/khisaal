// Normalize Arabic text for search/matching purposes only.
// Never use this to alter displayed reading text.

const DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g
const TATWEEL = /\u0640/g

export function normalizeArabic(input: string): string {
  if (!input) return ''
  let s = input
  s = s.replace(DIACRITICS, '')
  s = s.replace(TATWEEL, '')
  s = s.replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627') // آ إ أ ٱ -> ا
  s = s.replace(/\u0629/g, '\u0647') // ة -> ه
  s = s.replace(/\u0649/g, '\u064A') // ى -> ي
  s = s.replace(/\u0624/g, '\u0648') // ؤ -> و
  s = s.replace(/\u0626/g, '\u064A') // ئ -> ي
  s = s.replace(/[\u061B\u061F\u060C،؛؟!.,:;"'`()[\]{}«»…]/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  return s.toLowerCase()
}

export function highlightMatches(text: string, query: string): { text: string; match: boolean }[] {
  if (!query.trim()) return [{ text, match: false }]
  const normText = normalizeArabic(text)
  const normQuery = normalizeArabic(query)
  if (!normQuery) return [{ text, match: false }]

  // Since normalization can change length (rare here), we do a best-effort
  // direct substring search on the raw text first, then fall back to normalized index mapping.
  const rawIdx = text.indexOf(query)
  if (rawIdx !== -1) {
    const segments: { text: string; match: boolean }[] = []
    let cursor = 0
    let idx = text.indexOf(query, cursor)
    while (idx !== -1) {
      if (idx > cursor) segments.push({ text: text.slice(cursor, idx), match: false })
      segments.push({ text: text.slice(idx, idx + query.length), match: true })
      cursor = idx + query.length
      idx = text.indexOf(query, cursor)
    }
    if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false })
    return segments
  }

  const normIdx = normText.indexOf(normQuery)
  if (normIdx === -1) return [{ text, match: false }]
  // Approximate mapping back to original text length ratio (safe fallback highlight of whole text region)
  const ratio = text.length / Math.max(normText.length, 1)
  const start = Math.max(0, Math.floor(normIdx * ratio) - 2)
  const end = Math.min(text.length, Math.ceil((normIdx + normQuery.length) * ratio) + 2)
  return [
    { text: text.slice(0, start), match: false },
    { text: text.slice(start, end), match: true },
    { text: text.slice(end), match: false },
  ]
}
