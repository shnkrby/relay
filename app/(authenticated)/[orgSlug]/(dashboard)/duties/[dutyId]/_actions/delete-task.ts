'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteTask(taskId: string, dutyId: string, orgSlug: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/${orgSlug}/duties/${dutyId}`)
  return { success: true }
}
