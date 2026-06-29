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


  revalidatePath(`/${orgSlug}/duties/${dutyId}`)
  revalidatePath(`/${orgSlug}`)
  return { success: true }
}
