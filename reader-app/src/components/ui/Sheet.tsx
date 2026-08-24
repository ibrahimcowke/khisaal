import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: ReactNode
  side?: 'bottom' | 'center'
  className?: string
}

export function Sheet({ open, onOpenChange, title, children, side = 'bottom', className }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed z-50 bg-app-surface text-app-text shadow-2xl focus:outline-none touch-manipulation',
            side === 'bottom'
              ? 'inset-x-0 bottom-0 rounded-t-3xl max-h-[88dvh] overflow-y-auto overscroll-contain animate-slide-up border-t border-app-border pb-[max(env(safe-area-inset-bottom,0px),1.25rem)]'
              : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl max-w-md w-[92vw] max-h-[88dvh] overflow-y-auto overscroll-contain border border-app-border animate-fade-in',
            className
          )}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-app-border bg-app-surface/95 backdrop-blur-md">
            <Dialog.Title className="font-display text-base sm:text-lg font-bold text-app-text truncate">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-black/5 active:scale-95 text-app-muted hover:text-app-text transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          {side === 'bottom' && <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-app-border/80 absolute top-1 left-1/2 -translate-x-1/2 pointer-events-none" />}
          <div className="px-4 sm:px-5 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
