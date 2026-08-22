import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { useTranslation } from '../../lib/i18n'

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
  const { isRtl, t } = useTranslation()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  return (
    <header className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-app-border/70">
      <div className="flex items-center gap-2.5 min-w-0">
        <IconButton onClick={handleBack} aria-label={t('back')} title={t('back')} size="sm">
          <BackIcon size={18} />
        </IconButton>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-app-text truncate leading-tight">
              {title}
            </h1>
            {count !== undefined && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-app-accent/10 text-app-accent font-sans font-bold shrink-0 border border-app-accent/20">
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
