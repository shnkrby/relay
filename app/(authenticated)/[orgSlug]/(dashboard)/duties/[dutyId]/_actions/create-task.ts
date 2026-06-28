'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications'

export async function createTask(
  dutyId: string, 
  orgSlug: string, 
  prevState: any, 
  formData: FormData
) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const assignee_id = formData.get('assignee_id') as string | null
  const priority = formData.get('priority') as string
  const due_date = formData.get('due_date') as string | null

  if (!title) {
    return { success: false, error: 'Task title is required.' }
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Insert task
  const { error: insertError } = await supabase
    .from('tasks')
    .insert({
      duty_id: dutyId,
      assignee_id: assignee_id || null,
      title,
      description,
      priority,
      due_date: due_date || null,
      status: 'pending'
    })

  if (insertError) {
    console.error('Create task error:', insertError)
    return { success: false, error: `Database error: ${insertError.message}` }
  }

  // If a task is assigned, notify the assignee
  if (assignee_id && assignee_id !== user.id) {
    // We need the orgId to send the notification
    const { data: duty } = await supabase
      .from('event_duties')
      .select('events(org_id)')
      .eq('id', dutyId)
      .single()
      
    const orgId = Array.isArray(duty?.events) ? duty?.events[0]?.org_id : (duty?.events as any)?.org_id
    
    if (orgId) {
      await createNotification({
        recipientId: assignee_id,
        orgId: orgId as string,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to: ${title}`,
        link: `/${orgSlug}/duties/${dutyId}`
      })
    }
  }

  revalidatePath(`/${orgSlug}/duties/${dutyId}`)
  return { success: true }
}
