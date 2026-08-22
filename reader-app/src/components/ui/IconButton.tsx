import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, active, size = 'md', ...props }, ref) => {
    const sizeCls =
      size === 'sm'
        ? 'h-8 w-8 text-xs'
        : size === 'lg'
        ? 'h-11 w-11 text-base'
        : 'h-10 w-10 text-sm'

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer active:scale-95 shrink-0',
          'text-app-text-secondary hover:bg-black/5 hover:text-app-text border border-transparent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/50',
          active && 'bg-app-accent/10 text-app-accent border-app-accent/30 font-bold',
          sizeCls,
          className
        )}
        {...props}
      />
    )
  }
)
IconButton.displayName = 'IconButton'
