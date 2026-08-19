import { FileText, Printer } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { db } from '../../lib/db'
import { useBook } from '../../context/BookContext'
import { toArabicDigits, formatArabicDate } from '../../lib/format'

export function NotebookExporterModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { index } = useBook()

  const highlights = useLiveQuery(() => (index ? db.highlights.where('bookId').equals(index.book.id).toArray() : []), [index?.book.id])
  const notes = useLiveQuery(() => (index ? db.notes.where('bookId').equals(index.book.id).toArray() : []), [index?.book.id])
  const quotes = useLiveQuery(() => (index ? db.quotes.where('bookId').equals(index.book.id).toArray() : []), [index?.book.id])

  const totalItems = (highlights?.length ?? 0) + (notes?.length ?? 0) + (quotes?.length ?? 0)

  const generateMarkdown = () => {
    if (!index) return ''
    let md = `# كراسة الفوائد والتدوينات — ${index.book.title}\n`
    md += `**المؤلف/الجامع:** ${index.book.author}\n`
    md += `**تاريخ التصدير:** ${formatArabicDate()}\n\n`
    md += `---\n\n`

    if (quotes && quotes.length > 0) {
      md += `## ❖ الاقتباسات والدرر المختارة (${quotes.length})\n\n`
      for (const q of quotes) {
        const chap = index.chapterById.get(q.chapterId)
        md += `> «${q.text}»\n>\n> *— ${chap?.title ?? ''}*\n\n`
      }
    }

    if (notes && notes.length > 0) {
      md += `## ❖ الملاحظات والتدوينات (${notes.length})\n\n`
      for (const n of notes) {
        const chap = index.chapterById.get(n.chapterId)
        md += `### في باب: ${chap?.title ?? ''}\n`
        md += `**النص المقروء:** «${n.selectedText}»\n\n`
        md += `**الخاطرة والتدوين:** ${n.body}\n\n`
      }
    }

    if (highlights && highlights.length > 0) {
      md += `## ❖ الفوائد والتظليلات (${highlights.length})\n\n`
      for (const h of highlights) {
        const chap = index.chapterById.get(h.chapterId)
        md += `- «${h.text}» *(باب: ${chap?.title ?? ''})*\n`
      }
    }

    return md
  }

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown()
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kurasat-fawaid-${Date.now()}.md`
    a.click()
  }

  const handlePrintHTML = () => {
    const md = generateMarkdown()
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>كراسة الفوائد — ${index?.book.title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;600&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Amiri', serif; line-height: 1.9; padding: 40px; max-width: 800px; margin: auto; color: #222; }
          h1 { color: #836A42; border-bottom: 2px solid #836A42; padding-bottom: 10px; }
          h2 { color: #836A42; margin-top: 30px; border-bottom: 1px solid #ddd; }
          blockquote { border-right: 4px solid #836A42; margin: 20px 0; padding: 10px 20px; background: #faf7f0; font-size: 1.1em; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: left; margin-bottom: 20px;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #836A42; color: white; border: none; border-radius: 8px; cursor: pointer;">طباعة أو حفظ PDF 🖨️</button>
        </div>
        ${md.replace(/\n/g, '<br/>')}
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="تصدير كراسة الفوائد والتدوينات" className="max-w-md mx-auto">
      <div className="space-y-5 text-center">
        <div className="w-16 h-16 rounded-3xl bg-app-accent/15 text-app-accent flex items-center justify-center mx-auto text-2xl font-bold font-display">
          📚
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-app-text">كراسة فوائد {index?.book.title}</h3>
          <p className="text-xs text-app-text-secondary mt-1">
            إجمالي {toArabicDigits(totalItems)} فائدة وتظليل واقتباس محفوظ
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pt-2">
          <Button onClick={handlePrintHTML} className="gap-2 py-3">
            <Printer size={16} />
            <span>طباعة أو حفظ كملف PDF أنيق</span>
          </Button>

          <Button variant="secondary" onClick={handleDownloadMarkdown} className="gap-2 py-3">
            <FileText size={16} />
            <span>تصدير كملف Markdown (.md)</span>
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
