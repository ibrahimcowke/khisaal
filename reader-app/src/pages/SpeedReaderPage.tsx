import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Zap, Sliders, BookOpen, FastForward, Rewind } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { useTranslation } from '../lib/i18n'
import { toArabicDigits } from '../lib/format'
import { useBook } from '../context/BookContext'

export default function SpeedReaderPage() {
  const { index } = useBook()
  const { isRtl } = useTranslation()

  const [wpm, setWpm] = useState(250)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [chunkSize, setChunkSize] = useState<1 | 2>(1)
  const [selectedChapterId, setSelectedChapterId] = useState<string>('')
  const [customText, setCustomText] = useState<string>('')
  const [isCustomMode, setIsCustomMode] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Extract words from chosen chapter or custom text
  const currentChapter = index?.chapters.find((c) => c.id === selectedChapterId) || index?.chapters[0]

  const words = (isCustomMode && customText.trim()
    ? customText.trim().split(/\s+/)
    : currentChapter?.blocks.flatMap((b) => (b.text ? b.text.split(/\s+/) : b.items ?? [])) ?? []
  ).filter(Boolean)

  useEffect(() => {
    if (index?.chapters[0]?.id && !selectedChapterId) {
      setSelectedChapterId(index.chapters[0].id)
    }
  }, [index, selectedChapterId])

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.round((60000 / wpm) * chunkSize)
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev + chunkSize >= words.length) {
            setIsPlaying(false)
            return words.length - 1
          }
          return prev + chunkSize
        })
      }, intervalMs)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, wpm, chunkSize, words.length])

  const handleTogglePlay = () => {
    if (currentIndex >= words.length - 1) {
      setCurrentIndex(0)
    }
    setIsPlaying((p) => !p)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentIndex(0)
  }

  const handleSkip = (amount: number) => {
    setCurrentIndex((prev) => Math.max(0, Math.min(words.length - 1, prev + amount)))
  }

  const displayedWords = words.slice(currentIndex, currentIndex + chunkSize).join(' ')
  const progressPercent = words.length > 0 ? Math.round((currentIndex / words.length) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-16">
      <PageHeader
        title={isRtl ? 'مختبر القراءة السريعة والتركيز (RSVP)' : 'Speed Reading & Focus Trainer'}
        subtitle={isRtl ? 'أداة تفاعلية لتدريب العين وتنمية سرعة الاستيعاب والتركيز' : 'Interactive RSVP pacing tool to boost comprehension speed & focus'}
        backTo="/more"
      />

      <div className="space-y-6">
        {/* Source Selector */}
        <div className="p-4 rounded-2xl bg-app-surface border border-app-border space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-text flex items-center gap-1.5">
              <BookOpen size={14} className="text-app-accent" />
              {isRtl ? 'مصدر النص للتدريب:' : 'Reading Material Source:'}
            </span>

            <button
              onClick={() => {
                setIsCustomMode(!isCustomMode)
                setIsPlaying(false)
                setCurrentIndex(0)
              }}
              className="text-xs font-bold text-app-accent hover:underline cursor-pointer"
            >
              {isCustomMode ? (isRtl ? 'اختر من فصول الكتاب' : 'Choose Book Chapter') : (isRtl ? 'كتابة نص مخصص' : 'Custom Text')}
            </button>
          </div>

          {!isCustomMode ? (
            <select
              value={selectedChapterId}
              onChange={(e) => {
                setSelectedChapterId(e.target.value)
                setIsPlaying(false)
                setCurrentIndex(0)
              }}
              className="w-full p-2.5 rounded-xl border border-app-border bg-app-bg text-app-text text-xs font-medium outline-hidden focus:border-app-accent"
            >
              {index?.chapters.map((c, i) => (
                <option key={c.id} value={c.id}>
                  {`الفصل ${toArabicDigits(i + 1)}: ${c.title}`}
                </option>
              ))}
            </select>
          ) : (
            <textarea
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value)
                setCurrentIndex(0)
              }}
              placeholder={isRtl ? 'الصق أو اكتب أي نص هنا لبدء تمرين القراءة السريعة...' : 'Paste any text here to start speed reading practice...'}
              rows={3}
              className="w-full p-3 rounded-xl border border-app-border bg-app-bg text-app-text text-xs font-medium outline-hidden focus:border-app-accent resize-none"
            />
          )}
        </div>

        {/* Display Stage (RSVP Word Screen) */}
        <div className="relative min-h-55 sm:min-h-65 p-8 rounded-3xl bg-app-surface border-2 border-app-accent/30 shadow-lg flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Subtle Arabesque Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-9xl font-display select-none">
            ❖
          </div>

          {/* Focal Guides */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-app-accent/20 rounded-full" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-app-accent/20 rounded-full" />

          <p className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-app-text transition-all leading-tight px-4 select-none">
            {displayedWords || (isRtl ? 'اضغط تشغيل للبدء' : 'Press Play to Start')}
          </p>

          <div className="absolute bottom-3 inset-x-6 flex items-center justify-between text-[11px] text-app-muted font-sans font-medium">
            <span>{toArabicDigits(currentIndex + 1)} / {toArabicDigits(words.length)} كلمة</span>
            <span>{toArabicDigits(progressPercent)}%</span>
          </div>
        </div>

        {/* Progress scrub line */}
        <div className="h-1.5 w-full bg-app-border rounded-full overflow-hidden">
          <div
            className="h-full bg-app-accent transition-all duration-150 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Playback Controls */}
        <div className="p-4 sm:p-5 rounded-2xl bg-app-surface border border-app-border shadow-xs space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => handleSkip(-10)}
              className="p-2.5 rounded-xl border border-app-border bg-app-bg text-app-text hover:text-app-accent hover:border-app-accent active:scale-95 transition-all shadow-2xs cursor-pointer touch-manipulation"
              title={isRtl ? 'تراجع 10 كلمات' : 'Rewind 10 words'}
            >
              <Rewind size={18} />
            </button>

            <Button
              size="lg"
              onClick={handleTogglePlay}
              className="px-4 sm:px-8 gap-2 font-bold shadow-md active:scale-95 text-xs sm:text-sm"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              <span>{isPlaying ? (isRtl ? 'إيقاف مؤقت' : 'Pause') : (isRtl ? 'بدء القراءة' : 'Start Reading')}</span>
            </Button>

            <button
              onClick={() => handleSkip(10)}
              className="p-2.5 rounded-xl border border-app-border bg-app-bg text-app-text hover:text-app-accent hover:border-app-accent active:scale-95 transition-all shadow-2xs cursor-pointer touch-manipulation"
              title={isRtl ? 'تقديم 10 كلمات' : 'Forward 10 words'}
            >
              <FastForward size={18} />
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-app-border bg-app-bg text-app-text hover:text-app-accent hover:border-app-accent active:scale-95 transition-all shadow-2xs cursor-pointer touch-manipulation"
              title={isRtl ? 'إعادة من البداية' : 'Reset'}
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Speed (WPM) & Chunk Size Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-app-border/60">
            <div>
              <div className="flex justify-between text-xs font-bold text-app-text mb-1.5">
                <span className="flex items-center gap-1">
                  <Zap size={13} className="text-app-accent" />
                  {isRtl ? 'السرعة (كلمة / دقيقة):' : 'Speed (WPM):'}
                </span>
                <span className="text-app-accent font-mono">{toArabicDigits(wpm)} WPM</span>
              </div>
              <input
                type="range"
                min={120}
                max={600}
                step={20}
                value={wpm}
                onChange={(e) => setWpm(Number(e.target.value))}
                className="w-full accent-app-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-app-muted mt-1">
                <span>{isRtl ? 'هادئ (120)' : 'Slow (120)'}</span>
                <span>{isRtl ? 'متوسط (250)' : 'Normal (250)'}</span>
                <span>{isRtl ? 'سريع جداً (600)' : 'Very Fast (600)'}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-app-text mb-1.5">
                <span className="flex items-center gap-1">
                  <Sliders size={13} className="text-app-accent" />
                  {isRtl ? 'تجميع الكلمات (Chunk):' : 'Words per Chunk:'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setChunkSize(1)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    chunkSize === 1
                      ? 'bg-app-accent/15 border-app-accent text-app-accent shadow-2xs'
                      : 'bg-app-bg border-app-border text-app-text hover:border-app-accent/60'
                  }`}
                >
                  {isRtl ? 'كلمة واحدة' : '1 Word'}
                </button>
                <button
                  onClick={() => setChunkSize(2)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    chunkSize === 2
                      ? 'bg-app-accent/15 border-app-accent text-app-accent shadow-2xs'
                      : 'bg-app-bg border-app-border text-app-text hover:border-app-accent/60'
                  }`}
                >
                  {isRtl ? 'كلمتان معاً' : '2 Words'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
