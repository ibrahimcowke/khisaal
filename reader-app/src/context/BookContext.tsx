import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loadBook, loadAllBooks, buildIndex, type BookIndex } from '../lib/bookData'
import type { BookData } from '../lib/types'

interface BookContextValue {
  index: BookIndex | null
  allBooks: BookData[]
  currentBookId: string
  loading: boolean
  error: string | null
  selectBook: (bookId: string) => Promise<void>
}

const BookContext = createContext<BookContextValue>({
  index: null,
  allBooks: [],
  currentBookId: 'imtaa-al-qari-vol-1',
  loading: true,
  error: null,
  selectBook: async () => {},
})

export function BookProvider({ children }: { children: ReactNode }) {
  const [currentBookId, setCurrentBookId] = useState<string>(() => {
    return localStorage.getItem('imtaa-active-book') || 'imtaa-al-qari-vol-1'
  })
  const [index, setIndex] = useState<BookIndex | null>(null)
  const [allBooks, setAllBooks] = useState<BookData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectBook = async (bookId: string) => {
    setLoading(true)
    try {
      const data = await loadBook(bookId)
      setIndex(buildIndex(data))
      setCurrentBookId(bookId)
      localStorage.setItem('imtaa-active-book', bookId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل الكتاب')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([loadBook(currentBookId), loadAllBooks()])
      .then(([activeData, all]) => {
        if (cancelled) return
        setIndex(buildIndex(activeData))
        setAllBooks(all)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [currentBookId])

  return (
    <BookContext.Provider value={{ index, allBooks, currentBookId, loading, error, selectBook }}>
      {children}
    </BookContext.Provider>
  )
}

export function useBook() {
  return useContext(BookContext)
}
