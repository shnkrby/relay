'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteCommittee(
  committeeId: string, 
  orgId: string, 
  orgSlug: string
) {
  const supabase = await createClient()

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
    return { success: false, error: 'Unauthorized. Only admins can delete committees.' }
  }

  // Delete committee
  const { error: deleteError } = await supabase
    .from('committees')
    .delete()
    .eq('id', committeeId)
    .eq('org_id', orgId)

  if (deleteError) {
    console.error('Delete committee error:', deleteError)
    return { success: false, error: `Database error: ${deleteError.message || 'Failed to delete committee.'}` }
  }

  revalidatePath(`/${orgSlug}/committees`)
  return { success: true }
}
