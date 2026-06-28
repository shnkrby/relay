'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

  revalidatePath(`/${orgSlug}/duties/${dutyId}`)
  return { success: true }
}
