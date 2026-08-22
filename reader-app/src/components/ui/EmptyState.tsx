import { type LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border border-app-border/80 bg-app-surface/60 ${className}`}
    >
      <div className="h-14 w-14 rounded-2xl bg-app-accent/10 text-app-accent flex items-center justify-center mb-4 shadow-xs">
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-lg font-bold text-app-text mb-1.5">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-app-text-secondary max-w-md leading-relaxed mb-5">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="gap-2">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
