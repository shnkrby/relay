'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createBulkNotifications } from '@/lib/notifications'

export async function createEvent(
  orgId: string, 
  orgSlug: string, 
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
    return { success: false, error: 'Unauthorized. Only admins can create events.' }
  }

  // Insert event
  const { error: insertError } = await supabase
    .from('events')
    .insert({
      org_id: orgId,
      title,
      description,
      status: 'upcoming',
      start_date,
      end_date
    })

  if (insertError) {
    console.error('Create event error:', insertError)
    return { success: false, error: `Database error: ${insertError.message}` }
  }

  // Fetch all org members to notify them
  const { data: members } = await supabase
    .from('org_members')
    .select('profile_id')
    .eq('org_id', orgId)

  if (members && members.length > 0) {
    const memberIds = members.map(m => m.profile_id).filter(id => id !== user.id) // Exclude creator
    
    await createBulkNotifications({
      recipientIds: memberIds,
      orgId,
      type: 'event_created',
      title: 'New Event Scheduled',
      message: `${title} has been scheduled.`,
      link: `/${orgSlug}/events`
    })
  }

  revalidatePath(`/${orgSlug}/events`)
  return { success: true }
}
