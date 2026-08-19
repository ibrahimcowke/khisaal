import { useState } from 'react'
import { Sheet } from '../ui/Sheet'
import { Tabs, TabPanel } from '../ui/Tabs'
import { Slider } from '../ui/Slider'
import { Switch } from '../ui/Switch'
import { cn } from '../../lib/cn'
import {
  useSettingsStore,
  FONT_FAMILY_MAP,
  FONT_LABEL_MAP,
  FONT_SAMPLE_MAP,
  ACCENT_COLOR_MAP,
  CARD_SHAPING_MAP,
  type FontChoice,
  type LineHeightPreset,
  type ReaderTheme,
  type ReadingMode,
  type AccentChoice,
  type CardShaping,
} from '../../store/settingsStore'
import { toArabicDigits } from '../../lib/format'

const THEMES: { key: ReaderTheme; label: string; bg: string; text: string }[] = [
  { key: 'paper', label: 'ورقي كلاسيكي', bg: '#F8F5EE', text: '#25221E' },
  { key: 'warm', label: 'دافئ مريح', bg: '#F4EEDE', text: '#2E2A22' },
  { key: 'sepia', label: 'سيبيا عتيق', bg: '#EDE1C8', text: '#382E22' },
  { key: 'olive', label: 'زيتوني هادئ', bg: '#EAECE4', text: '#212B24' },
  { key: 'gray', label: 'رمادي حديث', bg: '#E7E7E4', text: '#2A2A28' },
  { key: 'night', label: 'ليلي مخملي', bg: '#11110F', text: '#DDD8CE' },
  { key: 'oled', label: 'أسود نقي', bg: '#000000', text: '#CCCCCC' },
]

const LINE_HEIGHTS: { key: LineHeightPreset; label: string }[] = [
  { key: 'compact', label: 'مضغوط' },
  { key: 'normal', label: 'عادي' },
  { key: 'comfortable', label: 'مريح' },
  { key: 'spacious', label: 'واسع' },
]

const READING_MODES: { key: ReadingMode; label: string; desc: string }[] = [
  { key: 'paginated', label: 'تقليب الصفحات 📖', desc: 'قراءة صفحة بصفحة كالكتاب المطبوع' },
  { key: 'scroll', label: 'تمرير متصل 📜', desc: 'تمرير انسيابي مستمر' },
  { key: 'columns', label: 'عمودين (مكتبي) 📰', desc: 'تخطيط صحفي مزدوج' },
  { key: 'focus', label: 'وضع التركيز 🎯', desc: 'إبراز الفقرة النشطة وتعتيم الباقي' },
]

const FONT_SIZE_PRESETS = [
  { size: 18, label: 'صغير' },
  { size: 22, label: 'متوسط' },
  { size: 28, label: 'كبير' },
  { size: 36, label: 'كبير جداً' },
  { size: 46, label: 'ضخم' },
  { size: 52, label: 'عملاق' },
]

const SPACING_PRESETS = [
  { val: 0.6, label: 'متقارب' },
  { val: 1.0, label: 'عادي' },
  { val: 1.5, label: 'مريح' },
  { val: 2.2, label: 'واسع' },
]

export function ReaderSettingsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [tab, setTab] = useState('font')
  const s = useSettingsStore()

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="تخصيص تجربة القراءة">
      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: 'font', label: 'الخطوط والحجم' },
          { value: 'appearance', label: 'المظهر والسمات' },
          { value: 'shaping', label: 'هيئة الأشكال 🎨' },
          { value: 'layout', label: 'طريقة العرض' },
          { value: 'tools', label: 'الأدوات والتركيز' },
        ]}
      >
        {/* Tab: Fonts & Typography */}
        <TabPanel value="font" className="space-y-6">
          {/* Font Type Selection */}
          <div>
            <p className="text-sm font-semibold mb-2.5">نوع الخط العربي (للقراءة والمواضيع)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(FONT_FAMILY_MAP) as FontChoice[]).map((f) => (
                <button
                  key={f}
                  onClick={() => s.setFontFamily(f)}
                  style={{ fontFamily: FONT_FAMILY_MAP[f] }}
                  className={cn(
                    'rounded-2xl border p-3 text-right transition-all group hover:border-app-accent',
                    s.fontFamily === f
                      ? 'border-app-accent bg-app-accent/15 ring-2 ring-app-accent/25 shadow-xs'
                      : 'border-app-border bg-app-surface'
                  )}
                >
                  <p className="text-base sm:text-lg leading-tight mb-1.5 truncate text-app-text font-bold">
                    {FONT_SAMPLE_MAP[f] || 'بِسْمِ اللَّهِ'}
                  </p>
                  <p className="text-[11px] text-app-accent font-sans font-medium truncate">
                    {FONT_LABEL_MAP[f]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Big Font Size Slider & Presets */}
          <div className="bg-app-surface/60 p-4 rounded-2xl border border-app-border space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-app-text">حجم الخط (تكبير النصوص)</p>
              <span className="text-xs font-bold text-app-accent bg-app-accent/10 px-2.5 py-0.5 rounded-full">
                {toArabicDigits(s.fontSize)} نقطة
              </span>
            </div>

            {/* Quick Size Presets */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {FONT_SIZE_PRESETS.map((p) => (
                <button
                  key={p.size}
                  onClick={() => s.setFontSize(p.size)}
                  className={cn(
                    'py-1.5 px-2 rounded-xl text-xs font-medium border transition-all',
                    s.fontSize === p.size
                      ? 'bg-app-accent text-white border-app-accent font-bold shadow-xs'
                      : 'border-app-border bg-app-surface text-app-text-secondary hover:border-app-accent'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => s.setFontSize(s.fontSize - 2)}
                className="h-9 w-9 shrink-0 rounded-xl border border-app-border flex items-center justify-center text-sm font-bold hover:bg-app-bg active:scale-95 transition-all"
                title="تصغير الخط"
              >
                A−
              </button>
              <Slider value={s.fontSize} onValueChange={s.setFontSize} min={16} max={54} ariaLabel="حجم الخط" />
              <button
                onClick={() => s.setFontSize(s.fontSize + 2)}
                className="h-9 w-9 shrink-0 rounded-xl border border-app-border flex items-center justify-center text-base font-bold hover:bg-app-bg active:scale-95 transition-all"
                title="تكبير الخط"
              >
                A+
              </button>
            </div>
          </div>

          {/* Paragraph Spacing */}
          <div className="bg-app-surface/60 p-4 rounded-2xl border border-app-border space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-app-text">تباعد الفقرات (المسافة بين الفقرات)</p>
              <span className="text-xs text-app-muted">
                {s.paragraphSpacing.toFixed(1)}em
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SPACING_PRESETS.map((p) => (
                <button
                  key={p.val}
                  onClick={() => s.setParagraphSpacing(p.val)}
                  className={cn(
                    'py-1.5 px-2 rounded-xl text-xs font-medium border transition-all',
                    Math.abs(s.paragraphSpacing - p.val) < 0.1
                      ? 'bg-app-accent text-white border-app-accent font-bold shadow-xs'
                      : 'border-app-border bg-app-surface text-app-text-secondary hover:border-app-accent'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <Slider
                value={s.paragraphSpacing}
                onValueChange={s.setParagraphSpacing}
                min={0.4}
                max={3.0}
                step={0.1}
                ariaLabel="تباعد الفقرات"
              />
            </div>
          </div>

          {/* Line Height */}
          <div>
            <p className="text-sm font-medium mb-2.5">تباعد الأسطر (ارتفاع السطر)</p>
            <div className="grid grid-cols-4 gap-2">
              {LINE_HEIGHTS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => s.setLineHeight(l.key)}
                  className={cn(
                    'rounded-xl border py-2 text-xs font-medium transition-colors',
                    s.lineHeight === l.key
                      ? 'border-app-accent bg-app-accent/15 text-app-accent font-bold ring-1 ring-app-accent/30'
                      : 'border-app-border text-app-text-secondary'
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <RowSwitch
            label="تخفيف تباين التشكيل (لقراءة مريحة)"
            checked={s.softenTashkeel}
            onChange={s.setSoftenTashkeel}
          />
        </TabPanel>

        {/* Tab: Appearance */}
        <TabPanel value="appearance" className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-2.5">سمة القراءة (ألوان الصفحات)</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => s.setTheme(t.key)}
                  className={cn(
                    'rounded-2xl border overflow-hidden transition-all text-right group shadow-xs',
                    s.theme === t.key ? 'border-app-accent ring-2 ring-app-accent/30' : 'border-app-border'
                  )}
                >
                  <div style={{ backgroundColor: t.bg, color: t.text }} className="h-12 flex items-center justify-center text-xl font-display font-bold">
                    أ
                  </div>
                  <p className="text-[10px] py-1 text-center bg-app-surface text-app-text-secondary truncate px-1 font-medium">{t.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2.5">لون التمييز (Accent)</p>
            <div className="flex items-center gap-2.5">
              {(Object.keys(ACCENT_COLOR_MAP) as AccentChoice[]).map((acc) => (
                <button
                  key={acc}
                  onClick={() => s.setAccentColor(acc)}
                  style={{ backgroundColor: ACCENT_COLOR_MAP[acc].hex }}
                  className={cn(
                    'h-9 w-9 rounded-full border-2 transition-transform',
                    s.accentColor === acc ? 'scale-115 border-app-text ring-2 ring-app-accent/40 shadow-sm' : 'border-white/40'
                  )}
                  title={ACCENT_COLOR_MAP[acc].name}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-sm font-medium">تعتيم الشاشة الليلي</p>
              <span className="text-xs text-app-muted">{toArabicDigits(Math.round(s.brightnessOverlay * 100))}٪</span>
            </div>
            <Slider value={s.brightnessOverlay} onValueChange={s.setBrightnessOverlay} min={0} max={1} step={0.05} ariaLabel="تعتيم القراءة" />
          </div>
        </TabPanel>

        {/* Tab: Card & List Shaping */}
        <TabPanel value="shaping" className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">هيئة وتصميم البطاقات والقوائم (Card & List Shaping)</p>
            <p className="text-xs text-app-text-secondary mb-3">اختر الطابع الهندسي أو التراثي للبطاقات والفهارس والأزرار</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(CARD_SHAPING_MAP) as CardShaping[]).map((sh) => {
                const info = CARD_SHAPING_MAP[sh]
                const isSelected = s.cardShaping === sh
                return (
                  <button
                    key={sh}
                    onClick={() => s.setCardShaping(sh)}
                    className={cn(
                      'p-4 border text-right transition-all group flex items-start justify-between gap-3',
                      info.previewClass,
                      isSelected
                        ? 'bg-app-accent/15 border-app-accent ring-2 ring-app-accent/30 shadow-md'
                        : 'bg-app-surface border-app-border hover:border-app-accent/60'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm text-app-text">{info.label}</p>
                      <p className="text-xs text-app-text-secondary mt-1">{info.desc}</p>
                    </div>

                    <div className={cn('w-6 h-6 shrink-0 flex items-center justify-center font-display text-sm font-bold', info.previewClass, 'bg-app-accent text-white')}>
                      ❖
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-4 bg-app-surface/60 rounded-2xl border border-app-border space-y-2">
            <p className="text-xs font-semibold text-app-text">معاينة مباشرة لشكل قائمة الفهرس:</p>
            <div className="space-y-2">
              <div className="p-3 bg-app-surface border border-app-border rounded-2xl flex items-center justify-between">
                <span className="font-display text-sm font-bold text-app-accent">الباب الأول: في الحكمة والمروءة</span>
                <span className="text-xs text-app-muted">ص ١٢</span>
              </div>
              <div className="p-3 bg-app-accent/10 border border-app-accent rounded-2xl flex items-center justify-between">
                <span className="font-display text-sm font-bold text-app-accent">الباب الثاني: في الصبر والشكر</span>
                <span className="text-xs text-app-accent font-bold">نشط</span>
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Tab: Layout & Reading Mode */}
        <TabPanel value="layout" className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-2.5">نمط وطريقة القراءة</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {READING_MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => s.setReadingMode(m.key)}
                  className={cn(
                    'p-3.5 rounded-2xl border text-right transition-all',
                    s.readingMode === m.key
                      ? 'border-app-accent bg-app-accent/15 ring-2 ring-app-accent/25 shadow-xs'
                      : 'border-app-border bg-app-surface hover:border-app-accent/60'
                  )}
                >
                  <p className="font-bold text-sm text-app-text">{m.label}</p>
                  <p className="text-xs text-app-text-secondary mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Edge to Edge Display Mode Switch */}
          <div className="p-4 rounded-2xl border border-app-border bg-app-surface/60 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-app-text">عرض كامل الحواف (Edge-to-Edge)</p>
                <p className="text-xs text-app-text-secondary mt-0.5">تمديد مساحة القراءة واستغلال الشاشة بالكامل بدون هوامش ميتة</p>
              </div>
              <Switch checked={s.edgeToEdgeDisplay} onCheckedChange={s.setEdgeToEdgeDisplay} ariaLabel="عرض كامل الحواف" />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2.5">عرض عمود النص (في الوضع العادي)</p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-app-muted">ضيّق</span>
              <Slider value={s.textWidth} onValueChange={s.setTextWidth} min={540} max={940} step={10} ariaLabel="عرض النص" />
              <span className="text-xs text-app-muted">واسع</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2.5">محاذاة النص</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => s.setTextAlign('right')}
                className={cn('rounded-xl border py-2.5 text-xs font-semibold', s.textAlign === 'right' ? 'border-app-accent bg-app-accent/15 text-app-accent' : 'border-app-border')}
              >
                محاذاة لليمين
              </button>
              <button
                onClick={() => s.setTextAlign('justify')}
                className={cn('rounded-xl border py-2.5 text-xs font-semibold', s.textAlign === 'justify' ? 'border-app-accent bg-app-accent/15 text-app-accent' : 'border-app-border')}
              >
                ضبط الأسطر (Justify)
              </button>
            </div>
          </div>

          <RowSwitch
            label="إظهار أرقام صفحات المطبوع المصدرية"
            checked={s.showSourcePages}
            onChange={s.toggleShowSourcePages}
          />
        </TabPanel>

        {/* Tab: Tools */}
        <TabPanel value="tools" className="space-y-6">
          <RowSwitch
            label="مسطرة التركيز القرائي (تتبع الأسطر)"
            checked={s.showFocusRuler}
            onChange={s.setShowFocusRuler}
          />

          <RowSwitch
            label="إبقاء الشاشة مضاءة أثناء القراءة"
            checked={s.keepScreenOn}
            onChange={s.setKeepScreenOn}
          />

          <RowSwitch
            label="عكس مناطق النقر لتقليب الصفحات"
            checked={s.tapZonesInverted}
            onChange={s.toggleTapZones}
          />
        </TabPanel>
      </Tabs>
    </Sheet>
  )
}

function RowSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-t border-app-border/40">
      <span className="text-sm font-medium text-app-text">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} ariaLabel={label} />
    </div>
  )
}
