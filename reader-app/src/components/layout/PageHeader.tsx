import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { IconButton } from '../ui/IconButton'

export function PageHeader({
  title,
  subtitle,
  count,
  backTo,
  onBack,
  actions,
}: {
  title: string
  subtitle?: string
  count?: number | string
  backTo?: string
  onBack?: () => void
  actions?: React.ReactNode
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  return (
    <header className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-app-border">
      <div className="flex items-center gap-2.5 min-w-0">
        <IconButton onClick={handleBack} aria-label="رجوع" title="رجوع للصفحة السابقة">
          <ArrowRight size={20} />
        </IconButton>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-app-text truncate leading-tight">
              {title}
            </h1>
            {count !== undefined && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-app-accent/15 text-app-accent font-sans font-bold shrink-0">
                {count}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-app-text-secondary truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
    </header>
  )
}
