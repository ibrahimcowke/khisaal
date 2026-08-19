import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitBranch, Search, Filter, ChevronLeft } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { toArabicDigits } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'
import { cn } from '../lib/cn'
import { normalizeArabic } from '../lib/arabicNormalize'

interface TraitPillar {
  id: string
  name: string
  icon: string
  keywords: string[]
  color: string
}

const MORAL_PILLARS: TraitPillar[] = [
  { id: 'all', name: 'جميع المحاور الأخلاقية', icon: '❖', keywords: [], color: 'bg-app-accent text-white' },
  { id: 'knowledge', name: 'العلم والفكر والحكمة', icon: '📖', keywords: ['العلم', 'الحكمة', 'العقل', 'الفهم', 'المعرفة', 'البيان', 'الطلب'], color: 'border-amber-500/50 bg-amber-500/10 text-amber-600' },
  { id: 'patience', name: 'الحلم والصبر وضبط النفس', icon: '🛡️', keywords: ['الصبر', 'الحلم', 'الغضب', 'السكوت', 'الأناة', 'العفو', 'الاحتمال'], color: 'border-blue-500/50 bg-blue-500/10 text-blue-600' },
  { id: 'nobility', name: 'المروءة والشرف وعزة النفس', icon: '👑', keywords: ['المروءة', 'الشرف', 'العزة', 'النبل', 'الهمة', 'الكبرياء', 'الحرص'], color: 'border-purple-500/50 bg-purple-500/10 text-purple-600' },
  { id: 'generosity', name: 'الكرم والإحسان والصلة', icon: '💎', keywords: ['الكرم', 'الجود', 'السخاء', 'الصلة', 'البر', 'الإحسان', 'الصدقة'], color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600' },
  { id: 'manners', name: 'الأدب والسلوك وحسن العشرة', icon: '🌿', keywords: ['الأدب', 'الخلق', 'العشرة', 'الصداقة', 'المجالسة', 'الحديث', 'الوفاء'], color: 'border-rose-500/50 bg-rose-500/10 text-rose-600' },
]

export default function TraitTreePage() {
  const { index, loading } = useBook()
  const navigate = useNavigate()
  const [selectedPillar, setSelectedPillar] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Group chapters by systems
  const systems = useMemo(() => {
    if (!index) return []
    const map = new Map<string, typeof index.chapters>()

    for (const c of index.chapters) {
      let sysName = 'أبواب الموسوعة'
      if (c.title.includes('ثنائيات') || c.title.includes('اثنتان') || c.title.includes('اثنان')) sysName = 'منظومة الثنائيات'
      else if (c.title.includes('ثلاثيات') || c.title.includes('ثلاث') || c.title.includes('ثلاثة')) sysName = 'منظومة الثلاثيات'
      else if (c.title.includes('رباعيات') || c.title.includes('أربع') || c.title.includes('أربعة')) sysName = 'منظومة الرباعيات'
      else if (c.title.includes('خماسيات') || c.title.includes('خمس') || c.title.includes('خمسة')) sysName = 'منظومة الخماسيات'
      else if (c.title.includes('سداسيات') || c.title.includes('ست') || c.title.includes('ستة')) sysName = 'منظومة السداسيات'

      if (!map.has(sysName)) map.set(sysName, [])
      map.get(sysName)!.push(c)
    }

    return Array.from(map.entries()).map(([name, chapters]) => ({ name, chapters }))
  }, [index])

  // Filtered chapters
  const filteredSystems = useMemo(() => {
    const pillar = MORAL_PILLARS.find((p) => p.id === selectedPillar)
    const q = normalizeArabic(searchQuery.trim())

    return systems
      .map((s) => {
        const filteredChapters = s.chapters.filter((c) => {
          const normTitle = normalizeArabic(c.title)
          const allText = normalizeArabic(c.blocks.map((b) => b.text ?? '').join(' '))

          // Search query filter
          if (q && !normTitle.includes(q) && !allText.includes(q)) return false

          // Pillar category keywords filter
          if (pillar && pillar.id !== 'all' && pillar.keywords.length > 0) {
            const hasKeyword = pillar.keywords.some((kw) => {
              const nkw = normalizeArabic(kw)
              return normTitle.includes(nkw) || allText.includes(nkw)
            })
            if (!hasKeyword) return false
          }

          return true
        })

        return { ...s, chapters: filteredChapters }
      })
      .filter((s) => s.chapters.length > 0)
  }, [systems, selectedPillar, searchQuery])

  if (loading || !index) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ تجهيز شجرة الخصال...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-14 animate-fade-in">
      <PageHeader
        title="شجرة وخريطة الخصال والمفاهيم"
        subtitle="خريطة بصرية تفاعلية تربط الخصال بمنظوماتها الأخلاقية والأدبية"
        count={`${toArabicDigits(index.chapters.length)} باباً`}
      />

      {/* Interactive Controls & Filters */}
      <div className="space-y-4 mb-8">
        {/* Search Bar */}
        <div className="relative">
          <Search size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-app-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في شجرة الخصال والمفاهيم (مثل: الصبر، الكرم، المروءة)..."
            dir="rtl"
            className="w-full rounded-2xl border border-app-border bg-app-surface py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40 shadow-xs"
          />
        </div>

        {/* Moral Pillars Pills */}
        <div>
          <p className="text-xs font-semibold text-app-text-secondary mb-2 flex items-center gap-1.5">
            <Filter size={13} className="text-app-accent" />
            <span>التصفية حسب المحور الأخلاقي والسلوكي:</span>
          </p>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {MORAL_PILLARS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPillar(p.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all active:scale-95 shadow-xs',
                  selectedPillar === p.id
                    ? 'bg-app-accent text-white border-app-accent shadow-sm'
                    : 'bg-app-surface border-app-border text-app-text hover:border-app-accent/60'
                )}
              >
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Systems & Trait Nodes Tree */}
      <div className="space-y-8">
        {filteredSystems.length === 0 ? (
          <div className="text-center py-16 bg-app-surface/60 rounded-3xl border border-app-border">
            <GitBranch size={36} className="mx-auto text-app-muted mb-3 opacity-40" />
            <p className="text-base font-bold text-app-text">لم يتم العثور على خصال مطابقة</p>
            <p className="text-xs text-app-muted mt-1">جرب تغيير كلمات البحث أو اختيار محور أخلاقي آخر</p>
          </div>
        ) : (
          filteredSystems.map((sys, sysIdx) => (
            <div key={sys.name} className="space-y-3">
              {/* System Header Node */}
              <div className="flex items-center gap-3 bg-app-surface p-3.5 rounded-2xl border border-app-border shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-app-accent/15 text-app-accent font-display text-base font-bold flex items-center justify-center shrink-0">
                  {toArabicDigits(sysIdx + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-app-text leading-tight">{sys.name}</h3>
                  <p className="text-xs text-app-text-secondary mt-0.5">
                    {toArabicDigits(sys.chapters.length)} أبواب وخصلة مرتبطة
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-app-accent/10 text-app-accent font-bold">
                  {toArabicDigits(sys.chapters.length)}
                </span>
              </div>

              {/* Trait Branch Nodes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-4 border-r-2 border-app-accent/30 mr-4">
                {sys.chapters.map((chapter) => {
                  const wordCount = chapter.blocks.reduce(
                    (acc, b) => acc + (b.text ?? (b.items ?? []).join(' ')).split(/\s+/).filter(Boolean).length,
                    0
                  )

                  return (
                    <div
                      key={chapter.id}
                      onClick={() => navigate(`/book/${index.book.id}/read?c=${chapter.id}`)}
                      className="p-4 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold text-app-accent bg-app-accent/10 px-2 py-0.5 rounded-md">
                            ص {toArabicDigits(chapter.sourcePageStart)}
                          </span>
                          <span className="text-xs text-app-muted opacity-60 font-display">❖</span>
                        </div>

                        <h4 className="font-display text-sm sm:text-base font-bold text-app-text group-hover:text-app-accent transition-colors line-clamp-2 leading-snug">
                          {chapter.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-app-border/40 text-[11px] text-app-muted">
                        <span>{toArabicDigits(chapter.blocks.length)} فقرات · {toArabicDigits(wordCount)} كلمة</span>
                        <div className="flex items-center gap-1 text-app-accent font-bold group-hover:-translate-x-1 transition-transform">
                          <span>قراءة</span>
                          <ChevronLeft size={13} />
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
