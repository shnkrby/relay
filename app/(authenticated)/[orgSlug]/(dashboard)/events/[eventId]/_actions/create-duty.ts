'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDuty(
  eventId: string, 
  orgSlug: string, 
  prevState: any, 
  formData: FormData
) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const committee_id = formData.get('committee_id') as string

  if (!name || !committee_id) {
    return { success: false, error: 'Duty name and committee are required.' }
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Get event to verify org
  const { data: event } = await supabase
    .from('events')
    .select('org_id')
    .eq('id', eventId)
    .single()

  if (!event) {
    return { success: false, error: 'Event not found.' }
  }

  // Verify user is an admin/owner of this org
  const { data: memberData } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', event.org_id)
    .eq('profile_id', user.id)
    .single()

  if (!memberData || (memberData.role !== 'owner' && memberData.role !== 'admin')) {
    return { success: false, error: 'Unauthorized. Only admins can assign duties.' }
  }

  // Insert duty
  const { error: insertError } = await supabase
    .from('event_duties')
    .insert({
      event_id: eventId,
      committee_id,
      name
    })

  if (insertError) {
    console.error('Create duty error:', insertError)
    return { success: false, error: `Database error: ${insertError.message}` }
  }

  revalidatePath(`/${orgSlug}/events/${eventId}`)
  return { success: true }
}
