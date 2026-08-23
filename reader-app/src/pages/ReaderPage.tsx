import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, Maximize, Minimize, PlayCircle, ChevronRight, ChevronLeft, Mic, GitBranch, Calendar, Sparkles } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { db, uid } from '../lib/db'
import { chapterProgress as computeChapterProgress, overallProgress as computeOverallProgress, estimateMinutes } from '../lib/bookData'
import { createAnchor } from '../lib/textAnchor'
import { useSettingsStore, FONT_FAMILY_MAP, LINE_HEIGHT_MAP } from '../store/settingsStore'
import { usePositionStore } from '../store/positionStore'
import { BlockRenderer } from '../components/reader/BlockRenderer'
import { ReaderTopBar } from '../components/reader/ReaderTopBar'
import { ReaderBottomBar } from '../components/reader/ReaderBottomBar'
import { TocSheet } from '../components/reader/TocSheet'
import { ReaderSettingsSheet } from '../components/reader/ReaderSettingsSheet'
import { ReaderSearchSheet } from '../components/reader/ReaderSearchSheet'
import { NoteEditorSheet } from '../components/reader/NoteEditorSheet'
import { SelectionToolbar } from '../components/reader/SelectionToolbar'
import { useTextSelection } from '../components/reader/useTextSelection'
import { MoreMenu } from '../components/reader/MoreMenu'
import { TtsBar } from '../components/reader/TtsBar'
import { useTts } from '../components/reader/useTts'
import { useAutoScroll } from '../components/reader/useAutoScroll'
import { AutoScrollBar } from '../components/reader/AutoScrollBar'
import { useWakeLock } from '../components/reader/useWakeLock'
import { WordLookupSheet } from '../components/reader/WordLookupSheet'
import { FocusRuler } from '../components/reader/FocusRuler'
import { QuoteStudioModal } from '../components/quotes/QuoteStudioModal'
import { AiExplainerSheet } from '../components/reader/AiExplainerSheet'
import { VoiceNotesSheet } from '../components/reader/VoiceNotesSheet'
import { ChapterHeaderBanner } from '../components/reader/ChapterHeaderBanner'
import { NextChapterCard } from '../components/reader/NextChapterCard'
import { FloatingDesktopNav } from '../components/reader/FloatingDesktopNav'
import { TopReadingProgressLine } from '../components/reader/TopReadingProgressLine'
import { IconButton } from '../components/ui/IconButton'
import type { HighlightColor } from '../lib/types'
import { usePagination, type TopicUnit } from '../components/reader/usePagination'
import { toArabicDigits } from '../lib/format'
import { useTranslation } from '../lib/i18n'
import { cn } from '../lib/cn'

export default function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { index, currentBookId, selectBook, loading } = useBook()
  const s = useSettingsStore()
  const position = usePositionStore()

  useEffect(() => {
    if (bookId && bookId !== currentBookId) {
      selectBook(bookId)
    }
  }, [bookId, currentBookId, selectBook])

  const chapterId = searchParams.get('c') || position.chapterId || index?.chapters[0]?.id || ''
  const chapter = index?.chapterById.get(chapterId) ?? null

  const [controlsVisible, setControlsVisible] = useState(true)
  const [tocOpen, setTocOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteContext, setNoteContext] = useState<{ blockId: string; text: string; startOffset: number; endOffset: number; highlightId?: string } | null>(null)
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null)
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null)
  const [ttsActive, setTtsActive] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [page, setPage] = useState(0) // for paginated mode
  const [lookupWord, setLookupWord] = useState<string | null>(null)
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string | undefined>(undefined)
  const [quoteStudioOpen, setQuoteStudioOpen] = useState(false)
  const [quoteStudioText, setQuoteStudioText] = useState('')
  const [aiExplainOpen, setAiExplainOpen] = useState(false)
  const [aiExplainText, setAiExplainText] = useState('')
  const [voiceNotesOpen, setVoiceNotesOpen] = useState(false)
  const navigate = useNavigate()

  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { selection, clear: clearSelection } = useTextSelection(containerRef)
  const tts = useTts()
  const autoScroll = useAutoScroll(s.autoScrollSpeed)
  useWakeLock(s.keepScreenOn)
  const sessionStartRef = useRef<number>(Date.now())
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const highlights = useLiveQuery(
    () => (index && chapterId ? db.highlights.where('chapterId').equals(chapterId).toArray() : []),
    [chapterId]
  )
  const bookmarks = useLiveQuery(
    () => (index ? db.bookmarks.where({ bookId: index.book.id, chapterId }).toArray() : []),
    [chapterId, index?.book.id]
  )
  const isBookmarked = (bookmarks?.length ?? 0) > 0

  // ---------- Redirect bare /read to last-known or first chapter ----------
  useEffect(() => {
    if (!index) return
    if (!searchParams.get('c')) {
      const c = position.chapterId && index.chapterById.has(position.chapterId) ? position.chapterId : index.chapters[0].id
      setSearchParams({ c }, { replace: true })
    }
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Stop transient playback state on chapter change ----------
  useEffect(() => {
    autoScroll.stop()
    tts.stop()
    setTtsActive(false)
  }, [chapterId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Session tracking ----------
  useEffect(() => {
    sessionStartRef.current = Date.now()
    position.startSession()
    return () => {
      const seconds = position.endSession()
      if (seconds > 2 && index && chapter) {
        position.addTodaySeconds(seconds)
        db.sessions.add({
          id: uid('session'),
          bookId: index.book.id,
          chapterId: chapter.id,
          startedAt: sessionStartRef.current,
          endedAt: Date.now(),
          durationSeconds: seconds,
        })
        db.history.add({
          id: uid('hist'),
          bookId: index.book.id,
          chapterId: chapter.id,
          visitedAt: Date.now(),
          durationSeconds: seconds,
        })
      }
    }
  }, [chapterId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Restore reading position on chapter load ----------
  useEffect(() => {
    if (!chapter) return
    setPage(0)
    const explicitBlock = searchParams.get('block')
    const targetBlockId = explicitBlock || (position.chapterId === chapterId ? position.blockId : chapter.blocks[0]?.id)
    requestAnimationFrame(() => {
      if (targetBlockId) {
        const el = document.querySelector(`[data-block-id="${targetBlockId}"]`)
        el?.scrollIntoView({ block: 'start', behavior: 'auto' })
      } else {
        window.scrollTo(0, 0)
      }
    })
  }, [chapterId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Track current block via IntersectionObserver, persist position ----------
  useEffect(() => {
    if (s.readingMode === 'paginated') return
    const blocks = document.querySelectorAll('[data-block-id]')
    if (blocks.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute('data-block-id')
          if (id) {
            setCurrentBlockId(id)
            if (index) position.setPosition(chapterId, id, 0)
          }
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: [0, 1] }
    )
    blocks.forEach((b) => observer.observe(b))
    return () => observer.disconnect()
  }, [chapterId, chapter?.blocks.length, s.readingMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Persist to Dexie (debounced) ----------
  useEffect(() => {
    if (!currentBlockId || !index) return
    const t = setTimeout(() => {
      db.positions.put({ bookId: index.book.id, chapterId, blockId: currentBlockId, scrollRatio: 0, updatedAt: Date.now() })
    }, 800)
    return () => clearTimeout(t)
  }, [currentBlockId, chapterId, index])

  // ---------- Auto-hide controls ----------
  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3200)
  }, [])

  const showControls = useCallback(() => {
    setControlsVisible(true)
    resetHideTimer()
  }, [resetHideTimer])

  useEffect(() => {
    showControls()
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [chapterId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Keyboard shortcuts ----------
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'f' || e.key === 'F') {
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) toggleFullscreen()
      }
      if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen()
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (s.readingMode === 'paginated') {
        if (e.key === 'ArrowLeft' || e.key === 'PageDown') goPage(1)
        if (e.key === 'ArrowRight' || e.key === 'PageUp') goPage(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [s.readingMode, page]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
      setFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setFullscreen(false)
    }
  }

  // ---------- Pagination (measured real heights for accurate page breaks) ----------
  const fontFamily = FONT_FAMILY_MAP[s.fontFamily]
  const lineHeightValue = LINE_HEIGHT_MAP[s.lineHeight]
  const effectiveTextWidth = s.edgeToEdgeDisplay ? 1080 : s.textWidth

  const { pages, topics, ready: pagesReady, isDesktop, measureRef } = usePagination({
    chapter,
    active: s.readingMode === 'paginated',
    fontFamily,
    fontSize: s.fontSize,
    lineHeight: lineHeightValue,
    paragraphSpacing: s.paragraphSpacing,
    textWidth: effectiveTextWidth,
    textAlign: s.textAlign,
  })

  useEffect(() => {
    if (pages.length > 0 && page >= pages.length) setPage(pages.length - 1)
  }, [pages, page])

  function goPage(dir: 1 | -1) {
    setPage((p) => {
      const next = p + dir
      if (next < 0) {
        const prev = index && chapter ? prevChapterOf() : null
        if (prev) {
          setSearchParams({ c: prev.id })
          return 0
        }
        return p
      }
      if (next >= pages.length) {
        const nxt = index && chapter ? nextChapterOf() : null
        if (nxt) {
          setSearchParams({ c: nxt.id })
          return 0
        }
        return p
      }
      return next
    })
  }

  function nextChapterOf() {
    if (!index || !chapter) return null
    const order = index.chapterOrder.get(chapter.id)!
    return index.chapters[order + 1] ?? null
  }
  function prevChapterOf() {
    if (!index || !chapter) return null
    const order = index.chapterOrder.get(chapter.id)!
    return index.chapters[order - 1] ?? null
  }

  // ---------- Tap zones ----------
  function handleReaderTap(e: React.MouseEvent<HTMLDivElement>) {
    if (window.getSelection()?.toString()) return
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const inverted = s.tapZonesInverted
    // Physical zones: left 25%, center 50%, right 25% (screen-space, not logical rtl)
    if (s.readingMode === 'paginated') {
      if (relX < 0.25) {
        goPage(inverted ? -1 : 1)
        return
      }
      if (relX > 0.75) {
        goPage(inverted ? 1 : -1)
        return
      }
    }
    if (controlsVisible) {
      setControlsVisible(false)
    } else {
      showControls()
    }
  }

  // ---------- Highlight / note / bookmark actions ----------
  async function handleCreateHighlight(color: HighlightColor) {
    if (!selection || !index || !chapter) return
    const blockData = chapter.blocks.find((b) => b.id === selection.blockId)
    if (!blockData?.text) return
    const anchor = createAnchor(blockData.text, selection.startOffset, selection.endOffset)
    await db.highlights.add({
      id: uid('hl'),
      bookId: index.book.id,
      chapterId: chapter.id,
      blockId: selection.blockId,
      text: anchor.text,
      prefix: anchor.prefix,
      suffix: anchor.suffix,
      startOffset: anchor.startOffset,
      endOffset: anchor.endOffset,
      color,
      tags: [],
      favorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    window.getSelection()?.removeAllRanges()
  }

  function handleOpenNote() {
    if (!selection) return
    setNoteContext({ blockId: selection.blockId, text: selection.text, startOffset: selection.startOffset, endOffset: selection.endOffset })
    setNoteOpen(true)
  }

  async function handleSaveNote(body: string, tags: string[]) {
    if (!noteContext || !index || !chapter) return
    await db.notes.add({
      id: uid('note'),
      bookId: index.book.id,
      chapterId: chapter.id,
      blockId: noteContext.blockId,
      selectedText: noteContext.text,
      body,
      tags,
      favorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    window.getSelection()?.removeAllRanges()
  }

  async function handleSaveQuote() {
    if (!selection || !index || !chapter) return
    const block = chapter.blocks.find((b) => b.id === selection.blockId)
    await db.quotes.add({
      id: uid('quote'),
      bookId: index.book.id,
      chapterId: chapter.id,
      text: selection.text,
      sourcePage: block?.sourcePage ?? chapter.sourcePageStart,
      tags: [],
      favorite: false,
      createdAt: Date.now(),
    })
    window.getSelection()?.removeAllRanges()
  }

  async function toggleBookmark() {
    if (!index || !chapter) return
    if (isBookmarked && bookmarks) {
      await db.bookmarks.bulkDelete(bookmarks.map((b) => b.id))
    } else {
      await db.bookmarks.add({
        id: uid('bm'),
        bookId: index.book.id,
        chapterId: chapter.id,
        blockId: currentBlockId ?? chapter.blocks[0]?.id ?? '',
        title: chapter.title,
        createdAt: Date.now(),
      })
    }
  }

  function handleScrub(ratio: number) {
    if (!chapter) return
    if (s.readingMode === 'paginated') {
      const target = Math.min(pages.length - 1, Math.max(0, Math.round(ratio * (pages.length - 1))))
      setPage(target)
      return
    }
    const idx = Math.min(chapter.blocks.length - 1, Math.max(0, Math.round(ratio * (chapter.blocks.length - 1))))
    const targetBlock = chapter.blocks[idx]
    if (targetBlock) {
      document.querySelector(`[data-block-id="${targetBlock.id}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }

  function jumpToChapter(id: string) {
    setSearchParams({ c: id })
    setTocOpen(false)
  }
  function jumpToBlock(cId: string, blockId: string) {
    if (cId !== chapterId) {
      setSearchParams({ c: cId })
      setTimeout(() => document.querySelector(`[data-block-id="${blockId}"]`)?.scrollIntoView({ block: 'center' }), 150)
    } else {
      document.querySelector(`[data-block-id="${blockId}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
    setTocOpen(false)
    setSearchOpen(false)
  }

  function handleHighlightClick(id: string) {
    setActiveHighlightId((cur) => (cur === id ? null : id))
  }

  function startTts() {
    if (!chapter) return
    const sentences = chapter.blocks.flatMap((b) => (b.text ? b.text.split(/(?<=[.؟!:])\s+/) : b.items ?? []))
    tts.speakSentences(sentences.filter(Boolean))
    setTtsActive(true)
  }

  if (loading || !index) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg text-app-text-secondary">
        جارٍ تحميل الكتاب...
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg text-app-text-secondary">
        لم يتم العثور على هذا الفصل
      </div>
    )
  }

  const cProgress = currentBlockId ? computeChapterProgress(index, chapterId, currentBlockId) : 0
  const oProgress = computeOverallProgress(index, chapterId)
  const wordsSeenIdx = currentBlockId ? chapter.blocks.findIndex((b) => b.id === currentBlockId) : 0
  const wordsRemaining = chapter.blocks.slice(wordsSeenIdx).reduce((acc, b) => acc + (b.text ?? (b.items ?? []).join(' ')).split(/\s+/).filter(Boolean).length, 0)
  const minutesRemaining = estimateMinutes(wordsRemaining)
  const lineHeight = lineHeightValue

  return (
    <div
      data-reader-theme={s.theme}
      className="min-h-screen bg-app-bg text-app-text reading-surface selection:bg-app-accent/20"
      onMouseMove={() => controlsVisible || showControls()}
    >
      <TopReadingProgressLine />

      <FloatingDesktopNav
        hasPrev={!!prevChapterOf()}
        hasNext={!!nextChapterOf()}
        onPrev={() => prevChapterOf() && setSearchParams({ c: prevChapterOf()!.id })}
        onNext={() => nextChapterOf() && setSearchParams({ c: nextChapterOf()!.id })}
        prevTitle={prevChapterOf()?.title}
        nextTitle={nextChapterOf()?.title}
      />

      <ReaderTopBar
        visible={controlsVisible}
        title={chapter.title}
        bookTitle={index.book.shortTitle}
        isBookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
        onOpenToc={() => setTocOpen(true)}
        onOpenSearch={() => {
          setPendingSearchQuery(undefined)
          setSearchOpen(true)
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenMore={() => {}}
      />

      {/* Desktop-only extra actions row anchored top-left */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden md:flex fixed top-3 left-3 z-30 items-center gap-1"
          >
            <MoreMenu
              trigger={
                <IconButton aria-label="خيارات إضافية" title="أدوات وميزات إضافية">
                  <Sparkles size={18} />
                </IconButton>
              }
              items={[
                { label: 'تسجيل ملاحظة صوتية', icon: <Mic size={15} />, onClick: () => setVoiceNotesOpen(true) },
                { label: 'شجرة وخريطة الخصال', icon: <GitBranch size={15} />, onClick: () => navigate('/trait-tree') },
                { label: 'ختمة الـ 30 يوماً', icon: <Calendar size={15} />, onClick: () => navigate('/reading-plan') },
                { label: 'الاستماع الصوتي للفصل', icon: <Volume2 size={15} />, onClick: startTts },
                {
                  label: autoScroll.active ? 'إيقاف التمرير التلقائي' : 'بدء التمرير التلقائي',
                  icon: <PlayCircle size={15} />,
                  onClick: () => (autoScroll.active ? autoScroll.stop() : autoScroll.start()),
                },
                {
                  label: fullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة',
                  icon: fullscreen ? <Minimize size={15} /> : <Maximize size={15} />,
                  onClick: toggleFullscreen,
                },
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {s.readingMode === 'paginated' && chapter && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            top: -99999,
            right: -99999,
            visibility: 'hidden',
            pointerEvents: 'none',
            width: Math.min(s.textWidth, window.innerWidth - 40),
            fontFamily,
            fontSize: s.fontSize,
            lineHeight,
          }}
        >
          <div ref={measureRef}>
            {topics.map((topic) => (
              <div key={topic.id} data-measure-topic={topic.id} className="mb-6 p-5">
                {topic.blocks.map((block) => (
                  <BlockRenderer key={block.id} block={block} highlights={[]} activeHighlightId={null} onHighlightClick={() => {}} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        onClick={handleReaderTap}
        className="pt-14 sm:pt-16 pb-28 px-4 sm:px-6 md:px-8 min-h-screen transition-all duration-150"
        style={{
          filter: s.brightnessOverlay > 0 ? undefined : undefined,
        }}
      >
        {s.readingMode === 'paginated' ? (
          !pagesReady ? (
            <div className="flex items-center justify-center min-h-[70vh] text-app-muted text-sm">جارٍ تجهيز الصفحات...</div>
          ) : (
            <PaginatedView
              pageTopics={pages[page] ?? []}
              fontFamily={fontFamily}
              fontSize={s.fontSize}
              lineHeight={lineHeight}
              textWidth={effectiveTextWidth}
              highlights={highlights ?? []}
              activeHighlightId={activeHighlightId}
              onHighlightClick={handleHighlightClick}
              pageIndex={page}
              pageCount={pages.length}
              chapter={chapter}
              chapterNumber={(index.chapterOrder.get(chapterId) ?? 0) + 1}
              nextChapter={nextChapterOf()}
              onNextPage={() => goPage(1)}
              onPrevPage={() => goPage(-1)}
              onNextChapter={() => {
                const nxt = nextChapterOf()
                if (nxt) setSearchParams({ c: nxt.id })
              }}
              onOpenToc={() => setTocOpen(true)}
              isDesktop={isDesktop}
            />
          )
        ) : (
          <div
            ref={scrollRef}
            className="mx-auto"
            style={{
              maxWidth: effectiveTextWidth,
              fontFamily,
              fontSize: s.fontSize,
              lineHeight,
              columnCount: s.readingMode === 'columns' ? 2 : undefined,
              columnGap: s.readingMode === 'columns' ? '3.5rem' : undefined,
            }}
          >
            <ChapterHeaderBanner
              chapter={chapter}
              chapterNumber={(index.chapterOrder.get(chapterId) ?? 0) + 1}
            />

            {topics.map((topic) => (
              <div
                key={topic.id}
                className={cn(
                  'break-inside-avoid mb-6',
                  s.readingMode === 'columns' ? 'p-4 rounded-2xl bg-app-surface/40 border border-app-border/60' : ''
                )}
              >
                {topic.blocks.map((block) => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    highlights={highlights ?? []}
                    activeHighlightId={activeHighlightId}
                    onHighlightClick={handleHighlightClick}
                    isCurrent={block.id === currentBlockId}
                    dimmed={s.readingMode === 'focus' && currentBlockId !== null && block.id !== currentBlockId}
                  />
                ))}
              </div>
            ))}

            <NextChapterCard
              nextChapter={nextChapterOf()}
              onNext={() => nextChapterOf() && setSearchParams({ c: nextChapterOf()!.id })}
              onOpenToc={() => setTocOpen(true)}
              isLastChapter={!nextChapterOf()}
            />
          </div>
        )}
      </div>



      <ReaderBottomBar
        visible={controlsVisible}
        chapterLabel={`الفصل ${toArabicDigits(index.chapterOrder.get(chapterId)! + 1)}: ${chapter.title}`}
        chapterProgress={s.readingMode === 'paginated' ? Math.round(((page + 1) / Math.max(1, pages.length)) * 100) : cProgress}
        overallProgress={oProgress}
        timeRemainingLabel={`${toArabicDigits(minutesRemaining)} د متبقية`}
        onScrub={handleScrub}
        onPrev={() => (prevChapterOf() ? setSearchParams({ c: prevChapterOf()!.id }) : undefined)}
        onNext={() => (nextChapterOf() ? setSearchParams({ c: nextChapterOf()!.id }) : undefined)}
        hasPrev={!!prevChapterOf()}
        hasNext={!!nextChapterOf()}
      />

      <FocusRuler />

      <AnimatePresence>
        {selection && (
          <SelectionToolbar
            selection={selection}
            onHighlight={handleCreateHighlight}
            onNote={handleOpenNote}
            onSearchSelected={() => {
              setPendingSearchQuery(selection.text)
              setSearchOpen(true)
            }}
            onSaveQuote={handleSaveQuote}
            onLookup={() => setLookupWord(selection.text.trim().split(/\s+/)[0] ?? selection.text)}
            onCardQuote={() => {
              setQuoteStudioText(selection.text)
              setQuoteStudioOpen(true)
            }}
            onAiExplain={() => {
              setAiExplainText(selection.text)
              setAiExplainOpen(true)
            }}
            onDismiss={clearSelection}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ttsActive && (
          <TtsBar
            tts={tts}
            currentBlockIndex={tts.currentIndex}
            totalBlocks={chapter?.blocks.length || 1}
            onClose={() => {
              tts.stop()
              setTtsActive(false)
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {autoScroll.active && (
          <AutoScrollBar
            paused={autoScroll.paused}
            speed={s.autoScrollSpeed}
            onSpeedChange={s.setAutoScrollSpeed}
            onTogglePause={autoScroll.togglePause}
            onStop={autoScroll.stop}
          />
        )}
      </AnimatePresence>
      {lookupWord && (
        <WordLookupSheet
          open={!!lookupWord}
          onOpenChange={(v) => !v && setLookupWord(null)}
          word={lookupWord}
          onSearchInBook={(word) => {
            setPendingSearchQuery(word)
            setSearchOpen(true)
          }}
        />
      )}

      <TocSheet
        open={tocOpen}
        onOpenChange={setTocOpen}
        index={index}
        currentChapterId={chapterId}
        onSelectChapter={jumpToChapter}
        onSelectBookmark={jumpToBlock}
      />
      <ReaderSettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ReaderSearchSheet
        open={searchOpen}
        onOpenChange={setSearchOpen}
        index={index}
        currentChapterId={chapterId}
        onJump={jumpToBlock}
        initialQuery={pendingSearchQuery}
      />
      {noteContext && (
        <NoteEditorSheet
          open={noteOpen}
          onOpenChange={setNoteOpen}
          selectedText={noteContext.text}
          onSave={handleSaveNote}
        />
      )}
      <QuoteStudioModal
        open={quoteStudioOpen}
        onOpenChange={setQuoteStudioOpen}
        quoteText={quoteStudioText}
        sourceChapterTitle={chapter?.title}
        bookTitle={index?.book.title}
        author={index?.book.author}
      />
      <AiExplainerSheet
        open={aiExplainOpen}
        onOpenChange={setAiExplainOpen}
        selectedText={aiExplainText}
        chapterTitle={chapter?.title}
        bookId={index?.book.id}
        chapterId={chapter?.id}
      />
      <VoiceNotesSheet
        open={voiceNotesOpen}
        onOpenChange={setVoiceNotesOpen}
        bookId={index?.book.id || ''}
        chapterId={chapter?.id || ''}
        chapterTitle={chapter?.title}
      />
    </div>
  )
}

function PaginatedView({
  pageTopics,
  fontFamily,
  fontSize,
  lineHeight,
  textWidth,
  highlights,
  activeHighlightId,
  onHighlightClick,
  pageIndex,
  pageCount,
  chapter,
  chapterNumber,
  nextChapter,
  onNextPage,
  onPrevPage,
  onNextChapter,
  onOpenToc,
  isDesktop,
}: {
  pageTopics: TopicUnit[]
  fontFamily: string
  fontSize: number
  lineHeight: number
  textWidth: number
  highlights: any[]
  activeHighlightId: string | null
  onHighlightClick: (id: string) => void
  pageIndex: number
  pageCount: number
  chapter: any
  chapterNumber: number
  nextChapter: any
  onNextPage: () => void
  onPrevPage: () => void
  onNextChapter: () => void
  onOpenToc: () => void
  isDesktop: boolean
}) {
  const { t, isRtl, formatDigits } = useTranslation()
  const isFirstPage = pageIndex === 0
  const isLastPage = pageIndex === pageCount - 1
  const isMultiTopicDesktop = isDesktop && pageTopics.length >= 2

  return (
    <div className="flex flex-col items-center justify-between min-h-[78vh] py-2">
      <motion.div
        key={pageIndex}
        initial={{ opacity: 0, x: isRtl ? -15 : 15 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isRtl ? 15 : -15 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          const swipeThreshold = 40
          const velocityThreshold = 400
          if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
            // Dragged to the right
            if (isRtl) {
              onPrevPage()
            } else {
              onPrevPage()
            }
          } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
            // Dragged to the left
            if (isRtl) {
              onNextPage()
            } else {
              onNextPage()
            }
          }
        }}
        className="mx-auto w-full flex-1 touch-pan-y"
        style={{ maxWidth: isMultiTopicDesktop ? Math.max(textWidth, 1100) : textWidth, fontFamily, fontSize, lineHeight }}
      >
        {isFirstPage && chapter && (
          <div className="mb-6">
            <ChapterHeaderBanner chapter={chapter} chapterNumber={chapterNumber} />
          </div>
        )}

        <div
          className={cn(
            isMultiTopicDesktop
              ? 'grid grid-cols-1 md:grid-cols-2 gap-8 items-start'
              : 'flex flex-col gap-6'
          )}
        >
          {pageTopics.map((topic) => (
            <div
              key={topic.id}
              className="topic-card p-6 sm:p-8 rounded-3xl bg-app-surface/90 backdrop-blur-xs border border-app-border/90 shadow-xs flex flex-col justify-start"
            >
              {topic.blocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  highlights={highlights}
                  activeHighlightId={activeHighlightId}
                  onHighlightClick={onHighlightClick}
                />
              ))}
            </div>
          ))}
        </div>

        {isLastPage && (
          <div className="mt-8">
            <NextChapterCard
              nextChapter={nextChapter}
              onNext={onNextChapter}
              onOpenToc={onOpenToc}
              isLastChapter={!nextChapter}
            />
          </div>
        )}
      </motion.div>

      {/* Page Turn Controller Bar at Bottom */}
      <div className="mt-8 flex items-center justify-center gap-3 pt-3 border-t border-app-border/40 select-none">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrevPage()
          }}
          disabled={isFirstPage && !chapter}
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-app-border bg-app-surface text-app-text hover:text-app-accent hover:border-app-accent disabled:opacity-30 transition-all active:scale-95 shadow-xs group"
          title={t('prevPage')}
        >
          {isRtl ? <ChevronRight size={14} className="text-app-muted group-hover:text-app-accent transition-colors" /> : <ChevronLeft size={14} className="text-app-muted group-hover:text-app-accent transition-colors" />}
          <span>{t('prevPage')}</span>
        </button>

        <span className="text-xs font-bold text-app-accent bg-app-accent/10 px-3.5 py-1.5 rounded-full border border-app-accent/20">
          {t('pageOf', { current: formatDigits(pageIndex + 1), total: formatDigits(pageCount) })}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onNextPage()
          }}
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-app-border bg-app-surface text-app-text hover:text-app-accent hover:border-app-accent transition-all active:scale-95 shadow-xs group"
          title={t('nextPage')}
        >
          <span>{t('nextPage')}</span>
          {isRtl ? <ChevronLeft size={14} className="text-app-muted group-hover:text-app-accent transition-colors" /> : <ChevronRight size={14} className="text-app-muted group-hover:text-app-accent transition-colors" />}
        </button>
      </div>
    </div>
  )
}
