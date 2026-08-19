import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PositionState {
  chapterId: string | null
  blockId: string | null
  scrollRatio: number
  updatedAt: number
  sessionStartedAt: number | null
  todaySeconds: number
  todayDateKey: string
  streakDays: number
  lastReadDateKey: string | null

  setPosition: (chapterId: string, blockId: string, scrollRatio: number) => void
  startSession: () => void
  endSession: () => number // returns seconds elapsed
  addTodaySeconds: (seconds: number) => void
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export const usePositionStore = create<PositionState>()(
  persist(
    (set, get) => ({
      chapterId: null,
      blockId: null,
      scrollRatio: 0,
      updatedAt: 0,
      sessionStartedAt: null,
      todaySeconds: 0,
      todayDateKey: todayKey(),
      streakDays: 0,
      lastReadDateKey: null,

      setPosition: (chapterId, blockId, scrollRatio) =>
        set({ chapterId, blockId, scrollRatio, updatedAt: Date.now() }),

      startSession: () => set({ sessionStartedAt: Date.now() }),

      endSession: () => {
        const { sessionStartedAt } = get()
        if (!sessionStartedAt) return 0
        const seconds = Math.round((Date.now() - sessionStartedAt) / 1000)
        set({ sessionStartedAt: null })
        return seconds
      },

      addTodaySeconds: (seconds) =>
        set((s) => {
          const key = todayKey()
          const isNewDay = key !== s.todayDateKey
          const prevDay = s.todayDateKey
          let streak = s.streakDays
          let lastReadDateKey = s.lastReadDateKey

          if (isNewDay) {
            // determine streak continuity: was prevDay yesterday relative to key?
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
            if (prevDay === yesterday || lastReadDateKey === yesterday) {
              streak = streak + 1
            } else if (lastReadDateKey !== key) {
              streak = 1
            }
            lastReadDateKey = key
            return {
              todaySeconds: seconds,
              todayDateKey: key,
              streakDays: streak,
              lastReadDateKey,
            }
          }
          if (s.streakDays === 0) {
            streak = 1
            lastReadDateKey = key
          }
          return { todaySeconds: s.todaySeconds + seconds, streakDays: streak, lastReadDateKey }
        }),
    }),
    { name: 'imtaa-reader-position' }
  )
)
