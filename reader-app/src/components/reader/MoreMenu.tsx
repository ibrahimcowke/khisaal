import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { type ReactNode } from 'react'

export function MoreMenu({
  trigger,
  items,
}: {
  trigger: ReactNode
  items: { label: string; icon?: ReactNode; onClick: () => void; danger?: boolean }[]
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-[190px] rounded-xl bg-app-surface border border-app-border shadow-xl py-1.5 animate-fade-in"
        >
          {items.map((item, i) => (
            <DropdownMenu.Item
              key={i}
              onSelect={item.onClick}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer outline-none hover:bg-black/5 ${item.danger ? 'text-red-600' : ''}`}
            >
              {item.icon}
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
