import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { FolderHeart, Plus, Trash2 } from 'lucide-react'
import { db, uid } from '../lib/db'
import { Sheet } from '../components/ui/Sheet'
import { Button } from '../components/ui/Button'
import { toArabicDigits } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'

export default function CollectionsPage() {
  const navigate = useNavigate()
  const collections = useLiveQuery(() => db.collections.orderBy('createdAt').reverse().toArray(), [])
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  async function createCollection() {
    if (!name.trim()) return
    await db.collections.add({ id: uid('col'), name: name.trim(), itemIds: [], createdAt: Date.now() })
    setName('')
    setCreating(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title="المجموعات والتصنيفات"
        count={collections ? toArabicDigits(collections.length) : undefined}
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={15} />
            مجموعة جديدة
          </Button>
        }
      />

      {!collections || collections.length === 0 ? (
        <div className="text-center py-20">
          <FolderHeart size={32} className="mx-auto text-app-muted mb-3" />
          <p className="text-sm text-app-muted mb-1">لا توجد مجموعات بعد</p>
          <p className="text-xs text-app-muted">أنشئ مجموعات مثل "الحكمة" أو "الصداقة" لتنظيم اقتباساتك</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {collections.map((c) => (
            <div key={c.id} className="rounded-2xl bg-app-surface border border-app-border p-4 relative group">
              <button onClick={() => navigate(`/collections/${c.id}`)} className="w-full text-right">
                <FolderHeart size={20} className="text-app-accent mb-2" />
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-xs text-app-muted mt-0.5">{toArabicDigits(c.itemIds.length)} عنصر</p>
              </button>
              <button
                onClick={() => db.collections.delete(c.id)}
                className="absolute top-3 left-3 h-7 w-7 rounded-full items-center justify-center text-app-muted hover:text-red-600 hover:bg-red-50 hidden group-hover:flex"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={creating} onOpenChange={setCreating} title="مجموعة جديدة" side="center">
        <div className="space-y-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم المجموعة"
            dir="rtl"
            className="w-full rounded-xl border border-app-border bg-app-bg/40 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40"
          />
          <Button className="w-full" disabled={!name.trim()} onClick={createCollection}>
            إنشاء
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
