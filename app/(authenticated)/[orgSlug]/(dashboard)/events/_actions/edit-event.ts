'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function editEvent(
  orgId: string, 
  orgSlug: string, 
  eventId: string,
  prevState: any, 
  formData: FormData
) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const startDateStr = formData.get('start_date') as string | null
  const endDateStr = formData.get('end_date') as string | null

  if (!title) {
    return { success: false, error: 'Event title is required.' }
  }

  // Convert dates to ISO strings if provided
  const start_date = startDateStr ? new Date(startDateStr).toISOString() : null
  const end_date = endDateStr ? new Date(endDateStr).toISOString() : null

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
    return { success: false, error: 'Unauthorized. Only admins can edit events.' }
  }

  // Update event
  const { error: updateError } = await supabase
    .from('events')
    .update({
      title,
      description,
      start_date,
      end_date
    })
    .eq('id', eventId)
    .eq('org_id', orgId)

  if (updateError) {
    console.error('Edit event error:', updateError)
    return { success: false, error: `Database error: ${updateError.message}` }
  }

  revalidatePath(`/${orgSlug}/events`)
  revalidatePath(`/${orgSlug}`)
  return { success: true }
}
