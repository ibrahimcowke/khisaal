import { useNavigate } from 'react-router-dom'
import { Quote, GitBranch, Network, HeartHandshake, Brain, Wrench, Award, Zap } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'

export function QuickActionsHub() {
  const navigate = useNavigate()
  const { t, isRtl } = useTranslation()

  const actions = [
    {
      label: isRtl ? 'تتبع الفضائل' : 'Habit Tracker',
      desc: isRtl ? 'التطبيق والورد اليومي' : 'Daily Practice',
      icon: HeartHandshake,
      path: '/habit-tracker',
    },
    {
      label: isRtl ? 'القراءة السريعة' : 'Speed Reader',
      desc: isRtl ? 'تدريب التركيز RSVP' : 'Focus Trainer',
      icon: Zap,
      path: '/speed-reader',
    },
    {
      label: isRtl ? 'مقياس الخصال' : 'Virtue Quiz',
      desc: isRtl ? 'تقييم سلوكي شامل' : 'Self Assessment',
      icon: Award,
      path: '/khisal-assessment',
    },
    {
      label: isRtl ? 'مركز الأدوات' : 'Tools Hub',
      desc: isRtl ? 'أدوات تفاعلية متقدمة' : 'Interactive Suite',
      icon: Wrench,
      path: '/tools',
    },
    {
      label: isRtl ? 'ستوديو البطاقات' : 'Quote Studio',
      desc: isRtl ? 'تصميم ومشاركة الحِكم' : 'Card Designer',
      icon: Quote,
      path: '/quotes',
    },
    {
      label: isRtl ? 'شجرة الخصال' : 'Trait Tree',
      desc: isRtl ? 'تصنيف أبواب الأخلاق' : 'Virtue Taxonomy',
      icon: GitBranch,
      path: '/trait-tree',
    },
    {
      label: isRtl ? 'خريطة المفاهيم' : 'Mind Map',
      desc: isRtl ? 'شجرة بصرية مترابطة' : 'Concept Graph',
      icon: Network,
      path: '/mindmap',
    },
    {
      label: isRtl ? 'بطاقات المراجعة' : 'Flashcards',
      desc: isRtl ? 'حفظ واستذكار ذكي' : 'Spaced Repetition',
      icon: Brain,
      path: '/flashcards',
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs sm:text-sm font-bold text-app-text font-display">
          {t('quickActions')}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-2.5 sm:gap-3 p-3 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent hover:bg-app-accent/5 transition-all text-start group active:scale-[0.98] shadow-2xs cursor-pointer min-w-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-app-accent/10 text-app-accent flex items-center justify-center shrink-0 transition-all duration-150 group-hover:scale-105 group-hover:bg-app-accent group-hover:text-white shadow-xs">
                <Icon size={18} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-app-text group-hover:text-app-accent transition-colors truncate leading-tight">
                  {action.label}
                </p>
                <p className="text-[10px] sm:text-[11px] text-app-muted truncate mt-0.5 leading-tight">
                  {action.desc}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
