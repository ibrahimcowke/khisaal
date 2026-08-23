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
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { useTranslation } from '../lib/i18n'

export default function ToolsHubPage() {
  const navigate = useNavigate()
  const { isRtl } = useTranslation()

  const tools = [
    {
      id: 'khisal-assessment',
      title: isRtl ? 'مقياس واختبار الخصال السلوكية' : 'Virtue Assessment Tool',
      desc: isRtl ? 'اختبار تفاعلي لقياس 8 أبعاد خلقية وسلوكية مع توصيات ذكية للقراءة' : 'Reflective test measuring 8 virtue dimensions with reading recommendations',
      icon: Award,
      path: '/khisal-assessment',
      badge: isRtl ? 'جديد 🌟' : 'New 🌟',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600',
    },
    {
      id: 'speed-reader',
      title: isRtl ? 'مختبر القراءة السريعة (RSVP)' : 'Speed Reading Trainer',
      desc: isRtl ? 'تدريب تفاعلي للعين وسرعة الاستيعاب بالتحكم في الكلمات بالدقيقة' : 'Rapid Serial Visual Presentation trainer with adjustable WPM and pacing',
      icon: Zap,
      path: '/speed-reader',
      badge: isRtl ? 'تفاعلي ⚡' : 'Interactive ⚡',
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-600',
    },
    {
      id: 'flashcards',
      title: isRtl ? 'بطاقات الحفظ والمراجعة الذكية' : 'Flashcards & Spaced Repetition',
      desc: isRtl ? 'نظام التكرار المتباعد لاختبار الذاكرة وحفظ خصال المروءة والحكم' : 'Spaced repetition system to quiz and memorize core virtues & maxims',
      icon: Brain,
      path: '/flashcards',
      badge: isRtl ? 'تكرار ذكي 🧠' : 'Smart 🧠',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-600',
    },
    {
      id: 'mindmap',
      title: isRtl ? 'خريطة المفاهيم وترابط الخصال' : 'Visual Concept Mind Map',
      desc: isRtl ? 'مخطط بصري شبكي يربط الأبواب والخصال ومحاور التربية' : 'Interactive visual graph connecting chapters, virtues, and concepts',
      icon: Network,
      path: '/mindmap',
      badge: isRtl ? 'بصري 🌐' : 'Visual 🌐',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-600',
    },
    {
      id: 'trait-tree',
      title: isRtl ? 'شجرة الخصال المائتان' : 'Virtue Trait Tree',
      desc: isRtl ? 'تسلسل شجري هرمي لخصال السلوك من الثنائيات إلى الثمانيات' : 'Hierarchical virtue tree organizing traits from doubles to eights',
      icon: GitBranch,
      path: '/trait-tree',
      badge: isRtl ? 'شجري 🌳' : 'Tree 🌳',
      color: 'from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-600',
    },
    {
      id: 'habit-tracker',
      title: isRtl ? 'سجل تطبيق الخصال ومتابعة العادات' : 'Daily Habit & Practice Tracker',
      desc: isRtl ? 'متابعة يومية للالتزام بمكارم الأخلاق مع حساب الإنجاز المتواصل' : 'Track daily virtue execution with continuous streak counters',
      icon: HeartHandshake,
      path: '/habit-tracker',
      badge: isRtl ? 'يومي 📈' : 'Daily 📈',
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-600',
    },
    {
      id: 'reading-plan',
      title: isRtl ? 'خطة ختمة الـ 30 يوماً' : '30-Day Reading Plan',
      desc: isRtl ? 'جدول زمني مقسم لإتمام قراءة الكتاب واستيعابه في شهر' : 'Structured daily timeline to finish and comprehend the books in 30 days',
      icon: Calendar,
      path: '/reading-plan',
      badge: isRtl ? 'مخطط 📅' : 'Planner 📅',
      color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-600',
    },
    {
      id: 'quotes',
      title: isRtl ? 'ستوديو تصميم وبطاقات الاقتباس' : 'Quote Studio & Visual Cards',
      desc: isRtl ? 'تحويل الفوائد والحكم إلى بطاقات أنيقة مزخرفة للمشاركة والحفظ' : 'Turn wisdom quotes into elegant arabesque cards for sharing and export',
      icon: Quote,
      path: '/quotes',
      badge: isRtl ? 'تصميم 🎨' : 'Design 🎨',
      color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-600',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-16">
      <PageHeader
        title={isRtl ? 'مركز الأدوات التفاعلية' : 'Interactive Tools Hub'}
        subtitle={isRtl ? 'مجموعة متكاملة من الأدوات الذكية لتعزيز القراءة والتدريب السلوكي' : 'A complete suite of interactive tools for reading & behavioral practice'}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((t) => {
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

                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-app-accent/10 text-app-accent border border-app-accent/20">
                  {t.badge}
                </span>
              </div>

              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-app-text group-hover:text-app-accent transition-colors flex items-center gap-1.5">
                  <span>{t.title}</span>
                </h3>
                <p className="text-xs text-app-text-secondary mt-1.5 leading-relaxed font-serif">
                  {t.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-app-border/40 flex items-center justify-between text-xs font-bold text-app-accent">
                <span>{isRtl ? 'فتح الأداة التفاعلية' : 'Launch Tool'}</span>
                <span className="group-hover:translate-x-[-4px] transition-transform">❖</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
