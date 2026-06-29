'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications'

export async function createGlobalTask(
  orgSlug: string, 
  prevState: any, 
  formData: FormData
) {
  const supabase = await createClient()

  const dutyId = formData.get('duty_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const assigneeIdsStr = formData.get('assignee_ids') as string | null
  const assignee_ids = assigneeIdsStr ? assigneeIdsStr.split(',').filter(Boolean) : []
  const priority = formData.get('priority') as string
  const due_date = formData.get('due_date') as string | null

  if (!dutyId) {
    return { success: false, error: 'Duty context is required.' }
  }

  if (!title) {
    return { success: false, error: 'Task title is required.' }
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Verify that the duty belongs to the org
  const { data: dutyCheck } = await supabase
    .from('event_duties')
    .select('events!inner(org_id)')
    .eq('id', dutyId)
    .single()

  if (!dutyCheck) {
    return { success: false, error: 'Invalid duty context.' }
  }

  // Insert task and get its ID
  const { data: task, error: insertError } = await supabase
    .from('tasks')
    .insert({
      duty_id: dutyId,
      assigner_id: user.id,
      title,
      description,
      priority,
      due_date: due_date || null,
      status: 'pending'
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('Create global task error:', insertError)
    return { success: false, error: `Database error: ${insertError.message}` }
  }

  if (assignee_ids.length > 0 && task) {
    // Insert into task_assignees junction table
    const assigneeRecords = assignee_ids.map(id => ({
      task_id: task.id,
      profile_id: id
    }))
    
    const { error: assigneesError } = await supabase
      .from('task_assignees')
      .insert(assigneeRecords)

    if (assigneesError) {
      console.error('Task assignees error:', assigneesError)
      // We don't fail the whole action, but we should log it.
    } else {
      // Create notifications for each assignee (except if they assigned themselves)
      for (const assignee_id of assignee_ids) {
        if (assignee_id !== user.id) {
          await createNotification({
            recipientId: assignee_id,
            orgId: Array.isArray(dutyCheck.events) ? (dutyCheck.events[0] as any).org_id : (dutyCheck.events as any).org_id,
            type: 'task_assigned',
            title: 'New Task Assigned',
            message: `You have been assigned to: ${title}`,
            link: `/${orgSlug}/duties/${dutyId}`
          })
        }
      }
    }
  }

  revalidatePath(`/${orgSlug}/tasks`)
  revalidatePath(`/${orgSlug}`)
  
  return { success: true }
}
