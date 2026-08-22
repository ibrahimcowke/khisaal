import { useState } from 'react'
import { Download, Upload, ShieldCheck, FileText, Check, Lock, Key, Copy } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { Tabs, TabPanel } from '../ui/Tabs'
import {
  exportDatabaseToJson,
  generateObsidianMarkdownVault,
  encryptData,
  decryptData,
} from '../../lib/cloudSync'
import { db } from '../../lib/db'
import { useTranslation } from '../../lib/i18n'

export function AdvancedExporterModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { isRtl } = useTranslation()
  const [activeTab, setActiveTab] = useState<string>('obsidian')
  const [passphrase, setPassphrase] = useState('')
  const [restorePassphrase, setRestorePassphrase] = useState('')
  const [copiedMd, setCopiedMd] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null)
  const [uploadedEncryptedData, setUploadedEncryptedData] = useState<string | null>(null)

  const handleDownloadObsidian = async () => {
    setDownloading(true)
    try {
      const md = await generateObsidianMarkdownVault()
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `imtaa-qari-vault-${new Date().toISOString().split('T')[0]}.md`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const handleCopyObsidian = async () => {
    const md = await generateObsidianMarkdownVault()
    await navigator.clipboard.writeText(md)
    setCopiedMd(true)
    setTimeout(() => setCopiedMd(false), 1500)
  }

  const handleDownloadEncrypted = async () => {
    if (!passphrase || passphrase.length < 4) {
      alert(isRtl ? 'يرجى كتابة كلمة مرور قوية (٤ أحرف على الأقل)' : 'Please enter a valid passphrase')
      return
    }
    setDownloading(true)
    try {
      const rawJson = await exportDatabaseToJson()
      const encrypted = await encryptData(rawJson, passphrase)
      const blob = new Blob([encrypted], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `imtaa-backup-encrypted-${new Date().toISOString().split('T')[0]}.enc`
      a.click()
      URL.revokeObjectURL(url)
      setPassphrase('')
    } finally {
      setDownloading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedEncryptedData(event.target?.result as string)
      setRestoreStatus(null)
    }
    reader.readAsText(file)
  }

  const handleRestoreEncrypted = async () => {
    if (!uploadedEncryptedData || !restorePassphrase) return
    try {
      const decrypted = await decryptData(uploadedEncryptedData, restorePassphrase)
      const parsed = JSON.parse(decrypted)
      if (parsed.data) {
        if (parsed.data.highlights) await db.highlights.bulkPut(parsed.data.highlights)
        if (parsed.data.notes) await db.notes.bulkPut(parsed.data.notes)
        if (parsed.data.quotes) await db.quotes.bulkPut(parsed.data.quotes)
        if (parsed.data.bookmarks) await db.bookmarks.bulkPut(parsed.data.bookmarks)
        if (parsed.data.virtueLogs) await db.virtueLogs.bulkPut(parsed.data.virtueLogs)
        if (parsed.data.flashcards) await db.flashcards.bulkPut(parsed.data.flashcards)
        setRestoreStatus(isRtl ? 'تمت استعادة البيانات وفك التشفير بنجاح! ✅' : 'Restored successfully! ✅')
      }
    } catch {
      setRestoreStatus(isRtl ? 'خطأ: كلمة المرور غير صحيحة أو الملف تالف ❌' : 'Error: Invalid passphrase or corrupted file ❌')
    }
  }

  const tabsConfig = [
    { value: 'obsidian', label: 'Obsidian / Markdown', icon: <FileText size={14} /> },
    { value: 'encrypted', label: isRtl ? 'نسخ مشفر' : 'Encrypted', icon: <ShieldCheck size={14} /> },
    { value: 'restore', label: isRtl ? 'استعادة' : 'Restore', icon: <Upload size={14} /> },
  ]

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      side="center"
      title={isRtl ? 'المزامنة السحابية والتصدير المتقدم' : 'Advanced Cloud Sync & Export'}
      className="max-w-xl"
    >
      <div className="space-y-4 pt-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} tabs={tabsConfig}>
          {/* Obsidian Export */}
          <TabPanel value="obsidian" className="space-y-4 mt-2">
            <div className="p-4 rounded-2xl bg-app-surface border border-app-border/80">
              <h4 className="text-sm font-bold text-app-text mb-1 flex items-center gap-1.5">
                <FileText size={15} className="text-purple-500" />
                {isRtl ? 'تصدير كامل لتطبيقات الملاحظات الذكية' : 'Obsidian & Markdown Vault Export'}
              </h4>
              <p className="text-xs text-app-text-secondary leading-relaxed mb-4">
                {isRtl
                  ? 'تصدير شامل ومنسق لجميع تظليلاتك، ملاحظاتك، اقتباساتك وسجل خصالك متوافق مع Obsidian و Logseq وروابط الويكي [[Internal Links]].'
                  : 'Complete formatted markdown export with YAML headers, tags, and internal wiki links.'}
              </p>

              <div className="flex gap-2">
                <Button onClick={handleDownloadObsidian} disabled={downloading} className="gap-1.5 text-xs flex-1">
                  <Download size={14} />
                  {isRtl ? 'تنزيل ملف Markdown (.md)' : 'Download .md Vault'}
                </Button>
                <Button variant="outline" onClick={handleCopyObsidian} className="gap-1.5 text-xs">
                  {copiedMd ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copiedMd ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ النص' : 'Copy')}
                </Button>
              </div>
            </div>
          </TabPanel>

          {/* Encrypted Backup */}
          <TabPanel value="encrypted" className="space-y-4 mt-2">
            <div className="p-4 rounded-2xl bg-app-surface border border-app-border/80 space-y-3">
              <h4 className="text-sm font-bold text-app-text flex items-center gap-1.5">
                <Lock size={15} className="text-amber-500" />
                {isRtl ? 'تشفير عسكري AES-256 بكلمة سر' : 'AES-256 Encrypted Backup'}
              </h4>
              <p className="text-xs text-app-muted leading-relaxed">
                {isRtl
                  ? 'يتم تشفير كافة سجلاتك وملاحظاتك محلياً بكلمة المرور الخاصة بك ولا يمكن لأحد قراءتها بدونها.'
                  : 'All records are client-side encrypted using AES-GCM and PBKDF2 before export.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-app-text mb-1">
                  {isRtl ? 'اختر كلمة مرور لحماية ملف النسخ الاحتياطي:' : 'Passphrase:'}
                </label>
                <div className="relative">
                  <Key size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted" />
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-app-border bg-app-bg text-app-text text-sm focus:border-app-accent outline-none"
                  />
                </div>
              </div>

              <Button onClick={handleDownloadEncrypted} disabled={downloading} className="w-full gap-1.5 text-xs justify-center mt-2">
                <Download size={14} />
                {isRtl ? 'تشفير وتحميل النسخة الاحتياطية (.enc)' : 'Encrypt & Download (.enc)'}
              </Button>
            </div>
          </TabPanel>

          {/* Restore */}
          <TabPanel value="restore" className="space-y-4 mt-2">
            <div className="p-4 rounded-2xl bg-app-surface border border-app-border/80 space-y-3">
              <h4 className="text-sm font-bold text-app-text flex items-center gap-1.5">
                <Upload size={15} className="text-emerald-500" />
                {isRtl ? 'استعادة نسخة احتياطية مشفرة' : 'Restore Encrypted Backup'}
              </h4>

              <input
                type="file"
                accept=".enc,.json"
                onChange={handleFileUpload}
                className="w-full text-xs file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-app-accent/10 file:text-app-accent file:font-semibold cursor-pointer"
              />

              {uploadedEncryptedData && (
                <div>
                  <label className="block text-xs font-bold text-app-text mb-1">
                    {isRtl ? 'أدخل كلمة المرور لفك التشفير:' : 'Enter decryption passphrase:'}
                  </label>
                  <input
                    type="password"
                    value={restorePassphrase}
                    onChange={(e) => setRestorePassphrase(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-app-border bg-app-bg text-app-text text-sm focus:border-app-accent outline-none"
                  />
                </div>
              )}

              {restoreStatus && (
                <p className="text-xs font-bold text-center p-2 rounded-xl bg-app-bg border border-app-border">
                  {restoreStatus}
                </p>
              )}

              <Button
                onClick={handleRestoreEncrypted}
                disabled={!uploadedEncryptedData || !restorePassphrase}
                className="w-full gap-1.5 text-xs justify-center"
              >
                <ShieldCheck size={14} />
                {isRtl ? 'فك التشفير ودمج البيانات' : 'Decrypt & Restore'}
              </Button>
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </Sheet>
  )
}
