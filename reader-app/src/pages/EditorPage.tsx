import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight, ArrowLeft, Check, Undo2, Download, ShieldCheck } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db, uid } from '../lib/db'
import { Button } from '../components/ui/Button'
import { toArabicDigits } from '../lib/format'

export default function EditorPage() {
  const { index, loading } = useBook()
  const [chapterIdx, setChapterIdx] = useState(0)
  const [blockIdx, setBlockIdx] = useState(0)
  const [draft, setDraft] = useState('')
  const [dirty, setDirty] = useState(false)

  const chapter = index?.chapters[chapterIdx]
  const block = chapter?.blocks[blockIdx]

  const override = useLiveQuery(() => (block ? db.blockOverrides.get(block.id) : undefined), [block?.id])
  const verified = useLiveQuery(() => (block ? db.verifiedBlocks.get(block.id) : undefined), [block?.id])
  const history = useLiveQuery(() => (block ? db.corrections.where('blockId').equals(block.id).reverse().sortBy('timestamp') : []), [block?.id])

  const sourceText = block?.text ?? (block?.items ?? []).join('\n')

  useEffect(() => {
    setDraft(override?.text ?? sourceText ?? '')
    setDirty(false)
  }, [block?.id, override?.text]) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveCorrection() {
    if (!block) return
    const before = override?.text ?? sourceText ?? ''
    if (draft === before) return
    await db.blockOverrides.put({ blockId: block.id, text: draft, updatedAt: Date.now() })
    await db.corrections.add({ id: uid('corr'), blockId: block.id, before, after: draft, timestamp: Date.now() })
    setDirty(false)
  }

  async function toggleVerified() {
    if (!block) return
    if (verified) await db.verifiedBlocks.delete(block.id)
    else await db.verifiedBlocks.put({ blockId: block.id, verifiedAt: Date.now() })
  }

  function restoreVersion(before: string) {
    setDraft(before)
    setDirty(true)
  }

  function goNext() {
    if (!index) return
    let ci = chapterIdx
    let bi = blockIdx + 1
    while (ci < index.chapters.length) {
      const c = index.chapters[ci]
      while (bi < c.blocks.length) {
        setChapterIdx(ci)
        setBlockIdx(bi)
        return
      }
      ci++
      bi = 0
    }
  }

  function goPrev() {
    if (blockIdx > 0) setBlockIdx(blockIdx - 1)
    else if (chapterIdx > 0) {
      setChapterIdx(chapterIdx - 1)
      setBlockIdx((index?.chapters[chapterIdx - 1].blocks.length ?? 1) - 1)
    }
  }

  const allBlocksFlat = useMemo(() => index?.chapters.flatMap((c) => c.blocks) ?? [], [index])
  const globalIdx = block ? allBlocksFlat.findIndex((b) => b.id === block.id) : -1

  async function exportCorrectedBook() {
    if (!index) return
    const overrides = await db.blockOverrides.toArray()
    const overrideMap = new Map(overrides.map((o) => [o.blockId, o.text]))
    const chapters = index.chapters.map((c) => ({
      ...c,
      blocks: c.blocks.map((b) => (overrideMap.has(b.id) ? { ...b, text: overrideMap.get(b.id) } : b)),
    }))
    const payload = { schemaVersion: '1.0.0', book: index.book, chapters }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'book-corrected.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading || !index || !chapter || !block) {
    return <div className="min-h-screen flex items-center justify-center text-app-text-secondary">جارٍ التحميل...</div>
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="sticky top-0 z-10 bg-app-surface/95 backdrop-blur border-b border-app-border px-5 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold">وضع التحرير والمراجعة</h1>
          <p className="text-xs text-app-text-secondary">{chapter.title} · كتلة {toArabicDigits(globalIdx + 1)} من {toArabicDigits(allBlocksFlat.length)}</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportCorrectedBook}>
          <Download size={14} />
          تصدير النسخة المنقحة
        </Button>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-6">
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <div className="rounded-2xl border border-app-border bg-app-surface p-4">
            <p className="text-xs font-medium text-app-text-secondary mb-2">النص المصدر (الأصلي)</p>
            <p dir="rtl" className="text-base leading-relaxed whitespace-pre-wrap">{sourceText}</p>
          </div>
          <div className="rounded-2xl border border-app-accent/40 bg-app-surface p-4">
            <p className="text-xs font-medium text-app-accent mb-2">النص المصحح (قابل للتعديل)</p>
            <textarea
              dir="rtl"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                setDirty(true)
              }}
              rows={6}
              className="w-full resize-y text-base leading-relaxed bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Button onClick={saveCorrection} disabled={!dirty}>
            <Check size={15} />
            حفظ التصحيح
          </Button>
          <Button variant={verified ? 'secondary' : 'outline'} onClick={toggleVerified}>
            <ShieldCheck size={15} />
            {verified ? 'موثّق ✓' : 'وضع علامة موثّق'}
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={goPrev}>
            <ArrowRight size={14} />
            السابق
          </Button>
          <Button variant="ghost" size="sm" onClick={() => goNext()}>
            التالي
            <ArrowLeft size={14} />
          </Button>
        </div>

        {history && history.length > 0 && (
          <section>
            <p className="text-sm font-semibold mb-3">سجل الإصدارات</p>
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id} className="rounded-xl border border-app-border p-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-app-text-secondary truncate flex-1">{h.after}</p>
                  <button
                    onClick={() => restoreVersion(h.before)}
                    className="text-xs text-app-accent shrink-0 flex items-center gap-1"
                  >
                    <Undo2 size={12} />
                    استعادة النسخة السابقة
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
