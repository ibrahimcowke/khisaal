import { useSettingsStore } from '../store/settingsStore'

export type Language = 'ar' | 'en'

export const TRANSLATIONS = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    library: 'المكتبة',
    traitTree: 'شجرة الخصال',
    readingPlan: 'خطة الـ 30 يوماً',
    stats: 'الإحصائيات',
    quotes: 'الاقتباسات',
    highlights: 'الملاحظات والفوائد',
    bookmarks: 'العلامات المرجعية',
    notes: 'الملاحظات',
    history: 'السجل',
    collections: 'المجموعات',
    settings: 'الإعدادات',
    about: 'عن التطبيق',
    search: 'بحث',
    more: 'المزيد',
    back: 'رجوع',
    close: 'إغلاق',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    done: 'تم',
    loading: 'جارٍ التحميل...',
    share: 'مشاركة',
    copy: 'نسخ',
    copied: 'تم النسخ بنجاح',

    // App & Header
    appTitle: 'الخصال المائتان وإمتاع القارئ',
    appSubtitle: 'موسوعة الأخلاق والآداب والحكم العربية',
    greetingMorning: 'صباح الخير',
    greetingDay: 'طاب يومك',
    greetingEvening: 'مساء الخير',
    greetingNight: 'ليلة سعيدة',
    proverbQuote: '«خَيْرُ جَلِيسٍ فِي الزَّمَانِ كِتَابُ» — روائع الآداب والأخلاق والمروءة',
    encyclopediaBadge: 'موسوعة الخصال والحكم',

    // Home sections
    continueReading: 'متابعة القراءة',
    dailyGoal: 'الهدف اليومي للقراءة',
    todayReadingTime: 'وقت قراءة اليوم',
    quickActions: 'المحاور والوصول السريع',
    quoteOfDay: 'حكمة اليوم المختارة',
    recentSections: 'أحدث الأبواب المقروءة',
    weeklyActivity: 'نشاطك الأسبوعي',
    openReader: 'فتح القارئ',
    chapter: 'الباب',
    page: 'صفحة',
    minutesRemaining: 'د متبقية',
    minutesShort: 'د',
    hoursShort: 'س',
    wordsCount: 'كلمة',

    // Reader UI
    toc: 'فهرس الأبواب',
    readerSettings: 'تخصيص القراءة',
    bookmarkAdded: 'تمت إضافة العلامة المرجعية',
    bookmarkRemoved: 'تمت إزالة العلامة المرجعية',
    searchInBook: 'بحث دقيق في الكتاب (Ctrl + F)',
    audioTts: 'الاستماع الصوتي للفصل',
    autoScroll: 'التمرير التلقائي',
    fullscreen: 'ملء الشاشة',
    exitFullscreen: 'الخروج من ملء الشاشة',
    prevChapter: 'الباب السابق',
    nextChapter: 'الباب التالي',
    prevPage: 'السابقة',
    nextPage: 'التالية',
    pageOf: 'صفحة {current} من {total}',
    bookProgress: '{percent}٪ من الموسوعة',
    recordVoiceNote: 'تسجيل ملاحظة صوتية',
    explainAi: 'شرح وتفسير مع الذكاء الاصطناعي',
    createQuoteCard: 'تصميم بطاقة اقتباس 4K',

    // Settings
    appearance: 'المظهر والسمات',
    readerTheme: 'سمة القراءة (Reader Theme)',
    accentColor: 'لون التمييز (Accent Color)',
    cardShaping: 'هيئة وشكل البطاقات والقوائم',
    typography: 'الخط والطباعة',
    fontFamily: 'نوع الخط العربي',
    fontSize: 'حجم الخط',
    lineHeight: 'ارتفاع السطر',
    paragraphSpacing: 'تباعد الفقرات',
    textWidth: 'عرض النص',
    textAlign: 'محاذاة النص',
    softenTashkeel: 'تخفيف التشكيل والحركات',
    readingBehavior: 'سلوك ونمط القراءة',
    readingMode: 'نمط العرض والقراءة',
    paginatedMode: 'صفحات كتاب (Flip Book)',
    scrollMode: 'تمرير متصل (Continuous Scroll)',
    columnsMode: 'عمودان متوازيان (Two Columns)',
    focusMode: 'وضع التركيز والهدوء (Focus Mode)',
    tapZonesInverted: 'عكس مناطق النقر لتقليب الصفحات',
    keepScreenOn: 'إبقاء الشاشة مضاءة أثناء القراءة',
    showSourcePages: 'إظهار أرقام صفحات المرجع الأصلي',
    brightness: 'تعتيم الشاشة الليلي',
    language: 'لغة التطبيق (Language)',
    arabic: 'العربية (Arabic)',
    english: 'الإنجليزية (English)',
    resetToDefault: 'استعادة الإعدادات الافتراضية',

    // Trait Tree
    traitTreeTitle: 'شجرة وخريطة الخصال والمفاهيم',
    traitTreeSubtitle: 'خريطة بصرية تفاعلية تربط الخصال بمنظوماتها الأخلاقية والأدبية',
    allPillars: 'جميع المحاور الأخلاقية',
    pillarKnowledge: 'العلم والفكر والحكمة',
    pillarPatience: 'الحلم والصبر وضبط النفس',
    pillarNobility: 'المروءة والشرف وعزة النفس',
    pillarGenerosity: 'الكرم والإحسان والصلة',
    pillarManners: 'الأدب والسلوك وحسن العشرة',
    searchTraitsPlaceholder: 'ابحث في شجرة الخصال والمفاهيم (مثل: الصبر، الكرم، المروءة)...',
    filterByPillar: 'التصفية حسب المحور الأخلاقي والسلوكي:',
    noTraitsFound: 'لم يتم العثور على خصال مطابقة',

    // 30-Day Plan
    readingPlanTitle: 'ختمة الـ 30 يوماً في الخصال والآداب',
    readingPlanSubtitle: 'برنامج يومي منظم لقراءة موسوعة الخصال واستيعاب مكارم الأخلاق',
    dayPlan: 'اليوم {day}',
    completedDays: '{count} من 30 يوماً مكتملة',
    planCompleted: 'مكتمل',
    planPending: 'متبقي',
    startReadingDay: 'قراءة ورد اليوم',

    // Quote Studio
    quoteStudioTitle: 'ستوديو بطاقات الاقتباس 4K',
    quoteStudioSubtitle: 'صمم وشارك بطاقات اقتباس راقية بدقة عالية',
    downloadImage: 'تحميل كصورة عالية الدقة',
    copyQuoteText: 'نسخ نص الحكمة',
    cardLayout: 'تنسيق البطاقة',

    // Library
    libraryTitle: 'مكتبة الكتب والموسوعات',
    librarySubtitle: 'تصفح مؤلفات الموسوعة، استورد نصوصك، أو صدّر كراسات القراءة',
    importCustomBook: 'استيراد كتاب مخصص',
    exportNotebook: 'تصدير كراسة القراءة',
    readBook: 'قراءة الكتاب',
    totalSectionsCount: '{count} باباً وفصلاً',
    sourcePagesCount: '{count} صفحة أصلية',
  },
  en: {
    // Navigation
    home: 'Home',
    library: 'Library',
    traitTree: 'Trait Tree',
    readingPlan: '30-Day Plan',
    englishGames: '3D English Learning',
    stats: 'Statistics',
    quotes: 'Quotes',
    highlights: 'Highlights & Notes',
    bookmarks: 'Bookmarks',
    notes: 'Notes',
    history: 'History',
    collections: 'Collections',
    settings: 'Settings',
    about: 'About',
    search: 'Search',
    more: 'More',
    back: 'Back',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
    loading: 'Loading...',
    share: 'Share',
    copy: 'Copy',
    copied: 'Copied successfully',

    // App & Header
    appTitle: 'The 200 Moral Traits & Reader',
    appSubtitle: 'Encyclopedia of Arabic Ethics, Manners, and Wisdom',
    greetingMorning: 'Good Morning',
    greetingDay: 'Good Afternoon',
    greetingEvening: 'Good Evening',
    greetingNight: 'Good Night',
    proverbQuote: '«The best companion in time is a book» — Classical Arabic Wisdom',
    encyclopediaBadge: 'Encyclopedia of Traits & Wisdom',

    // Home sections
    continueReading: 'Continue Reading',
    dailyGoal: 'Daily Reading Goal',
    todayReadingTime: "Today's Reading Time",
    quickActions: 'Quick Navigation Hub',
    quoteOfDay: 'Quote of the Day',
    recentSections: 'Recently Read Chapters',
    weeklyActivity: 'Weekly Activity',
    openReader: 'Open Reader',
    chapter: 'Chapter',
    page: 'Page',
    minutesRemaining: 'min left',
    minutesShort: 'm',
    hoursShort: 'h',
    wordsCount: 'words',

    // Reader UI
    toc: 'Table of Contents',
    readerSettings: 'Reading Settings',
    bookmarkAdded: 'Bookmark added',
    bookmarkRemoved: 'Bookmark removed',
    searchInBook: 'Search in Book (Ctrl + F)',
    audioTts: 'Audio Narration',
    autoScroll: 'Auto-Scroll',
    fullscreen: 'Full Screen',
    exitFullscreen: 'Exit Full Screen',
    prevChapter: 'Previous Chapter',
    nextChapter: 'Next Chapter',
    prevPage: 'Previous',
    nextPage: 'Next',
    pageOf: 'Page {current} of {total}',
    bookProgress: '{percent}% of Book',
    recordVoiceNote: 'Record Voice Note',
    explainAi: 'Explain with AI',
    createQuoteCard: 'Create 4K Quote Card',

    // Settings
    appearance: 'Appearance & Themes',
    readerTheme: 'Reader Theme',
    accentColor: 'Accent Color',
    cardShaping: 'Card & List Shaping',
    typography: 'Typography & Layout',
    fontFamily: 'Arabic Typeface',
    fontSize: 'Font Size',
    lineHeight: 'Line Height',
    paragraphSpacing: 'Paragraph Spacing',
    textWidth: 'Content Width',
    textAlign: 'Text Alignment',
    softenTashkeel: 'Soften Diacritics (Tashkeel)',
    readingBehavior: 'Reading Behavior',
    readingMode: 'Reading Layout Mode',
    paginatedMode: 'Book Pages (Paginated)',
    scrollMode: 'Continuous Scroll',
    columnsMode: 'Dual Columns',
    focusMode: 'Focus & Calm Mode',
    tapZonesInverted: 'Invert Screen Tap Zones',
    keepScreenOn: 'Keep Screen Awake',
    showSourcePages: 'Display Source Page Numbers',
    brightness: 'Night Brightness Overlay',
    language: 'App Language',
    arabic: 'Arabic (العربية)',
    english: 'English',
    resetToDefault: 'Restore Default Settings',

    // Trait Tree
    traitTreeTitle: 'Trait & Concept Map Tree',
    traitTreeSubtitle: 'Interactive visual map linking traits to their moral and literary frameworks',
    allPillars: 'All Moral Pillars',
    pillarKnowledge: 'Knowledge, Reason & Wisdom',
    pillarPatience: 'Patience, Forbearance & Temperance',
    pillarNobility: 'Nobility, Honor & Self-Respect',
    pillarGenerosity: 'Generosity, Kindness & Kinship',
    pillarManners: 'Etiquette, Manners & Fellowship',
    searchTraitsPlaceholder: 'Search traits and concepts (e.g., Patience, Honor, Generosity)...',
    filterByPillar: 'Filter by Moral Pillar:',
    noTraitsFound: 'No matching traits found',

    // 30-Day Plan
    readingPlanTitle: '30-Day Moral Reading Journey',
    readingPlanSubtitle: 'Structured daily plan to explore the 200 traits and noble ethics',
    dayPlan: 'Day {day}',
    completedDays: '{count} of 30 days completed',
    planCompleted: 'Completed',
    planPending: 'Pending',
    startReadingDay: 'Read Daily Target',

    // Quote Studio
    quoteStudioTitle: '4K Quote Studio',
    quoteStudioSubtitle: 'Design and share elegant high-resolution quote cards',
    downloadImage: 'Download High-Res Image',
    copyQuoteText: 'Copy Quote Text',
    cardLayout: 'Card Layout',

    // Library
    libraryTitle: 'Library & Encyclopedias',
    librarySubtitle: 'Browse encyclopedia volumes, import custom texts, or export reading notebooks',
    importCustomBook: 'Import Custom Book',
    exportNotebook: 'Export Reading Notebook',
    readBook: 'Read Book',
    totalSectionsCount: '{count} chapters & sections',
    sourcePagesCount: '{count} source pages',
  },
} as const

export type TranslationKey = keyof typeof TRANSLATIONS.ar

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function toDigits(input: number | string, lang: Language = 'ar'): string {
  const str = String(input)
  if (lang === 'en') {
    return str.replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
  }
  return str.replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)])
}

export function useTranslation() {
  const language = (useSettingsStore((s) => s.language) || 'ar') as Language
  const setLanguage = useSettingsStore((s) => s.setLanguage)

  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.ar
    let text: string = (dict as Record<string, string>)[key] || (TRANSLATIONS.ar as Record<string, string>)[key] || key

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        const valStr = typeof v === 'number' ? toDigits(v, language) : String(v)
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), valStr)
      })
    }
    return text
  }

  const isRtl = language === 'ar'

  const formatDigits = (val: number | string) => toDigits(val, language)

  const formatMinutes = (totalSeconds: number) => {
    const minutes = Math.round(totalSeconds / 60)
    return language === 'ar' ? `${toDigits(minutes, 'ar')} دقيقة` : `${toDigits(minutes, 'en')} mins`
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return language === 'ar' ? 'أقل من دقيقة' : '< 1 min'
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return language === 'ar' ? `${toDigits(minutes, 'ar')} دقيقة` : `${toDigits(minutes, 'en')} mins`
    const hours = Math.floor(minutes / 60)
    const rem = minutes % 60
    if (language === 'ar') {
      return rem > 0 ? `${toDigits(hours, 'ar')} س ${toDigits(rem, 'ar')} د` : `${toDigits(hours, 'ar')} ساعة`
    }
    return rem > 0 ? `${toDigits(hours, 'en')}h ${toDigits(rem, 'en')}m` : `${toDigits(hours, 'en')} hours`
  }

  const greetingForHour = (date: Date = new Date()) => {
    const h = date.getHours()
    if (h < 5) return t('greetingEvening')
    if (h < 12) return t('greetingMorning')
    if (h < 17) return t('greetingDay')
    if (h < 21) return t('greetingEvening')
    return t('greetingNight')
  }

  return {
    t,
    lang: language,
    setLanguage,
    isRtl,
    formatDigits,
    formatMinutes,
    formatDuration,
    greetingForHour,
  }
}
