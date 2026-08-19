import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { FolderHeart, Plus, Check } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { db, uid } from '../../lib/db'

export function AddToCollectionSheet({
  open,
  onOpenChange,
  itemId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  itemId: string
}) {
  const collections = useLiveQuery(() => db.collections.orderBy('createdAt').reverse().toArray(), [])
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  async function toggleItem(collectionId: string, current: string[]) {
    const has = current.includes(itemId)
    const itemIds = has ? current.filter((id) => id !== itemId) : [...current, itemId]
    await db.collections.update(collectionId, { itemIds })
  }

  async function createAndAdd() {
    if (!name.trim()) return
    await db.collections.add({ id: uid('col'), name: name.trim(), itemIds: [itemId], createdAt: Date.now() })
    setName('')
    setCreating(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="إضافة إلى مجموعة" className="max-w-md mx-auto">
      <div className="space-y-3">
        {!collections || collections.length === 0 ? (
          <p className="text-sm text-app-muted text-center py-6">لا توجد مجموعات بعد. أنشئ واحدة أدناه.</p>
        ) : (
          <ul className="space-y-1.5">
            {collections.map((c) => {
              const active = c.itemIds.includes(itemId)
              return (
                <li key={c.id}>
                  <button
                    onClick={() => toggleItem(c.id, c.itemIds)}
                    className="w-full flex items-center gap-3 rounded-xl border border-app-border px-3.5 py-2.5 hover:bg-black/5"
                  >
                    <FolderHeart size={16} className="text-app-accent shrink-0" />
                    <span className="flex-1 text-right text-sm">{c.name}</span>
                    {active && <Check size={16} className="text-app-accent shrink-0" />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {creating ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم المجموعة"
              dir="rtl"
              className="flex-1 rounded-xl border border-app-border bg-app-bg/40 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40"
            />
            <Button size="sm" disabled={!name.trim()} onClick={createAndAdd}>
              إضافة
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => setCreating(true)}>
            <Plus size={15} />
            مجموعة جديدة
          </Button>
        )}
      </div>
    </Sheet>
  )
}
