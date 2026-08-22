import { useNavigate } from 'react-router-dom'
import { Highlighter, Quote, GitBranch, Calendar, Search, Network, HeartHandshake, Brain } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'

export function QuickActionsHub() {
  const navigate = useNavigate()
  const { t, isRtl } = useTranslation()

  const actions = [
    {
      label: t('habitTracker'),
      desc: isRtl ? 'التطبيق اليومي' : 'Daily Practice',
      icon: HeartHandshake,
      path: '/habit-tracker',
    },
    {
      label: t('flashcards'),
      desc: isRtl ? 'حفظ ومراجعة' : 'Spaced Flashcards',
      icon: Brain,
      path: '/flashcards',
    },
    {
      label: t('mindmap'),
      desc: isRtl ? 'خريطة المفاهيم' : 'Concept Graph',
      icon: Network,
      path: '/mindmap',
    },
    {
      label: t('traitTree'),
      desc: isRtl ? 'شجرة الخصال' : 'Virtue Tree',
      icon: GitBranch,
      path: '/trait-tree',
    },
    {
      label: t('readingPlan'),
      desc: isRtl ? 'خطة 30 يوماً' : '30-Day Plan',
      icon: Calendar,
      path: '/reading-plan',
    },
    {
      label: t('search'),
      desc: isRtl ? 'بحث في المتن' : 'Full Search',
      icon: Search,
      path: '/search',
    },
    {
      label: t('quotes'),
      desc: isRtl ? 'ستوديو الاقتباس' : 'Quote Studio',
      icon: Quote,
      path: '/quotes',
    },
    {
      label: t('highlights'),
      desc: isRtl ? 'التظليلات' : 'Highlights',
      icon: Highlighter,
      path: '/highlights',
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs sm:text-sm font-bold text-app-text font-display">
          {t('quickActions')}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent/60 hover:bg-app-accent/5 hover:shadow-xs transition-all duration-150 group text-center active:scale-[0.98] shadow-2xs cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-app-accent/10 text-app-accent flex items-center justify-center mb-1.5 transition-transform duration-150 group-hover:scale-105">
                <Icon size={16} strokeWidth={1.8} />
              </div>
              <span className="text-xs font-semibold text-app-text truncate w-full group-hover:text-app-accent transition-colors">
                {action.label}
              </span>
              <span className="text-[10px] text-app-muted truncate w-full">
                {action.desc}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
