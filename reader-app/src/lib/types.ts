// ---------- Book content model ----------

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'quote'
  | 'list'
  | 'numbered-list'
  | 'verse'
  | 'poetry'
  | 'divider'
  | 'note'
  | 'source'
  | 'callout'
  | 'image'
  | 'page-marker'

export interface ContentBlock {
  id: string
  type: BlockType
  text?: string
  items?: string[]
  level?: number
  attribution?: string
  sourcePage: number
  pageId: string
}

export interface Chapter {
  id: string
  title: string
  order: number
  sourcePageStart: number
  sourcePageEnd: number
  pageIds: string[]
  wordCount: number
  tags: string[]
  blocks: ContentBlock[]
}

export interface BookMeta {
  id: string
  title: string
  shortTitle: string
  subtitle: string
  author: string
  language: string
  direction: 'rtl' | 'ltr'
  sourcePageCount: number
  totalSections: number
  totalPages: number
  totalWords: number
  totalBlocks: number
  description: string
}

export interface BookData {
  schemaVersion: string
  book: BookMeta
  reading: {
    default_font_family: string
    recommended_font_size_px: number
    recommended_line_height: number
    page_anchor_field: string
    search_field: string
    bookmark_key: string
  }
  chapters: Chapter[]
}

// ---------- User data model (persisted in Dexie) ----------

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange'

export interface Highlight {
  id: string
  bookId: string
  chapterId: string
  blockId: string
  text: string
  prefix: string
  suffix: string
  startOffset: number
  endOffset: number
  color: HighlightColor
  note?: string
  tags: string[]
  favorite: boolean
  createdAt: number
  updatedAt: number
}

export interface Note {
  id: string
  bookId: string
  chapterId: string
  blockId: string
  highlightId?: string
  selectedText: string
  body: string
  tags: string[]
  favorite: boolean
  createdAt: number
  updatedAt: number
}

export interface Bookmark {
  id: string
  bookId: string
  chapterId: string
  blockId: string
  title: string
  createdAt: number
}

export interface Quote {
  id: string
  bookId: string
  chapterId: string
  text: string
  sourcePage: number
  tags: string[]
  favorite: boolean
  createdAt: number
}

export interface Collection {
  id: string
  name: string
  itemIds: string[] // ids of highlights/notes/quotes
  createdAt: number
}

export interface ReadingSession {
  id: string
  bookId: string
  chapterId: string
  startedAt: number
  endedAt: number
  durationSeconds: number
}

export interface ReadingPosition {
  bookId: string
  chapterId: string
  blockId: string
  scrollRatio: number
  updatedAt: number
}

export interface EditorCorrection {
  id: string
  blockId: string
  before: string
  after: string
  timestamp: number
}

export interface RecentSearch {
  id: string
  query: string
  createdAt: number
}
