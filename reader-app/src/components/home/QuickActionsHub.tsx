import { useNavigate } from 'react-router-dom'
import { Highlighter, Quote, GitBranch, Calendar, Search, Network, HeartHandshake, Brain } from 'lucide-react'
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
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      label: t('flashcards'),
      desc: isRtl ? 'حفظ ومراجعة' : 'Spaced Reviews',
      icon: Brain,
      path: '/flashcards',
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      label: t('mindmap'),
      desc: isRtl ? 'خريطة تفاعلية' : 'Virtue Graph',
      icon: Network,
      path: '/mindmap',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      label: t('traitTree'),
      desc: isRtl ? 'شجرة الخصال' : 'Concept Map',
      icon: GitBranch,
      path: '/trait-tree',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: t('readingPlan'),
      desc: isRtl ? 'خطة القراءة' : '30-Day Plan',
      icon: Calendar,
      path: '/reading-plan',
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
    {
      label: t('search'),
      desc: isRtl ? 'بحث شامل' : 'Deep Search',
      icon: Search,
      path: '/search',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      label: t('quotes'),
      desc: isRtl ? 'ستوديو 4K' : '4K Studio',
      icon: Quote,
      path: '/quotes',
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      label: t('highlights'),
      desc: isRtl ? 'تدويناتك' : 'Annotations',
      icon: Highlighter,
      path: '/highlights',
      color: 'bg-app-accent/15 text-app-accent',
    },
  ]

  return (
    <div className="space-y-2.5">
      <h2 className="text-sm font-semibold text-app-text-secondary px-1">{t('quickActions')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent hover:shadow-xs transition-all group text-center"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${action.color}`}>
                <Icon size={20} />
              </div>
              <span className="text-xs font-bold text-app-text truncate w-full">
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
