import * as RadixSwitch from '@radix-ui/react-switch'

export function Switch({
  checked,
  onCheckedChange,
  ariaLabel,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  ariaLabel: string
}) {
  return (
    <RadixSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={ariaLabel}
      className="w-11 h-6 rounded-full bg-app-border data-[state=checked]:bg-app-accent relative shrink-0 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-app-accent/50"
    >
      <RadixSwitch.Thumb className="block w-5 h-5 bg-white rounded-full shadow absolute top-0.5 left-0.5 transition-transform duration-150 data-[state=checked]:translate-x-[20px]" />
    </RadixSwitch.Root>
  )
}
