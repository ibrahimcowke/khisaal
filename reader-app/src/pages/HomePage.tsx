import { useBook } from '../context/BookContext'
import { HeroHeader } from '../components/home/HeroHeader'
import { ContinueReadingCard } from '../components/home/ContinueReadingCard'
import { DailyGoalCard } from '../components/home/DailyGoalCard'
import { QuickActionsHub } from '../components/home/QuickActionsHub'
import { QuoteOfDayCard } from '../components/home/QuoteOfDayCard'
import { ChapterGridExplorer } from '../components/home/ChapterGridExplorer'
import { WeeklyActivityMiniCard } from '../components/home/WeeklyActivityMiniCard'
import { RecentlyReadSection, RecentHighlightsSection } from '../components/home/RecentSections'
import { DailyTraitWidget } from '../components/home/DailyTraitWidget'
import { PwaInstallCard } from '../components/ui/PwaInstallCard'

export default function HomePage() {
  const { index, loading } = useBook()

  if (loading || !index) {
    return (
      <div className="min-h-screen flex items-center justify-center text-app-text-secondary">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-app-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-display text-xl font-bold text-app-accent">إمتاع القارئ وموسوعة الخصال</p>
          <p className="text-xs text-app-text-secondary">جارٍ تجهيز الكتاب والمكتبة والبيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20 animate-fade-in space-y-6 sm:space-y-8">
      {/* Grand Hero Welcome Header */}
      <HeroHeader />

      {/* PWA Install Promotion Card */}
      <PwaInstallCard />

      {/* Responsive Bento Grid: Main Feed (8 cols on Desktop) + Analytics & Tools Hub (4 cols on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Main Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-7">
          <ContinueReadingCard index={index} />
          <DailyTraitWidget />
          <QuoteOfDayCard index={index} />
          <ChapterGridExplorer index={index} />
          <div className="space-y-6 pt-2">
            <RecentlyReadSection index={index} />
            <RecentHighlightsSection index={index} />
          </div>
        </div>

        {/* Sidebar Insights & Tools Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 sm:space-y-7 sticky top-6">
          <DailyGoalCard bookId={index.book.id} />
          <QuickActionsHub />
          <WeeklyActivityMiniCard bookId={index.book.id} />
        </div>
      </div>
    </div>
  )
}
