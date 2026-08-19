import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, active, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'h-10 w-10 inline-flex items-center justify-center rounded-full transition-colors',
        'text-app-text-secondary hover:bg-black/5 hover:text-app-text',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/50',
        active && 'bg-app-accent/10 text-app-accent',
        className
      )}
      {...props}
    />
  )
)
IconButton.displayName = 'IconButton'
