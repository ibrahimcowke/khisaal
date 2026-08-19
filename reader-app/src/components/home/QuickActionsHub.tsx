import { useNavigate } from 'react-router-dom'
import { Search, Bookmark, Highlighter, Quote, Sparkles, FolderHeart } from 'lucide-react'

export function QuickActionsHub() {
  const navigate = useNavigate()

  const actions = [
    { label: 'البحث الذكي', icon: Search, path: '/search', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { label: 'العلامات المرجعية', icon: Bookmark, path: '/bookmarks', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { label: 'التظليلات والملاحظات', icon: Highlighter, path: '/highlights', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { label: 'روائع الحكم', icon: Quote, path: '/quotes', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    { label: 'المجموعات الأدبية', icon: FolderHeart, path: '/collections', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
    { label: 'المفضلة والمختارات', icon: Sparkles, path: '/favorites', color: 'bg-app-accent/15 text-app-accent' },
  ]

  return (
    <div className="space-y-2.5">
      <h2 className="text-sm font-semibold text-app-text-secondary px-1">الوصول السريع</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent hover:shadow-md transition-all group text-center"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${action.color}`}>
                <Icon size={18} />
              </div>
              <span className="text-xs font-medium text-app-text truncate w-full">
                {action.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
