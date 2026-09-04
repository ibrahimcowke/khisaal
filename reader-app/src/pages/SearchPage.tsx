import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search as SearchIcon, X, Clock, Sparkles, Tag, BookOpen, Filter } from 'lucide-react'
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
  tags: string[]
  blockId: string
  text: string
  normText: string
  sourcePage: number
  sourceBook?: string
}

const SEARCH_FACETS = [
  { id: 'all', label: 'الكل' },
  { id: 'dyads', label: 'الثنائيات' },
  { id: 'triads', label: 'الثلاثيات' },
  { id: 'tetrads', label: 'الرباعيات' },
  { id: 'ethics', label: 'الخصال والآداب' },
]

const SOURCES = [
  'الكل',
  'صحيح البخاري',
  'صحيح مسلم',
  'سنن الترمذي',
  'سنن أبي داود',
  'مسند أحمد',
  'موطأ مالك',
]

export default function SearchPage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedFacet, setSelectedFacet] = useState('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<string>('الكل')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const recentSearches = useLiveQuery(() => db.recentSearches.orderBy('createdAt').reverse().limit(8).toArray(), [])

  // Check if query matches any classical root
  const lexiconHint = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return null
    return lookupWordInLexicon(query.trim())
  }, [query])

  // Extract popular tags
  const popularTags = useMemo(() => {
    if (!index) return []
    const tagCount = new Map<string, number>()
    for (const c of index.chapters) {
      for (const t of c.tags || []) {
        tagCount.set(t, (tagCount.get(t) || 0) + 1)
      }
    }
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([tag, count]) => ({ tag, count }))
  }, [index])

  const docs = useMemo(() => {
    if (!index) return []
    const list: SearchDoc[] = []
    for (const c of index.chapters) {
      let cat = 'ethics'
      if (c.title.includes('ثنائيات') || c.title.includes('اثنتان')) cat = 'dyads'
      else if (c.title.includes('ثلاثيات') || c.title.includes('ثلاث')) cat = 'triads'
      else if (c.title.includes('رباعيات') || c.title.includes('أربع')) cat = 'tetrads'

      for (const b of c.blocks) {
        const text = b.text ?? (b.items ?? []).join(' ')
        if (!text) continue

        let detectedSource = ''
        if (text.includes('البخاري') || text.includes('رواه البخاري')) detectedSource = 'صحيح البخاري'
        else if (text.includes('مسلم') || text.includes('رواه مسلم')) detectedSource = 'صحيح مسلم'
        else if (text.includes('الترمذي')) detectedSource = 'سنن الترمذي'
        else if (text.includes('أبي داود') || text.includes('أبو داود')) detectedSource = 'سنن أبي داود'
        else if (text.includes('أحمد') || text.includes('مسند')) detectedSource = 'مسند أحمد'
        else if (text.includes('مالك') || text.includes('الموطأ')) detectedSource = 'موطأ مالك'

        list.push({
          chapterId: c.id,
          chapterTitle: c.title,
          category: cat,
          tags: c.tags || [],
          blockId: b.id,
          text,
          normText: normalizeArabic(text + ' ' + (c.tags || []).join(' ')),
          sourcePage: b.sourcePage,
          sourceBook: detectedSource,
        })
      }
    }
    return list
  }, [index])

  const fuse = useMemo(() => {
    if (docs.length === 0) return null
    return new Fuse(docs, {
      keys: ['normText', 'chapterTitle', 'tags'],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    })
  }, [docs])

  const results = useMemo(() => {
    let pool: SearchDoc[] = []

    if (query.trim()) {
      if (!fuse) return []
      pool = fuse.search(normalizeArabic(query)).map((r) => r.item)
    } else if (selectedTag || selectedSource !== 'الكل' || selectedFacet !== 'all') {
      pool = docs
    } else {
      return []
    }

    return pool
      .filter((item) => {
        if (selectedFacet !== 'all' && item.category !== selectedFacet) return false
        if (selectedTag && !item.tags.includes(selectedTag)) return false
        if (selectedSource !== 'الكل' && item.sourceBook !== selectedSource && !item.text.includes(selectedSource)) return false
        return true
      })
      .slice(0, 60)
  }, [fuse, docs, query, selectedFacet, selectedTag, selectedSource])

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

  const isFiltering = query.trim() || selectedTag || selectedSource !== 'الكل' || selectedFacet !== 'all'

  function clearAllFilters() {
    setQuery('')
    setSelectedTag(null)
    setSelectedSource('الكل')
    setSelectedFacet('all')
  }

  if (loading || !index) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ التحميل...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-14 animate-fade-in">
      <PageHeader
        title="البحث المتقدم في الموسوعة"
        subtitle="بحث سريع في النصوص والأبواب والوسوم والمصادر المعتمدة"
        count={isFiltering ? `${toArabicDigits(results.length)} نتيجة` : undefined}
      />

      {/* Main Search Input */}
      <div className="relative mb-3">
        <SearchIcon size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-app-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالنص أو الكلمة أو الحكمة..."
          dir="rtl"
          className="w-full rounded-2xl border border-app-border bg-app-surface py-3.5 pr-11 pl-20 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40 shadow-xs"
        />
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-app-muted hover:text-app-text p-1.5 rounded-lg hover:bg-app-border/40"
              title="مسح"
            >
              <X size={15} />
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              'p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-colors',
              showAdvanced || selectedTag || selectedSource !== 'الكل'
                ? 'bg-app-accent text-white border-app-accent'
                : 'bg-app-surface text-app-text-secondary border-app-border hover:text-app-text'
            )}
            title="تصفية متقدمة"
          >
            <Filter size={14} />
          </button>
        </div>
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

      {/* Advanced Filters Drawer / Panel */}
      {(showAdvanced || selectedTag || selectedSource !== 'الكل') && (
        <div className="mb-4 p-4 rounded-2xl bg-app-surface border border-app-border space-y-3.5 animate-fade-in shadow-2xs">
          {/* Source filter */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-app-text mb-2">
              <span className="flex items-center gap-1.5">
                <BookOpen size={13} className="text-app-accent" />
                المصدر أو الديوان
              </span>
              {selectedSource !== 'الكل' && (
                <button onClick={() => setSelectedSource('الكل')} className="text-[11px] text-app-accent hover:underline">
                  إعادة ضبط
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SOURCES.map((source) => (
                <button
                  key={source}
                  onClick={() => setSelectedSource(source)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer',
                    selectedSource === source
                      ? 'bg-app-accent text-white font-medium shadow-2xs'
                      : 'bg-app-bg border border-app-border text-app-text-secondary hover:text-app-text'
                  )}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          {/* Tags filter cloud */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-app-text mb-2">
              <span className="flex items-center gap-1.5">
                <Tag size={13} className="text-app-accent" />
                الوسوم والمواضيع
              </span>
              {selectedTag && (
                <button onClick={() => setSelectedTag(null)} className="text-[11px] text-app-accent hover:underline">
                  إلغاء اختيار الوسم
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {popularTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer',
                    selectedTag === tag
                      ? 'bg-emerald-600 text-white font-medium shadow-2xs'
                      : 'bg-app-bg border border-app-border text-app-text-secondary hover:text-app-text hover:border-app-accent/40'
                  )}
                >
                  <span>{tag}</span>
                  <span className="text-[10px] opacity-70">({toArabicDigits(count)})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {isFiltering && (
            <div className="pt-2 border-t border-app-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-app-muted">التصفيات:</span>
                {selectedTag && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs">
                    وسم: {selectedTag}
                    <button onClick={() => setSelectedTag(null)}><X size={10} /></button>
                  </span>
                )}
                {selectedSource !== 'الكل' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-app-accent/15 text-app-accent text-xs">
                    مصدر: {selectedSource}
                    <button onClick={() => setSelectedSource('الكل')}><X size={10} /></button>
                  </span>
                )}
                {selectedFacet !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs">
                    تصنيف: {SEARCH_FACETS.find((f) => f.id === selectedFacet)?.label}
                    <button onClick={() => setSelectedFacet('all')}><X size={10} /></button>
                  </span>
                )}
              </div>
              <button onClick={clearAllFilters} className="text-red-500 hover:underline text-xs shrink-0 mr-2">
                مسح الكل
              </button>
            </div>
          )}
        </div>
      )}

      {/* Category Facets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {SEARCH_FACETS.map((facet) => (
          <button
            key={facet.id}
            onClick={() => setSelectedFacet(facet.id)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-xs cursor-pointer',
              selectedFacet === facet.id
                ? 'bg-app-accent text-white shadow-xs'
                : 'bg-app-surface border border-app-border text-app-muted hover:text-app-text'
            )}
          >
            {facet.label}
          </button>
        ))}
      </div>

      {/* Empty State / Recent Searches & Popular Tags */}
      {!isFiltering && (
        <div className="space-y-6">
          {recentSearches && recentSearches.length > 0 && (
            <div>
              <p className="text-sm font-medium text-app-text-secondary mb-3">عمليات بحث سابقة</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setQuery(r.query)}
                    className="flex items-center gap-1.5 rounded-full border border-app-border px-3.5 py-1.5 text-xs text-app-text-secondary hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <Clock size={12} />
                    {r.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-app-text-secondary mb-3 flex items-center gap-1.5">
              <Tag size={14} className="text-app-accent" />
              تصفح حسب الموضوع والوسم
            </p>
            <div className="flex flex-wrap gap-2">
              {popularTags.slice(0, 12).map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag)
                    setShowAdvanced(true)
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-app-surface border border-app-border px-3 py-1.5 text-xs text-app-text hover:border-app-accent transition-all cursor-pointer shadow-2xs"
                >
                  <Tag size={11} className="text-app-accent" />
                  <span>{tag}</span>
                  <span className="text-[10px] text-app-muted">({toArabicDigits(count)})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      {isFiltering && (
        <div>
          <div className="flex items-center justify-between text-xs text-app-muted mb-3">
            <span>{toArabicDigits(results.length)} نتيجة بحث</span>
            <div className="flex items-center gap-2">
              {selectedFacet !== 'all' && <span>{SEARCH_FACETS.find((f) => f.id === selectedFacet)?.label}</span>}
              {selectedTag && <span>· {selectedTag}</span>}
            </div>
          </div>
          <ul className="space-y-2.5">
            {results.map((r) => {
              const segments = query.trim() ? highlightMatches(r.text, query) : [{ text: r.text, match: false }]
              return (
                <li key={r.blockId}>
                  <button
                    onClick={() => openResult(r.chapterId, r.blockId)}
                    className="w-full text-right rounded-2xl bg-app-surface border border-app-border p-4 hover:border-app-accent/60 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-app-accent font-bold group-hover:underline">
                        {r.chapterTitle}
                      </span>
                      <span className="text-[11px] text-app-muted font-serif">
                        صفحة {toArabicDigits(r.sourcePage)}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed line-clamp-3 font-serif text-app-text mb-2.5">
                      {segments.map((s, i) =>
                        s.match ? (
                          <mark key={i} className="bg-app-accent/20 text-app-accent font-bold rounded-xs px-0.5">
                            {s.text}
                          </mark>
                        ) : (
                          <span key={i}>{s.text}</span>
                        )
                      )}
                    </p>

                    {r.tags && r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-app-border/40">
                        {r.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-md font-sans',
                              selectedTag === tag
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold'
                                : 'bg-app-bg text-app-muted'
                            )}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                </li>
              )
            })}
            {results.length === 0 && (
              <div className="text-center py-12 bg-app-surface rounded-2xl border border-app-border">
                <SearchIcon size={32} className="mx-auto text-app-muted/50 mb-3" />
                <p className="text-sm font-bold text-app-text mb-1">لم يتم العثور على نتائج</p>
                <p className="text-xs text-app-muted">جرب البحث بكلمات أخرى أو تقليل شروط التصفية</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-3 text-xs text-app-accent hover:underline font-semibold"
                >
                  إلغاء جميع خيارات التصفية
                </button>
              </div>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
