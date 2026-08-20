import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Chapter, ContentBlock } from '../../lib/types'

export interface TopicUnit {
  id: string
  title?: string
  sourcePage?: number
  blocks: ContentBlock[]
}

/**
 * Groups a chapter's blocks into discrete, atomic topics/khisals.
 * A single topic/khislah is never split across pages.
 */
export function groupChapterIntoTopics(chapter: Chapter | null): TopicUnit[] {
  if (!chapter || !chapter.blocks || chapter.blocks.length === 0) return []

  const topics: TopicUnit[] = []
  let current: ContentBlock[] = []

  function isTopicStart(block: ContentBlock, idx: number, prevBlock?: ContentBlock): boolean {
    if (idx === 0) return true
    if (prevBlock && prevBlock.type === 'divider') return true
    if (block.type === 'heading') return true
    if (block.text) {
      const t = block.text.trim()
      // Numbered khisal items (e.g., "1. ", "2. ", "١. ", "٢. ")
      if (/^\s*(\d+|[\u0660-\u0669]+)[.\-)]\s+/.test(t)) return true
      // Specific khisal / section prefixes
      if (/^(الخصلة|خصلة|المفسد|أولاً|ثانياً|ثالثاً|رابعاً|خامساً|سادساً|سابعاً|ثامناً|تاسعاً|عاشراً|فائدة|حكمة|مسألة|تنبيه|وقفة|باب|فصل)/.test(t)) return true
      // Quotes or narrative openings if the previous topic already contains content
      if (/^•?\s*(قال|سأل|روي|قيل|عن|من أصدق|من أجمل|من روائع|بيات وجمل|مفسدات|ثلاث|أربعة|خمسة|ستة)/.test(t) && block.type === 'paragraph') {
        if (current.length >= 2 || (current.length >= 1 && current.some((b) => b.type === 'list' || b.type === 'callout' || b.type === 'quote'))) {
          return true
        }
      }
    }
    return false
  }

  chapter.blocks.forEach((block, idx) => {
    const prev = chapter.blocks[idx - 1]
    if (isTopicStart(block, idx, prev) && current.length > 0) {
      topics.push({
        id: current[0].id,
        sourcePage: current[0].sourcePage,
        blocks: current,
      })
      current = []
    }
    current.push(block)
  })

  if (current.length > 0) {
    topics.push({
      id: current[0].id,
      sourcePage: current[0].sourcePage,
      blocks: current,
    })
  }

  return topics
}

interface PaginationInput {
  chapter: Chapter | null
  active: boolean
  fontFamily: string
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
  textWidth: number
  textAlign: 'right' | 'justify'
}

function useDebouncedWindowSize(delay = 150) {
  const [size, setSize] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 800,
    h: typeof window !== 'undefined' ? window.innerHeight : 600,
  })
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    function onResize() {
      clearTimeout(t)
      t = setTimeout(() => setSize({ w: window.innerWidth, h: window.innerHeight }), delay)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(t)
    }
  }, [delay])
  return size
}

/**
 * Topic-Aware Pagination:
 * - Measures entire topic units (never breaks a single topic / khislah across pages).
 * - On Mobile: guarantees at least 1 topic per page.
 * - On Desktop: guarantees at least 2 topics per page (when >= 2 topics exist).
 */
export function usePagination({
  chapter,
  active,
  fontFamily,
  fontSize,
  lineHeight,
  paragraphSpacing,
  textWidth,
  textAlign,
}: PaginationInput) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [pages, setPages] = useState<TopicUnit[][]>([])
  const [ready, setReady] = useState(false)
  const { w: windowWidth, h: windowHeight } = useDebouncedWindowSize()

  const isDesktop = windowWidth >= 768
  const topics = useMemo(() => groupChapterIntoTopics(chapter), [chapter])

  useLayoutEffect(() => {
    if (!active || !chapter || topics.length === 0 || !measureRef.current) return
    setReady(false)

    const raf = requestAnimationFrame(() => {
      const container = measureRef.current
      if (!container) return
      const nodes = Array.from(container.querySelectorAll<HTMLElement>('[data-measure-topic]'))
      const heights = nodes.map((n) => n.offsetHeight)

      // Available vertical height: screen height minus topbar & bottombar margins
      const available = Math.max(300, windowHeight - 160)
      const minTopicsPerPage = isDesktop ? 2 : 1

      const packed: TopicUnit[][] = []
      let current: TopicUnit[] = []
      let currentHeight = 0

      topics.forEach((topic, i) => {
        const h = heights[i] ?? 200

        if (current.length === 0) {
          current.push(topic)
          currentHeight = h
        } else if (current.length < minTopicsPerPage) {
          // Mandatory minimum topics on page (e.g. at least 2 on desktop, at least 1 on mobile)
          current.push(topic)
          currentHeight += h
        } else {
          // Check if adding this complete topic exceeds available page height
          if (currentHeight + h <= available) {
            current.push(topic)
            currentHeight += h
          } else {
            // Finalize page with complete topics, start new page
            packed.push(current)
            current = [topic]
            currentHeight = h
          }
        }
      })

      if (current.length > 0) packed.push(current)

      // Balance desktop pages: ensure the final page also has at least 2 topics if possible
      if (isDesktop && packed.length > 1) {
        const lastPage = packed[packed.length - 1]
        if (lastPage.length < 2) {
          const prevPage = packed[packed.length - 2]
          packed[packed.length - 2] = [...prevPage, ...lastPage]
          packed.pop()
        }
      }

      if (packed.length === 0) packed.push([])

      setPages(packed)
      setReady(true)
    })

    return () => cancelAnimationFrame(raf)
  }, [active, chapter, fontFamily, fontSize, lineHeight, paragraphSpacing, textWidth, textAlign, windowHeight, windowWidth, isDesktop, topics])

  return { pages, topics, totalPages: pages.length, ready, isDesktop, measureRef }
}

