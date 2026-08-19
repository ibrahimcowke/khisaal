import { useBook } from '../context/BookContext'
import { HeroHeader } from '../components/home/HeroHeader'
import { ContinueReadingCard } from '../components/home/ContinueReadingCard'
import { DailyGoalCard } from '../components/home/DailyGoalCard'
import { QuickActionsHub } from '../components/home/QuickActionsHub'
import { QuoteOfDayCard } from '../components/home/QuoteOfDayCard'
import { ChapterGridExplorer } from '../components/home/ChapterGridExplorer'
import { WeeklyActivityMiniCard } from '../components/home/WeeklyActivityMiniCard'
import { RecentlyReadSection, RecentHighlightsSection } from '../components/home/RecentSections'

export default function HomePage() {
  const { index, loading } = useBook()

  if (loading || !index) {
    return (
      <div className="min-h-screen flex items-center justify-center text-app-text-secondary">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-3 border-app-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-display text-lg text-app-accent">إمتاع القارئ</p>
          <p className="text-xs text-app-text-secondary">جارٍ تجهيز الكتاب والمكتبة...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-12 space-y-7 animate-fade-in">
      <HeroHeader />
      <ContinueReadingCard index={index} />
      <DailyGoalCard bookId={index.book.id} />
      <QuickActionsHub />
      <QuoteOfDayCard index={index} />
      <ChapterGridExplorer index={index} />
      <WeeklyActivityMiniCard bookId={index.book.id} />
      <RecentHighlightsSection index={index} />
      <RecentlyReadSection index={index} />
    </div>
  )
}
