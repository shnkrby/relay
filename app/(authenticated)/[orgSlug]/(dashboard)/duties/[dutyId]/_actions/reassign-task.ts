'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reassignTask(
  taskId: string,
  dutyId: string, 
  orgSlug: string, 
  prevState: any, 
  formData: FormData
) {
  const supabase = await createClient()

  const assigneeIdsStr = formData.get('assignee_ids') as string | null
  const assignee_ids = assigneeIdsStr ? assigneeIdsStr.split(',').filter(Boolean) : []

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  // 1. Delete existing assignees for this task
  const { error: deleteError } = await supabase
    .from('task_assignees')
    .delete()
    .eq('task_id', taskId)

  if (deleteError) return { success: false, error: deleteError.message }

  // 2. Insert new assignees
  if (assignee_ids.length > 0) {
    const assigneeRecords = assignee_ids.map(id => ({
      task_id: taskId,
      profile_id: id
    }))
    
    const { error: insertError } = await supabase
      .from('task_assignees')
      .insert(assigneeRecords)
      
    if (insertError) return { success: false, error: insertError.message }
  }

  revalidatePath(`/${orgSlug}/duties/${dutyId}`)
  return { success: true }
}
