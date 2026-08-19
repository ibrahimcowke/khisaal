import type { BookData, Chapter, ContentBlock } from './types'

const WORDS_PER_MINUTE = 180

export const BOOK_FILES: Record<string, string> = {
  'imtaa-al-qari-vol-1': '/data/book.json',
  'alkhisal-al-miatan': '/data/alkhisal.json',
}

const cacheMap = new Map<string, BookData>()
const inflightMap = new Map<string, Promise<BookData>>()

export async function loadBook(bookId = 'imtaa-al-qari-vol-1'): Promise<BookData> {
  const targetId = BOOK_FILES[bookId] ? bookId : 'imtaa-al-qari-vol-1'
  if (cacheMap.has(targetId)) return cacheMap.get(targetId)!
  if (inflightMap.has(targetId)) return inflightMap.get(targetId)!

  const file = BOOK_FILES[targetId] || '/data/book.json'
  const promise = fetch(file)
    .then((r) => {
      if (!r.ok) throw new Error('تعذر تحميل بيانات الكتاب')
      return r.json() as Promise<BookData>
    })
    .then((data) => {
      cacheMap.set(targetId, data)
      return data
    })

  inflightMap.set(targetId, promise)
  return promise
}

export async function loadAllBooks(): Promise<BookData[]> {
  const ids = Object.keys(BOOK_FILES)
  return Promise.all(ids.map((id) => loadBook(id)))
}

export function estimateMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))
}

export interface BookIndex {
  book: BookData['book']
  chapters: Chapter[]
  chapterById: Map<string, Chapter>
  chapterOrder: Map<string, number> // chapterId -> index in chapters[]
  blockById: Map<string, { block: ContentBlock; chapter: Chapter }>
  flatBlockIds: string[] // global order of all block ids
  totalWords: number
}

export function buildIndex(data: BookData): BookIndex {
  const chapterById = new Map<string, Chapter>()
  const chapterOrder = new Map<string, number>()
  const blockById = new Map<string, { block: ContentBlock; chapter: Chapter }>()
  const flatBlockIds: string[] = []

  data.chapters.forEach((chapter, idx) => {
    chapterById.set(chapter.id, chapter)
    chapterOrder.set(chapter.id, idx)
    chapter.blocks.forEach((block) => {
      blockById.set(block.id, { block, chapter })
      flatBlockIds.push(block.id)
    })
  })

  return {
    book: data.book,
    chapters: data.chapters,
    chapterById,
    chapterOrder,
    blockById,
    flatBlockIds,
    totalWords: data.book.totalWords,
  }
}

export function chapterProgress(index: BookIndex, chapterId: string, blockId?: string): number {
  const chapter = index.chapterById.get(chapterId)
  if (!chapter) return 0
  if (!blockId) return 0
  const pos = chapter.blocks.findIndex((b) => b.id === blockId)
  if (pos === -1) return 0
  return Math.round(((pos + 1) / chapter.blocks.length) * 100)
}

export function overallProgress(index: BookIndex, chapterId: string): number {
  const order = index.chapterOrder.get(chapterId)
  if (order === undefined) return 0
  return Math.round(((order + 1) / index.chapters.length) * 100)
}

export function nextChapter(index: BookIndex, chapterId: string): Chapter | null {
  const order = index.chapterOrder.get(chapterId)
  if (order === undefined) return null
  return index.chapters[order + 1] ?? null
}

export function prevChapter(index: BookIndex, chapterId: string): Chapter | null {
  const order = index.chapterOrder.get(chapterId)
  if (order === undefined) return null
  return index.chapters[order - 1] ?? null
}
