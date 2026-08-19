import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Sheet } from '../ui/Sheet'
import { db, uid } from '../../lib/db'
import { toArabicDigits, formatDuration, formatRelativeDay } from '../../lib/format'
import { cn } from '../../lib/cn'

export function VoiceNotesSheet({
  open,
  onOpenChange,
  bookId,
  chapterId,
  chapterTitle,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  bookId: string
  chapterId: string
  chapterTitle?: string
}) {
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioUrlMap, setAudioUrlMap] = useState<Record<string, string>>({})
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeAudioRef = useRef<HTMLAudioElement | null>(null)

  const voiceNotes = useLiveQuery(
    () => db.voiceNotes.where({ bookId, chapterId }).reverse().sortBy('createdAt'),
    [bookId, chapterId]
  )

  useEffect(() => {
    // Generate object URLs for blobs
    const newMap: Record<string, string> = {}
    for (const vn of voiceNotes ?? []) {
      newMap[vn.id] = URL.createObjectURL(vn.audioBlob)
    }
    setAudioUrlMap(newMap)

    return () => {
      Object.values(newMap).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [voiceNotes])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await db.voiceNotes.add({
          id: uid('vnote'),
          bookId,
          chapterId,
          title: `تسجيل صوتي (${chapterTitle || 'ملاحظة'})`,
          audioBlob: blob,
          durationSeconds: recordSeconds,
          createdAt: Date.now(),
        })
        stream.getTracks().forEach((track) => track.stop())
        setRecordSeconds(0)
      }

      recorder.start()
      setRecording(true)
      setRecordSeconds(0)

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1)
      }, 1000)
    } catch {
      alert('يرجى منح الإذن للوصول إلى الميكروفون لتسجيل الملاحظات الصوتية.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const playAudio = (id: string) => {
    const url = audioUrlMap[id]
    if (!url) return

    if (activeAudioRef.current) {
      activeAudioRef.current.pause()
    }

    if (playingId === id) {
      setPlayingId(null)
      return
    }

    const audio = new Audio(url)
    activeAudioRef.current = audio
    setPlayingId(id)

    audio.onended = () => setPlayingId(null)
    audio.play()
  }

  const handleDelete = async (id: string) => {
    if (playingId === id && activeAudioRef.current) {
      activeAudioRef.current.pause()
      setPlayingId(null)
    }
    await db.voiceNotes.delete(id)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="الملاحظات والتسجيلات الصوتية" className="max-w-md mx-auto">
      <div className="space-y-6">
        {/* Record Control Hero */}
        <div className="p-6 bg-app-surface border border-app-border rounded-3xl text-center space-y-4 shadow-sm">
          <div className="relative inline-block">
            <button
              onClick={recording ? stopRecording : startRecording}
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95',
                recording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-app-accent text-white hover:opacity-90'
              )}
              title={recording ? 'إيقاف التسجيل' : 'بدء تسجيل ملاحظة صوتية'}
            >
              {recording ? <Square size={28} /> : <Mic size={32} />}
            </button>
          </div>

          <div>
            <p className="text-sm font-bold text-app-text">
              {recording ? 'جارٍ التسجيل الصوتي...' : 'اضغط للتسجيل الصوتي'}
            </p>
            <p className="text-xs text-app-muted mt-0.5">
              {recording ? formatDuration(recordSeconds) : 'سجل خواطرك وتأملاتك بصوتك'}
            </p>
          </div>
        </div>

        {/* Voice Notes List */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-app-text-secondary px-1">
            التسجيلات المحفوظة لهذا الباب ({toArabicDigits(voiceNotes?.length ?? 0)}):
          </p>

          {!voiceNotes || voiceNotes.length === 0 ? (
            <p className="text-center text-xs text-app-muted py-6">لا توجد تسجيلات صوتية بعد</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {voiceNotes.map((vn) => (
                <li
                  key={vn.id}
                  className="p-3.5 bg-app-surface border border-app-border rounded-2xl flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => playAudio(vn.id)}
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                        playingId === vn.id
                          ? 'bg-app-accent text-white shadow-xs'
                          : 'bg-app-accent/15 text-app-accent hover:bg-app-accent hover:text-white'
                      )}
                    >
                      {playingId === vn.id ? <Pause size={18} /> : <Play size={18} className="mr-0.5" />}
                    </button>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-app-text truncate">{vn.title}</p>
                      <p className="text-[10px] text-app-muted mt-0.5">
                        {formatRelativeDay(vn.createdAt)} · {formatDuration(vn.durationSeconds)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(vn.id)}
                    className="p-2 rounded-xl text-app-muted hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                    title="حذف التسجيل"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Sheet>
  )
}
