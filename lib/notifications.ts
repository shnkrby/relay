import { createClient } from '@/lib/supabase/server'
import { NotificationType } from '@/types/database'

/**
 * Creates a notification for a specific user.
 * Call this from server actions to notify users of important events.
 */
export async function createNotification({
  recipientId,
  orgId,
  type,
  title,
  message,
  link,
}: {
  recipientId: string
  orgId: string
  type: NotificationType
  title: string
  message: string
  link?: string | null
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .insert({
      recipient_id: recipientId,
      org_id: orgId,
      type,
      title,
      message,
      link: link || null,
      is_read: false,
    })

  if (error) {
    console.error('Failed to create notification:', error)
  }
}

/**
 * Creates notifications for multiple recipients at once.
 */
export async function createBulkNotifications({
  recipientIds,
  orgId,
  type,
  title,
  message,
  link,
}: {
  recipientIds: string[]
  orgId: string
  type: NotificationType
  title: string
  message: string
  link?: string | null
}) {
  if (recipientIds.length === 0) return

  const supabase = await createClient()

  const notifications = recipientIds.map(recipientId => ({
    recipient_id: recipientId,
    org_id: orgId,
    type,
    title,
    message,
    link: link || null,
    is_read: false,
  }))

  const { error } = await supabase
    .from('notifications')
    .insert(notifications)

  if (error) {
    console.error('Failed to create bulk notifications:', error)
  }
}
