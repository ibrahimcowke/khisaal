import * as RadixTabs from '@radix-ui/react-tabs'
import { type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Tabs({
  value,
  onValueChange,
  tabs,
  children,
}: {
  value: string
  onValueChange: (v: string) => void
  tabs: { value: string; label: string; icon?: ReactNode }[]
  children: ReactNode
}) {
  return (
    <RadixTabs.Root value={value} onValueChange={onValueChange}>
      <RadixTabs.List className="flex gap-1 border-b border-app-border mb-4 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <RadixTabs.Trigger
            key={t.value}
            value={t.value}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-app-text-secondary border-b-2 border-transparent whitespace-nowrap transition-colors',
              'data-[state=active]:text-app-accent data-[state=active]:border-app-accent'
            )}
          >
            {t.icon}
            {t.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  )
}

export const TabPanel = RadixTabs.Content
