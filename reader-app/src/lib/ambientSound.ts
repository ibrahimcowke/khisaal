import type { AmbientSoundType } from '../store/settingsStore'

class AmbientAudioEngine {
  private ctx: AudioContext | null = null
  private gainNode: GainNode | null = null
  private currentType: AmbientSoundType = 'off'
  private nodes: (AudioNode | number)[] = []
  private volume = 0.5

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioContextClass()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol))
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1)
    }
  }

  public play(type: AmbientSoundType) {
    if (type === this.currentType) return
    this.stop()
    if (type === 'off') return

    try {
      const ctx = this.getContext()
      this.currentType = type

      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0.01, ctx.currentTime)
      masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, this.volume), ctx.currentTime + 1.2)
      masterGain.connect(ctx.destination)
      this.gainNode = masterGain

      if (type === 'rain') {
        this.startRain(ctx, masterGain)
      } else if (type === 'breeze') {
        this.startBreeze(ctx, masterGain)
      } else if (type === 'fire') {
        this.startFire(ctx, masterGain)
      } else if (type === 'library') {
        this.startLibrary(ctx, masterGain)
      } else if (type === 'waves') {
        this.startWaves(ctx, masterGain)
      }
    } catch {
      // Ignore audio autoplay restrictions gracefully
    }
  }

  public stop() {
    this.currentType = 'off'
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3)
      } catch {
        // Safe catch
      }
    }

    this.nodes.forEach((n) => {
      if (typeof n === 'number') {
        window.clearInterval(n)
      } else {
        try {
          if ('stop' in n && typeof (n as AudioScheduledSourceNode).stop === 'function') {
            (n as AudioScheduledSourceNode).stop()
          }
          n.disconnect()
        } catch {
          // Safe catch
        }
      }
    })
    this.nodes = []
    this.gainNode = null
  }

  private createNoiseBuffer(ctx: AudioContext, duration = 3): AudioBuffer {
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  private startRain(ctx: AudioContext, out: GainNode) {
    const buffer = this.createNoiseBuffer(ctx, 4)
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1000, ctx.currentTime)

    const highpass = ctx.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.setValueAtTime(200, ctx.currentTime)

    noise.connect(filter)
    filter.connect(highpass)
    highpass.connect(out)
    noise.start()
    this.nodes.push(noise, filter, highpass)
  }

  private startBreeze(ctx: AudioContext, out: GainNode) {
    const buffer = this.createNoiseBuffer(ctx, 5)
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(450, ctx.currentTime)
    filter.Q.setValueAtTime(2.5, ctx.currentTime)

    const lfo = ctx.createOscillator()
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime)
    const lfoGain = ctx.createGain()
    lfoGain.gain.setValueAtTime(200, ctx.currentTime)

    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    noise.connect(filter)
    filter.connect(out)
    noise.start()
    lfo.start()
    this.nodes.push(noise, filter, lfo, lfoGain)
  }

  private startFire(ctx: AudioContext, out: GainNode) {
    const buffer = this.createNoiseBuffer(ctx, 2)
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(320, ctx.currentTime)

    noise.connect(filter)
    filter.connect(out)
    noise.start()
    this.nodes.push(noise, filter)
  }

  private startLibrary(ctx: AudioContext, out: GainNode) {
    const buffer = this.createNoiseBuffer(ctx, 6)
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(280, ctx.currentTime)

    noise.connect(filter)
    filter.connect(out)
    noise.start()
    this.nodes.push(noise, filter)
  }

  private startWaves(ctx: AudioContext, out: GainNode) {
    const buffer = this.createNoiseBuffer(ctx, 6)
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(400, ctx.currentTime)

    const lfo = ctx.createOscillator()
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime)
    const lfoGain = ctx.createGain()
    lfoGain.gain.setValueAtTime(300, ctx.currentTime)

    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    noise.connect(filter)
    filter.connect(out)
    noise.start()
    lfo.start()
    this.nodes.push(noise, filter, lfo, lfoGain)
  }
}

export const ambientAudio = new AmbientAudioEngine()
