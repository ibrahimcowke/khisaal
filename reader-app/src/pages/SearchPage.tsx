import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search as SearchIcon, X, Clock, Sparkles } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db, uid } from '../lib/db'
import { normalizeArabic, highlightMatches } from '../lib/arabicNormalize'
import { toArabicDigits } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'
import { lookupWordInLexicon } from '../lib/arabicLexicon'
import { cn } from '../lib/cn'

interface SearchDoc {
  chapterId: string
  chapterTitle: string
  category: string
  blockId: string
  text: string
  normText: string
  sourcePage: number
}

const SEARCH_FACETS = [
  { id: 'all', label: 'الكل' },
  { id: 'dyads', label: 'الثنائيات' },
  { id: 'triads', label: 'الثلاثيات' },
  { id: 'tetrads', label: 'الرباعيات' },
  { id: 'ethics', label: 'الخصال والآداب' },
]

export default function SearchPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedFacet, setSelectedFacet] = useState('all')
  const recentSearches = useLiveQuery(() => db.recentSearches.orderBy('createdAt').reverse().limit(8).toArray(), [])

  // Check if query matches any classical root
  const lexiconHint = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return null
    return lookupWordInLexicon(query.trim())
  }, [query])

  const fuse = useMemo(() => {
    if (!index) return null
    const docs: SearchDoc[] = []
    for (const c of index.chapters) {
      let cat = 'ethics'
      if (c.title.includes('ثنائيات') || c.title.includes('اثنتان')) cat = 'dyads'
      else if (c.title.includes('ثلاثيات') || c.title.includes('ثلاث')) cat = 'triads'
      else if (c.title.includes('رباعيات') || c.title.includes('أربع')) cat = 'tetrads'

      for (const b of c.blocks) {
        const text = b.text ?? (b.items ?? []).join(' ')
        if (!text) continue
        docs.push({
          chapterId: c.id,
          chapterTitle: c.title,
          category: cat,
          blockId: b.id,
          text,
          normText: normalizeArabic(text),
          sourcePage: b.sourcePage,
        })
      }
    }
    return new Fuse(docs, { keys: ['normText', 'chapterTitle'], threshold: 0.35, ignoreLocation: true, minMatchCharLength: 2 })
  }, [index])

  const results = useMemo(() => {
    if (!fuse || !query.trim()) return []
    const raw = fuse.search(normalizeArabic(query)).map((r) => r.item)
    if (selectedFacet === 'all') return raw.slice(0, 50)
    return raw.filter((item) => item.category === selectedFacet).slice(0, 50)
  }, [fuse, query, selectedFacet])

  useEffect(() => {
    if (!query.trim()) return
    const t = setTimeout(async () => {
      const existing = await db.recentSearches.where('query').equals(query.trim()).first()
      if (!existing) {
        await db.recentSearches.add({ id: uid('search'), query: query.trim(), createdAt: Date.now() })
        const all = await db.recentSearches.orderBy('createdAt').toArray()
        if (all.length > 20) await db.recentSearches.bulkDelete(all.slice(0, all.length - 20).map((s) => s.id))
      }
    }, 1200)
    return () => clearTimeout(t)
  }, [query])

  function openResult(chapterId: string, blockId: string) {
    navigate(`/book/${index!.book.id}/read?c=${chapterId}&block=${blockId}`)
  }

  if (loading || !index) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ التحميل...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title="البحث في الموسوعة"
        subtitle="بحث سريع في كل نصوص وفصول الكتاب"
        count={query.trim() ? `${toArabicDigits(results.length)} نتيجة` : undefined}
      />

      <div className="relative mb-4">
        <SearchIcon size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-app-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في نصوص وأبواب الموسوعة كاملاً..."
          dir="rtl"
          className="w-full rounded-2xl border border-app-border bg-app-surface py-3.5 pr-11 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40 shadow-xs"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-text p-1">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Lexicon Root Matching Hint */}
      {lexiconHint && (
        <div className="mb-4 p-3 rounded-2xl bg-app-accent/10 border border-app-accent/25 flex items-center justify-between text-xs text-app-accent font-medium">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>الجذر اللغوي: <strong>[{lexiconHint.root}]</strong> · المعنى: {lexiconHint.meaning.slice(0, 50)}...</span>
          </div>
          <span className="text-[10px] font-bold bg-app-accent/20 px-2 py-0.5 rounded-full">معجم تراثي</span>
        </div>
      )}

      {/* Category Facets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {SEARCH_FACETS.map((facet) => (
          <button
            key={facet.id}
            onClick={() => setSelectedFacet(facet.id)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-xs',
              selectedFacet === facet.id
                ? 'bg-app-accent text-white shadow-xs'
                : 'bg-app-surface border border-app-border text-app-muted hover:text-app-text'
            )}
          >
            {facet.label}
          </button>
        ))}
      </div>

      {!query && (
        <div>
          <p className="text-sm font-medium text-app-text-secondary mb-3">عمليات بحث سابقة</p>
          {!recentSearches || recentSearches.length === 0 ? (
            <p className="text-sm text-app-muted">لا توجد عمليات بحث بعد</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setQuery(r.query)}
                  className="flex items-center gap-1.5 rounded-full border border-app-border px-3.5 py-1.5 text-xs text-app-text-secondary hover:bg-black/5"
                >
                  <Clock size={12} />
                  {r.query}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {query && (
        <div>
          <div className="flex items-center justify-between text-xs text-app-muted mb-3">
            <span>{toArabicDigits(results.length)} نتيجة بحث</span>
            {selectedFacet !== 'all' && <span>تصفية: {SEARCH_FACETS.find((f) => f.id === selectedFacet)?.label}</span>}
          </div>
          <ul className="space-y-2">
            {results.map((r) => {
              const segments = highlightMatches(r.text, query)
              return (
                <li key={r.blockId}>
                  <button
                    onClick={() => openResult(r.chapterId, r.blockId)}
                    className="w-full text-right rounded-2xl bg-app-surface border border-app-border p-4 hover:border-app-accent/60 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-app-accent font-bold group-hover:underline">{r.chapterTitle}</span>
                      <span className="text-[11px] text-app-muted font-serif">صفحة {toArabicDigits(r.sourcePage)}</span>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-3 font-serif text-app-text">
                      {segments.map((s, i) =>
                        s.match ? <mark key={i} className="bg-app-accent/20 text-app-accent font-bold rounded-xs px-0.5">{s.text}</mark> : <span key={i}>{s.text}</span>
                      )}
                    </p>
                  </button>
                </li>
              )
            })}
            {results.length === 0 && <p className="text-sm text-app-muted text-center py-10">لم يتم العثور على نتائج</p>}
          </ul>
        </div>
      )}
    </div>
  )
}
