import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award,
  Zap,
  Network,
  Brain,
  GitBranch,
  Calendar,
  HeartHandshake,
  Quote,
  HelpCircle,
  Columns,
  Search,
  Sparkles,
  Flame,
  TrendingUp,
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '../components/layout/PageHeader'
import { useTranslation } from '../lib/i18n'
import { db } from '../lib/db'
import { toArabicDigits } from '../lib/format'
import { cn } from '../lib/cn'

type CategoryFilter = 'all' | 'quiz' | 'analysis' | 'habits'

export default function ToolsHubPage() {
  const navigate = useNavigate()
  const { isRtl } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Live query for habit practices to show user momentum in the hub
  const virtueLogsCount = useLiveQuery(() => db.virtueLogs.count(), []) ?? 0
  const flashcardsCount = useLiveQuery(() => db.flashcards.count(), []) ?? 0

  const tools = [
    {
      id: 'quiz',
      category: 'quiz',
      title: isRtl ? 'اختبار وتحدي الخصال (Quiz)' : 'Virtue Quiz Challenge',
      desc: isRtl ? 'أسئلة قصيرة ومركزة لاختبار استيعاب مكارم الأخلاق مع مؤقت وتحدي الحفاظ' : 'Concise interactive quiz testing moral traits & classical maxims with timer mode',
      icon: HelpCircle,
      path: '/quiz',
      badge: isRtl ? 'تحدي سريع 🎯' : 'Quiz 🎯',
      timeEst: isRtl ? 'دقيقتان' : '2 min',
      color: 'from-fuchsia-500/20 to-purple-500/10 border-fuchsia-500/30 text-fuchsia-600',
    },
    {
      id: 'khisal-assessment',
      category: 'quiz',
      title: isRtl ? 'مقياس واختبار الخصال السلوكية' : 'Virtue Assessment Tool',
      desc: isRtl ? 'اختبار تفاعلي لقياس 8 أبعاد خلقية وسلوكية مع توصيات ذكية للقراءة' : 'Reflective test measuring 8 virtue dimensions with reading recommendations',
      icon: Award,
      path: '/khisal-assessment',
      badge: isRtl ? 'تقييم ذاتي 🌟' : 'Assessment 🌟',
      timeEst: isRtl ? '3 دقائق' : '3 min',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600',
    },
    {
      id: 'flashcards',
      category: 'quiz',
      title: isRtl ? 'بطاقات الحفظ والمراجعة الذكية' : 'Flashcards & Spaced Repetition',
      desc: isRtl ? 'نظام التكرار المتباعد SM-2 لحفظ خصال المروءة والحكم واستحضارها' : 'Spaced repetition system to quiz and memorize core virtues & maxims',
      icon: Brain,
      path: '/flashcards',
      badge: isRtl ? 'تكرار ذكي 🧠' : 'Smart 🧠',
      timeEst: isRtl ? 'مراجعة يومية' : 'Daily',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-600',
    },
    {
      id: 'compare',
      category: 'analysis',
      title: isRtl ? 'مقارنة الخصال والحِكَم' : 'Virtues Comparison Tool',
      desc: isRtl ? 'مقارنة دلالية وموضوعية جنباً إلى جنب بين بابين لمعاينة الترابط والفروق' : 'Side-by-side comparison between two virtue chapters with tag overlap analysis',
      icon: Columns,
      path: '/compare',
      badge: isRtl ? 'تحليل مقارن ⚖️' : 'Compare ⚖️',
      timeEst: isRtl ? 'تأمل تحليلي' : 'Analytical',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-600',
    },
    {
      id: 'mindmap',
      category: 'analysis',
      title: isRtl ? 'خريطة المفاهيم وترابط الخصال' : 'Visual Concept Mind Map',
      desc: isRtl ? 'مخطط بصري شبكي يربط الأبواب والخصال ومحاور التربية' : 'Interactive visual graph connecting chapters, virtues, and concepts',
      icon: Network,
      path: '/mindmap',
      badge: isRtl ? 'شبكة بصرية 🌐' : 'Visual 🌐',
      timeEst: isRtl ? 'استكشاف' : 'Explore',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-600',
    },
    {
      id: 'trait-tree',
      category: 'analysis',
      title: isRtl ? 'شجرة الخصال ومكارم الأخلاق (600+ خصلة)' : 'Virtue Trait Tree (600+ Traits)',
      desc: isRtl ? 'تسلسل شجري هرمي لخصال السلوك من الثنائيات إلى الثمانيات وأبواب التراث' : 'Hierarchical virtue tree organizing traits from doubles to eights',
      icon: GitBranch,
      path: '/trait-tree',
      badge: isRtl ? 'هرمي شجري 🌳' : 'Tree 🌳',
      timeEst: isRtl ? 'تصفح' : 'Browse',
      color: 'from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-600',
    },
    {
      id: 'habit-tracker',
      category: 'habits',
      title: isRtl ? 'سجل تطبيق الخصال ومتابعة العادات' : 'Daily Habit & Practice Tracker',
      desc: isRtl ? 'متابعة يومية للالتزام بمكارم الأخلاق مع حساب الإنجاز المتواصل' : 'Track daily virtue execution with continuous streak counters',
      icon: HeartHandshake,
      path: '/habit-tracker',
      badge: isRtl ? 'يومي 📈' : 'Daily 📈',
      timeEst: isRtl ? 'دقيقة واحدة' : '1 min',
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-600',
    },
    {
      id: 'speed-reader',
      category: 'habits',
      title: isRtl ? 'مختبر القراءة السريعة (RSVP)' : 'Speed Reading Trainer',
      desc: isRtl ? 'تدريب تفاعلي للعين وسرعة الاستيعاب بالتحكم في الكلمات بالدقيقة' : 'Rapid Serial Visual Presentation trainer with adjustable WPM and pacing',
      icon: Zap,
      path: '/speed-reader',
      badge: isRtl ? 'تدريب سرعة ⚡' : 'Interactive ⚡',
      timeEst: isRtl ? 'تمرين بصري' : 'Training',
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-600',
    },
    {
      id: 'reading-plan',
      category: 'habits',
      title: isRtl ? 'خطة ختمة الـ 30 يوماً' : '30-Day Reading Plan',
      desc: isRtl ? 'جدول زمني مقسم لإتمام قراءة الكتاب واستيعابه في شهر' : 'Structured daily timeline to finish and comprehend the books in 30 days',
      icon: Calendar,
      path: '/reading-plan',
      badge: isRtl ? 'جدول ختمة 📅' : 'Planner 📅',
      timeEst: isRtl ? 'ورد يومي' : 'Daily Target',
      color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-600',
    },
    {
      id: 'quotes',
      category: 'habits',
      title: isRtl ? 'ستوديو تصميم وبطاقات الاقتباس 4K' : 'Quote Studio & Visual Cards',
      desc: isRtl ? 'تحويل الفوائد والحكم إلى بطاقات أنيقة مزخرفة للمشاركة بجودة فائقة' : 'Turn wisdom quotes into elegant arabesque cards for sharing and export',
      icon: Quote,
      path: '/quotes',
      badge: isRtl ? 'ستوديو بطاقات 🎨' : 'Design 🎨',
      timeEst: isRtl ? 'تصدير 4K' : 'Export 4K',
      color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-600',
    },
  ]

  const filteredTools = useMemo(() => {
    return tools.filter((t) => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory
      const matchQuery =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.desc.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchQuery
    })
  }, [tools, selectedCategory, searchQuery])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-16 animate-fade-in">
      <PageHeader
        title={isRtl ? 'مركز الأدوات التفاعلية' : 'Interactive Tools Hub'}
        subtitle={isRtl ? 'منظومة متكاملة من الأدوات الذكية، الاختبارات السريعة، ومختبرات الفهم والتطبيق' : 'A complete suite of interactive tools, rapid quizzes, and reflective labs'}
      />

      {/* Featured Quick Challenge & Momentum Banner */}
      <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-linear-to-br from-app-accent/15 via-app-surface to-app-accent/5 border border-app-accent/25 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-app-accent/15 text-app-accent text-xs font-bold mb-1">
            <Sparkles size={13} />
            <span>{isRtl ? 'تحدي اليوم السريع' : 'Daily Quick Challenge'}</span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-app-text">
            {isRtl ? 'اختبر حصيلتك في خصال المروءة (5 أسئلة)' : 'Test Your Moral Virtues (5 Questions)'}
          </h3>
          <p className="text-xs text-app-text-secondary leading-relaxed font-serif max-w-md">
            {isRtl ? 'أسئلة قصيرة وممتعة لاختبار استحضارك لمكارم الأخلاق والحكم العربية المأثورة.' : 'Short, fun quiz questions testing your retention of noble Arabic ethics.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            onClick={() => navigate('/quiz')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-app-accent text-white font-bold text-xs hover:bg-app-accent/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <span>{isRtl ? 'بدء التحدي الآن' : 'Start Challenge'}</span>
            <Flame size={14} />
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-app-surface border border-app-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="text-[11px] text-app-muted block">{isRtl ? 'تطبيقات الخصال' : 'Habit Logs'}</span>
            <span className="font-display font-bold text-base text-app-text">{toArabicDigits(virtueLogsCount)}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-app-surface border border-app-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
            <Brain size={18} />
          </div>
          <div>
            <span className="text-[11px] text-app-muted block">{isRtl ? 'بطاقات الحفظ' : 'Flashcards'}</span>
            <span className="font-display font-bold text-base text-app-text">{toArabicDigits(flashcardsCount)}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-app-surface border border-app-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
            <Award size={18} />
          </div>
          <div>
            <span className="text-[11px] text-app-muted block">{isRtl ? 'الأدوات التفاعلية' : 'Active Tools'}</span>
            <span className="font-display font-bold text-base text-app-text">10</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-app-surface border border-app-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="text-[11px] text-app-muted block">{isRtl ? 'محتوى الموسوعة' : 'Content'}</span>
            <span className="font-display font-bold text-base text-app-text">{isRtl ? '600+ خصلة' : '600+ Traits'}</span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-app-surface border border-app-border overflow-x-auto text-xs font-bold select-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap',
              selectedCategory === 'all' ? 'bg-app-accent text-white shadow-2xs' : 'text-app-muted hover:text-app-text'
            )}
          >
            {isRtl ? 'الكل (10)' : 'All (10)'}
          </button>
          <button
            onClick={() => setSelectedCategory('quiz')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap',
              selectedCategory === 'quiz' ? 'bg-app-accent text-white shadow-2xs' : 'text-app-muted hover:text-app-text'
            )}
          >
            {isRtl ? 'اختبارات وتحديات' : 'Quizzes'}
          </button>
          <button
            onClick={() => setSelectedCategory('analysis')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap',
              selectedCategory === 'analysis' ? 'bg-app-accent text-white shadow-2xs' : 'text-app-muted hover:text-app-text'
            )}
          >
            {isRtl ? 'تحليل واستكشاف' : 'Analysis'}
          </button>
          <button
            onClick={() => setSelectedCategory('habits')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap',
              selectedCategory === 'habits' ? 'bg-app-accent text-white shadow-2xs' : 'text-app-muted hover:text-app-text'
            )}
          >
            {isRtl ? 'عادات وتطبيق' : 'Habits & Practice'}
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'ابحث في الأدوات...' : 'Search tools...'}
            className="w-full pr-9 pl-3 py-2 rounded-2xl bg-app-surface border border-app-border text-xs text-app-text placeholder:text-app-muted focus:outline-none focus:border-app-accent"
          />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredTools.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => navigate(t.path)}
              className="p-5 rounded-3xl bg-app-surface border border-app-border hover:border-app-accent/80 hover:shadow-md transition-all duration-200 text-right group flex flex-col justify-between gap-4 active:scale-[0.99] cursor-pointer shadow-xs"
            >
              <div className="flex items-start justify-between gap-3 w-full">
                <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${t.color} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon size={22} />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-app-muted font-mono font-medium">
                    {t.timeEst}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-app-accent/10 text-app-accent border border-app-accent/20">
                    {t.badge}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-app-text group-hover:text-app-accent transition-colors flex items-center gap-1.5">
                  <span>{t.title}</span>
                </h3>
                <p className="text-xs text-app-text-secondary mt-1.5 leading-relaxed font-serif">
                  {t.desc}
                </p>
              </div>

              <div className="pt-2.5 border-t border-app-border/40 flex items-center justify-between text-xs font-bold text-app-accent">
                <span>{isRtl ? 'فتح الأداة التفاعلية' : 'Launch Tool'}</span>
                <span className="group-hover:-translate-x-1 transition-transform">❖</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
