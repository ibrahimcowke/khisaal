import { useEffect, useState, useCallback } from 'react'

export interface ActiveSelection {
  blockId: string
  text: string
  startOffset: number
  endOffset: number
  rect: DOMRect
}

function offsetWithin(root: Element, node: Node, nodeOffset: number): number {
  let total = 0
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let current = walker.nextNode()
  while (current) {
    if (current === node) {
      return total + nodeOffset
    }
    total += current.textContent?.length ?? 0
    current = walker.nextNode()
  }
  return total
}

export function useTextSelection(containerRef: React.RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState<ActiveSelection | null>(null)

  const clear = useCallback(() => setSelection(null), [])

  useEffect(() => {
    function handleSelectionChange() {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setSelection(null)
        return
      }
      const range = sel.getRangeAt(0)
      const text = sel.toString().trim()
      if (!text) {
        setSelection(null)
        return
      }
      const container = containerRef.current
      if (!container || !container.contains(range.commonAncestorContainer)) {
        return
      }
      let blockEl = (range.commonAncestorContainer instanceof Element
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement
      )?.closest('[data-block-id]') as HTMLElement | null

      if (!blockEl) return
      const blockId = blockEl.getAttribute('data-block-id')!
      const startOffset = offsetWithin(blockEl, range.startContainer, range.startOffset)
      const endOffset = offsetWithin(blockEl, range.endContainer, range.endOffset)
      const rect = range.getBoundingClientRect()

      setSelection({ blockId, text, startOffset, endOffset, rect })
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [containerRef])

  return { selection, clear }
}
