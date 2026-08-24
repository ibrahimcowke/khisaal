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
  THEMES,
  type FontChoice,
  type LineHeightPreset,
  type ReadingMode,
  type AccentChoice,
  type CardShaping,
} from '../../store/settingsStore'
import { useTranslation } from '../../lib/i18n'

export function ReaderSettingsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [tab, setTab] = useState('font')
  const s = useSettingsStore()
  const { t, lang, setLanguage, isRtl, formatDigits } = useTranslation()

  const LINE_HEIGHTS: { key: LineHeightPreset; label: string }[] = [
    { key: 'compact', label: isRtl ? 'مضغوط' : 'Compact' },
    { key: 'normal', label: isRtl ? 'عادي' : 'Normal' },
    { key: 'comfortable', label: isRtl ? 'مريح' : 'Comfortable' },
    { key: 'spacious', label: isRtl ? 'واسع' : 'Spacious' },
  ]

  const READING_MODES: { key: ReadingMode; label: string; desc: string }[] = [
    { key: 'paginated', label: isRtl ? 'تقليب الصفحات 📖' : 'Book Pages 📖', desc: isRtl ? 'قراءة صفحة بصفحة كالكتاب المطبوع' : 'Page-by-page book flip' },
    { key: 'scroll', label: isRtl ? 'تمرير متصل 📜' : 'Continuous Scroll 📜', desc: isRtl ? 'تمرير انسيابي مستمر' : 'Smooth infinite scrolling' },
    { key: 'columns', label: isRtl ? 'عمودين (مكتبي) 📰' : 'Dual Columns 📰', desc: isRtl ? 'تخطيط صحفي مزدوج' : 'Side-by-side newspaper layout' },
    { key: 'focus', label: isRtl ? 'وضع التركيز 🎯' : 'Focus Mode 🎯', desc: isRtl ? 'إبراز الفقرة النشطة وتعتيم الباقي' : 'Highlight active paragraph' },
  ]

  const FONT_SIZE_PRESETS = [
    { size: 18, label: isRtl ? 'صغير' : 'Small' },
    { size: 22, label: isRtl ? 'متوسط' : 'Medium' },
    { size: 28, label: isRtl ? 'كبير' : 'Large' },
    { size: 36, label: isRtl ? 'كبير جداً' : 'X-Large' },
    { size: 46, label: isRtl ? 'ضخم' : 'Huge' },
    { size: 52, label: isRtl ? 'عملاق' : 'Giant' },
  ]

  const SPACING_PRESETS = [
    { val: 0.6, label: isRtl ? 'متقارب' : 'Tight' },
    { val: 1.0, label: isRtl ? 'عادي' : 'Normal' },
    { val: 1.5, label: isRtl ? 'مريح' : 'Relaxed' },
    { val: 2.2, label: isRtl ? 'واسع' : 'Spacious' },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t('readerSettings')}>
      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: 'font', label: isRtl ? 'الخطوط والحجم' : 'Typography' },
          { value: 'appearance', label: isRtl ? 'المظهر والسمات' : 'Appearance' },
          { value: 'shaping', label: isRtl ? 'هيئة الأشكال 🎨' : 'Shaping 🎨' },
          { value: 'layout', label: isRtl ? 'طريقة العرض' : 'Layout' },
          { value: 'tools', label: isRtl ? 'الأدوات واللغة' : 'Tools & Lang' },
        ]}
      >
        {/* Tab: Fonts & Typography */}
        <TabPanel value="font" className="space-y-6">
          {/* Font Type Selection */}
          <div>
            <p className="text-sm font-semibold mb-2.5">{t('fontFamily')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(FONT_FAMILY_MAP) as FontChoice[]).map((f) => (
                <button
                  key={f}
                  onClick={() => s.setFontFamily(f)}
                  style={{ fontFamily: FONT_FAMILY_MAP[f] }}
                  className={cn(
                    'rounded-2xl border p-3 transition-all group hover:border-app-accent',
                    isRtl ? 'text-right' : 'text-left',
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
              <p className="text-sm font-semibold text-app-text">{t('fontSize')}</p>
              <span className="text-xs font-bold text-app-accent bg-app-accent/10 px-2.5 py-0.5 rounded-full">
                {formatDigits(s.fontSize)} {isRtl ? 'نقطة' : 'pt'}
              </span>
            </div>

            {/* Quick Size Presets */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {FONT_SIZE_PRESETS.map((p) => (
                <button
                  key={p.size}
                  onClick={() => s.setFontSize(p.size)}
                  className={cn(
                    'py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all',
                    s.fontSize === p.size
                      ? 'border-app-accent bg-app-accent text-white shadow-xs font-bold'
                      : 'border-app-border bg-app-surface hover:bg-app-accent/10 text-app-text'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Slider value={s.fontSize} min={16} max={54} step={1} onValueChange={s.setFontSize} ariaLabel={t('fontSize')} />
          </div>

          {/* Line Height Presets */}
          <div>
            <p className="text-sm font-semibold mb-2">{t('lineHeight')}</p>
            <div className="grid grid-cols-4 gap-2">
              {LINE_HEIGHTS.map((lh) => (
                <button
                  key={lh.key}
                  onClick={() => s.setLineHeight(lh.key)}
                  className={cn(
                    'py-2 rounded-xl border text-xs font-semibold transition-all',
                    s.lineHeight === lh.key
                      ? 'border-app-accent bg-app-accent/15 text-app-accent font-bold ring-2 ring-app-accent/20'
                      : 'border-app-border bg-app-surface text-app-text hover:border-app-accent/40'
                  )}
                >
                  {lh.label}
                </button>
              ))}
            </div>
          </div>

          {/* Paragraph Spacing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">{t('paragraphSpacing')}</p>
              <span className="text-xs text-app-muted">{formatDigits(s.paragraphSpacing)}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {SPACING_PRESETS.map((sp) => (
                <button
                  key={sp.val}
                  onClick={() => s.setParagraphSpacing(sp.val)}
                  className={cn(
                    'py-1.5 rounded-xl border text-xs font-semibold transition-all',
                    s.paragraphSpacing === sp.val
                      ? 'border-app-accent bg-app-accent/15 text-app-accent font-bold ring-2 ring-app-accent/20'
                      : 'border-app-border bg-app-surface text-app-text hover:border-app-accent/40'
                  )}
                >
                  {sp.label}
                </button>
              ))}
            </div>
            <Slider value={s.paragraphSpacing} min={0.4} max={3.0} step={0.2} onValueChange={s.setParagraphSpacing} ariaLabel={t('paragraphSpacing')} />
          </div>

          {/* Soften Tashkeel */}
          <div className="p-3 bg-app-surface/60 rounded-2xl border border-app-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-app-text">{t('softenTashkeel')}</p>
              <p className="text-xs text-app-text-secondary mt-0.5">
                {isRtl ? 'إظهار الحركات بلون خافت لراحة العين أثناء القراءة الطويلة' : 'Display diacritics in a soft contrast'}
              </p>
            </div>
            <Switch checked={s.softenTashkeel} onCheckedChange={s.setSoftenTashkeel} ariaLabel={t('softenTashkeel')} />
          </div>
        </TabPanel>

        {/* Tab: Themes & Appearance */}
        <TabPanel value="appearance" className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-2.5">{t('readerTheme')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {THEMES.map((th) => (
                <button
                  key={th.key}
                  onClick={() => s.setTheme(th.key)}
                  className={cn(
                    'rounded-2xl border p-2.5 transition-all text-center group hover:scale-[1.02]',
                    s.theme === th.key
                      ? 'border-app-accent ring-2 ring-app-accent/30 shadow-md scale-[1.02]'
                      : 'border-app-border bg-app-surface'
                  )}
                >
                  <div
                    style={{ backgroundColor: th.bg, color: th.text }}
                    className="h-13 rounded-xl border border-black/10 flex items-center justify-center font-display text-2xl font-bold shadow-xs mb-1.5"
                  >
                    {isRtl ? 'أ' : 'Aa'}
                  </div>
                  <p className="text-xs font-bold text-app-text truncate">{isRtl ? th.label : th.labelEn}</p>
                  <p className="text-[10px] text-app-muted truncate mt-0.5">{isRtl ? th.desc : th.descEn}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2.5">{t('accentColor')}</p>
            <div className="grid grid-cols-5 gap-2.5">
              {(Object.keys(ACCENT_COLOR_MAP) as AccentChoice[]).map((acc) => (
                <button
                  key={acc}
                  onClick={() => s.setAccentColor(acc)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all',
                    s.accentColor === acc
                      ? 'border-app-accent bg-app-accent/10 ring-2 ring-app-accent/25 shadow-xs'
                      : 'border-app-border bg-app-surface hover:border-app-accent/40'
                  )}
                >
                  <div
                    style={{ backgroundColor: ACCENT_COLOR_MAP[acc].hex }}
                    className="w-7 h-7 rounded-full shadow-xs border-2 border-white/50"
                  />
                  <span className="text-[11px] font-semibold text-app-text truncate">
                    {isRtl ? ACCENT_COLOR_MAP[acc].name : ACCENT_COLOR_MAP[acc].nameEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-sm font-medium">{t('brightness')}</p>
              <span className="text-xs text-app-muted">{formatDigits(Math.round(s.brightnessOverlay * 100))}%</span>
            </div>
            <Slider value={s.brightnessOverlay} onValueChange={s.setBrightnessOverlay} min={0} max={1} step={0.05} ariaLabel={t('brightness')} />
          </div>
        </TabPanel>

        {/* Tab: Card & List Shaping */}
        <TabPanel value="shaping" className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">{t('cardShaping')}</p>
            <p className="text-xs text-app-text-secondary mb-3">
              {isRtl ? 'اختر الطابع الهندسي أو التراثي للبطاقات والفهارس والأزرار' : 'Select corner geometry and borders for all cards and lists'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(CARD_SHAPING_MAP) as CardShaping[]).map((sh) => {
                const info = CARD_SHAPING_MAP[sh]
                const isSelected = s.cardShaping === sh
                return (
                  <button
                    key={sh}
                    onClick={() => s.setCardShaping(sh)}
                    className={cn(
                      'p-4 border transition-all group flex items-start justify-between gap-3',
                      isRtl ? 'text-right' : 'text-left',
                      info.previewClass,
                      isSelected
                        ? 'bg-app-accent/15 border-app-accent ring-2 ring-app-accent/30 shadow-md'
                        : 'bg-app-surface border-app-border hover:border-app-accent/60'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm text-app-text">{isRtl ? info.label : info.labelEn}</p>
                      <p className="text-xs text-app-text-secondary mt-1">{isRtl ? info.desc : info.descEn}</p>
                    </div>

                    <div className={cn('w-7 h-7 shrink-0 flex items-center justify-center font-display text-sm font-bold transition-transform group-hover:scale-110', info.previewClass, 'bg-app-accent text-white shadow-xs')}>
                      {info.icon}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-4 bg-app-surface/60 rounded-2xl border border-app-border space-y-2">
            <p className="text-xs font-semibold text-app-text">
              {isRtl ? 'معاينة مباشرة لشكل قائمة الفهرس والخصال:' : 'Live Shaping Preview:'}
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-app-surface border border-app-border rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-app-accent text-xs font-bold">{CARD_SHAPING_MAP[s.cardShaping || 'andalusian']?.icon || '❖'}</span>
                  <span className="font-display text-sm font-bold text-app-accent">
                    {isRtl ? 'الباب الأول: في الحكمة والمروءة' : 'Chapter 1: On Wisdom and Honor'}
                  </span>
                </div>
                <span className="text-xs text-app-muted">{formatDigits(12)}</span>
              </div>
              <div className="p-3 bg-app-accent/10 border border-app-accent rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-app-accent text-xs font-bold">{CARD_SHAPING_MAP[s.cardShaping || 'andalusian']?.icon || '❖'}</span>
                  <span className="font-display text-sm font-bold text-app-accent">
                    {isRtl ? 'الباب الثاني: في الصبر والشكر' : 'Chapter 2: On Patience and Gratitude'}
                  </span>
                </div>
                <span className="text-xs text-app-accent font-bold">{isRtl ? 'نشط' : 'Active'}</span>
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Tab: Layout & Reading Mode */}
        <TabPanel value="layout" className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-2.5">{t('readingMode')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {READING_MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => s.setReadingMode(m.key)}
                  className={cn(
                    'p-3.5 rounded-2xl border transition-all',
                    isRtl ? 'text-right' : 'text-left',
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
                <p className="text-sm font-semibold text-app-text">
                  {isRtl ? 'عرض كامل الحواف (Edge-to-Edge)' : 'Edge-to-Edge Display'}
                </p>
                <p className="text-xs text-app-text-secondary mt-0.5">
                  {isRtl ? 'تمديد مساحة القراءة واستغلال الشاشة بالكامل بدون هوامش ميتة' : 'Maximize reading area without empty padding'}
                </p>
              </div>
              <Switch checked={s.edgeToEdgeDisplay} onCheckedChange={s.setEdgeToEdgeDisplay} ariaLabel="Edge-to-Edge" />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2.5">{t('textWidth')}</p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-app-muted">{isRtl ? 'ضيّق' : 'Narrow'}</span>
              <Slider value={s.textWidth} onValueChange={s.setTextWidth} min={540} max={940} step={10} ariaLabel={t('textWidth')} />
              <span className="text-xs text-app-muted">{isRtl ? 'واسع' : 'Wide'}</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2.5">{t('textAlign')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => s.setTextAlign('right')}
                className={cn('rounded-xl border py-2.5 text-xs font-semibold', s.textAlign === 'right' ? 'border-app-accent bg-app-accent/15 text-app-accent' : 'border-app-border')}
              >
                {isRtl ? 'محاذاة لليمين' : 'Right Align'}
              </button>
              <button
                onClick={() => s.setTextAlign('justify')}
                className={cn('rounded-xl border py-2.5 text-xs font-semibold', s.textAlign === 'justify' ? 'border-app-accent bg-app-accent/15 text-app-accent' : 'border-app-border')}
              >
                {isRtl ? 'ضبط الأسطر (Justify)' : 'Justified'}
              </button>
            </div>
          </div>

          <RowSwitch
            label={t('showSourcePages')}
            checked={s.showSourcePages}
            onChange={s.toggleShowSourcePages}
          />
        </TabPanel>

        {/* Tab: Tools & Language */}
        <TabPanel value="tools" className="space-y-6">
          {/* Quick Language Switcher */}
          <div className="p-4 bg-app-surface/60 rounded-2xl border border-app-border space-y-2.5">
            <p className="text-sm font-semibold text-app-text">{t('language')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLanguage('ar')}
                className={cn(
                  'py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all',
                  lang === 'ar'
                    ? 'border-app-accent bg-app-accent/15 text-app-accent ring-2 ring-app-accent/20'
                    : 'border-app-border bg-app-surface text-app-text hover:border-app-accent/40'
                )}
              >
                <span>🇸🇦</span>
                <span>العربية</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  'py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all',
                  lang === 'en'
                    ? 'border-app-accent bg-app-accent/15 text-app-accent ring-2 ring-app-accent/20'
                    : 'border-app-border bg-app-surface text-app-text hover:border-app-accent/40'
                )}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>

          <RowSwitch
            label={isRtl ? 'مسطرة التركيز القرائي (تتبع الأسطر)' : 'Focus Ruler Guide'}
            checked={s.showFocusRuler}
            onChange={s.setShowFocusRuler}
          />

          <RowSwitch
            label={t('keepScreenOn')}
            checked={s.keepScreenOn}
            onChange={s.setKeepScreenOn}
          />

          <RowSwitch
            label={t('tapZonesInverted')}
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
