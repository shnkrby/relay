'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { TaskStatus } from '@/types/database'

export async function updateTaskStatus(
  taskId: string, 
  dutyId: string,
  orgSlug: string, 
  newStatus: TaskStatus,
  completionReport?: string,
  overdueReason?: string
) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Update task
  const { error: updateError } = await supabase
    .from('tasks')
    .update({ 
      status: newStatus,
      ...(completionReport !== undefined ? { completion_report: completionReport } : {}),
      ...(overdueReason !== undefined ? { overdue_reason: overdueReason } : {})
    })
    .eq('id', taskId)

  if (updateError) {
    console.error('Update task error:', updateError)
    return { success: false, error: `Database error: ${updateError.message}` }
  }

  revalidatePath(`/${orgSlug}/duties/${dutyId}`)
  return { success: true }
}
