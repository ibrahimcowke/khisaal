import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, List as ListIcon, BookOpen, ChevronLeft, ChevronRight, Upload, Download } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/layout/PageHeader'
import { CustomBookImporterModal } from '../components/library/CustomBookImporterModal'
import { NotebookExporterModal } from '../components/library/NotebookExporterModal'
import type { BookData } from '../lib/types'
import { useTranslation } from '../lib/i18n'

export default function LibraryPage() {
  const { allBooks, currentBookId, selectBook, loading } = useBook()
  const navigate = useNavigate()
  const { t, isRtl, formatDigits } = useTranslation()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [importerOpen, setImporterOpen] = useState(false)
  const [exporterOpen, setExporterOpen] = useState(false)

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight

  if (loading && allBooks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-app-text-secondary text-sm">
        {t('loading')}
      </div>
    )
  }

  const handleOpenBook = async (book: BookData) => {
    await selectBook(book.book.id)
    navigate(`/book/${book.book.id}`)
  }

  const handleReadBook = async (book: BookData, e: React.MouseEvent) => {
    e.stopPropagation()
    await selectBook(book.book.id)
    navigate(`/book/${book.book.id}/read`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-14 animate-fade-in">
      <PageHeader
        title={t('libraryTitle')}
        subtitle={t('librarySubtitle')}
        count={`${formatDigits(allBooks.length)} ${isRtl ? 'كتب وموسوعات' : 'volumes'}`}
        actions={
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setImporterOpen(true)}
              className="gap-1.5 text-xs py-1.5 px-3"
            >
              <Upload size={13} />
              <span className="hidden sm:inline">{t('importCustomBook')}</span>
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setExporterOpen(true)}
              className="gap-1.5 text-xs py-1.5 px-3"
            >
              <Download size={13} />
              <span className="hidden sm:inline">{t('exportNotebook')}</span>
            </Button>

            <div className="flex items-center gap-0.5 rounded-xl border border-app-border p-0.5 bg-app-surface">
              <button
                onClick={() => setView('grid')}
                className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  view === 'grid' ? 'bg-app-accent text-white' : 'text-app-text-secondary hover:text-app-text'
                }`}
                title={isRtl ? 'عرض شبكي' : 'Grid View'}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  view === 'list' ? 'bg-app-accent text-white' : 'text-app-text-secondary hover:text-app-text'
                }`}
                title={isRtl ? 'عرض قائمة' : 'List View'}
              >
                <ListIcon size={15} />
              </button>
            </div>
          </div>
        }
      />

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {allBooks.map((b) => {
            const isCurrent = currentBookId === b.book.id
            return (
              <div
                key={b.book.id}
                onClick={() => handleOpenBook(b)}
                className={`rounded-3xl border p-5 sm:p-6 transition-all duration-150 cursor-pointer group shadow-2xs ${
                  isCurrent
                    ? 'bg-app-surface border-app-accent ring-1 ring-app-accent/30'
                    : 'bg-app-surface border-app-border hover:border-app-accent/60'
                }`}
              >
                <div className="flex gap-4 sm:gap-5 items-start">
                  {/* Spine Visual */}
                  <div className="w-22 h-34 sm:w-26 sm:h-38 rounded-2xl bg-linear-to-b from-app-accent/15 via-app-surface to-app-accent/5 border border-app-accent/20 shadow-2xs flex flex-col items-center justify-between p-2.5 shrink-0 group-hover:scale-[1.02] transition-transform">
                    <span className="text-[10px] text-app-accent font-bold font-display">❖</span>
                    <span className="font-display text-3xl sm:text-4xl text-app-accent font-bold leading-none">
                      {b.book.id === 'alkhisal-al-miatan' ? 'خ' : 'إ'}
                    </span>
                    <span className="text-[9px] text-app-text-secondary font-semibold text-center truncate w-full">
                      {b.book.shortTitle}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between h-34 sm:h-38">
                    <div>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-app-accent bg-app-accent/10 px-2 py-0.5 rounded-full mb-1">
                          {isRtl ? 'الكتاب النشط' : 'Active Volume'}
                        </span>
                      )}
                      <h3 className="font-display text-base sm:text-lg font-bold text-app-text line-clamp-2 leading-snug group-hover:text-app-accent transition-colors">
                        {b.book.title}
                      </h3>
                      <p className="text-xs text-app-accent font-medium mt-0.5 truncate">
                        {b.book.author}
                      </p>
                      <p className="text-xs text-app-text-secondary line-clamp-2 mt-1 leading-relaxed">
                        {b.book.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-app-muted font-serif">
                        {formatDigits(b.book.totalSections)} {isRtl ? 'فصول' : 'sec'} · {formatDigits(b.book.totalWords)} {t('wordsCount')}
                      </span>
                      <Button
                        size="sm"
                        onClick={(e) => handleReadBook(b, e)}
                        className="gap-1.5"
                      >
                        <BookOpen size={13} />
                        <span>{t('readBook')}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {allBooks.map((b) => (
            <div
              key={b.book.id}
              onClick={() => handleOpenBook(b)}
              className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent/60 hover:shadow-2xs transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-16 rounded-xl bg-app-accent/10 border border-app-border flex items-center justify-center shrink-0 font-display text-xl text-app-accent font-bold">
                  {b.book.id === 'alkhisal-al-miatan' ? 'خ' : 'إ'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-sm sm:text-base font-bold text-app-text truncate group-hover:text-app-accent transition-colors">
                    {b.book.title}
                  </h3>
                  <p className="text-xs text-app-text-secondary truncate mt-0.5">{b.book.author}</p>
                  <p className="text-[11px] text-app-muted mt-0.5 font-serif">
                    {formatDigits(b.book.totalSections)} {isRtl ? 'فصول' : 'sections'} · {formatDigits(b.book.sourcePageCount)} {isRtl ? 'صفحة' : 'pages'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" onClick={(e) => handleReadBook(b, e)}>
                  <BookOpen size={13} />
                  <span>{t('readBook')}</span>
                </Button>
                <ChevronIcon size={15} className="text-app-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CustomBookImporterModal
        open={importerOpen}
        onOpenChange={setImporterOpen}
        onBookImported={async (bookId) => {
          await selectBook(bookId)
          navigate(`/book/${bookId}`)
        }}
      />
      <NotebookExporterModal
        open={exporterOpen}
        onOpenChange={setExporterOpen}
      />
    </div>
  )
}
