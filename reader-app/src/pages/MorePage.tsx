import { useNavigate } from 'react-router-dom'
import {
  Highlighter,
  StickyNote,
  FolderHeart,
  BarChart3,
  Settings,
  Edit3,
  Info,
  ChevronLeft,
  Quote,
  History,
  Star,
  Network,
  HeartHandshake,
  Brain,
  Wrench,
  Award,
  Zap,
} from 'lucide-react'

const items = [
  { to: '/tools', label: 'مركز الأدوات التفاعلية (Tools Hub)', icon: Wrench },
  { to: '/khisal-assessment', label: 'مقياس واختبار الخصال السلوكية', icon: Award },
  { to: '/speed-reader', label: 'مختبر القراءة السريعة (RSVP)', icon: Zap },
  { to: '/habit-tracker', label: 'سجل تطبيق الخصال اليومي', icon: HeartHandshake },
  { to: '/flashcards', label: 'بطاقات الحفظ والمراجعة (Flashcards)', icon: Brain },
  { to: '/mindmap', label: 'خريطة وترابط الخصال (Mind Map)', icon: Network },
  { to: '/highlights', label: 'التظليلات', icon: Highlighter },
  { to: '/notes', label: 'الملاحظات', icon: StickyNote },
  { to: '/quotes', label: 'الاقتباسات', icon: Quote },
  { to: '/favorites', label: 'المفضلة', icon: Star },
  { to: '/collections', label: 'المجموعات', icon: FolderHeart },
  { to: '/history', label: 'سجل القراءة', icon: History },
  { to: '/reading-stats', label: 'إحصائيات القراءة', icon: BarChart3 },
  { to: '/settings', label: 'الإعدادات', icon: Settings },
  { to: '/editor', label: 'وضع التحرير والمراجعة', icon: Edit3 },
  { to: '/about', label: 'حول التطبيق', icon: Info },
]

export default function MorePage() {
  const navigate = useNavigate()
  return (
    <div className="max-w-2xl mx-auto px-5 pt-8 pb-10">
      <h1 className="font-display text-2xl font-bold mb-6">المزيد</h1>
      <div className="rounded-2xl bg-app-surface border border-app-border divide-y divide-app-border overflow-hidden">
        {items.map((item) => (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-black/5 transition-colors"
          >
            <item.icon size={18} className="text-app-accent shrink-0" />
            <span className="flex-1 text-right text-sm">{item.label}</span>
            <ChevronLeft size={15} className="text-app-muted" />
          </button>
        ))}
      </div>
    </div>
  )
}
