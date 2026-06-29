'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateEventStatus(
  orgId: string,
  orgSlug: string,
  eventId: string,
  newStatus: 'active' | 'upcoming' | 'completed' | 'cancelled' | 'paused'
) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Verify user is an admin/owner of this org
  const { data: memberData, error: memberError } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('profile_id', user.id)
    .single()

  if (memberError || !memberData || (memberData.role !== 'owner' && memberData.role !== 'admin')) {
    return { success: false, error: 'Unauthorized. Only admins can update event status.' }
  }

  // Update status
  const { error: updateError } = await supabase
    .from('events')
    .update({ status: newStatus })
    .eq('id', eventId)
    .eq('org_id', orgId)

  if (updateError) {
    console.error('Update event status error:', updateError)
    return { success: false, error: `Database error: ${updateError.message}` }
  }

  revalidatePath(`/${orgSlug}/events`)
  revalidatePath(`/${orgSlug}`)
  return { success: true }
}
