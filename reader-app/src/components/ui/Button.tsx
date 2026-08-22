import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-app-accent text-white hover:bg-app-accent-hover active:scale-[0.98] shadow-xs border border-app-accent/30',
  secondary:
    'bg-app-surface text-app-text border border-app-border hover:border-app-accent/40 hover:bg-app-accent/5 active:scale-[0.98] shadow-2xs',
  ghost:
    'text-app-text-secondary hover:text-app-text hover:bg-black/5 active:scale-[0.98]',
  outline:
    'border border-app-border bg-transparent text-app-text hover:border-app-accent hover:text-app-accent active:scale-[0.98]',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-xs',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs font-semibold rounded-xl gap-1.5 min-w-[2rem]',
  md: 'h-10 px-4 text-sm font-semibold rounded-xl gap-2 min-h-[2.5rem]',
  lg: 'h-12 px-6 text-sm sm:text-base font-bold rounded-2xl gap-2.5 min-h-[3rem]',
  icon: 'h-10 w-10 p-0 rounded-xl justify-center shrink-0',
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-display transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:pointer-events-none select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/50 focus-visible:ring-offset-1',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
