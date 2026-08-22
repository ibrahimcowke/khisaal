import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { List, Bookmark as BookmarkIcon, StickyNote, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Tabs, TabPanel } from '../ui/Tabs'
import { EmptyState } from '../ui/EmptyState'
import { db } from '../../lib/db'
import type { BookIndex } from '../../lib/bookData'
import { normalizeArabic } from '../../lib/arabicNormalize'
import { cn } from '../../lib/cn'
import { useTranslation } from '../../lib/i18n'

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
  const { isRtl, formatDigits } = useTranslation()

  const bookmarks = useLiveQuery(
    () => db.bookmarks.where('bookId').equals(index.book.id).reverse().toArray(),
    [index.book.id]
  )
  const notes = useLiveQuery(
    () => db.notes.where('bookId').equals(index.book.id).reverse().toArray(),
    [index.book.id]
  )

  const filteredChapters = useMemo(() => {
    if (!searchFilter.trim()) return index.chapters
    const q = normalizeArabic(searchFilter)
    return index.chapters.filter((c) => normalizeArabic(c.title).includes(q))
  }, [index.chapters, searchFilter])

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isRtl ? 'فهرس الكتاب والعلامات' : 'Table of Contents & Bookmarks'}
      className="max-w-xl mx-auto"
    >
      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          {
            value: 'toc',
            label: isRtl ? `الأبواب (${formatDigits(index.chapters.length)})` : `Chapters (${index.chapters.length})`,
            icon: <List size={14} />,
          },
          {
            value: 'bookmarks',
            label: isRtl ? `العلامات (${formatDigits(bookmarks?.length ?? 0)})` : `Bookmarks (${bookmarks?.length ?? 0})`,
            icon: <BookmarkIcon size={14} />,
          },
          {
            value: 'notes',
            label: isRtl ? `الملاحظات (${formatDigits(notes?.length ?? 0)})` : `Notes (${notes?.length ?? 0})`,
            icon: <StickyNote size={14} />,
          },
        ]}
      >
        <TabPanel value="toc" className="space-y-3">
          {/* Quick Filter in TOC */}
          <div className="relative">
            <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-muted" />
            <input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={isRtl ? 'تصفية الفهرس والبحث في الأبواب...' : 'Filter chapters...'}
              dir={isRtl ? 'rtl' : 'ltr'}
              className="w-full rounded-xl border border-app-border bg-app-surface py-2 pr-9 pl-3 text-xs focus:outline-none focus:ring-1 focus:ring-app-accent"
            />
          </div>

          {filteredChapters.length === 0 ? (
            <EmptyState
              icon={Search}
              title={isRtl ? 'لا توجد أبواب مطابقة' : 'No matching chapters'}
              description={isRtl ? 'جرب البحث بكلمات أخرى' : 'Try different keywords'}
            />
          ) : (
            <ul className="max-h-[58vh] overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
              {filteredChapters.map((c, i) => {
                const isCurrent = c.id === currentChapterId

                return (
                  <li key={c.id}>
                    <button
                      onClick={() => onSelectChapter(c.id)}
                      className={cn(
                        'w-full text-right p-3 rounded-2xl border text-sm flex items-center justify-between gap-3 transition-all group hover:shadow-2xs cursor-pointer',
                        isCurrent
                          ? 'bg-app-accent/10 border-app-accent text-app-accent font-bold shadow-2xs'
                          : 'bg-app-surface border-app-border text-app-text hover:border-app-accent/50'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            'w-6.5 h-6.5 rounded-xl flex items-center justify-center shrink-0 font-display text-xs font-bold transition-colors',
                            isCurrent
                              ? 'bg-app-accent text-white shadow-2xs'
                              : 'bg-app-bg text-app-text-secondary group-hover:bg-app-accent/15 group-hover:text-app-accent'
                          )}
                        >
                          {formatDigits(i + 1)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate font-display text-xs sm:text-sm">{c.title}</p>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-app-accent text-white font-sans shrink-0 font-normal">
                                {isRtl ? 'الحالي' : 'Current'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-app-muted shrink-0 font-serif">
                        <span>{formatDigits(c.blocks.length)} {isRtl ? 'فقرات' : 'p'}</span>
                        <ChevronIcon size={14} />
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </TabPanel>

        <TabPanel value="bookmarks" className="space-y-3">
          {!bookmarks || bookmarks.length === 0 ? (
            <EmptyState
              icon={BookmarkIcon}
              title={isRtl ? 'لا توجد علامات مرجعية' : 'No Bookmarks Yet'}
              description={isRtl ? 'يمكنك حفظ أي فقرة أثناء القراءة بالضغط على أيقونة العلامة المرجعية.' : 'Add bookmarks while reading to quickly jump back to favorite sections.'}
            />
          ) : (
            <ul className="max-h-[58vh] overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
              {bookmarks.map((b) => {
                const chapter = index.chapterById.get(b.chapterId)
                return (
                  <li key={b.id}>
                    <button
                      onClick={() => onSelectBookmark(b.chapterId, b.blockId)}
                      className="w-full text-right p-3.5 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent/60 transition-all flex items-start justify-between gap-3 group cursor-pointer shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold text-xs text-app-text group-hover:text-app-accent transition-colors">
                          {b.title || chapter?.title}
                        </p>
                        {chapter && (
                          <p className="text-[11px] text-app-muted font-serif line-clamp-1 mt-1">
                            {chapter.title}
                          </p>
                        )}
                      </div>
                      <ChevronIcon size={14} className="text-app-muted group-hover:text-app-accent shrink-0 mt-1" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </TabPanel>

        <TabPanel value="notes" className="space-y-3">
          {!notes || notes.length === 0 ? (
            <EmptyState
              icon={StickyNote}
              title={isRtl ? 'لا توجد ملاحظات مسجلة' : 'No Notes Yet'}
              description={isRtl ? 'حدد أي نص أثناء القراءة لتدوين أفكارك وتعليقاتك وفوائدك.' : 'Highlight text while reading to jot down your notes and insights.'}
            />
          ) : (
            <ul className="max-h-[58vh] overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
              {notes.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => onSelectBookmark(n.chapterId, n.blockId ?? '')}
                    className="w-full text-right p-3.5 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent/60 transition-all flex items-start justify-between gap-3 group cursor-pointer shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-app-text leading-relaxed">
                        {n.body}
                      </p>
                      {n.selectedText && (
                        <p className="text-[11px] text-app-muted font-serif line-clamp-1 mt-1 border-r-2 border-app-accent/40 pr-2">
                          «{n.selectedText}»
                        </p>
                      )}
                    </div>
                    <ChevronIcon size={14} className="text-app-muted group-hover:text-app-accent shrink-0 mt-1" />
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
