import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ReaderTheme = 'paper' | 'warm' | 'sepia' | 'olive' | 'gray' | 'night' | 'oled'
export type AccentChoice = 'gold' | 'emerald' | 'indigo' | 'crimson' | 'amber'
export type CardShaping = 'rounded' | 'andalusian' | 'sharp' | 'pill' | 'bordered'
export type FontChoice =
  | 'amiri'
  | 'ruqaa'
  | 'naskh'
  | 'scheherazade'
  | 'cairo'
  | 'tajawal'
  | 'almarai'
  | 'kufi'
  | 'plex'

export type LineHeightPreset = 'compact' | 'normal' | 'comfortable' | 'spacious'
export type ReadingMode = 'paginated' | 'scroll' | 'columns' | 'focus'
export type TextAlign = 'right' | 'justify'
export type AmbientSoundType = 'off' | 'rain' | 'breeze' | 'fire' | 'library' | 'waves'

export const FONT_FAMILY_MAP: Record<FontChoice, string> = {
  amiri: 'var(--font-reading-amiri)',
  ruqaa: 'var(--font-reading-ruqaa)',
  naskh: 'var(--font-reading-naskh)',
  scheherazade: 'var(--font-reading-scheherazade)',
  cairo: 'var(--font-reading-cairo)',
  tajawal: 'var(--font-reading-tajawal)',
  almarai: 'var(--font-reading-almarai)',
  kufi: 'var(--font-reading-kufi)',
  plex: 'var(--font-reading-plex)',
}

export const FONT_LABEL_MAP: Record<FontChoice, string> = {
  amiri: 'الخط الأميري (عريق للمواضيع)',
  ruqaa: 'عارف رقعة (أصيل)',
  naskh: 'نسخ نوتو (معاصر)',
  scheherazade: 'شهرزاد (عثماني)',
  cairo: 'خط القاهرة (حديث)',
  tajawal: 'خط تجوال (سلس)',
  almarai: 'خط المراعي (أنيق)',
  kufi: 'ريم كوفي (تراثي)',
  plex: 'آي بي إم بلكس',
}

export const FONT_SAMPLE_MAP: Record<FontChoice, string> = {
  amiri: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  ruqaa: 'روائع الكلم والحِكَم',
  naskh: 'الخصال المائتان والآداب',
  scheherazade: 'جامع المنظومات الأخلاقية',
  cairo: 'جمال القراءة والأناقة',
  tajawal: 'تهذيب السلوك والمروءة',
  almarai: 'مكارم الأخلاق الإسلامية',
  kufi: 'إمتاع القارئ العربي',
  plex: 'العلم والأدب الرفيع',
}

export const CARD_SHAPING_MAP: Record<CardShaping, { label: string; labelEn: string; desc: string; descEn: string; previewClass: string }> = {
  andalusian: {
    label: 'أندلسي مزخرف 🕌',
    labelEn: 'Andalusian Curved 🕌',
    desc: 'أركان مقوسة متباينة مع زخارف عريقة',
    descEn: 'Asymmetrical curvilinear arches inspired by classical heritage',
    previewClass: 'rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md border-app-accent',
  },
  rounded: {
    label: 'انسيابي عصري 💫',
    labelEn: 'Modern Rounded 💫',
    desc: 'حواف مستديرة ناعمة ومتوازنة',
    descEn: 'Smooth, balanced modern rounded corners',
    previewClass: 'rounded-2xl border-app-border',
  },
  bordered: {
    label: 'مؤطر مذهب ⚜️',
    labelEn: 'Gilded Border ⚜️',
    desc: 'إطار مذهب أنيق ومحدد بدقة',
    descEn: 'Distinct accent gold border with elegant shadows',
    previewClass: 'rounded-2xl border-2 border-app-accent shadow-sm',
  },
  pill: {
    label: 'كبسولي بيضاوي 💊',
    labelEn: 'Pill / Capsule 💊',
    desc: 'انحناءات كاملة مريحة للعين',
    descEn: 'Full pill-shaped curvilinear contours',
    previewClass: 'rounded-[2rem] border-app-border',
  },
  sharp: {
    label: 'كلاسيكي هندسي 📐',
    labelEn: 'Geometric Sharp 📐',
    desc: 'حواف حادة ومستقيمة كالطبعات القديمة',
    descEn: 'Crisp, rectilinear edges like vintage manuscripts',
    previewClass: 'rounded-xs border-2 border-app-border',
  },
}

export const LINE_HEIGHT_MAP: Record<LineHeightPreset, number> = {
  compact: 1.6,
  normal: 1.95,
  comfortable: 2.2,
  spacious: 2.5,
}

export const ACCENT_COLOR_MAP: Record<AccentChoice, { name: string; nameEn: string; hex: string }> = {
  gold: { name: 'ذهبي أندلسي', nameEn: 'Andalusian Gold', hex: '#836A42' },
  emerald: { name: 'أخضر زمردي', nameEn: 'Emerald Green', hex: '#1B6B4A' },
  indigo: { name: 'أزرق ملكي', nameEn: 'Royal Indigo', hex: '#244B7A' },
  crimson: { name: 'عنابي فاخر', nameEn: 'Imperial Crimson', hex: '#8C253B' },
  amber: { name: 'كهرماني دافئ', nameEn: 'Warm Amber', hex: '#B45309' },
}

interface SettingsState {
  // Language
  language: 'ar' | 'en'
  // Appearance
  theme: ReaderTheme
  accentColor: AccentChoice
  cardShaping: CardShaping
  edgeToEdgeDisplay: boolean
  appFollowsReaderTheme: boolean
  // Typography
  fontFamily: FontChoice
  fontSize: number
  lineHeight: LineHeightPreset
  paragraphSpacing: number
  textWidth: number
  textAlign: TextAlign
  softenTashkeel: boolean
  // Reading behavior
  readingMode: ReadingMode
  tapZonesInverted: boolean
  showSourcePages: boolean
  brightnessOverlay: number
  autoScrollSpeed: number
  keepScreenOn: boolean
  reduceMotion: boolean
  // Reading Aids
  showFocusRuler: boolean
  focusRulerHeight: number
  focusRulerOpacity: number
  ambientSound: AmbientSoundType
  ambientVolume: number
  // Goals & Productivity
  dailyGoalMinutes: number
  pomodoroMinutes: number

  setLanguage: (l: 'ar' | 'en') => void
  setTheme: (t: ReaderTheme) => void
  setAccentColor: (a: AccentChoice) => void
  setCardShaping: (s: CardShaping) => void
  setEdgeToEdgeDisplay: (b: boolean) => void
  toggleEdgeToEdgeDisplay: () => void
  setFontFamily: (f: FontChoice) => void
  setFontSize: (n: number) => void
  setLineHeight: (l: LineHeightPreset) => void
  setParagraphSpacing: (n: number) => void
  setTextWidth: (n: number) => void
  setTextAlign: (a: TextAlign) => void
  setSoftenTashkeel: (b: boolean) => void
  setReadingMode: (m: ReadingMode) => void
  toggleTapZones: () => void
  toggleShowSourcePages: () => void
  setBrightnessOverlay: (n: number) => void
  setAutoScrollSpeed: (n: number) => void
  setKeepScreenOn: (b: boolean) => void
  setShowFocusRuler: (b: boolean) => void
  setFocusRulerHeight: (n: number) => void
  setFocusRulerOpacity: (n: number) => void
  setAmbientSound: (s: AmbientSoundType) => void
  setAmbientVolume: (v: number) => void
  setDailyGoalMinutes: (n: number) => void
  setPomodoroMinutes: (n: number) => void
  resetSettings: () => void
}

const DEFAULT_SETTINGS = {
  language: 'ar' as 'ar' | 'en',
  theme: 'paper' as ReaderTheme,
  accentColor: 'gold' as AccentChoice,
  cardShaping: 'andalusian' as CardShaping,
  edgeToEdgeDisplay: true,
  appFollowsReaderTheme: true,
  fontFamily: 'amiri' as FontChoice,
  fontSize: 24,
  lineHeight: 'normal' as LineHeightPreset,
  paragraphSpacing: 1.2,
  textWidth: 740,
  textAlign: 'right' as TextAlign,
  softenTashkeel: false,
  readingMode: 'paginated' as ReadingMode,
  tapZonesInverted: false,
  showSourcePages: false,
  brightnessOverlay: 0,
  autoScrollSpeed: 1,
  keepScreenOn: false,
  reduceMotion: false,
  showFocusRuler: false,
  focusRulerHeight: 48,
  focusRulerOpacity: 0.18,
  ambientSound: 'off' as AmbientSoundType,
  ambientVolume: 0.5,
  dailyGoalMinutes: 20,
  pomodoroMinutes: 25,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setCardShaping: (cardShaping) => set({ cardShaping }),
      setEdgeToEdgeDisplay: (edgeToEdgeDisplay) => set({ edgeToEdgeDisplay }),
      toggleEdgeToEdgeDisplay: () => set((s) => ({ edgeToEdgeDisplay: !s.edgeToEdgeDisplay })),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize: Math.min(54, Math.max(16, fontSize)) }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setParagraphSpacing: (paragraphSpacing) => set({ paragraphSpacing: Math.min(3.0, Math.max(0.4, paragraphSpacing)) }),
      setTextWidth: (textWidth) => set({ textWidth: Math.min(940, Math.max(540, textWidth)) }),
      setTextAlign: (textAlign) => set({ textAlign }),
      setSoftenTashkeel: (softenTashkeel) => set({ softenTashkeel }),
      setReadingMode: (readingMode) => set({ readingMode }),
      toggleTapZones: () => set((s) => ({ tapZonesInverted: !s.tapZonesInverted })),
      toggleShowSourcePages: () => set((s) => ({ showSourcePages: !s.showSourcePages })),
      setBrightnessOverlay: (brightnessOverlay) => set({ brightnessOverlay }),
      setAutoScrollSpeed: (autoScrollSpeed) => set({ autoScrollSpeed }),
      setKeepScreenOn: (keepScreenOn) => set({ keepScreenOn }),
      setShowFocusRuler: (showFocusRuler) => set({ showFocusRuler }),
      setFocusRulerHeight: (focusRulerHeight) => set({ focusRulerHeight }),
      setFocusRulerOpacity: (focusRulerOpacity) => set({ focusRulerOpacity }),
      setAmbientSound: (ambientSound) => set({ ambientSound }),
      setAmbientVolume: (ambientVolume) => set({ ambientVolume }),
      setDailyGoalMinutes: (dailyGoalMinutes) => set({ dailyGoalMinutes }),
      setPomodoroMinutes: (pomodoroMinutes) => set({ pomodoroMinutes }),
      resetSettings: () => set({ ...DEFAULT_SETTINGS }),
    }),
    { name: 'imtaa-reader-settings' }
  )
)
