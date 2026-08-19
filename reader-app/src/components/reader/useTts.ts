import { useCallback, useEffect, useRef, useState } from 'react'

export interface TtsController {
  supported: boolean
  hasArabicVoice: boolean
  speaking: boolean
  paused: boolean
  currentIndex: number
  rate: number
  setRate: (r: number) => void
  speakSentences: (sentences: string[], startIndex?: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
  next: () => void
  prev: () => void
}

export function useTts(): TtsController {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [hasArabicVoice, setHasArabicVoice] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [rate, setRate] = useState(1)
  const [currentIndex, setCurrentIndex] = useState(0)
  const sentencesRef = useRef<string[]>([])
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (!supported) return
    function loadVoices() {
      const voices = window.speechSynthesis.getVoices()
      const ar = voices.find((v) => v.lang?.toLowerCase().startsWith('ar'))
      voiceRef.current = ar ?? null
      setHasArabicVoice(!!ar)
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [supported])

  const speakFrom = useCallback(
    (index: number) => {
      if (!supported) return
      window.speechSynthesis.cancel()
      const sentences = sentencesRef.current
      if (index < 0 || index >= sentences.length) {
        setSpeaking(false)
        return
      }
      const utter = new SpeechSynthesisUtterance(sentences[index])
      utter.lang = 'ar-SA'
      utter.rate = rate
      if (voiceRef.current) utter.voice = voiceRef.current
      utter.onend = () => {
        if (index + 1 < sentences.length) {
          setCurrentIndex(index + 1)
          speakFrom(index + 1)
        } else {
          setSpeaking(false)
        }
      }
      setCurrentIndex(index)
      window.speechSynthesis.speak(utter)
      setSpeaking(true)
      setPaused(false)
    },
    [supported, rate]
  )

  const speakSentences = useCallback(
    (sentences: string[], startIndex = 0) => {
      sentencesRef.current = sentences
      speakFrom(startIndex)
    },
    [speakFrom]
  )

  const pause = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.pause()
    setPaused(true)
  }, [supported])

  const resume = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.resume()
    setPaused(false)
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
  }, [supported])

  const next = useCallback(() => speakFrom(currentIndex + 1), [speakFrom, currentIndex])
  const prev = useCallback(() => speakFrom(Math.max(0, currentIndex - 1)), [speakFrom, currentIndex])

  return { supported, hasArabicVoice, speaking, paused, currentIndex, rate, setRate, speakSentences, pause, resume, stop, next, prev }
}
