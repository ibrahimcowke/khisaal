import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { BookProvider } from './context/BookContext'
import { ThemeEffect } from './context/ThemeEffect'

const HomePage = lazy(() => import('./pages/HomePage'))
const LibraryPage = lazy(() => import('./pages/LibraryPage'))
const BookDetailPage = lazy(() => import('./pages/BookDetailPage'))
const ReaderPage = lazy(() => import('./pages/ReaderPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'))
const HighlightsPage = lazy(() => import('./pages/HighlightsPage'))
const NotesPage = lazy(() => import('./pages/NotesPage'))
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'))
const CollectionDetailPage = lazy(() => import('./pages/CollectionDetailPage'))
const QuotesPage = lazy(() => import('./pages/QuotesPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const EditorPage = lazy(() => import('./pages/EditorPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const MorePage = lazy(() => import('./pages/MorePage'))
const TraitTreePage = lazy(() => import('./pages/TraitTreePage'))
const ReadingPlanPage = lazy(() => import('./pages/ReadingPlanPage'))
const HabitTrackerPage = lazy(() => import('./pages/HabitTrackerPage'))
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage'))
const MindmapPage = lazy(() => import('./pages/MindmapPage'))

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
