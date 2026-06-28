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

  const assignee_id = formData.get('assignee_id') as string | null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { error } = await supabase
    .from('tasks')
    .update({
      assignee_id: assignee_id || null
    })
    .eq('id', taskId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/${orgSlug}/duties/${dutyId}`)
  return { success: true }
}
