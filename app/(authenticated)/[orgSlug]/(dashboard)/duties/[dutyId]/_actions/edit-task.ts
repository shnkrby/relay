'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function editTask(
  taskId: string,
  dutyId: string, 
  orgSlug: string, 
  prevState: any, 
  formData: FormData
) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const priority = formData.get('priority') as string
  const due_date = formData.get('due_date') as string | null

  if (!title) {
    return { success: false, error: 'Task title is required.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { error } = await supabase
    .from('tasks')
    .update({
      title,
      description,
      priority,
      due_date: due_date || null
    })
    .eq('id', taskId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/${orgSlug}/duties/${dutyId}`)
  return { success: true }
}
