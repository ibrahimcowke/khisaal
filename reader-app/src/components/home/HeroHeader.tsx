import { useNavigate } from 'react-router-dom'
import { Settings, BarChart2, Sun, Moon, Sunrise, Sunset, Sparkles, Search, Library, ArrowRight } from 'lucide-react'
import { greetingForHour, formatArabicDate } from '../../lib/format'
import { IconButton } from '../ui/IconButton'

export function HeroHeader({ showBack = false }: { showBack?: boolean }) {
  const navigate = useNavigate()
  const hour = new Date().getHours()

  const getTimeIcon = () => {
    if (hour >= 5 && hour < 11) return <Sunrise className="text-amber-500" size={22} />
    if (hour >= 11 && hour < 17) return <Sun className="text-amber-400" size={22} />
    if (hour >= 17 && hour < 21) return <Sunset className="text-orange-400" size={22} />
    return <Moon className="text-indigo-400" size={22} />
  }

  return (
    <header className="relative -mx-4 sm:-mx-5 -mt-6 sm:-mt-8 mb-6 rounded-b-[2.5rem] bg-gradient-to-b from-app-surface via-app-surface to-app-accent/10 border-b border-app-border px-5 sm:px-8 pt-8 pb-7 shadow-sm overflow-hidden transition-all">
      {/* Decorative background arabesque watermark */}
      <div className="absolute top-2 left-4 opacity-5 select-none font-display text-9xl text-app-accent pointer-events-none">
        إمتاع
      </div>

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {showBack && (
              <IconButton onClick={() => navigate(-1)} aria-label="رجوع" title="رجوع" className="mr-0.5">
                <ArrowRight size={18} />
              </IconButton>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-app-accent/10 border border-app-accent/20">
              {getTimeIcon()}
              <span className="text-[11px] font-bold text-app-accent tracking-wide">
                {formatArabicDate()}
              </span>
            </div>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-app-text leading-tight">
            {greetingForHour()}
          </h1>

          <p className="text-xs sm:text-sm text-app-text-secondary mt-1.5 flex items-center gap-1.5">
            <Sparkles size={13} className="text-app-accent shrink-0" />
            <span className="truncate">«خَيْرُ جَلِيسٍ فِي الزَّمَانِ كِتَابُ» — روائع الأدب العربي</span>
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0 pt-1">
          <IconButton onClick={() => navigate('/search')} aria-label="البحث" title="البحث في المكتبة">
            <Search size={19} />
          </IconButton>
          <IconButton onClick={() => navigate('/library')} aria-label="المكتبة" title="المكتبة والكتب">
            <Library size={19} />
          </IconButton>
          <IconButton onClick={() => navigate('/reading-stats')} aria-label="الإحصائيات" title="إحصائيات القراءة">
            <BarChart2 size={19} />
          </IconButton>
          <IconButton onClick={() => navigate('/settings')} aria-label="الإعدادات" title="إعدادات التطبيق">
            <Settings size={19} />
          </IconButton>
        </div>
      </div>
    </header>
  )
}
