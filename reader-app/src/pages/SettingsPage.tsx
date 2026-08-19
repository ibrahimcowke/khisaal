import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Download,
  Upload,
  Trash2,
  Info,
  ChevronLeft,
  Edit3,
  FileText,
  RotateCcw,
  Palette,
  Type,
  BookOpen,
  Database,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
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
import { toArabicDigits, formatDuration } from '../lib/format'
import { cn } from '../lib/cn'
import { PageHeader } from '../components/layout/PageHeader'

const GOALS = [10, 15, 20, 30, 45, 60, 90]
const POMODORO_OPTIONS = [15, 20, 25, 30, 45, 60]

const THEMES: { key: ReaderTheme; label: string; bg: string; text: string }[] = [
  { key: 'paper', label: 'ورقي كلاسيكي', bg: '#F8F5EE', text: '#25221E' },
  { key: 'warm', label: 'دافئ مريح', bg: '#F4EEDE', text: '#2E2A22' },
  { key: 'sepia', label: 'سيبيا عتيق', bg: '#EDE1C8', text: '#382E22' },
  { key: 'olive', label: 'زيتوني هادئ', bg: '#EAECE4', text: '#212B24' },
  { key: 'gray', label: 'رمادي حديث', bg: '#E7E7E4', text: '#2A2A28' },
  { key: 'night', label: 'ليلي مخملي', bg: '#11110F', text: '#DDD8CE' },
  { key: 'oled', label: 'أسود نقي', bg: '#000000', text: '#CCCCCC' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const s = useSettingsStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

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
    setStatus('تم تصدير النسخة الاحتياطية بنجاح')
    setTimeout(() => setStatus(null), 3000)
  }

  async function handleExportMarkdown() {
    const [highlights, notes, quotes, bookmarks] = await Promise.all([
      db.highlights.toArray(),
      db.notes.toArray(),
      db.quotes.toArray(),
      db.bookmarks.toArray(),
    ])

    let md = `# ملخص قراءاتي وملاحظاتي — إمتاع القارئ\n\n`
    md += `*تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}*\n\n---\n\n`

    if (highlights.length > 0) {
      md += `## ✍️ التظليلات (${highlights.length})\n\n`
      highlights.forEach((h, i) => {
        md += `### ${i + 1}. ${h.text}\n`
        md += `- **التاريخ:** ${new Date(h.createdAt).toLocaleDateString('ar-EG')}\n`
        if (h.note) md += `- **الملاحظة:** ${h.note}\n`
        md += `\n`
      })
    }

    if (notes.length > 0) {
      md += `## 📝 الملاحظات والتدوينات (${notes.length})\n\n`
      notes.forEach((n, i) => {
        md += `### ${i + 1}. تدوينة حول: "${n.selectedText}"\n`
        md += `> ${n.body}\n\n`
      })
    }

    if (quotes.length > 0) {
      md += `## 📜 درر واقتباسات مختارة (${quotes.length})\n\n`
      quotes.forEach((q) => {
        md += `> «${q.text}»\n`
        if (q.tags?.length) md += `*الوسوم: ${q.tags.join(', ')}*\n\n`
      })
    }

    if (bookmarks.length > 0) {
      md += `## 🔖 الإشارات المرجعية (${bookmarks.length})\n\n`
      bookmarks.forEach((b) => {
        md += `- **${b.title}** (أضيفت: ${new Date(b.createdAt).toLocaleDateString('ar-EG')})\n`
      })
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `imtaa-notes-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
    setStatus('تم تصدير ملف Markdown جاهز لـ Obsidian و Notion')
    setTimeout(() => setStatus(null), 3500)
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
      if (data.corrections) await db.corrections.bulkPut(data.corrections)
      if (data.blockOverrides) await db.blockOverrides.bulkPut(data.blockOverrides)
      if (data.verifiedBlocks) await db.verifiedBlocks.bulkPut(data.verifiedBlocks)
      setStatus('تم استيراد النسخة الاحتياطية بنجاح ✅')
    } catch {
      setStatus('تعذر استيراد الملف، تأكد من صحة الصيغة ❌')
    }
    setTimeout(() => setStatus(null), 3500)
  }

  async function handleClearHistory() {
    await db.history.clear()
    setConfirmClear(false)
    setStatus('تم مسح سجل القراءة بنجاح')
    setTimeout(() => setStatus(null), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-12 animate-fade-in">
      <PageHeader
        title="إعدادات التطبيق"
        subtitle="تخصيص السمات والخطوط والنسخ الاحتياطي"
        actions={
          <button
            onClick={() => {
              s.resetSettings()
              setStatus('تمت استعادة الإعدادات الافتراضية')
              setTimeout(() => setStatus(null), 2500)
            }}
            className="text-xs text-app-text-secondary hover:text-app-accent flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-app-border bg-app-surface transition-colors"
            title="استعادة الإعدادات الافتراضية"
          >
            <RotateCcw size={14} />
            <span>افتراضي</span>
          </button>
        }
      />

      {status && (
        <div className="mb-5 p-3.5 rounded-2xl bg-app-accent/15 border border-app-accent/30 text-app-accent text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{status}</span>
        </div>
      )}

      {/* Theme & Accent Palette */}
      <Section title="المظهر والسمات" icon={<Palette size={16} className="text-app-accent" />}>
        <div className="py-2 space-y-4">
          <div>
            <p className="text-xs font-semibold text-app-text-secondary mb-2.5">سمة القراءة الرئيسية</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => s.setTheme(t.key)}
                  className={cn(
                    'rounded-xl border overflow-hidden transition-all text-right',
                    s.theme === t.key ? 'border-app-accent ring-2 ring-app-accent/30' : 'border-app-border'
                  )}
                >
                  <div style={{ backgroundColor: t.bg, color: t.text }} className="h-10 flex items-center justify-center text-lg font-display">
                    أ
                  </div>
                  <p className="text-[10px] py-1 text-center bg-app-surface text-app-text-secondary truncate px-1">
                    {t.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-app-border">
            <p className="text-xs font-semibold text-app-text-secondary mb-2.5">لون التمييز (Accent Color)</p>
            <div className="flex items-center gap-3">
              {(Object.keys(ACCENT_COLOR_MAP) as AccentChoice[]).map((acc) => (
                <button
                  key={acc}
                  onClick={() => s.setAccentColor(acc)}
                  style={{ backgroundColor: ACCENT_COLOR_MAP[acc].hex }}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-transform shadow-sm',
                    s.accentColor === acc ? 'scale-115 border-app-text ring-2 ring-app-accent/40' : 'border-white/40'
                  )}
                  title={ACCENT_COLOR_MAP[acc].name}
                />
              ))}
            </div>
          </div>

          {/* Card Shaping */}
          <div className="pt-3 border-t border-app-border space-y-2.5">
            <div>
              <p className="text-xs font-semibold text-app-text-secondary mb-1">هيئة وشكل البطاقات والقوائم (Card & List Shaping)</p>
              <p className="text-[11px] text-app-muted">تطبيق الطابع الأندلسي أو العصري على كل القوائم والفهارس والبطاقات</p>
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
                      'p-3 border text-right transition-all group flex items-center justify-between gap-2',
                      info.previewClass,
                      isSelected
                        ? 'bg-app-accent/15 border-app-accent ring-2 ring-app-accent/30 shadow-xs'
                        : 'bg-app-surface border-app-border hover:border-app-accent/50'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-display font-bold text-xs text-app-text">{info.label}</p>
                      <p className="text-[10px] text-app-text-secondary mt-0.5 truncate">{info.desc}</p>
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
            <Row label="عرض كامل الحواف (Edge-to-Edge Display)">
              <Switch checked={s.edgeToEdgeDisplay} onCheckedChange={s.setEdgeToEdgeDisplay} ariaLabel="عرض كامل الحواف" />
            </Row>
          </div>
        </div>
      </Section>

      {/* Typography */}
      <Section title="الخطوط والنصوص (للقراءة والمواضيع)" icon={<Type size={16} className="text-app-accent" />}>
        <div className="py-3 space-y-4">
          <div>
            <p className="text-xs font-semibold text-app-text-secondary mb-2.5">نوع الخط العربي المفضل</p>
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

          {/* Big Font Size */}
          <div className="bg-app-bg/60 p-4 rounded-2xl border border-app-border space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-app-text-secondary">حجم الخط الافتراضي (تكبير النصوص)</p>
              <span className="text-xs font-bold text-app-accent bg-app-accent/10 px-2 py-0.5 rounded-full">
                {toArabicDigits(s.fontSize)} نقطة
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
              {[
                { size: 18, label: 'صغير' },
                { size: 22, label: 'متوسط' },
                { size: 28, label: 'كبير' },
                { size: 36, label: 'كبير جداً' },
                { size: 46, label: 'ضخم' },
                { size: 52, label: 'عملاق' },
              ].map((p) => (
                <button
                  key={p.size}
                  onClick={() => s.setFontSize(p.size)}
                  className={cn(
                    'py-1 rounded-lg text-xs font-medium border transition-all',
                    s.fontSize === p.size
                      ? 'bg-app-accent text-white border-app-accent font-bold'
                      : 'border-app-border bg-app-surface text-app-text-secondary hover:border-app-accent'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Slider value={s.fontSize} onValueChange={s.setFontSize} min={16} max={54} ariaLabel="حجم الخط" />
          </div>

          {/* Paragraph Spacing */}
          <div className="bg-app-bg/60 p-4 rounded-2xl border border-app-border space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-app-text-secondary">تباعد الفقرات (المسافة بين الفقرات)</p>
              <span className="text-xs text-app-muted font-bold">{s.paragraphSpacing.toFixed(1)}em</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { val: 0.6, label: 'متقارب' },
                { val: 1.0, label: 'عادي' },
                { val: 1.5, label: 'مريح' },
                { val: 2.2, label: 'واسع' },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => s.setParagraphSpacing(p.val)}
                  className={cn(
                    'py-1 px-2 rounded-lg text-xs font-medium border transition-all',
                    Math.abs(s.paragraphSpacing - p.val) < 0.1
                      ? 'bg-app-accent text-white border-app-accent font-bold'
                      : 'border-app-border bg-app-surface text-app-text-secondary hover:border-app-accent'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Slider value={s.paragraphSpacing} onValueChange={s.setParagraphSpacing} min={0.4} max={3.0} step={0.1} ariaLabel="تباعد الفقرات" />
          </div>

          <Row label="تخفيف تباين التشكيل والحركات">
            <Switch checked={s.softenTashkeel} onCheckedChange={s.setSoftenTashkeel} ariaLabel="تخفيف التشكيل" />
          </Row>
        </div>
      </Section>

      {/* Reading Aids & Goals */}
      <Section title="أدوات القراءة والإنتاجية" icon={<BookOpen size={16} className="text-app-accent" />}>
        <div className="py-2 space-y-4">
          <div>
            <p className="text-xs font-semibold text-app-text-secondary mb-2.5">هدف القراءة اليومي</p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => s.setDailyGoalMinutes(g)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                    s.dailyGoalMinutes === g
                      ? 'border-app-accent bg-app-accent text-white font-bold'
                      : 'border-app-border text-app-text-secondary hover:border-app-accent'
                  )}
                >
                  {toArabicDigits(g)} دقيقة
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-app-text-secondary mb-2.5">مدة جلسة التركيز (بومودورو)</p>
            <div className="flex flex-wrap gap-2">
              {POMODORO_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => s.setPomodoroMinutes(p)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                    s.pomodoroMinutes === p
                      ? 'border-app-accent bg-app-accent text-white font-bold'
                      : 'border-app-border text-app-text-secondary hover:border-app-accent'
                  )}
                >
                  {toArabicDigits(p)} دقيقة
                </button>
              ))}
            </div>
          </div>

          <Row label="مسطرة تتبع وقراءة السطور (Focus Guide)">
            <Switch checked={s.showFocusRuler} onCheckedChange={s.setShowFocusRuler} ariaLabel="مسطرة التركيز" />
          </Row>
          <Row label="إبقاء الشاشة مضيئة أثناء القراءة (WakeLock)">
            <Switch checked={s.keepScreenOn} onCheckedChange={s.setKeepScreenOn} ariaLabel="إبقاء الشاشة مضيئة" />
          </Row>
          <Row label="إظهار أرقام صفحات المخطوطة الأصلية">
            <Switch checked={s.showSourcePages} onCheckedChange={s.toggleShowSourcePages} ariaLabel="إظهار أرقام الصفحات" />
          </Row>
        </div>
      </Section>

      {/* Data Management Suite */}
      <Section title="إدارة البيانات والنسخ الاحتياطي" icon={<Database size={16} className="text-app-accent" />}>
        {/* Quick Database Stats */}
        {counts && (
          <div className="grid grid-cols-3 gap-2 py-3 bg-app-bg/50 rounded-xl p-3 my-2 border border-app-border text-center">
            <div>
              <p className="text-xs text-app-text-secondary">التظليلات</p>
              <p className="text-sm font-bold text-app-text font-display">{toArabicDigits(counts.hl)}</p>
            </div>
            <div>
              <p className="text-xs text-app-text-secondary">الملاحظات</p>
              <p className="text-sm font-bold text-app-text font-display">{toArabicDigits(counts.notes)}</p>
            </div>
            <div>
              <p className="text-xs text-app-text-secondary">وقت القراءة</p>
              <p className="text-sm font-bold text-app-text font-display">{formatDuration(counts.totalSecs)}</p>
            </div>
          </div>
        )}

        <button onClick={handleExportMarkdown} className="w-full flex items-center gap-3 py-3 text-sm hover:text-app-accent transition-colors">
          <FileText size={17} className="text-app-accent" />
          <div className="flex-1 text-right">
            <p className="font-semibold text-xs">تصدير التظليلات والملاحظات كملف Markdown (.md)</p>
            <p className="text-[11px] text-app-text-secondary">ملف منسق وجاهز للاستيراد في Obsidian و Notion</p>
          </div>
          <ChevronLeft size={15} className="text-app-muted" />
        </button>

        <button onClick={handleExportJSON} className="w-full flex items-center gap-3 py-3 text-sm hover:text-app-accent transition-colors">
          <Download size={17} className="text-app-accent" />
          <div className="flex-1 text-right">
            <p className="font-semibold text-xs">تصدير نسخة احتياطية كاملة (JSON)</p>
            <p className="text-[11px] text-app-text-secondary">تشمل كافة العلامات والجلسات والمجموعات والإعدادات</p>
          </div>
          <ChevronLeft size={15} className="text-app-muted" />
        </button>

        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 py-3 text-sm hover:text-app-accent transition-colors">
          <Upload size={17} className="text-app-accent" />
          <div className="flex-1 text-right">
            <p className="font-semibold text-xs">استيراد نسخة احتياطية (JSON)</p>
            <p className="text-[11px] text-app-text-secondary">استعادة كافة بياناتك المحفوظة</p>
          </div>
          <ChevronLeft size={15} className="text-app-muted" />
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
            <span className="text-xs text-red-600 font-bold">هل أنت متأكد من مسح سجل القراءة؟</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearHistory}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
              >
                تأكيد
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1 bg-app-bg text-app-text rounded-lg text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmClear(true)} className="w-full flex items-center gap-3 py-3 text-sm hover:text-red-600 transition-colors">
            <Trash2 size={17} className="text-red-500" />
            <span className="flex-1 text-right text-xs">مسح سجل القراءة وتاريخ التصفح</span>
            <ChevronLeft size={15} className="text-app-muted" />
          </button>
        )}
      </Section>

      {/* Other options */}
      <Section title="المزيد" icon={<Sparkles size={16} className="text-app-accent" />}>
        <button onClick={() => navigate('/editor')} className="w-full flex items-center gap-3 py-3 text-sm hover:text-app-accent transition-colors">
          <Edit3 size={17} className="text-app-accent" />
          <span className="flex-1 text-right text-xs font-medium">وضع التحرير والتدقيق اللغوي</span>
          <ChevronLeft size={15} className="text-app-muted" />
        </button>
        <button onClick={() => navigate('/about')} className="w-full flex items-center gap-3 py-3 text-sm hover:text-app-accent transition-colors">
          <Info size={17} className="text-app-accent" />
          <span className="flex-1 text-right text-xs font-medium">حول تطبيق إمتاع القارئ</span>
          <ChevronLeft size={15} className="text-app-muted" />
        </button>
      </Section>
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
      <div className="rounded-3xl bg-app-surface border border-app-border px-4 divide-y divide-app-border/70 shadow-sm">{children}</div>
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
