import Dexie, { type Table } from 'dexie'
import type {
  Highlight,
  Note,
  Bookmark,
  Quote,
  Collection,
  ReadingSession,
  ReadingPosition,
  EditorCorrection,
  RecentSearch,
} from './types'

export interface VoiceNote {
  id: string
  bookId: string
  chapterId: string
  blockId?: string
  title: string
  audioBlob: Blob
  durationSeconds: number
  createdAt: number
}

export interface ReadingPlanProgress {
  id: string
  planId: string
  day: number
  completed: boolean
  completedAt?: number
}

export interface CustomBookRecord {
  id: string
  title: string
  author: string
  jsonData: string
  createdAt: number
}

export interface VirtueLog {
  id: string
  date: string // YYYY-MM-DD
  traitId: string
  traitTitle: string
  category: string
  completed: boolean
  reflectionText?: string
  createdAt: number
}

export interface Flashcard {
  id: string
  front: string
  back: string
  category: string
  source?: string
  interval: number // days
  repetition: number
  easeFactor: number
  dueDate: string // YYYY-MM-DD
  lastReviewedAt?: number
  createdAt: number
}

export class ReaderDatabase extends Dexie {
  highlights!: Table<Highlight, string>
  notes!: Table<Note, string>
  bookmarks!: Table<Bookmark, string>
  quotes!: Table<Quote, string>
  collections!: Table<Collection, string>
  sessions!: Table<ReadingSession, string>
  positions!: Table<ReadingPosition, string>
  corrections!: Table<EditorCorrection, string>
  recentSearches!: Table<RecentSearch, string>
  history!: Table<{ id: string; bookId: string; chapterId: string; visitedAt: number; durationSeconds: number }, string>
  verifiedBlocks!: Table<{ blockId: string; verifiedAt: number }, string>
  blockOverrides!: Table<{ blockId: string; text: string; updatedAt: number }, string>
  voiceNotes!: Table<VoiceNote, string>
  readingPlans!: Table<ReadingPlanProgress, string>
  customBooks!: Table<CustomBookRecord, string>
  virtueLogs!: Table<VirtueLog, string>
  flashcards!: Table<Flashcard, string>

  constructor() {
    super('imtaa-reader-db')
    this.version(3).stores({
      highlights: 'id, bookId, chapterId, blockId, color, createdAt',
      notes: 'id, bookId, chapterId, blockId, highlightId, createdAt',
      bookmarks: 'id, bookId, chapterId, blockId, createdAt',
      quotes: 'id, bookId, chapterId, favorite, createdAt',
      collections: 'id, name, createdAt',
      sessions: 'id, bookId, chapterId, startedAt',
      positions: 'bookId',
      corrections: 'id, blockId, timestamp',
      recentSearches: 'id, createdAt',
      history: 'id, bookId, chapterId, visitedAt',
      verifiedBlocks: 'blockId, verifiedAt',
      blockOverrides: 'blockId, updatedAt',
      voiceNotes: 'id, bookId, chapterId, blockId, createdAt',
      readingPlans: 'id, planId, day, completed',
      customBooks: 'id, title, createdAt',
      virtueLogs: 'id, date, traitId, completed, createdAt',
      flashcards: 'id, dueDate, category, createdAt',
    })
  }
}

export const db = new ReaderDatabase()

export function uid(prefix = ''): string {
  const rand = Math.random().toString(36).slice(2, 10)
  const time = Date.now().toString(36)
  return `${prefix}${prefix ? '-' : ''}${time}${rand}`
}
