import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { FolderHeart, Plus, Trash2, Sparkles, Bookmark, Flame } from 'lucide-react'
import { db, uid } from '../lib/db'
import { Sheet } from '../components/ui/Sheet'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { useTranslation } from '../lib/i18n'
import { useToast } from '../context/ToastContext'

export default function CollectionsPage() {
  const navigate = useNavigate()
  const { t, isRtl, formatDigits } = useTranslation()
  const toast = useToast()
  const collections = useLiveQuery(() => db.collections.orderBy('createdAt').reverse().toArray(), [])
  const bookmarksCount = useLiveQuery(() => db.bookmarks.count()) ?? 0
  const highlightsCount = useLiveQuery(() => db.highlights.count()) ?? 0
  const virtueLogsCount = useLiveQuery(() => db.virtueLogs.count()) ?? 0
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  async function createCollection() {
    if (!name.trim()) return
    await db.collections.add({ id: uid('col'), name: name.trim(), itemIds: [], createdAt: Date.now() })
    toast.success(isRtl ? 'تمت إضافة المجموعة!' : 'Collection Created!', name.trim())
    setName('')
    setCreating(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-10 animate-fade-in">
      <PageHeader
        title={t('collections')}
        count={collections ? formatDigits(collections.length) : undefined}
        actions={
          <Button size="sm" onClick={() => setCreating(true)} className="gap-1.5">
            <Plus size={14} />
            <span>{isRtl ? 'مجموعة جديدة' : 'New Collection'}</span>
          </Button>
        }
      />

      {/* Smart Auto-Collections */}
      <div className="mb-6 space-y-2">
        <h3 className="text-xs font-bold text-app-muted uppercase tracking-wide flex items-center gap-1.5">
          <Sparkles size={13} className="text-app-accent" />
          <span>{isRtl ? 'المجموعات الذكية التلقائية' : 'Smart Auto Collections'}</span>
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => navigate('/bookmarks')}
            className="p-3 rounded-2xl bg-app-surface border border-app-border text-right hover:border-app-accent/60 transition-all cursor-pointer group shadow-2xs"
          >
            <Bookmark size={16} className="text-purple-500 mb-1.5" />
            <p className="text-xs font-bold text-app-text group-hover:text-app-accent truncate">{isRtl ? 'العلامات' : 'Bookmarks'}</p>
            <p className="text-[10px] text-app-muted">{formatDigits(bookmarksCount)} {isRtl ? 'عنصر' : 'items'}</p>
          </button>
          <button
            onClick={() => navigate('/highlights')}
            className="p-3 rounded-2xl bg-app-surface border border-app-border text-right hover:border-app-accent/60 transition-all cursor-pointer group shadow-2xs"
          >
            <Sparkles size={16} className="text-amber-500 mb-1.5" />
            <p className="text-xs font-bold text-app-text group-hover:text-app-accent truncate">{isRtl ? 'التظليلات' : 'Highlights'}</p>
            <p className="text-[10px] text-app-muted">{formatDigits(highlightsCount)} {isRtl ? 'عنصر' : 'items'}</p>
          </button>
          <button
            onClick={() => navigate('/habit-tracker')}
            className="p-3 rounded-2xl bg-app-surface border border-app-border text-right hover:border-app-accent/60 transition-all cursor-pointer group shadow-2xs"
          >
            <Flame size={16} className="text-orange-500 mb-1.5" />
            <p className="text-xs font-bold text-app-text group-hover:text-app-accent truncate">{isRtl ? 'العادات اليومية' : 'Habit Logs'}</p>
            <p className="text-[10px] text-app-muted">{formatDigits(virtueLogsCount)} {isRtl ? 'سجل' : 'logs'}</p>
          </button>
        </div>
      </div>

      {!collections || collections.length === 0 ? (
        <EmptyState
          icon={FolderHeart}
          title={isRtl ? 'لا توجد مجموعات بعد' : 'No Collections Yet'}
          description={isRtl ? 'أنشئ مجموعات مثل "الحكمة" أو "مكارم الأخلاق" لتصنيف فوائدك واقتباساتك.' : 'Create thematic collections to organize your favorite quotes and notes.'}
          actionLabel={isRtl ? 'إنشاء أول مجموعة' : 'Create First Collection'}
          onAction={() => setCreating(true)}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {collections.map((c) => (
            <div key={c.id} className="rounded-2xl bg-app-surface border border-app-border p-4 relative group shadow-2xs hover:border-app-accent/50 transition-all">
              <button onClick={() => navigate(`/collections/${c.id}`)} className="w-full text-right cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-app-accent/10 text-app-accent flex items-center justify-center mb-2.5">
                  <FolderHeart size={18} />
                </div>
                <p className="text-xs sm:text-sm font-bold truncate text-app-text font-display group-hover:text-app-accent transition-colors">{c.name}</p>
                <p className="text-[10px] text-app-muted mt-0.5 font-serif">{formatDigits(c.itemIds.length)} {isRtl ? 'عنصر' : 'items'}</p>
              </button>
              <button
                onClick={() => db.collections.delete(c.id)}
                className="absolute top-3 left-3 h-7 w-7 rounded-lg items-center justify-center text-app-muted hover:text-red-600 hover:bg-red-50 hidden group-hover:flex transition-colors cursor-pointer"
                title={isRtl ? 'حذف' : 'Delete'}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={creating} onOpenChange={setCreating} title={isRtl ? 'مجموعة جديدة' : 'New Collection'} side="center">
        <div className="space-y-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isRtl ? 'اسم المجموعة (مثل: خصال المروءة)' : 'Collection name...'}
            dir={isRtl ? 'rtl' : 'ltr'}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-app-accent"
          />
          <Button className="w-full" disabled={!name.trim()} onClick={createCollection}>
            {isRtl ? 'إنشاء' : 'Create'}
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
