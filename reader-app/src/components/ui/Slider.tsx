import * as RadixSlider from '@radix-ui/react-slider'

export function Slider({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  ariaLabel,
}: {
  value: number
  onValueChange: (v: number) => void
  min: number
  max: number
  step?: number
  ariaLabel: string
}) {
  return (
    <RadixSlider.Root
      className="relative flex items-center select-none touch-none w-full h-6"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onValueChange(v)}
      aria-label={ariaLabel}
      dir="rtl"
    >
      <RadixSlider.Track className="bg-app-border relative grow rounded-full h-1.5">
        <RadixSlider.Range className="absolute bg-app-accent rounded-full h-full" />
      </RadixSlider.Track>
      <RadixSlider.Thumb className="block w-5 h-5 rounded-full bg-app-accent shadow-md border-2 border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/50" />
    </RadixSlider.Root>
  )
}
