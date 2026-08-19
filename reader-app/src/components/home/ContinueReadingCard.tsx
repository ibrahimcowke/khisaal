import { useNavigate } from 'react-router-dom'
import { BookOpen, Library } from 'lucide-react'
import type { BookIndex } from '../../lib/bookData'
import { estimateMinutes, overallProgress as computeOverallProgress } from '../../lib/bookData'
import { usePositionStore } from '../../store/positionStore'
import { toArabicDigits } from '../../lib/format'
import { Button } from '../ui/Button'
import { useBook } from '../../context/BookContext'

export function ContinueReadingCard({ index }: { index: BookIndex }) {
  const navigate = useNavigate()
  const { allBooks, selectBook } = useBook()
  const position = usePositionStore()
  const chapterId = position.chapterId && index.chapterById.has(position.chapterId) ? position.chapterId : index.chapters[0]?.id || ''
  const chapter = index.chapterById.get(chapterId) || index.chapters[0]
  const progress = computeOverallProgress(index, chapterId)

  const blockIdx = position.blockId ? chapter.blocks.findIndex((b) => b.id === position.blockId) : 0
  const remainingWords = chapter.blocks
    .slice(Math.max(0, blockIdx))
    .reduce((acc, b) => acc + (b.text ?? (b.items ?? []).join(' ')).split(/\s+/).filter(Boolean).length, 0)
  const minutesLeft = estimateMinutes(remainingWords)

  return (
    <div className="space-y-3">
      {allBooks.length > 1 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {allBooks.map((b) => {
              const active = b.book.id === index.book.id
              return (
                <button
                  key={b.book.id}
                  onClick={() => selectBook(b.book.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 border ${
                    active
                      ? 'bg-app-accent text-white border-app-accent shadow-sm'
                      : 'bg-app-surface text-app-text-secondary border-app-border hover:border-app-accent'
                  }`}
                >
                  <span>{b.book.id === 'alkhisal-al-miatan' ? 'خ' : 'إ'}</span>
                  <span>{b.book.shortTitle}</span>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => navigate('/library')}
            className="text-xs text-app-accent font-medium hover:underline flex items-center gap-1 shrink-0 mr-2"
          >
            <Library size={13} />
            <span>المكتبة</span>
          </button>
        </div>
      )}

      <button
        onClick={() => navigate(`/book/${index.book.id}/read?c=${chapterId}`)}
        className="w-full text-right rounded-3xl bg-app-surface border border-app-border p-5 sm:p-6 flex gap-5 items-center hover:shadow-lg transition-shadow group"
      >
        <div className="shrink-0 w-20 h-28 sm:w-24 sm:h-32 rounded-2xl bg-gradient-to-br from-app-accent/25 via-app-surface to-app-accent/5 border border-app-border flex flex-col items-center justify-between p-2.5 overflow-hidden">
          <span className="text-[10px] text-app-accent font-bold opacity-60">❖</span>
          <span className="font-display text-3xl sm:text-4xl text-app-accent leading-none px-1 text-center">
            {index.book.id === 'alkhisal-al-miatan' ? 'خ' : 'إ'}
          </span>
          <span className="text-[9px] text-app-text-secondary font-bold text-center truncate w-full">
            {index.book.shortTitle}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-app-text-secondary mb-1">متابعة القراءة</p>
          <h3 className="font-display text-lg sm:text-xl font-bold truncate mb-0.5 text-app-text">{index.book.title}</h3>
          <p className="text-sm text-app-accent truncate mb-3 font-medium">{chapter.title}</p>

          <div className="h-1.5 rounded-full bg-app-border overflow-hidden mb-2">
            <div className="h-full bg-app-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs text-app-text-secondary">
            <span>{toArabicDigits(progress)}٪ مكتمل</span>
            <span>{toArabicDigits(minutesLeft)} دقيقة متبقية</span>
          </div>
        </div>

        <div className="shrink-0 hidden sm:block">
          <Button size="md" className="pointer-events-none gap-1.5">
            <BookOpen size={16} />
            متابعة
          </Button>
        </div>
      </button>
    </div>
  )
}
