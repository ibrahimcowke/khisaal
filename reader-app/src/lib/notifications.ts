/**
 * Notifications helper for Daily Virtue and reminders
 */

export interface NotificationStatus {
  supported: boolean
  permission: NotificationPermission | 'unsupported'
}

export function getNotificationStatus(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, permission: 'unsupported' }
  }
  return { supported: true, permission: Notification.permission }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }
  try {
    const perm = await Notification.requestPermission()
    return perm === 'granted'
  } catch {
    return false
  }
}

export async function sendDailyVirtueNotification({
  title,
  snippet,
  chapterId,
  bookId = 'alkhisal-al-miatan',
}: {
  title: string
  snippet: string
  chapterId: string
  bookId?: string
}): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission()
    if (!granted) return false
  }

  try {
    const notifTitle = `❖ خصلة اليوم: ${title}`
    const notifOptions: NotificationOptions = {
      body: snippet.length > 120 ? `${snippet.slice(0, 120)}...` : snippet,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'daily-virtue',
      data: {
        url: `/book/${bookId}/read?c=${chapterId}`,
      },
    }

    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(notifTitle, notifOptions)
        return true
      }
    }

    new Notification(notifTitle, notifOptions)
    return true
  } catch (err) {
    console.warn('Failed to send notification', err)
    return false
  }
}
