import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Chapter, ContentBlock } from '../../lib/types'

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
  const [size, setSize] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 800, h: typeof window !== 'undefined' ? window.innerHeight : 600 })
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
 * Measures each block's real rendered height in an offscreen container that mirrors the
 * visible paginated layout, then packs blocks into pages that fit the available
 * viewport height. Recomputes automatically on typography or window resize.
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
  const [pages, setPages] = useState<ContentBlock[][]>([])
  const [ready, setReady] = useState(false)
  const { h: windowHeight } = useDebouncedWindowSize()

  useLayoutEffect(() => {
    if (!active || !chapter || !measureRef.current) return
    setReady(false)

    const raf = requestAnimationFrame(() => {
      const container = measureRef.current
      if (!container) return
      const nodes = Array.from(container.querySelectorAll<HTMLElement>('[data-measure-block]'))
      const heights = nodes.map((n) => n.offsetHeight)

      // Available vertical height for content: screen height minus header/footer padding
      const available = Math.max(220, windowHeight - 140)

      const packed: ContentBlock[][] = []
      let current: ContentBlock[] = []
      let currentHeight = 0

      chapter.blocks.forEach((block, i) => {
        const h = heights[i] ?? (fontSize * lineHeight * 2)
        if (current.length > 0 && currentHeight + h > available) {
          packed.push(current)
          current = []
          currentHeight = 0
        }
        current.push(block)
        currentHeight += h
      })

      if (current.length > 0) packed.push(current)
      if (packed.length === 0) packed.push([])

      setPages(packed)
      setReady(true)
    })

    return () => cancelAnimationFrame(raf)
  }, [active, chapter, fontFamily, fontSize, lineHeight, paragraphSpacing, textWidth, textAlign, windowHeight])

  return { pages, ready, measureRef }
}
