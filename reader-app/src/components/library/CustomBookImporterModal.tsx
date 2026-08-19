import { useState, useRef } from 'react'
import { Upload, AlertCircle, BookOpen } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { db, uid } from '../../lib/db'
import type { BookData, Chapter, ContentBlock } from '../../lib/types'

export function CustomBookImporterModal({
  open,
  onOpenChange,
  onBookImported,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onBookImported: (bookId: string) => void
}) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [rawContent, setRawContent] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text)
          if (parsed.book && parsed.chapters) {
            setTitle(parsed.book.title || '')
            setAuthor(parsed.book.author || '')
            setDescription(parsed.book.description || '')
            setRawContent(text)
            return
          }
        }
        // Text / Markdown parsing
        setRawContent(text)
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''))
      } catch {
        setError('تعذر قراءة الملف. يرجى التأكد من سلامة صياغة الملف.')
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!title.trim()) {
      setError('يرجى إدخال عنوان الكتاب')
      return
    }
    if (!rawContent.trim()) {
      setError('يرجى إدخال نص أو رفع ملف للكتاب')
      return
    }

    setLoading(true)
    try {
      let bookData: BookData

      if (rawContent.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(rawContent)
          if (parsed.book && parsed.chapters) {
            bookData = parsed
            bookData.book.id = uid('custom-book')
          } else {
            throw new Error('Invalid schema')
          }
        } catch {
          bookData = buildBookFromText(title, author || 'مؤلف غير معروف', description, rawContent)
        }
      } else {
        bookData = buildBookFromText(title, author || 'مؤلف غير معروف', description, rawContent)
      }

      // Save to indexedDB customBooks
      await db.customBooks.add({
        id: bookData.book.id,
        title: bookData.book.title,
        author: bookData.book.author,
        jsonData: JSON.stringify(bookData),
        createdAt: Date.now(),
      })

      onBookImported(bookData.book.id)
      onOpenChange(false)
    } catch {
      setError('حدث خطأ أثناء حفظ الكتاب.')
    } finally {
      setLoading(false)
    }
  }

  function buildBookFromText(bookTitle: string, bookAuthor: string, bookDesc: string, text: string): BookData {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    const chapters: Chapter[] = []
    let currentChapterBlocks: ContentBlock[] = []
    let chapterTitle = 'الباب الأول'
    let chapterOrder = 1
    let blockIdx = 1

    function pushChapter() {
      if (currentChapterBlocks.length === 0) return
      const words = currentChapterBlocks.reduce((acc, b) => acc + (b.text?.split(/\s+/).length ?? 0), 0)
      const pageId = `page-${Math.ceil(blockIdx / 5)}`
      chapters.push({
        id: uid('chap'),
        title: chapterTitle,
        order: chapterOrder++,
        sourcePageStart: Math.max(1, Math.ceil(blockIdx / 5) - 1),
        sourcePageEnd: Math.ceil(blockIdx / 5),
        pageIds: [pageId],
        wordCount: words,
        tags: ['كتاب-مخصص'],
        blocks: [...currentChapterBlocks],
      })
      currentChapterBlocks = []
    }

    for (const line of lines) {
      if (line.startsWith('#') || line.startsWith('باب') || line.startsWith('الفصل')) {
        pushChapter()
        chapterTitle = line.replace(/^#+\s*/, '')
      } else {
        const pageId = `page-${Math.ceil(blockIdx / 5)}`
        currentChapterBlocks.push({
          id: uid('block'),
          pageId,
          type: line.length < 50 && line.includes('—') ? 'quote' : 'paragraph',
          text: line,
          sourcePage: Math.ceil(blockIdx / 5),
        })
        blockIdx++
      }
    }
    pushChapter()

    const totalWords = chapters.reduce((acc, c) => acc + c.wordCount, 0)
    const totalBlocks = chapters.reduce((acc, c) => acc + c.blocks.length, 0)
    const totalPages = Math.max(1, Math.ceil(blockIdx / 5))

    return {
      schemaVersion: '1.0',
      book: {
        id: uid('book'),
        title: bookTitle,
        shortTitle: bookTitle.slice(0, 20),
        subtitle: bookDesc || 'كتاب مخصص في المكتبة',
        author: bookAuthor,
        description: bookDesc || 'كتاب تم استيراده للمكتبة الشخصية',
        language: 'ar',
        direction: 'rtl',
        totalSections: chapters.length,
        totalWords,
        totalPages,
        totalBlocks,
        sourcePageCount: totalPages,
      },
      chapters,
      reading: {
        default_font_family: 'Amiri',
        recommended_font_size_px: 22,
        recommended_line_height: 1.8,
        page_anchor_field: 'sourcePage',
        search_field: 'text',
        bookmark_key: 'blockId',
      },
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="استيراد كتاب أو مخطوطة للمكتبة" className="max-w-xl mx-auto">
      <div className="space-y-4">
        {/* Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-app-accent/40 hover:border-app-accent rounded-3xl p-6 text-center cursor-pointer bg-app-surface/60 transition-all hover:bg-app-accent/5"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Upload size={32} className="mx-auto text-app-accent mb-2" />
          <p className="text-sm font-bold text-app-text">اضغط لرفع ملف (JSON, TXT, Markdown)</p>
          <p className="text-xs text-app-muted mt-1">يمكنك استيراد كتبك ونصوصك لتصفحها بنفس تجربة القراءة والخطوط</p>
          {fileName && (
            <p className="text-xs text-app-accent font-bold mt-2 bg-app-accent/15 py-1 px-3 rounded-full inline-block">
              الملف المختار: {fileName}
            </p>
          )}
        </div>

        {/* Form Details */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-app-text-secondary block mb-1">عنوان الكتاب:</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: روائع الحكم والآداب"
              dir="rtl"
              className="w-full rounded-xl border border-app-border bg-app-surface py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-app-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-app-text-secondary block mb-1">المؤلف أو الجامع:</label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="اسم المؤلف"
                dir="rtl"
                className="w-full rounded-xl border border-app-border bg-app-surface py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-app-accent"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-app-text-secondary block mb-1">وصف مختصر:</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="نبذة عن الكتاب"
                dir="rtl"
                className="w-full rounded-xl border border-app-border bg-app-surface py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-app-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-app-text-secondary block mb-1">محتوى النص أو كود JSON:</label>
            <textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="الصق نص الكتاب أو الفصول هنا..."
              dir="rtl"
              rows={5}
              className="w-full rounded-xl border border-app-border bg-app-surface py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-app-accent font-mono leading-relaxed"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <Button onClick={handleImport} disabled={loading} className="w-full gap-2 py-3">
          <BookOpen size={16} />
          <span>{loading ? 'جارٍ المعالجة والإضافة...' : 'إضافة الكتاب إلى المكتبة الشخصية'}</span>
        </Button>
      </div>
    </Sheet>
  )
}
