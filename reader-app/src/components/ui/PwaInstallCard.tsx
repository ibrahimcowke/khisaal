import { useState } from 'react'
import { Download, Sparkles, X, CheckCircle2, Smartphone } from 'lucide-react'
import { usePwaInstall } from '../../lib/usePwaInstall'
import { useTranslation } from '../../lib/i18n'

export function PwaInstallCard() {
  const { canInstall, isInstalled, isIos, installApp } = usePwaInstall()
  const { isRtl } = useTranslation()
  const [dismissed, setDismissed] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)

  if (isInstalled || !canInstall || dismissed) return null

  const handleInstall = async () => {
    if (isIos) {
      setShowIosGuide(true)
      return
    }
    await installApp()
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-app-accent/15 via-app-surface to-amber-500/10 border-2 border-app-accent/30 p-4 sm:p-5 shadow-md transition-all">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 left-3 sm:left-4 p-1.5 rounded-full text-app-muted hover:text-app-text hover:bg-black/5 transition-colors"
        title={isRtl ? 'إغلاق' : 'Dismiss'}
      >
        <X size={16} />
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 pr-1">
          <div className="h-11 w-11 rounded-2xl bg-app-accent text-white flex items-center justify-center shrink-0 shadow-md">
            <Smartphone size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm sm:text-base text-app-text">
                {isRtl ? 'تثبيت التطبيق على جهازك (PWA)' : 'Install App on Your Device'}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-app-accent/20 text-app-accent">
                <Sparkles size={11} />
                {isRtl ? 'سريع وبدون إنترنت' : 'Fast & Offline'}
              </span>
            </div>
            <p className="text-xs text-app-text-secondary mt-0.5">
              {isRtl
                ? 'استمتع بتجربة ملء الشاشة الفاخرة، والوصول السريع بدون اتصال بالإنترنت.'
                : 'Enjoy an instant fullscreen reading experience with full offline library access.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleInstall}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-app-accent text-white font-display font-bold text-sm shadow-md hover:bg-app-accent-hover active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Download size={16} />
          <span>{isRtl ? 'تثبيت الآن مجاناً' : 'Install Now'}</span>
        </button>
      </div>

      {showIosGuide && (
        <div className="mt-3.5 pt-3 border-t border-app-accent/20 text-xs text-app-text space-y-1.5 animate-fade-in bg-app-surface/80 p-3 rounded-2xl">
          <p className="font-bold text-app-accent flex items-center gap-1.5">
            <CheckCircle2 size={15} />
            {isRtl ? 'خطوات التثبيت على آيفون / آيباد (iOS):' : 'Installation on iPhone / iPad (iOS):'}
          </p>
          <ol className="list-decimal list-inside space-y-1 text-app-text-secondary text-[11px] leading-relaxed">
            <li>
              {isRtl ? 'اضغط على زر المشاركة (Share ⎋) في أسفل متصفح Safari.' : 'Tap the Share button (⎋) at the bottom of Safari.'}
            </li>
            <li>
              {isRtl ? 'مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen ⊕).' : 'Scroll down and tap "Add to Home Screen" (⊕).'}
            </li>
            <li>
              {isRtl ? 'اضغط على "إضافة" (Add) في الزاوية العلوية.' : 'Tap "Add" in the top corner.'}
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}
