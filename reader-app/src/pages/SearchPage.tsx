import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search as SearchIcon, X, Clock } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db, uid } from '../lib/db'
import { normalizeArabic, highlightMatches } from '../lib/arabicNormalize'
import { toArabicDigits } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'

interface SearchDoc {
  chapterId: string
  chapterTitle: string
  blockId: string
  text: string
  normText: string
  sourcePage: number
}

export default function SearchPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const recentSearches = useLiveQuery(() => db.recentSearches.orderBy('createdAt').reverse().limit(8).toArray(), [])

  const fuse = useMemo(() => {
    if (!index) return null
    const docs: SearchDoc[] = []
    for (const c of index.chapters) {
      for (const b of c.blocks) {
        const text = b.text ?? (b.items ?? []).join(' ')
        if (!text) continue
        docs.push({ chapterId: c.id, chapterTitle: c.title, blockId: b.id, text, normText: normalizeArabic(text), sourcePage: b.sourcePage })
      }
    }
    return new Fuse(docs, { keys: ['normText', 'chapterTitle'], threshold: 0.32, ignoreLocation: true, minMatchCharLength: 2 })
  }, [index])

  const results = useMemo(() => {
    if (!fuse || !query.trim()) return []
    return fuse.search(normalizeArabic(query)).slice(0, 40).map((r) => r.item)
  }, [fuse, query])

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

      <div className="relative mb-6">
        <SearchIcon size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-app-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في نص الكتاب كاملاً..."
          dir="rtl"
          className="w-full rounded-2xl border border-app-border bg-app-surface py-3.5 pr-11 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted">
            <X size={16} />
          </button>
        )}
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
          <p className="text-xs text-app-muted mb-3">{toArabicDigits(results.length)} نتيجة</p>
          <ul className="space-y-2">
            {results.map((r) => {
              const segments = highlightMatches(r.text, query)
              return (
                <li key={r.blockId}>
                  <button
                    onClick={() => openResult(r.chapterId, r.blockId)}
                    className="w-full text-right rounded-xl bg-app-surface border border-app-border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-app-accent font-medium">{r.chapterTitle}</span>
                      <span className="text-[11px] text-app-muted">صفحة {toArabicDigits(r.sourcePage)}</span>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-3">
                      {segments.map((s, i) =>
                        s.match ? <mark key={i} className="bg-app-highlight rounded-[2px]">{s.text}</mark> : <span key={i}>{s.text}</span>
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
