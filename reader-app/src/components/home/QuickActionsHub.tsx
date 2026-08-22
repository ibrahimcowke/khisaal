import { useNavigate } from 'react-router-dom'
import { Highlighter, Quote, GitBranch, Calendar, Search, Network, HeartHandshake, Brain, Sparkles } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'

export function QuickActionsHub() {
  const navigate = useNavigate()
  const { t, isRtl } = useTranslation()

  const actions = [
    {
      label: t('habitTracker'),
      desc: isRtl ? 'التطبيق اليومي' : 'Daily Virtue',
      icon: HeartHandshake,
      path: '/habit-tracker',
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white',
      borderHover: 'hover:border-amber-500/50',
    },
    {
      label: t('flashcards'),
      desc: isRtl ? 'حفظ ومراجعة' : 'Spaced Reviews',
      icon: Brain,
      path: '/flashcards',
      color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white',
      borderHover: 'hover:border-indigo-500/50',
    },
    {
      label: t('mindmap'),
      desc: isRtl ? 'خريطة تفاعلية' : 'Virtue Graph',
      icon: Network,
      path: '/mindmap',
      color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
      borderHover: 'hover:border-purple-500/50',
    },
    {
      label: t('traitTree'),
      desc: isRtl ? 'شجرة الخصال' : 'Concept Map',
      icon: GitBranch,
      path: '/trait-tree',
      color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
      borderHover: 'hover:border-emerald-500/50',
    },
    {
      label: t('readingPlan'),
      desc: isRtl ? 'خطة القراءة' : '30-Day Plan',
      icon: Calendar,
      path: '/reading-plan',
      color: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white',
      borderHover: 'hover:border-teal-500/50',
    },
    {
      label: t('search'),
      desc: isRtl ? 'بحث شامل' : 'Deep Search',
      icon: Search,
      path: '/search',
      color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
      borderHover: 'hover:border-blue-500/50',
    },
    {
      label: t('quotes'),
      desc: isRtl ? 'ستوديو 4K' : '4K Studio',
      icon: Quote,
      path: '/quotes',
      color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white',
      borderHover: 'hover:border-rose-500/50',
    },
    {
      label: t('highlights'),
      desc: isRtl ? 'تدويناتك' : 'Annotations',
      icon: Highlighter,
      path: '/highlights',
      color: 'bg-app-accent/15 text-app-accent group-hover:bg-app-accent group-hover:text-white',
      borderHover: 'hover:border-app-accent/50',
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-app-text flex items-center gap-1.5">
          <Sparkles size={15} className="text-app-accent" />
          <span>{t('quickActions')}</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-app-surface border border-app-border ${action.borderHover} hover:shadow-md transition-all duration-200 group text-center active:scale-95 shadow-xs`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-200 group-hover:scale-110 shadow-xs ${action.color}`}>
                <Icon size={19} />
              </div>
              <span className="text-xs font-bold text-app-text truncate w-full group-hover:text-app-accent transition-colors">
                {action.label}
              </span>
              <span className="text-[10px] text-app-muted truncate w-full mt-0.5">
                {action.desc}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
