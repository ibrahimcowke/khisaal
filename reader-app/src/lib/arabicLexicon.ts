export interface LexiconEntry {
  word: string
  root: string
  pattern?: string
  meaning: string
  source?: string
  synonyms?: string[]
  antonyms?: string[]
  examples?: string[]
}

// Curated classical lexicon covering ethical, wisdom, theological, and literary vocabulary
export const CLASSICAL_LEXICON: Record<string, LexiconEntry> = {
  'حكمة': {
    word: 'حِكْمَة',
    root: 'ح ك م',
    pattern: 'فِعْلَة',
    meaning: 'الإصابة في القول والعمل، ووضع الشيء في موضعه اللائق به بعلم وفهم وبصيرة.',
    source: 'لسان العرب / المعجم الوسيط',
    synonyms: ['بصيرة', 'رشاد', 'فطنة', 'سداد'],
    antonyms: ['سفه', 'جهالة', 'حماقة'],
    examples: ['«ومن يؤت الحكمة فقد أوتي خيراً كثيراً»'],
  },
  'مروءة': {
    word: 'مُرُوءَة',
    root: 'م ر أ',
    pattern: 'فُعُولَة',
    meaning: 'كمال الرجولية والإنسانية بحمل النفس على مكارم الأخلاق وجميل العادات وترك ما يعاب.',
    source: 'القاموس المحيط',
    synonyms: ['شهامة', 'نخوة', 'كرم', 'عفة'],
    antonyms: ['دناءة', 'خسة', 'لؤم'],
    examples: ['المروءة حفظ الدين وصيانة النفس وحسن الخلق.'],
  },
  'حياء': {
    word: 'حَيَاء',
    root: 'ح ي ي',
    pattern: 'فَعَال',
    meaning: 'انقباض النفس عن القبيح وانزجارها عن ارتكاب ما لا يليق خوفاً من اللوم والذم ورعاية للحق.',
    source: 'المعجم الوسيط',
    synonyms: ['عفة', 'احتشام', 'وقار'],
    antonyms: ['وقاحة', 'تبجح', 'صفاقة'],
    examples: ['«الحياء شعبة من الإيمان»'],
  },
  'سخاء': {
    word: 'سَخَاء',
    root: 'س خ و',
    pattern: 'فَعَال',
    meaning: 'الجود والعطاء وسهولة البذل عن طيب نفس ورضا دون منّ ولا أذى.',
    source: 'لسان العرب',
    synonyms: ['جود', 'كرم', 'أريحية', 'بذل'],
    antonyms: ['بخل', 'شح', 'تقتير'],
    examples: ['السخاء يستر عيوب الرجال.'],
  },
  'كظم': {
    word: 'كَظْم',
    root: 'ك ظ م',
    pattern: 'فَعْل',
    meaning: 'حبس النفس والغيظ عند الغضب والإمساك عن الانتقام مع القدرة عليه.',
    source: 'مختار الصحاح',
    synonyms: ['حلم', 'صبر', 'أناة', 'ضبط النفس'],
    antonyms: ['بطش', 'تهور', 'انفعال'],
    examples: ['«والكاظمين الغيظ والعافين عن الناس»'],
  },
  'ورع': {
    word: 'وَرَع',
    root: 'و ر ع',
    pattern: 'فَعَل',
    meaning: 'اجتناب الشبهات والتحرز من المحرمات والمكروهات خوفاً من الوقوع في المعصية.',
    source: 'التعريفات للجرجاني',
    synonyms: ['تقوى', 'نزاهة', 'عفاف'],
    antonyms: ['تهاون', 'جسارة', 'فجور'],
    examples: ['ملاك الدين الورع.'],
  },
  'أناة': {
    word: 'أَنَاة',
    root: 'أ ن ي',
    pattern: 'فَعَلَة',
    meaning: 'التأني والتروي في الأمور والتثبت قبل الإقدام على الفعل أو الحكم.',
    source: 'المعجم الوسيط',
    synonyms: ['تمهل', 'روية', 'حلم', 'رزانة'],
    antonyms: ['عجلة', 'طيش', 'خفة'],
    examples: ['«التأني من الله والعجلة من الشيطان»'],
  },
  'تواضع': {
    word: 'تَوَاضُع',
    root: 'و ض ع',
    pattern: 'تَفَاعُل',
    meaning: 'خضوع النفس للحق وعدم رؤية الفضل على الخلق وترك التعالي والتفاخر.',
    source: 'لسان العرب',
    synonyms: ['لين الجانب', 'إخبات', 'خشوع'],
    antonyms: ['كبر', 'غرور', 'عجب', 'خيلاء'],
    examples: ['«من تواضع لله رفعه»'],
  },
  'عفة': {
    word: 'عِفَّة',
    root: 'ع ف ف',
    pattern: 'فِعْلَة',
    meaning: 'حصول حالة للنفس تمتنع بها عن غلبة الشهوات والترفع عما لا يحل ولا يجمل.',
    source: 'المفردات للراغب',
    synonyms: ['نزاهة', 'طهارة', 'صيانة'],
    antonyms: ['فجور', 'شره', 'دناءة'],
    examples: ['العفة زينة الفقر والشكر زينة الغنى.'],
  },
  'صبر': {
    word: 'صَبْر',
    root: 'ص ب ر',
    pattern: 'فَعْل',
    meaning: 'حبس النفس عن الجزع واللسان عن الشكوى والجوارح عن المحرمات عند نزول البلاء أو عند مشقة الطاعة.',
    source: 'لسان العرب',
    synonyms: ['احتمال', 'تجلد', 'ثبات'],
    antonyms: ['جزع', 'هلع', 'خور'],
    examples: ['الصبر مفتاح الفرج.'],
  },
  'إنصاف': {
    word: 'إِنْصَاف',
    root: 'ن ص ف',
    pattern: 'إِفْعَال',
    meaning: 'إعطاء الحق لصاحبه من نفسك طوعاً وإقامة العدل ومساواة الخصم في الحكم.',
    source: 'المعجم الوسيط',
    synonyms: ['عدالة', 'قسط', 'حق'],
    antonyms: ['جور', 'ظلم', 'حيف'],
    examples: ['ثلاث خصال من حقائق الإيمان: الإنصاف من نفسك.'],
  },
  'إيثار': {
    word: 'إِيثَار',
    root: 'أ ث ر',
    pattern: 'إِفْعَال',
    meaning: 'تقديم غيرك على نفسك في المنفعة والخير والفضل مع حاجتك إليه.',
    source: 'التعريفات',
    synonyms: ['تضحية', 'جود', 'سخاء'],
    antonyms: ['أثرة', 'أنانية', 'شح'],
    examples: ['«ويؤثرون على أنفسهم ولو كان بهم خصاصة»'],
  },
  'فطنة': {
    word: 'فِطْنَة',
    root: 'ف ط ن',
    pattern: 'فِعْلَة',
    meaning: 'حدة الذهن والذكاء وسرعة إدراك الأشياء الخفية ودقائق الأمور.',
    source: 'المعجم الوسيط',
    synonyms: ['ذكاء', 'نباهة', 'كياسة'],
    antonyms: ['غباوة', 'بلادة', 'غفلة'],
    examples: ['المؤمن كيس فطن.'],
  },
  'خصلة': {
    word: 'خَصْلَة',
    root: 'خ ص ل',
    pattern: 'فَعْلَة',
    meaning: 'الخُلُق والفضيلة والصفة المتمكنة في النفس خيراً كانت أو شراً، والجمع خِصال.',
    source: 'لسان العرب',
    synonyms: ['سجية', 'طباع', 'شيمة', 'خلق'],
    antonyms: [],
    examples: ['جامع المنظومات الأخلاقية: الخصال المائتان.'],
  },
  'وفاء': {
    word: 'وَفَاء',
    root: 'و ف ي',
    pattern: 'فَعَال',
    meaning: 'حفظ العهد وأداء الأمانة والتمام في العقد والمحبة ومجازاة الإحسان بالإحسان.',
    source: 'القاموس المحيط',
    synonyms: ['إخلاص', 'صدق', 'أمانة'],
    antonyms: ['غدر', 'خيانة', 'نكث'],
    examples: ['الوفاء شيمة الكرام.'],
  },
  'حلم': {
    word: 'حِلْم',
    root: 'ح ل م',
    pattern: 'فِعْل',
    meaning: 'الأناة وضبط النفس عند الغضب والصفح عن المسيء مع القدرة على معاقبته.',
    source: 'المعجم الوسيط',
    synonyms: ['تؤدة', 'وقار', 'صفح'],
    antonyms: ['طيش', 'نزق', 'سفه'],
    examples: ['إنما العلم بالتعلم وإنما الحلم بالتحلم.'],
  },
  'شكر': {
    word: 'شُكْر',
    root: 'ش ك ر',
    pattern: 'فُعْل',
    meaning: 'الاعتراف بالنعمة للمنعم والثناء عليه بها وصرفها في طاعته ورضاه.',
    source: 'التعريفات',
    synonyms: ['حمد', 'ثناء', 'عرفان'],
    antonyms: ['كفران', 'جحود'],
    examples: ['الشكر قيد النعم الموجودة وصيد النعم المفقودة.'],
  },
  'أمانة': {
    word: 'أَمَانَة',
    root: 'أ م ن',
    pattern: 'فَعَالَة',
    meaning: 'حفظ حقوق الله وحقوق العباد، ووفاء العهود وصيانة الودائع والسر.',
    source: 'لسان العرب',
    synonyms: ['نزاهة', 'صدق', 'استقامة'],
    antonyms: ['خيانة', 'غدر', 'تضييع'],
    examples: ['أدّ الأمانة إلى من ائتمنك ولا تخن من خانك.'],
  },
  'استقامة': {
    word: 'اسْتِقَامَة',
    root: 'ق و م',
    pattern: 'اسْتِفْعَالَة',
    meaning: 'اللزوم للنهج القويم وطريق الهدى دون ميل أو انحراف.',
    source: 'المعجم الوسيط',
    synonyms: ['صلاح', 'اعتدال', 'رشاد'],
    antonyms: ['اعوجاج', 'انحراف', 'زيغ'],
    examples: ['«قل آمنت بالله ثم استقم»'],
  },
  'مواساة': {
    word: 'مُوَاسَاة',
    root: 'أ س و',
    pattern: 'مُفَاعَلَة',
    meaning: 'مشاركة الأخ والرفيق في الشدة وتخفيف ألمه بالمال أو النفس أو طيب الكلم.',
    source: 'لسان العرب',
    synonyms: ['تسلية', 'مؤازرة', 'عضد'],
    antonyms: ['شماتة', 'خذلان'],
    examples: ['مواساة الأخيار في النوائب مروءة.'],
  },
}

/**
 * Normalizes an Arabic string by stripping diacritics and unifying letters.
 */
export function normalizeArabicWord(str: string): string {
  return str
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '') // strip tashkeel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\p{P}\p{S}]/gu, '')
}

/**
 * Light tri-literal Arabic root extraction algorithm.
 */
export function extractArabicRoot(rawWord: string): string {
  const norm = normalizeArabicWord(rawWord)
  if (norm.length <= 3) return norm.split('').join(' ')

  let s = norm

  // Strip prefixes
  const prefixes = [
    'كال', 'بال', 'فال', 'وال', 'ولل', 'فلل',
    'ال', 'لل', 'واست', 'فاست', 'است',
    'سي', 'ست', 'سن', 'سا',
    'مت', 'يت', 'تت', 'نت', 'ات',
    'مست', 'ان', 'افت',
  ]
  for (const p of prefixes) {
    if (s.startsWith(p) && s.length - p.length >= 3) {
      s = s.slice(p.length)
      break
    }
  }

  // Strip suffixes
  const suffixes = [
    'هما', 'كما', 'تما', 'ونا', 'ينا', 'ات', 'ان', 'ين', 'ون',
    'هم', 'هن', 'كم', 'كن', 'نا', 'ها', 'هم',
    'ية', 'يه', 'تي', 'ته', 'تم', 'تن', 'وا', 'ي', 'ه', 'ت', 'ك', 'ة',
  ]
  for (const suf of suffixes) {
    if (s.endsWith(suf) && s.length - suf.length >= 3) {
      s = s.slice(0, -suf.length)
      break
    }
  }

  // Filter out infixes in common patterns
  if (s.length === 4 && s[1] === 'ا') {
    s = s[0] + s.slice(2)
  } else if (s.length === 4 && s[2] === 'ا') {
    s = s.slice(0, 2) + s[3]
  } else if (s.length === 4 && s[2] === 'ي') {
    s = s.slice(0, 2) + s[3]
  } else if (s.length === 4 && s[2] === 'و') {
    s = s.slice(0, 2) + s[3]
  } else if (s.length === 5 && s[1] === 'ت') {
    s = s[0] + s.slice(2)
  }

  if (s.length > 3) {
    s = s.slice(0, 3)
  }

  return s.split('').join(' ')
}

/**
 * Searches dictionary for matching entry or generates root breakdown.
 */
export function lookupWordInLexicon(rawWord: string): LexiconEntry {
  const norm = normalizeArabicWord(rawWord)
  
  // Direct match in dictionary
  for (const [key, entry] of Object.entries(CLASSICAL_LEXICON)) {
    const keyNorm = normalizeArabicWord(key)
    if (keyNorm === norm || norm.includes(keyNorm) || keyNorm.includes(norm)) {
      return entry
    }
  }

  const root = extractArabicRoot(rawWord)

  // Search by root
  const rootCompact = root.replace(/\s+/g, '')
  for (const entry of Object.values(CLASSICAL_LEXICON)) {
    if (entry.root.replace(/\s+/g, '') === rootCompact) {
      return {
        ...entry,
        word: rawWord,
      }
    }
  }

  // Dynamic morphological entry
  return {
    word: rawWord,
    root: root || '—',
    meaning: 'مفردة لغوية مأثورة في كتب الأدب والحكمة والفضائل، يستدل بها على المعنى بالسياق والدلالة الصرفية.',
    source: 'المعجم الوسيط والاشتقاق العربي',
  }
}
