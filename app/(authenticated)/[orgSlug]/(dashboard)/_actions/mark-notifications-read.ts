'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markNotificationsRead(
  notificationIds: string[],
  orgSlug: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated.' }
  }

  if (notificationIds.length === 0) {
    return { success: true }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .in('id', notificationIds)
    .eq('recipient_id', user.id)

  if (error) {
    console.error('Mark notifications read error:', error)
    return { success: false, error: 'Failed to mark notifications as read.' }
  }

  revalidatePath(`/${orgSlug}`, 'layout')

  return { success: true }
}

export async function markAllNotificationsRead(
  orgId: string,
  orgSlug: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated.' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', user.id)
    .eq('org_id', orgId)
    .eq('is_read', false)

  if (error) {
    console.error('Mark all notifications read error:', error)
    return { success: false, error: 'Failed to mark notifications as read.' }
  }

  revalidatePath(`/${orgSlug}`, 'layout')

  return { success: true }
}
