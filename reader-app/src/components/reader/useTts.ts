import { useCallback, useEffect, useRef, useState } from 'react'

export interface TtsController {
  supported: boolean
  hasArabicVoice: boolean
  speaking: boolean
  paused: boolean
  currentIndex: number
  rate: number
  loopCount: number
  currentLoop: number
  setRate: (r: number) => void
  setLoopCount: (c: number) => void
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
  const [loopCount, setLoopCount] = useState(1)
  const [currentLoop, setCurrentLoop] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const sentencesRef = useRef<string[]>([])
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const loopCountRef = useRef(1)
  const currentLoopRef = useRef(0)

  useEffect(() => {
    loopCountRef.current = loopCount
  }, [loopCount])

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
        if (currentLoopRef.current + 1 < loopCountRef.current) {
          currentLoopRef.current += 1
          setCurrentLoop(currentLoopRef.current)
          speakFrom(0)
        } else {
          setSpeaking(false)
        }
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
        } else if (currentLoopRef.current + 1 < loopCountRef.current) {
          currentLoopRef.current += 1
          setCurrentLoop(currentLoopRef.current)
          speakFrom(0)
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
      currentLoopRef.current = 0
      setCurrentLoop(0)
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
    currentLoopRef.current = 0
    setCurrentLoop(0)
  }, [supported])

  const next = useCallback(() => speakFrom(currentIndex + 1), [speakFrom, currentIndex])
  const prev = useCallback(() => speakFrom(Math.max(0, currentIndex - 1)), [speakFrom, currentIndex])

  return { supported, hasArabicVoice, speaking, paused, currentIndex, rate, loopCount, currentLoop, setRate, setLoopCount, speakSentences, pause, resume, stop, next, prev }
}
