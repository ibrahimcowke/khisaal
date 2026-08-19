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
            'fixed z-50 bg-app-surface text-app-text shadow-2xl focus:outline-none',
            side === 'bottom'
              ? 'inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up border-t border-app-border'
              : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl max-w-md w-[92vw] max-h-[85vh] overflow-y-auto border border-app-border animate-fade-in',
            className
          )}
        >
          <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-app-border bg-app-surface/95 backdrop-blur">
            <Dialog.Title className="font-display text-lg">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-black/5"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          {side === 'bottom' && <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-app-border absolute top-1 left-1/2 -translate-x-1/2" />}
          <div className="px-5 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
