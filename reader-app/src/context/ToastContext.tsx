import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, Bookmark, Flame, Sparkles, X } from 'lucide-react'

export type ToastVariant = 'success' | 'info' | 'warning' | 'bookmark' | 'habit' | 'sparkles'

export interface ToastItem {
  id: string
  title: string
  message?: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextType {
  toasts: ToastItem[]
  showToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  bookmark: (title: string, message?: string) => void
  habit: (title: string, message?: string) => void
  sparkles: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(({ title, message, variant, duration = 4000 }: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts((prev) => [...prev.slice(-4), { id, title, message, variant, duration }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const success = useCallback((title: string, message?: string) => showToast({ title, message, variant: 'success' }), [showToast])
  const info = useCallback((title: string, message?: string) => showToast({ title, message, variant: 'info' }), [showToast])
  const warning = useCallback((title: string, message?: string) => showToast({ title, message, variant: 'warning' }), [showToast])
  const bookmark = useCallback((title: string, message?: string) => showToast({ title, message, variant: 'bookmark' }), [showToast])
  const habit = useCallback((title: string, message?: string) => showToast({ title, message, variant: 'habit' }), [showToast])
  const sparkles = useCallback((title: string, message?: string) => showToast({ title, message, variant: 'sparkles' }), [showToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, info, warning, bookmark, habit, sparkles }}>
      {children}
      {/* Toast Render Stack */}
      <div
        className="fixed bottom-5 left-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none pr-4 sm:pr-0"
        dir="rtl"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
    bookmark: <Bookmark className="w-5 h-5 text-purple-500 fill-purple-500/20 shrink-0" />,
    habit: <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20 shrink-0" />,
    sparkles: <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />,
  }

  const borderColors = {
    success: 'border-emerald-500/30 bg-emerald-500/5',
    info: 'border-blue-500/30 bg-blue-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    bookmark: 'border-purple-500/30 bg-purple-500/5',
    habit: 'border-orange-500/30 bg-orange-500/5',
    sparkles: 'border-amber-400/30 bg-amber-400/5',
  }

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-app-surface/95 backdrop-blur-md border ${borderColors[toast.variant]} shadow-lg text-right transition-all animate-slide-up relative overflow-hidden group`}
    >
      <div className="mt-0.5">{icons[toast.variant]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold font-display text-app-text">{toast.title}</h4>
        {toast.message && <p className="text-[11px] text-app-text-secondary font-serif leading-relaxed mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={onClose}
        className="text-app-muted hover:text-app-text p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer shrink-0"
        aria-label="إغلاق"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
