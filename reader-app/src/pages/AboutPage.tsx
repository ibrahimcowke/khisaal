import { useBook } from '../context/BookContext'
import { toArabicDigits } from '../lib/format'

export default function AboutPage() {
  const { index, loading } = useBook()
  if (loading || !index) return null

  return (
    <div className="max-w-xl mx-auto px-5 pt-8 pb-14">
      <h1 className="font-display text-2xl font-bold mb-6">حول التطبيق</h1>

      <section className="mb-8">
        <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-app-accent/25 to-app-accent/5 border border-app-border flex items-center justify-center mb-4">
          <span className="font-display text-2xl text-app-accent/70">إ</span>
        </div>
        <h2 className="font-display text-xl font-bold">{index.book.title}</h2>
        <p className="text-app-text-secondary mt-1">{index.book.subtitle}</p>
        <p className="text-app-accent mt-2 text-sm font-medium">{index.book.author}</p>
        <p className="text-sm text-app-text-secondary leading-relaxed mt-4">{index.book.description}</p>
      </section>

      <section className="mb-8 grid grid-cols-3 gap-3 text-center">
        <Stat label="الأقسام" value={index.book.totalSections} />
        <Stat label="صفحات المصدر" value={index.book.sourcePageCount} />
        <Stat label="الكلمات" value={index.book.totalWords} />
      </section>

      <section className="text-sm text-app-text-secondary leading-relaxed space-y-3">
        <p>
          تطبيق "إمتاع القارئ" هو تجربة قراءة رقمية مصممة خصيصاً لهذا الكتاب، تجمع بين أناقة القراءة الورقية
          وسهولة الأدوات الرقمية الحديثة: التظليل، الملاحظات، البحث، والعلامات المرجعية، مع دعم كامل للعمل دون اتصال بالإنترنت.
        </p>
        <p>جميع بياناتك — من تظليلات وملاحظات وعلامات — تُخزَّن محلياً على جهازك ولا تُشارك مع أي طرف خارجي.</p>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-app-border bg-app-surface py-3">
      <p className="font-display text-lg font-bold">{toArabicDigits(value)}</p>
      <p className="text-[11px] text-app-text-secondary mt-0.5">{label}</p>
    </div>
  )
}
