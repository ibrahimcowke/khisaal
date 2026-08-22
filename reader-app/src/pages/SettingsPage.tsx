import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Download,
  Upload,
  Trash2,
  Info,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  RotateCcw,
  Palette,
  Type,
  BookOpen,
  Database,
  Sparkles,
  Globe,
  Smartphone,
  CheckCircle2,
} from 'lucide-react'
import { usePwaInstall } from '../lib/usePwaInstall'
import { db } from '../lib/db'
import {
  useSettingsStore,
  FONT_FAMILY_MAP,
  FONT_LABEL_MAP,
  FONT_SAMPLE_MAP,
  ACCENT_COLOR_MAP,
  CARD_SHAPING_MAP,
  type FontChoice,
  type ReaderTheme,
  type AccentChoice,
  type CardShaping,
} from '../store/settingsStore'
import { Switch } from '../components/ui/Switch'
import { Slider } from '../components/ui/Slider'
import { formatDuration } from '../lib/format'
import { cn } from '../lib/cn'
import { PageHeader } from '../components/layout/PageHeader'
import { useTranslation } from '../lib/i18n'
import { AdvancedExporterModal } from '../components/library/AdvancedExporterModal'

const GOALS = [10, 15, 20, 30, 45, 60, 90]
const POMODORO_OPTIONS = [15, 20, 25, 30, 45, 60]

const THEMES: { key: ReaderTheme; label: string; labelEn: string; bg: string; text: string }[] = [
  { key: 'paper', label: 'ورقي كلاسيكي', labelEn: 'Classic Paper', bg: '#F8F5EE', text: '#25221E' },
  { key: 'warm', label: 'دافئ مريح', labelEn: 'Warm Parchment', bg: '#F4EEDE', text: '#2E2A22' },
  { key: 'sepia', label: 'سيبيا عتيق', labelEn: 'Vintage Sepia', bg: '#EDE1C8', text: '#382E22' },
  { key: 'olive', label: 'زيتوني هادئ', labelEn: 'Calm Olive', bg: '#EAECE4', text: '#212B24' },
  { key: 'gray', label: 'رمادي حديث', labelEn: 'Modern Gray', bg: '#E7E7E4', text: '#2A2A28' },
  { key: 'night', label: 'ليلي مخملي', labelEn: 'Velvet Night', bg: '#11110F', text: '#DDD8CE' },
  { key: 'oled', label: 'أسود نقي', labelEn: 'Pure OLED Black', bg: '#000000', text: '#CCCCCC' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const s = useSettingsStore()
  const { t, lang, setLanguage, isRtl, formatDigits } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [advancedExporterOpen, setAdvancedExporterOpen] = useState(false)
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight
  const { canInstall, installApp } = usePwaInstall()

  // Database stats for settings panel
  const counts = useLiveQuery(async () => {
    const [hl, notes, bm, quotes, sessions] = await Promise.all([
      db.highlights.count(),
      db.notes.count(),
      db.bookmarks.count(),
      db.quotes.count(),
      db.sessions.toArray(),
    ])
    const totalSecs = sessions.reduce((acc, sess) => acc + sess.durationSeconds, 0)
    return { hl, notes, bm, quotes, sessionsCount: sessions.length, totalSecs }
  })

  async function handleExportJSON() {
    const [highlights, notes, bookmarks, quotes, collections, sessions, positions, corrections, blockOverrides, verifiedBlocks] = await Promise.all([
      db.highlights.toArray(),
      db.notes.toArray(),
      db.bookmarks.toArray(),
      db.quotes.toArray(),
      db.collections.toArray(),
      db.sessions.toArray(),
      db.positions.toArray(),
      db.corrections.toArray(),
      db.blockOverrides.toArray(),
      db.verifiedBlocks.toArray(),
    ])
    const payload = {
      app: 'Imtaa Al-Qari Reader',
      exportedAt: new Date().toISOString(),
      highlights,
      notes,
      bookmarks,
      quotes,
      collections,
      sessions,
      positions,
      corrections,
      blockOverrides,
      verifiedBlocks,
      settings: s,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `imtaa-reader-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setStatus(isRtl ? 'تم تصدير النسخة الاحتياطية بنجاح 💾' : 'Backup exported successfully 💾')
    setTimeout(() => setStatus(null), 3000)
  }

  async function handleExportMarkdown() {
    const [highlights, notes] = await Promise.all([db.highlights.toArray(), db.notes.toArray()])
    let md = `# ${isRtl ? 'تظليلات وملاحظات إمتاع القارئ' : 'Imtaa Reader Notes & Highlights'}\n\n`
    md += `*${isRtl ? 'تم التصدير بتاريخ' : 'Exported on'}: ${new Date().toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}*\n\n---\n\n`

    if (highlights.length > 0) {
      md += `## ${isRtl ? 'التظليلات والفوائد' : 'Highlights'}\n\n`
      highlights.forEach((h, i) => {
        md += `### ${i + 1}. ${h.prefix || ''} **${h.text || ''}** ${h.suffix || ''}\n`
        md += `- **${isRtl ? 'الباب' : 'Chapter'}**: ${h.chapterId}\n`
        md += `- **${isRtl ? 'اللون' : 'Color'}**: ${h.color}\n`
        md += `- **${isRtl ? 'التاريخ' : 'Date'}**: ${new Date(h.createdAt).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}\n\n`
      })
    }

    if (notes.length > 0) {
      md += `## ${isRtl ? 'الملاحظات والتعليقات' : 'Notes & Annotations'}\n\n`
      notes.forEach((n, i) => {
        md += `### ${i + 1}. ${n.body}\n`
        md += `- **${isRtl ? 'الباب' : 'Chapter'}**: ${n.chapterId}\n`
        md += `- **${isRtl ? 'التاريخ' : 'Date'}**: ${new Date(n.createdAt).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}\n\n`
      })
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `imtaa-notes-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
    setStatus(isRtl ? 'تم تصدير ملف Markdown بنجاح 📝' : 'Markdown exported successfully 📝')
    setTimeout(() => setStatus(null), 3000)
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (data.highlights) await db.highlights.bulkPut(data.highlights)
      if (data.notes) await db.notes.bulkPut(data.notes)
      if (data.bookmarks) await db.bookmarks.bulkPut(data.bookmarks)
      if (data.quotes) await db.quotes.bulkPut(data.quotes)
      if (data.collections) await db.collections.bulkPut(data.collections)
      if (data.sessions) await db.sessions.bulkPut(data.sessions)
      if (data.positions) await db.positions.bulkPut(data.positions)
      if (data.corrections) await db.corrections.bulkPut(data.corrections)
      if (data.blockOverrides) await db.blockOverrides.bulkPut(data.blockOverrides)
      if (data.verifiedBlocks) await db.verifiedBlocks.bulkPut(data.verifiedBlocks)
      setStatus(isRtl ? 'تم استيراد كافة البيانات بنجاح ✅' : 'All data imported successfully ✅')
    } catch {
      setStatus(isRtl ? 'تعذر استيراد الملف، تأكد من صحة الصيغة ❌' : 'Import failed, invalid file format ❌')
    }
    setTimeout(() => setStatus(null), 3500)
  }

  async function handleClearHistory() {
    await db.history.clear()
    setConfirmClear(false)
    setStatus(isRtl ? 'تم مسح سجل القراءة بنجاح' : 'Reading history cleared')
    setTimeout(() => setStatus(null), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-12 animate-fade-in">
      <PageHeader
        title={t('settings')}
        subtitle={isRtl ? 'تخصيص اللغة والسمات والخطوط والنسخ الاحتياطي' : 'Customize language, themes, typography & backups'}
        actions={
          <button
            onClick={() => {
              s.resetSettings()
              setStatus(isRtl ? 'تمت استعادة الإعدادات الافتراضية' : 'Settings reset to default')
              setTimeout(() => setStatus(null), 2500)
            }}
            className="text-xs text-app-text-secondary hover:text-app-accent flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-app-border bg-app-surface transition-colors"
            title={t('resetToDefault')}
          >
            <RotateCcw size={14} />
            <span>{isRtl ? 'افتراضي' : 'Reset'}</span>
          </button>
        }
      />

      {status && (
        <div className="mb-5 p-3.5 rounded-2xl bg-app-accent/15 border border-app-accent/30 text-app-accent text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{status}</span>
        </div>
      )}

      {/* Language Section */}
      <Section title={t('language')} icon={<Globe size={16} className="text-app-accent" />}>
        <div className="py-3">
          <p className="text-xs font-semibold text-app-text-secondary mb-2.5">
            {isRtl ? 'اختر لغة الواجهة' : 'Select Interface Language'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLanguage('ar')}
              className={cn(
                'p-3.5 rounded-2xl border flex items-center justify-between gap-2 transition-all',
                lang === 'ar'
                  ? 'bg-app-accent/15 border-app-accent ring-2 ring-app-accent/30 font-bold text-app-accent shadow-xs'
                  : 'bg-app-surface border-app-border hover:border-app-accent/40 text-app-text'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🇸🇦</span>
                <span className="text-sm font-display">العربية (Arabic)</span>
              </div>
              {lang === 'ar' && <span className="text-xs font-bold text-app-accent">✓</span>}
            </button>

            <button
              onClick={() => setLanguage('en')}
              className={cn(
                'p-3.5 rounded-2xl border flex items-center justify-between gap-2 transition-all',
                lang === 'en'
                  ? 'bg-app-accent/15 border-app-accent ring-2 ring-app-accent/30 font-bold text-app-accent shadow-xs'
                  : 'bg-app-surface border-app-border hover:border-app-accent/40 text-app-text'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🇬🇧</span>
                <span className="text-sm font-semibold">English</span>
              </div>
              {lang === 'en' && <span className="text-xs font-bold text-app-accent">✓</span>}
            </button>
          </div>
        </div>
      </Section>

      {/* Theme & Accent Palette */}
      <Section title={t('appearance')} icon={<Palette size={16} className="text-app-accent" />}>
        <div className="py-2 space-y-4">
          <div>
            <p className="text-xs font-semibold text-app-text-secondary mb-2.5">{t('readerTheme')}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {THEMES.map((th) => (
                <button
                  key={th.key}
                  onClick={() => s.setTheme(th.key)}
                  className={cn(
                    'rounded-xl border overflow-hidden transition-all text-center',
                    s.theme === th.key ? 'border-app-accent ring-2 ring-app-accent/30' : 'border-app-border'
                  )}
                >
                  <div style={{ backgroundColor: th.bg, color: th.text }} className="h-10 flex items-center justify-center text-lg font-display">
                    {isRtl ? 'أ' : 'Aa'}
                  </div>
                  <p className="text-[10px] py-1 text-center bg-app-surface text-app-text-secondary truncate px-1 font-medium">
                    {isRtl ? th.label : th.labelEn}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-app-border">
            <p className="text-xs font-semibold text-app-text-secondary mb-2.5">{t('accentColor')}</p>
            <div className="flex items-center gap-3">
              {(Object.keys(ACCENT_COLOR_MAP) as AccentChoice[]).map((acc) => (
                <button
                  key={acc}
                  onClick={() => s.setAccentColor(acc)}
                  style={{ backgroundColor: ACCENT_COLOR_MAP[acc].hex }}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-transform shadow-xs',
                    s.accentColor === acc ? 'scale-115 border-app-text ring-2 ring-app-accent/40' : 'border-white/40'
                  )}
                  title={isRtl ? ACCENT_COLOR_MAP[acc].name : ACCENT_COLOR_MAP[acc].nameEn}
                />
              ))}
            </div>
          </div>

          {/* Card Shaping */}
          <div className="pt-3 border-t border-app-border space-y-2.5">
            <div>
              <p className="text-xs font-semibold text-app-text-secondary mb-1">{t('cardShaping')}</p>
              <p className="text-[11px] text-app-muted">
                {isRtl
                  ? 'تطبيق الطابع الأندلسي أو العصري أو المذهب على كل القوائم والفهارس والبطاقات'
                  : 'Customize borders and curvilinear corner shaping for all cards and list containers'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {(Object.keys(CARD_SHAPING_MAP) as CardShaping[]).map((sh) => {
                const info = CARD_SHAPING_MAP[sh]
                const isSelected = s.cardShaping === sh
                return (
                  <button
                    key={sh}
                    onClick={() => s.setCardShaping(sh)}
                    className={cn(
                      'p-3 border transition-all group flex items-center justify-between gap-2',
                      isRtl ? 'text-right' : 'text-left',
                      info.previewClass,
                      isSelected
                        ? 'bg-app-accent/15 border-app-accent ring-2 ring-app-accent/30 shadow-xs'
                        : 'bg-app-surface border-app-border hover:border-app-accent/50'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-display font-bold text-xs text-app-text">
                        {isRtl ? info.label : info.labelEn}
                      </p>
                      <p className="text-[10px] text-app-text-secondary mt-0.5 truncate">
                        {isRtl ? info.desc : info.descEn}
                      </p>
                    </div>

                    <div className={cn('w-5 h-5 shrink-0 flex items-center justify-center font-display text-xs font-bold', info.previewClass, 'bg-app-accent text-white')}>
                      ❖
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Edge to Edge Display */}
          <div className="pt-2 border-t border-app-border">
            <Row label={isRtl ? 'عرض كامل الحواف (Edge-to-Edge Display)' : 'Edge-to-Edge Reading Display'}>
              <Switch checked={s.edgeToEdgeDisplay} onCheckedChange={s.setEdgeToEdgeDisplay} ariaLabel="Edge-to-Edge" />
            </Row>
          </div>
        </div>
      </Section>

      {/* Typography */}
      <Section title={t('typography')} icon={<Type size={16} className="text-app-accent" />}>
        <div className="py-3 space-y-4">
          <div>
            <p className="text-xs font-semibold text-app-text-secondary mb-2.5">{t('fontFamily')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(FONT_FAMILY_MAP) as FontChoice[]).map((f) => (
                <button
                  key={f}
                  onClick={() => s.setFontFamily(f)}
                  className={cn(
                    'p-2.5 rounded-xl border text-center transition-all',
                    s.fontFamily === f
                      ? 'border-app-accent bg-app-accent/10 ring-2 ring-app-accent/20 text-app-accent font-bold'
                      : 'border-app-border bg-app-surface hover:border-app-accent/40 text-app-text'
                  )}
                >
                  <p style={{ fontFamily: FONT_FAMILY_MAP[f] }} className="text-base truncate">
                    {FONT_SAMPLE_MAP[f]}
                  </p>
                  <p className="text-[10px] text-app-text-secondary mt-1 truncate">{FONT_LABEL_MAP[f]}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-app-border">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-app-text-secondary font-medium">{t('fontSize')}</span>
                <span className="font-bold font-mono text-app-accent">{formatDigits(s.fontSize)}px</span>
              </div>
              <Slider value={s.fontSize} min={16} max={48} step={1} onValueChange={s.setFontSize} ariaLabel={t('fontSize')} />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-app-text-secondary font-medium">{t('paragraphSpacing')}</span>
                <span className="font-bold font-mono text-app-accent">{formatDigits(s.paragraphSpacing)}</span>
              </div>
              <Slider value={s.paragraphSpacing} min={0.6} max={2.6} step={0.2} onValueChange={s.setParagraphSpacing} ariaLabel={t('paragraphSpacing')} />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-app-text-secondary font-medium">{t('textWidth')}</span>
                <span className="font-bold font-mono text-app-accent">{formatDigits(s.textWidth)}px</span>
              </div>
              <Slider value={s.textWidth} min={540} max={920} step={20} onValueChange={s.setTextWidth} ariaLabel={t('textWidth')} />
            </div>
          </div>

          <Row label={t('softenTashkeel')}>
            <Switch checked={s.softenTashkeel} onCheckedChange={s.setSoftenTashkeel} ariaLabel={t('softenTashkeel')} />
          </Row>
        </div>
      </Section>

      {/* Reading Behavior */}
      <Section title={t('readingBehavior')} icon={<BookOpen size={16} className="text-app-accent" />}>
        <div className="py-2 space-y-3">
          <div>
            <p className="text-xs font-semibold text-app-text-secondary mb-2">{t('readingMode')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => s.setReadingMode('paginated')}
                className={cn(
                  'p-2.5 rounded-xl border text-xs font-semibold transition-all',
                  s.readingMode === 'paginated'
                    ? 'border-app-accent bg-app-accent/10 text-app-accent ring-2 ring-app-accent/20'
                    : 'border-app-border bg-app-surface text-app-text hover:border-app-accent/40'
                )}
              >
                {t('paginatedMode')}
              </button>
              <button
                onClick={() => s.setReadingMode('scroll')}
                className={cn(
                  'p-2.5 rounded-xl border text-xs font-semibold transition-all',
                  s.readingMode === 'scroll'
                    ? 'border-app-accent bg-app-accent/10 text-app-accent ring-2 ring-app-accent/20'
                    : 'border-app-border bg-app-surface text-app-text hover:border-app-accent/40'
                )}
              >
                {t('scrollMode')}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-app-border">
            <p className="text-xs font-semibold text-app-text-secondary mb-2">{t('dailyGoal')}</p>
            <div className="flex flex-wrap gap-1.5">
              {GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => s.setDailyGoalMinutes(g)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all',
                    s.dailyGoalMinutes === g
                      ? 'border-app-accent bg-app-accent/15 text-app-accent font-bold'
                      : 'border-app-border bg-app-surface text-app-text hover:border-app-accent/30'
                  )}
                >
                  {formatDigits(g)} {isRtl ? 'دقيقة' : 'mins'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-app-border">
            <p className="text-xs font-semibold text-app-text-secondary mb-2">
              {isRtl ? 'مؤقت التركيز (Pomodoro)' : 'Focus Session Timer'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POMODORO_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => s.setPomodoroMinutes(p)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all',
                    s.pomodoroMinutes === p
                      ? 'border-app-accent bg-app-accent/15 text-app-accent font-bold'
                      : 'border-app-border bg-app-surface text-app-text hover:border-app-accent/30'
                  )}
                >
                  {formatDigits(p)} {isRtl ? 'دقيقة' : 'mins'}
                </button>
              ))}
            </div>
          </div>

          <Row label={isRtl ? 'مسطرة تتبع وقراءة السطور (Focus Guide)' : 'Focus Ruler Guide'}>
            <Switch checked={s.showFocusRuler} onCheckedChange={s.setShowFocusRuler} ariaLabel="Focus Guide" />
          </Row>
          <Row label={t('keepScreenOn')}>
            <Switch checked={s.keepScreenOn} onCheckedChange={s.setKeepScreenOn} ariaLabel={t('keepScreenOn')} />
          </Row>
          <Row label={t('showSourcePages')}>
            <Switch checked={s.showSourcePages} onCheckedChange={s.toggleShowSourcePages} ariaLabel={t('showSourcePages')} />
          </Row>
        </div>
      </Section>

      {/* Data Management Suite */}
      <Section title={isRtl ? 'إدارة البيانات والنسخ الاحتياطي' : 'Data Management & Backups'} icon={<Database size={16} className="text-app-accent" />}>
        {counts && (
          <div className="grid grid-cols-3 gap-2 py-3 bg-app-bg/50 rounded-xl p-3 my-2 border border-app-border text-center">
            <div>
              <p className="text-xs text-app-text-secondary">{t('highlights')}</p>
              <p className="text-sm font-bold text-app-text font-display">{formatDigits(counts.hl)}</p>
            </div>
            <div>
              <p className="text-xs text-app-text-secondary">{t('notes')}</p>
              <p className="text-sm font-bold text-app-text font-display">{formatDigits(counts.notes)}</p>
            </div>
            <div>
              <p className="text-xs text-app-text-secondary">{isRtl ? 'وقت القراءة' : 'Reading Time'}</p>
              <p className="text-sm font-bold text-app-text font-display">{formatDuration(counts.totalSecs)}</p>
            </div>
          </div>
        )}

        <button onClick={() => setAdvancedExporterOpen(true)} className="w-full flex items-center gap-3 py-3 text-sm hover:text-app-accent transition-colors bg-app-accent/5 p-3 rounded-2xl border border-app-accent/20 my-1">
          <Sparkles size={18} className="text-app-accent shrink-0" />
          <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
            <p className="font-bold text-xs text-app-accent">{isRtl ? 'المزامنة السحابية والتصدير المتقدم (Obsidian & AES-256)' : 'Advanced Cloud Sync & Obsidian Vault Export'}</p>
            <p className="text-[11px] text-app-text-secondary">{isRtl ? 'تصدير Markdown منسق لـ Obsidian، أو نسخ احتياطي مشفر بكلمة مرور' : 'Export Obsidian markdown vault or encrypted AES backup'}</p>
          </div>
          <ChevronIcon size={15} className="text-app-accent shrink-0" />
        </button>

        <button onClick={handleExportMarkdown} className="w-full flex items-center gap-3 py-3 text-sm hover:text-app-accent transition-colors">
          <FileText size={17} className="text-app-accent shrink-0" />
          <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
            <p className="font-semibold text-xs">{isRtl ? 'تصدير التظليلات والملاحظات كملف Markdown (.md)' : 'Export Highlights & Notes as Markdown (.md)'}</p>
            <p className="text-[11px] text-app-text-secondary">{isRtl ? 'ملف منسق وجاهز للاستيراد في Obsidian و Notion' : 'Formatted for Obsidian, Notion & Logseq'}</p>
          </div>
          <ChevronIcon size={15} className="text-app-muted shrink-0" />
        </button>

        <button onClick={handleExportJSON} className="w-full flex items-center gap-3 py-3 text-sm hover:text-app-accent transition-colors">
          <Download size={17} className="text-app-accent shrink-0" />
          <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
            <p className="font-semibold text-xs">{isRtl ? 'تصدير نسخة احتياطية كاملة (JSON)' : 'Export Full Backup (JSON)'}</p>
            <p className="text-[11px] text-app-text-secondary">{isRtl ? 'تشمل كافة العلامات والجلسات والمجموعات والإعدادات' : 'Includes all bookmarks, sessions, highlights & settings'}</p>
          </div>
          <ChevronIcon size={15} className="text-app-muted shrink-0" />
        </button>

        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 py-3 text-sm hover:text-app-accent transition-colors">
          <Upload size={17} className="text-app-accent shrink-0" />
          <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
            <p className="font-semibold text-xs">{isRtl ? 'استيراد نسخة احتياطية (JSON)' : 'Import Backup (JSON)'}</p>
            <p className="text-[11px] text-app-text-secondary">{isRtl ? 'استعادة كافة بياناتك المحفوظة' : 'Restore all saved reading data'}</p>
          </div>
          <ChevronIcon size={15} className="text-app-muted shrink-0" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
        />

        {confirmClear ? (
          <div className="p-3 bg-red-500/10 rounded-xl my-2 border border-red-500/20 flex items-center justify-between">
            <span className="text-xs text-red-600 font-bold">
              {isRtl ? 'هل أنت متأكد من مسح سجل القراءة؟' : 'Clear all reading history?'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearHistory}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
              >
                {isRtl ? 'تأكيد' : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1 bg-app-bg text-app-text rounded-lg text-xs"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmClear(true)} className="w-full flex items-center gap-3 py-3 text-sm hover:text-red-600 transition-colors">
            <Trash2 size={17} className="text-red-500 shrink-0" />
            <span className={`flex-1 ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
              {isRtl ? 'مسح سجل القراءة وتاريخ التصفح' : 'Clear Reading History'}
            </span>
            <ChevronIcon size={15} className="text-app-muted shrink-0" />
          </button>
        )}
      </Section>

      {/* More Options */}
      <Section title={t('more')} icon={<Sparkles size={16} className="text-app-accent" />}>
        {canInstall && (
          <button
            onClick={installApp}
            className="w-full flex items-center gap-3 py-3 text-sm hover:text-app-accent transition-colors bg-app-accent/5 -mx-0 px-1 rounded-xl"
          >
            <Smartphone size={17} className="text-app-accent shrink-0" />
            <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
              <p className="text-xs font-bold text-app-accent">
                {isRtl ? 'تثبيت التطبيق على جهازك (PWA)' : 'Install App to Device'}
              </p>
              <p className="text-[10px] text-app-text-secondary">
                {isRtl ? 'تطبيق مستقل سريع بدون متصفح ويعمل بلا إنترنت' : 'Standalone app experience with full offline reading'}
              </p>
            </div>
            <ChevronIcon size={15} className="text-app-accent shrink-0" />
          </button>
        )}
        <button onClick={() => navigate('/editor')} className="w-full flex items-center gap-3 py-3 text-sm hover:text-app-accent transition-colors">
          <Edit3 size={17} className="text-app-accent shrink-0" />
          <span className={`flex-1 ${isRtl ? 'text-right' : 'text-left'} text-xs font-medium`}>
            {isRtl ? 'وضع التحرير والتدقيق اللغوي' : 'Book Editor & Proofreading Mode'}
          </span>
          <ChevronIcon size={15} className="text-app-muted shrink-0" />
        </button>
        <button onClick={() => navigate('/about')} className="w-full flex items-center gap-3 py-3 text-sm hover:text-app-accent transition-colors">
          <Info size={17} className="text-app-accent shrink-0" />
          <span className={`flex-1 ${isRtl ? 'text-right' : 'text-left'} text-xs font-medium`}>
            {t('about')}
          </span>
          <ChevronIcon size={15} className="text-app-muted shrink-0" />
        </button>
      </Section>

      {/* Advanced Exporter Dialog */}
      <AdvancedExporterModal
        open={advancedExporterOpen}
        onOpenChange={setAdvancedExporterOpen}
      />
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-bold text-app-text-secondary mb-2.5 flex items-center gap-1.5 px-1">
        {icon}
        <span>{title}</span>
      </h2>
      <div className="rounded-3xl bg-app-surface border border-app-border px-4 divide-y divide-app-border/70 shadow-xs">{children}</div>
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <p className="text-xs font-medium text-app-text">{label}</p>
      {children}
    </div>
  )
}
