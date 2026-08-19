import { useNavigate } from 'react-router-dom'
import { Highlighter, Quote, FolderHeart, GitBranch, Calendar, Search } from 'lucide-react'

export function QuickActionsHub() {
  const navigate = useNavigate()

  const actions = [
    { label: 'شجرة الخصال', desc: 'خريطة المفاهيم', icon: GitBranch, path: '/trait-tree', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { label: 'ختمة الـ 30 يوماً', desc: 'خطة القراءة', icon: Calendar, path: '/reading-plan', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { label: 'البحث في الموسوعة', desc: 'بحث دقيق', icon: Search, path: '/search', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { label: 'روائع الاقتباسات', desc: 'ستوديو 4K', icon: Quote, path: '/quotes', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    { label: 'الملاحظات والفوائد', desc: 'تدويناتك', icon: Highlighter, path: '/highlights', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
    { label: 'المجموعات والتصنيفات', desc: 'مجلداتك', icon: FolderHeart, path: '/collections', color: 'bg-app-accent/15 text-app-accent' },
  ]

  return (
    <div className="space-y-2.5">
      <h2 className="text-sm font-semibold text-app-text-secondary px-1">المحاور والوصول السريع</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent hover:shadow-md transition-all group text-center"
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
