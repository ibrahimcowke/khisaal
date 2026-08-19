import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { List, Bookmark as BookmarkIcon, StickyNote, Search, BookOpen, ChevronLeft } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Tabs, TabPanel } from '../ui/Tabs'
import { db } from '../../lib/db'
import type { BookIndex } from '../../lib/bookData'
import { normalizeArabic } from '../../lib/arabicNormalize'
import { cn } from '../../lib/cn'
import { toArabicDigits } from '../../lib/format'

export function TocSheet({
  open,
  onOpenChange,
  index,
  currentChapterId,
  onSelectChapter,
  onSelectBookmark,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  index: BookIndex
  currentChapterId: string
  onSelectChapter: (chapterId: string) => void
  onSelectBookmark: (chapterId: string, blockId: string) => void
}) {
  const [tab, setTab] = useState('toc')
  const [searchFilter, setSearchFilter] = useState('')
  const bookmarks = useLiveQuery(() => db.bookmarks.where('bookId').equals(index.book.id).reverse().toArray(), [index.book.id])
  const notes = useLiveQuery(() => db.notes.where('bookId').equals(index.book.id).reverse().toArray(), [index.book.id])

  const filteredChapters = useMemo(() => {
    if (!searchFilter.trim()) return index.chapters
    const q = normalizeArabic(searchFilter)
    return index.chapters.filter((c) => normalizeArabic(c.title).includes(q))
  }, [index.chapters, searchFilter])

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="فهرس الأبواب والعلامات" className="max-w-xl mx-auto">
      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: 'toc', label: `الأبواب (${toArabicDigits(index.chapters.length)})`, icon: <List size={15} /> },
          { value: 'bookmarks', label: `العلامات (${toArabicDigits(bookmarks?.length ?? 0)})`, icon: <BookmarkIcon size={15} /> },
          { value: 'notes', label: `الملاحظات (${toArabicDigits(notes?.length ?? 0)})`, icon: <StickyNote size={15} /> },
        ]}
      >
        <TabPanel value="toc" className="space-y-3">
          {/* Quick Filter in TOC */}
          <div className="relative">
            <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-muted" />
            <input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="تصفية الفهرس والبحث في الأبواب..."
              dir="rtl"
              className="w-full rounded-xl border border-app-border bg-app-surface py-2 pr-9 pl-3 text-xs focus:outline-none focus:ring-1 focus:ring-app-accent"
            />
          </div>

          <ul className="max-h-[58vh] overflow-y-auto space-y-2 pr-0.5">
            {filteredChapters.map((c, i) => {
              const isCurrent = c.id === currentChapterId
              const wordCount = c.blocks.reduce(
                (acc, b) => acc + (b.text ?? (b.items ?? []).join(' ')).split(/\s+/).filter(Boolean).length,
                0
              )

              return (
                <li key={c.id}>
                  <button
                    onClick={() => onSelectChapter(c.id)}
                    className={cn(
                      'w-full text-right p-3 rounded-2xl border text-sm flex items-center justify-between gap-3 transition-all group hover:shadow-sm cursor-pointer',
                      isCurrent
                        ? 'bg-app-accent/15 border-app-accent text-app-accent font-bold ring-1 ring-app-accent/30 shadow-xs'
                        : 'bg-app-surface border-app-border text-app-text hover:border-app-accent/60'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-display text-xs font-bold transition-colors',
                          isCurrent
                            ? 'bg-app-accent text-white shadow-xs'
                            : 'bg-app-bg text-app-text-secondary group-hover:bg-app-accent/20 group-hover:text-app-accent'
                        )}
                      >
                        {toArabicDigits(i + 1)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-display text-sm leading-snug">{c.title}</p>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-app-accent text-white font-sans shrink-0 font-normal">
                              الحالي
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-app-text-secondary truncate mt-0.5 font-normal">
                          {toArabicDigits(c.blocks.length)} فقرات · {toArabicDigits(wordCount)} كلمة
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-app-muted group-hover:text-app-accent">
                      <span className="text-[11px] font-sans">ص {toArabicDigits(c.sourcePageStart)}</span>
                      <ChevronLeft size={15} />
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </TabPanel>

        <TabPanel value="bookmarks">
          {!bookmarks || bookmarks.length === 0 ? (
            <EmptyState text="لا توجد علامات مرجعية محفوظة بعد" />
          ) : (
            <ul className="max-h-[58vh] overflow-y-auto space-y-2">
              {bookmarks.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => onSelectBookmark(b.chapterId, b.blockId)}
                    className="w-full text-right p-3 rounded-2xl border border-app-border bg-app-surface text-sm hover:border-app-accent transition-all group flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-bold truncate text-app-text group-hover:text-app-accent">{b.title}</p>
                      <p className="text-xs text-app-muted truncate mt-0.5">{index.chapterById.get(b.chapterId)?.title}</p>
                    </div>
                    <ChevronLeft size={15} className="text-app-muted group-hover:text-app-accent shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </TabPanel>

        <TabPanel value="notes">
          {!notes || notes.length === 0 ? (
            <EmptyState text="لا توجد ملاحظات وتدوينات بعد" />
          ) : (
            <ul className="max-h-[58vh] overflow-y-auto space-y-2">
              {notes.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => onSelectBookmark(n.chapterId, n.blockId)}
                    className="w-full text-right p-3 rounded-2xl border border-app-border bg-app-surface text-sm hover:border-app-accent transition-all group flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs text-app-text-secondary italic mb-1">"{n.selectedText}"</p>
                      <p className="text-sm font-bold text-app-text truncate group-hover:text-app-accent">{n.body}</p>
                    </div>
                    <ChevronLeft size={15} className="text-app-muted group-hover:text-app-accent shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </TabPanel>
      </Tabs>
    </Sheet>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12 bg-app-surface/60 rounded-3xl border border-app-border">
      <BookOpen size={28} className="mx-auto text-app-muted mb-2 opacity-50" />
      <p className="text-sm text-app-muted">{text}</p>
    </div>
  )
}
