import { db } from './db'

/**
 * Derives an AES-GCM encryption key from a user passphrase using PBKDF2.
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts arbitrary text/JSON with AES-GCM using a user passphrase.
 */
export async function encryptData(data: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase, salt)
  const enc = new TextEncoder()

  const encryptedContent = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(data)
  )

  // Package salt + iv + encrypted bytes into base64
  const combined = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encryptedContent), salt.length + iv.length)

  let binary = ''
  for (let i = 0; i < combined.byteLength; i++) {
    binary += String.fromCharCode(combined[i])
  }
  return btoa(binary)
}

/**
 * Decrypts AES-GCM encrypted base64 payload using the passphrase.
 */
export async function decryptData(encryptedBase64: string, passphrase: string): Promise<string> {
  const binary = atob(encryptedBase64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  const salt = bytes.slice(0, 16)
  const iv = bytes.slice(16, 28)
  const data = bytes.slice(28)

  const key = await deriveKey(passphrase, salt)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  const dec = new TextDecoder()
  return dec.decode(decrypted)
}

/**
 * Exports all database records into structured format for backup.
 */
export async function exportDatabaseToJson(): Promise<string> {
  const highlights = await db.highlights.toArray()
  const notes = await db.notes.toArray()
  const bookmarks = await db.bookmarks.toArray()
  const quotes = await db.quotes.toArray()
  const collections = await db.collections.toArray()
  const history = await db.history.toArray()
  const virtueLogs = await db.virtueLogs.toArray()
  const flashcards = await db.flashcards.toArray()
  const readingPlans = await db.readingPlans.toArray()

  const payload = {
    app: 'imtaa-al-qari-reader',
    version: 3,
    exportedAt: new Date().toISOString(),
    data: {
      highlights,
      notes,
      bookmarks,
      quotes,
      collections,
      history,
      virtueLogs,
      flashcards,
      readingPlans,
    },
  }

  return JSON.stringify(payload, null, 2)
}

/**
 * Generates an Obsidian-compatible Markdown export with YAML headers, tags, and internal wiki-links.
 */
export async function generateObsidianMarkdownVault(): Promise<string> {
  const notes = await db.notes.toArray()
  const quotes = await db.quotes.toArray()
  const virtueLogs = await db.virtueLogs.toArray()

  let md = `# 📚 موسوعة إمتاع القارئ والخصال - أرشيف المعرفة والملاحظات\n\n`
  md += `> تم التصدير بتاريخ: ${new Date().toLocaleDateString('ar-EG')}\n\n`
  md += `---\n\n`

  md += `## 🌟 الاقتباسات وروائع الكلم\n\n`
  for (const q of quotes) {
    md += `### ${q.text.slice(0, 30)}...\n`
    md += `> ${q.text}\n\n`
    md += `* **التاريخ**: ${new Date(q.createdAt).toLocaleDateString('ar-EG')}\n`
    md += `* **الوسوم**: #اقتباس #حكمة #إمتاع_القارئ\n\n`
  }

  md += `---\n\n## 📝 الملاحظات والفوائد العلمية\n\n`
  for (const n of notes) {
    md += `### فائدة: ${(n.body || '').slice(0, 35)}...\n`
    md += `\`\`\`yaml\n`
    md += `type: note\n`
    md += `bookId: ${n.bookId}\n`
    md += `chapterId: ${n.chapterId}\n`
    md += `date: ${new Date(n.createdAt).toISOString()}\n`
    md += `tags: [فوائد, مطالعة, خصال]\n`
    md += `\`\`\`\n\n`
    if (n.selectedText) {
      md += `**النص المقتبس:**\n> ${n.selectedText}\n\n`
    }
    md += `**التعليق والتحليل:**\n${n.body}\n\n`
  }

  md += `---\n\n## 🌿 سجل تطبيق الخصال والأخلاق\n\n`
  for (const v of virtueLogs) {
    md += `* [${v.completed ? 'x' : ' '}] **${v.traitTitle}** (${v.date})\n`
    if (v.reflectionText) {
      md += `  * *تأمل*: ${v.reflectionText}\n`
    }
  }

  return md
}
