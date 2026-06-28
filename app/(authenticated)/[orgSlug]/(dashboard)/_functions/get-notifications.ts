import { createClient } from '@/lib/supabase/server'

export async function getNotifications(orgId: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', userId)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Failed to fetch notifications:', error)
    return { notifications: [], unreadCount: 0 }
  }

  const notifications = data || []
  const unreadCount = notifications.filter((n: any) => !n.is_read).length

  return { notifications, unreadCount }
}
