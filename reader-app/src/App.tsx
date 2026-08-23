import { Suspense, lazy, type ComponentType } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { BookProvider } from './context/BookContext'
import { ThemeEffect } from './context/ThemeEffect'

// Resilient dynamic importer that auto-reloads if a new deployment changes chunk hashes
function lazyWithRetry<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      return await factory()
    } catch (error) {
      console.warn('Failed to load chunk, auto-reloading to fetch newest version...', error)
      const key = 'chunk_reload_' + window.location.pathname
      const hasRetried = sessionStorage.getItem(key)
      if (!hasRetried) {
        sessionStorage.setItem(key, 'true')
        window.location.reload()
        return new Promise(() => {}) // wait for reload
      }
      sessionStorage.removeItem(key)
      throw error
    }
  })
}

const HomePage = lazyWithRetry(() => import('./pages/HomePage'))
const LibraryPage = lazyWithRetry(() => import('./pages/LibraryPage'))
const BookDetailPage = lazyWithRetry(() => import('./pages/BookDetailPage'))
const ReaderPage = lazyWithRetry(() => import('./pages/ReaderPage'))
const SearchPage = lazyWithRetry(() => import('./pages/SearchPage'))
const BookmarksPage = lazyWithRetry(() => import('./pages/BookmarksPage'))
const HighlightsPage = lazyWithRetry(() => import('./pages/HighlightsPage'))
const NotesPage = lazyWithRetry(() => import('./pages/NotesPage'))
const CollectionsPage = lazyWithRetry(() => import('./pages/CollectionsPage'))
const CollectionDetailPage = lazyWithRetry(() => import('./pages/CollectionDetailPage'))
const QuotesPage = lazyWithRetry(() => import('./pages/QuotesPage'))
const HistoryPage = lazyWithRetry(() => import('./pages/HistoryPage'))
const FavoritesPage = lazyWithRetry(() => import('./pages/FavoritesPage'))
const StatsPage = lazyWithRetry(() => import('./pages/StatsPage'))
const SettingsPage = lazyWithRetry(() => import('./pages/SettingsPage'))
const EditorPage = lazyWithRetry(() => import('./pages/EditorPage'))
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage'))
const MorePage = lazyWithRetry(() => import('./pages/MorePage'))
const TraitTreePage = lazyWithRetry(() => import('./pages/TraitTreePage'))
const ReadingPlanPage = lazyWithRetry(() => import('./pages/ReadingPlanPage'))
const HabitTrackerPage = lazyWithRetry(() => import('./pages/HabitTrackerPage'))
const FlashcardsPage = lazyWithRetry(() => import('./pages/FlashcardsPage'))
const MindmapPage = lazyWithRetry(() => import('./pages/MindmapPage'))
const ToolsHubPage = lazyWithRetry(() => import('./pages/ToolsHubPage'))
const KhisalAssessmentPage = lazyWithRetry(() => import('./pages/KhisalAssessmentPage'))
const SpeedReaderPage = lazyWithRetry(() => import('./pages/SpeedReaderPage'))

function PageFallback() {
  return <div className="min-h-screen flex items-center justify-center text-app-text-secondary text-sm">جارٍ التحميل...</div>
}

function ChapterToRead() {
  const path = window.location.pathname
  const match = path.match(/\/book\/([^/]+)\/chapter\/([^/]+)/)
  if (match) {
    return <Navigate to={`/book/${match[1]}/read?c=${match[2]}`} replace />
  }
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <BookProvider>
      <ThemeEffect />
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/book/:bookId" element={<BookDetailPage />} />
              <Route path="/book/:bookId/read" element={<ReaderPage />} />
              <Route path="/book/:bookId/chapter/:chapterId" element={<ChapterToRead />} />
              <Route path="/tools" element={<ToolsHubPage />} />
              <Route path="/khisal-assessment" element={<KhisalAssessmentPage />} />
              <Route path="/speed-reader" element={<SpeedReaderPage />} />
              <Route path="/trait-tree" element={<TraitTreePage />} />
              <Route path="/mindmap" element={<MindmapPage />} />
              <Route path="/reading-plan" element={<ReadingPlanPage />} />
              <Route path="/habit-tracker" element={<HabitTrackerPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/highlights" element={<HighlightsPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:collectionId" element={<CollectionDetailPage />} />
              <Route path="/quotes" element={<QuotesPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/reading-stats" element={<StatsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/more" element={<MorePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </BookProvider>
  )
}
