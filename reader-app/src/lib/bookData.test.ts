import { describe, it, expect } from 'vitest'
import { buildIndex, chapterProgress, overallProgress, nextChapter, prevChapter, estimateMinutes } from './bookData'
import type { BookData } from './types'

function makeBookData(): BookData {
  return {
    schemaVersion: '1.0.0',
    book: {
      id: 'test-book',
      title: 'كتاب تجريبي',
      shortTitle: 'كتاب',
      subtitle: 'الجزء الأول',
      author: 'مؤلف تجريبي',
      language: 'ar',
      direction: 'rtl',
      sourcePageCount: 10,
      totalSections: 3,
      totalPages: 10,
      totalWords: 100,
      totalBlocks: 6,
      description: 'وصف تجريبي',
    },
    reading: {
      default_font_family: 'Noto Naskh Arabic',
      recommended_font_size_px: 22,
      recommended_line_height: 2,
      page_anchor_field: 'sourcePage',
      search_field: 'text',
      bookmark_key: 'blockId',
    },
    chapters: [
      {
        id: 'chapter-001',
        title: 'الفصل الأول',
        order: 1,
        sourcePageStart: 1,
        sourcePageEnd: 2,
        pageIds: ['p001', 'p002'],
        wordCount: 40,
        tags: [],
        blocks: [
          { id: 'chapter-001-b0001', type: 'heading', text: 'الفصل الأول', sourcePage: 1, pageId: 'p001' },
          { id: 'chapter-001-b0002', type: 'paragraph', text: 'نص أول', sourcePage: 1, pageId: 'p001' },
          { id: 'chapter-001-b0003', type: 'paragraph', text: 'نص ثانٍ', sourcePage: 2, pageId: 'p002' },
        ],
      },
      {
        id: 'chapter-002',
        title: 'الفصل الثاني',
        order: 2,
        sourcePageStart: 3,
        sourcePageEnd: 3,
        pageIds: ['p003'],
        wordCount: 30,
        tags: [],
        blocks: [
          { id: 'chapter-002-b0001', type: 'paragraph', text: 'نص ثالث', sourcePage: 3, pageId: 'p003' },
        ],
      },
      {
        id: 'chapter-003',
        title: 'الفصل الثالث',
        order: 3,
        sourcePageStart: 4,
        sourcePageEnd: 4,
        pageIds: ['p004'],
        wordCount: 30,
        tags: [],
        blocks: [
          { id: 'chapter-003-b0001', type: 'paragraph', text: 'نص رابع', sourcePage: 4, pageId: 'p004' },
        ],
      },
    ],
  }
}

describe('buildIndex', () => {
  it('indexes chapters and blocks for fast lookup', () => {
    const index = buildIndex(makeBookData())
    expect(index.chapters).toHaveLength(3)
    expect(index.chapterById.get('chapter-002')?.title).toBe('الفصل الثاني')
    expect(index.chapterOrder.get('chapter-001')).toBe(0)
    expect(index.blockById.get('chapter-001-b0002')?.block.text).toBe('نص أول')
    expect(index.flatBlockIds).toHaveLength(5)
  })
})

describe('chapterProgress', () => {
  it('computes percentage through a chapter by block position', () => {
    const index = buildIndex(makeBookData())
    expect(chapterProgress(index, 'chapter-001', 'chapter-001-b0001')).toBe(33)
    expect(chapterProgress(index, 'chapter-001', 'chapter-001-b0003')).toBe(100)
  })

  it('returns 0 for an unknown block or chapter', () => {
    const index = buildIndex(makeBookData())
    expect(chapterProgress(index, 'chapter-001', 'does-not-exist')).toBe(0)
    expect(chapterProgress(index, 'does-not-exist')).toBe(0)
  })
})

describe('overallProgress', () => {
  it('computes percentage through the book by chapter order', () => {
    const index = buildIndex(makeBookData())
    expect(overallProgress(index, 'chapter-001')).toBe(33)
    expect(overallProgress(index, 'chapter-003')).toBe(100)
  })
})

describe('nextChapter / prevChapter', () => {
  it('walks forward and backward through chapter order', () => {
    const index = buildIndex(makeBookData())
    expect(nextChapter(index, 'chapter-001')?.id).toBe('chapter-002')
    expect(prevChapter(index, 'chapter-002')?.id).toBe('chapter-001')
    expect(nextChapter(index, 'chapter-003')).toBeNull()
    expect(prevChapter(index, 'chapter-001')).toBeNull()
  })
})

describe('estimateMinutes', () => {
  it('estimates reading time at roughly 180 words per minute, minimum 1', () => {
    expect(estimateMinutes(0)).toBe(1)
    expect(estimateMinutes(180)).toBe(1)
    expect(estimateMinutes(360)).toBe(2)
    expect(estimateMinutes(900)).toBe(5)
  })
})
