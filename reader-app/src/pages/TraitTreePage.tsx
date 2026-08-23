import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitBranch, Search, Filter, ChevronLeft, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { useBook } from '../context/BookContext'
import { PageHeader } from '../components/layout/PageHeader'
import { cn } from '../lib/cn'
import { normalizeArabic } from '../lib/arabicNormalize'
import { useTranslation } from '../lib/i18n'

interface TraitPillar {
  id: string
  name: string
  nameEn: string
  icon: string
  keywords: string[]
  color: string
}

const MORAL_PILLARS: TraitPillar[] = [
  { id: 'all', name: 'جميع المحاور الأخلاقية', nameEn: 'All Moral Pillars', icon: '❖', keywords: [], color: 'bg-app-accent text-white' },
  { id: 'knowledge', name: 'العلم والفكر والحكمة', nameEn: 'Knowledge & Wisdom', icon: '📖', keywords: ['العلم', 'الحكمة', 'العقل', 'الفهم', 'المعرفة', 'البيان', 'الطلب'], color: 'border-amber-500/50 bg-amber-500/10 text-amber-600' },
  { id: 'patience', name: 'الحلم والصبر وضبط النفس', nameEn: 'Patience & Self-Control', icon: '🛡️', keywords: ['الصبر', 'الحلم', 'الغضب', 'السكوت', 'الأناة', 'العفو', 'الاحتمال'], color: 'border-blue-500/50 bg-blue-500/10 text-blue-600' },
  { id: 'nobility', name: 'المروءة والشرف وعزة النفس', nameEn: 'Nobility & Honor', icon: '👑', keywords: ['المروءة', 'الشرف', 'العزة', 'النبل', 'الهمة', 'الكبرياء', 'الحرص'], color: 'border-purple-500/50 bg-purple-500/10 text-purple-600' },
  { id: 'generosity', name: 'الكرم والإحسان والصلة', nameEn: 'Generosity & Kinship', icon: '💎', keywords: ['الكرم', 'الجود', 'السخاء', 'الصلة', 'البر', 'الإحسان', 'الصدقة'], color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600' },
  { id: 'manners', name: 'الأدب والسلوك وحسن العشرة', nameEn: 'Etiquette & Manners', icon: '🌿', keywords: ['الأدب', 'الخلق', 'العشرة', 'الصداقة', 'المجالسة', 'الحديث', 'الوفاء'], color: 'border-rose-500/50 bg-rose-500/10 text-rose-600' },
]

export default function TraitTreePage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const { t, isRtl, formatDigits } = useTranslation()
  const [selectedPillar, setSelectedPillar] = useState('all')
  const [practiceFilter, setPracticeFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const logs = useLiveQuery(() => db.virtueLogs.toArray()) || []
  const completedTraitIds = useMemo(() => {
    return new Set(logs.filter((l) => l.completed).map((l) => l.traitId))
  }, [logs])

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight

  // Group chapters by systems
  const systems = useMemo(() => {
    if (!index) return []
    const map = new Map<string, typeof index.chapters>()

    for (const c of index.chapters) {
      let sysName = isRtl ? 'أبواب الموسوعة' : 'Encyclopedia Chapters'
      if (c.title.includes('ثنائيات') || c.title.includes('اثنتان') || c.title.includes('اثنان')) sysName = isRtl ? 'منظومة الثنائيات (Dyads)' : 'Dyads (Systems of 2)'
      else if (c.title.includes('ثلاثيات') || c.title.includes('ثلاث') || c.title.includes('ثلاثة')) sysName = isRtl ? 'منظومة الثلاثيات (Triads)' : 'Triads (Systems of 3)'
      else if (c.title.includes('رباعيات') || c.title.includes('أربع') || c.title.includes('أربعة')) sysName = isRtl ? 'منظومة الرباعيات (Tetrads)' : 'Tetrads (Systems of 4)'
      else if (c.title.includes('خماسيات') || c.title.includes('خمس') || c.title.includes('خمسة')) sysName = isRtl ? 'منظومة الخماسيات (Pentads)' : 'Pentads (Systems of 5)'
      else if (c.title.includes('سداسيات') || c.title.includes('ست') || c.title.includes('ستة')) sysName = isRtl ? 'منظومة السداسيات (Hexads)' : 'Hexads (Systems of 6)'
      else if (c.title.includes('سباعيات') || c.title.includes('سبع') || c.title.includes('سبعة')) sysName = isRtl ? 'منظومة السباعيات (Heptads)' : 'Heptads (Systems of 7)'
      else if (c.title.includes('ثمانيات') || c.title.includes('ثمان') || c.title.includes('ثمانية')) sysName = isRtl ? 'منظومة الثمانيات (Octads)' : 'Octads (Systems of 8)'

      if (!map.has(sysName)) map.set(sysName, [])
      map.get(sysName)!.push(c)
    }

    return Array.from(map.entries()).map(([name, chapters]) => ({ name, chapters }))
  }, [index, isRtl])

  // Filter systems by pillar, practice status, and search query
  const filteredSystems = useMemo(() => {
    const activePillar = MORAL_PILLARS.find((p) => p.id === selectedPillar)
    const normQuery = normalizeArabic(searchQuery.trim())

    return systems
      .map((sys) => {
        const matchingChapters = sys.chapters.filter((ch) => {
          // Practice Status filter
          const isDone = completedTraitIds.has(ch.id)
          if (practiceFilter === 'completed' && !isDone) return false
          if (practiceFilter === 'pending' && isDone) return false

          // Search query filter
          if (normQuery) {
            const normTitle = normalizeArabic(ch.title)
            const textMatch = ch.blocks.some((b) => b.text && normalizeArabic(b.text).includes(normQuery))
            if (!normTitle.includes(normQuery) && !textMatch) return false
          }

          // Pillar category filter
          if (activePillar && activePillar.keywords.length > 0) {
            const hasKeyword = activePillar.keywords.some(
              (kw) =>
                ch.title.includes(kw) ||
                ch.blocks.some((b) => b.text && b.text.includes(kw))
            )
            if (!hasKeyword) return false
          }

          return true
        })

        return { ...sys, chapters: matchingChapters }
      })
      .filter((sys) => sys.chapters.length > 0)
  }, [systems, selectedPillar, searchQuery, practiceFilter, completedTraitIds])

  if (loading || !index) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-app-text-secondary">
        <div className="w-8 h-8 border-2 border-app-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalMatches = filteredSystems.reduce((acc, s) => acc + s.chapters.length, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16 animate-fade-in space-y-6">
      <PageHeader
        title={t('traitTreeTitle')}
        subtitle={t('traitTreeSubtitle')}
        count={formatDigits(totalMatches)}
      />

      {/* Interactive Controls & Pillar Filter Bar */}
      <div className="space-y-3 bg-app-surface p-4 sm:p-5 rounded-3xl border border-app-border shadow-xs">
        {/* Search Box */}
        <div className="relative">
          <Search size={16} className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-app-muted`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchTraitsPlaceholder')}
            className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 rounded-2xl bg-app-bg border border-app-border text-sm text-app-text placeholder:text-app-muted focus:outline-hidden focus:border-app-accent transition-all shadow-xs`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-xs text-app-muted hover:text-app-text`}
            >
              {t('close')}
            </button>
          )}
        </div>

        {/* Pillars Filter Buttons */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-app-text-secondary mb-2 px-1">
            <Filter size={13} className="text-app-accent" />
            <span>{t('filterByPillar')}</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {MORAL_PILLARS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPillar(p.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all active:scale-95 shadow-xs',
                  selectedPillar === p.id
                    ? 'bg-app-accent text-white border-app-accent shadow-xs'
                    : 'bg-app-surface border-app-border text-app-text hover:border-app-accent/60'
                )}
              >
                <span>{p.icon}</span>
                <span>{isRtl ? p.name : p.nameEn}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Practice Status Filter Tabs */}
        <div className="pt-2 border-t border-app-border/40 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs text-app-muted font-medium">
            <Sparkles size={13} className="text-app-accent" />
            <span>{isRtl ? 'حالة التطبيق والممارسة:' : 'Practice Status:'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPracticeFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-xs',
                practiceFilter === 'all'
                  ? 'bg-app-accent text-white'
                  : 'bg-app-surface border border-app-border text-app-muted hover:text-app-text'
              )}
            >
              {isRtl ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setPracticeFilter('completed')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shadow-xs',
                practiceFilter === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-app-surface border border-app-border text-emerald-600 hover:bg-emerald-500/10'
              )}
            >
              <CheckCircle2 size={12} />
              <span>{isRtl ? 'المطبقة' : 'Practiced'}</span>
              <span className="text-[10px] opacity-80">({formatDigits(completedTraitIds.size)})</span>
            </button>
            <button
              onClick={() => setPracticeFilter('pending')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-xs',
                practiceFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-app-surface border border-app-border text-amber-600 hover:bg-amber-500/10'
              )}
            >
              {isRtl ? 'غير المطبقة' : 'Unpracticed'}
            </button>
          </div>
        </div>
      </div>

      {/* Systems & Trait Nodes Tree */}
      <div className="space-y-8">
        {filteredSystems.length === 0 ? (
          <div className="text-center py-16 bg-app-surface/60 rounded-3xl border border-app-border">
            <GitBranch size={36} className="mx-auto text-app-muted mb-3 opacity-40" />
            <p className="text-base font-bold text-app-text">{t('noTraitsFound')}</p>
            <p className="text-xs text-app-muted mt-1">
              {isRtl ? 'جرب تغيير كلمات البحث أو اختيار محور أخلاقي آخر' : 'Try adjusting search terms or pillar filters'}
            </p>
          </div>
        ) : (
          filteredSystems.map((sys, sysIdx) => (
            <div key={sys.name} className="space-y-3">
              {/* System Header Node */}
              <div className="flex items-center gap-3 bg-app-surface p-3.5 rounded-2xl border border-app-border shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-app-accent/15 text-app-accent font-display text-base font-bold flex items-center justify-center shrink-0">
                  {formatDigits(sysIdx + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-app-text leading-tight">{sys.name}</h3>
                  <p className="text-xs text-app-text-secondary mt-0.5">
                    {formatDigits(sys.chapters.length)} {isRtl ? 'أبواب وخصلة مرتبطة' : 'chapters & traits'}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-app-accent/10 text-app-accent font-bold">
                  {formatDigits(sys.chapters.length)}
                </span>
              </div>

              {/* Trait Branch Nodes Grid */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${isRtl ? 'pr-4 border-r-2 mr-4' : 'pl-4 border-l-2 ml-4'} border-app-accent/30`}>
                {sys.chapters.map((chapter) => {
                  const isDone = completedTraitIds.has(chapter.id)
                  const wordCount = chapter.blocks.reduce(
                    (acc, b) => acc + (b.text ?? (b.items ?? []).join(' ')).split(/\s+/).filter(Boolean).length,
                    0
                  )

                  return (
                    <div
                      key={chapter.id}
                      onClick={() => navigate(`/book/${index.book.id}/read?c=${chapter.id}`)}
                      className={cn(
                        'topic-card p-4 rounded-2xl bg-app-surface border hover:border-app-accent hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden',
                        isDone ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-app-border'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold text-app-accent bg-app-accent/10 px-2 py-0.5 rounded-md">
                            {isRtl ? 'ص' : 'P.'} {formatDigits(chapter.sourcePageStart)}
                          </span>
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 size={11} />
                              <span>{isRtl ? 'تم التطبيق' : 'Practiced'}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-app-muted opacity-60 font-display">❖</span>
                          )}
                        </div>

                        <h4 className="font-display text-sm sm:text-base font-bold text-app-text group-hover:text-app-accent transition-colors line-clamp-2 leading-snug">
                          {chapter.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-app-border/40 text-[11px] text-app-muted">
                        <span>{formatDigits(chapter.blocks.length)} {isRtl ? 'فقرات' : 'blocks'} · {formatDigits(wordCount)} {t('wordsCount')}</span>
                        <div className="flex items-center gap-1 text-app-accent font-bold group-hover:translate-x-0.5 transition-transform">
                          <span>{isRtl ? 'قراءة' : 'Read'}</span>
                          <ChevronIcon size={13} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
