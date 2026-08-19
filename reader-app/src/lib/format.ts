const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function toArabicDigits(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)])
}

export function formatMinutes(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60)
  return `${toArabicDigits(minutes)} دقيقة`
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `أقل من دقيقة`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${toArabicDigits(minutes)} دقيقة`
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  return rem > 0 ? `${toArabicDigits(hours)} س ${toArabicDigits(rem)} د` : `${toArabicDigits(hours)} ساعة`
}

const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

export function formatArabicDate(date: Date = new Date()): string {
  const weekday = WEEKDAYS[date.getDay()]
  const day = toArabicDigits(date.getDate())
  const month = MONTHS[date.getMonth()]
  const year = toArabicDigits(date.getFullYear())
  return `${weekday}، ${day} ${month} ${year}`
}

export function formatRelativeDay(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const dayMs = 86400000
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / dayMs)
  if (diffDays === 0) return 'اليوم'
  if (diffDays === 1) return 'أمس'
  if (diffDays === 2) return 'أول أمس'
  if (diffDays < 7) return `منذ ${toArabicDigits(diffDays)} أيام`
  return formatArabicDate(date)
}

export function greetingForHour(date: Date = new Date()): string {
  const h = date.getHours()
  if (h < 5) return 'مساء الخير'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'طاب يومك'
  if (h < 21) return 'مساء الخير'
  return 'ليلة سعيدة'
}
