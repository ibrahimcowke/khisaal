import { useEffect, useState } from 'react'
import { CloudRain, Wind, Flame, Building2, Waves, VolumeX, Volume2, Sparkles } from 'lucide-react'
import { useSettingsStore, type AmbientSoundType } from '../../store/settingsStore'
import { ambientAudio } from '../../lib/ambientSound'
import { Slider } from '../ui/Slider'
import { cn } from '../../lib/cn'

const SOUNDS: { type: AmbientSoundType; label: string; icon: typeof CloudRain }[] = [
  { type: 'off', label: 'صامت', icon: VolumeX },
  { type: 'rain', label: 'مطر هادئ', icon: CloudRain },
  { type: 'breeze', label: 'نسيم عليل', icon: Wind },
  { type: 'fire', label: 'دفء المدفأة', icon: Flame },
  { type: 'library', label: 'أجواء المكتبة', icon: Building2 },
  { type: 'waves', label: 'أمواج هادئة', icon: Waves },
]

export function AmbientSoundPlayer({ className }: { className?: string }) {
  const { ambientSound, ambientVolume, setAmbientSound, setAmbientVolume } = useSettingsStore()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    ambientAudio.setVolume(ambientVolume)
  }, [ambientVolume])

  useEffect(() => {
    ambientAudio.play(ambientSound)
    return () => {
      // Don't kill audio unnecessarily on unmount unless desired
    }
  }, [ambientSound])

  const activeSound = SOUNDS.find((s) => s.type === ambientSound) ?? SOUNDS[0]
  const Icon = activeSound.icon

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
          ambientSound !== 'off'
            ? 'bg-app-accent text-white border-app-accent shadow-sm'
            : 'bg-app-surface border-app-border text-app-text-secondary hover:border-app-accent'
        )}
        title="أصوات القراءة المحيطية"
      >
        <Icon size={14} className={ambientSound !== 'off' ? 'animate-pulse' : ''} />
        <span>{ambientSound === 'off' ? 'أصوات التركيز' : activeSound.label}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-72 rounded-2xl bg-app-surface border border-app-border shadow-xl p-4 z-50 animate-fade-in space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-app-text">
                <Sparkles size={14} className="text-app-accent" />
                <span>أصوات القراءة المهدئة</span>
              </div>
              {ambientSound !== 'off' && (
                <button
                  onClick={() => setAmbientSound('off')}
                  className="text-[11px] text-red-500 hover:underline"
                >
                  إيقاف
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {SOUNDS.map((s) => {
                const SoundIcon = s.icon
                const isSelected = ambientSound === s.type
                return (
                  <button
                    key={s.type}
                    onClick={() => setAmbientSound(s.type)}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-xl text-xs text-right border transition-colors',
                      isSelected
                        ? 'border-app-accent bg-app-accent/15 text-app-accent font-bold'
                        : 'border-app-border bg-app-bg/50 hover:bg-app-surface text-app-text-secondary'
                    )}
                  >
                    <SoundIcon size={14} className="shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </button>
                )
              })}
            </div>

            {ambientSound !== 'off' && (
              <div className="pt-2 border-t border-app-border">
                <div className="flex items-center justify-between text-xs text-app-text-secondary mb-1.5">
                  <span className="flex items-center gap-1">
                    <Volume2 size={12} /> مستوى الصوت
                  </span>
                  <span>{Math.round(ambientVolume * 100)}%</span>
                </div>
                <Slider
                  value={Math.round(ambientVolume * 100)}
                  onValueChange={(val) => setAmbientVolume(val / 100)}
                  min={5}
                  max={100}
                  step={5}
                  ariaLabel="مستوى صوت الخلفية"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
