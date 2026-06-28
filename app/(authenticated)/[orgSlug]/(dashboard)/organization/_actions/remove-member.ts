'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function removeMember(orgId: string, orgSlug: string, profileId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  if (user.id === profileId) {
    return { success: false, error: 'You cannot remove yourself. Use the leave organization option instead.' }
  }

  // Verify user is an owner/admin of this org
  const { data: memberData, error: memberError } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('profile_id', user.id)
    .single()

  if (memberError || !memberData || (memberData.role !== 'owner' && memberData.role !== 'admin')) {
    return { success: false, error: 'Unauthorized. Only admins can remove members.' }
  }

  // Check target member's role to prevent admins from kicking owners
  const { data: targetMember } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('profile_id', profileId)
    .single()

  if (targetMember?.role === 'owner' && memberData.role !== 'owner') {
     return { success: false, error: 'Admins cannot remove the organization owner.' }
  }

  // Remove the member
  const { error: deleteError } = await supabase
    .from('org_members')
    .delete()
    .eq('org_id', orgId)
    .eq('profile_id', profileId)

  if (deleteError) {
    console.error('Remove member error:', deleteError)
    return { success: false, error: `Database error: ${deleteError.message}` }
  }

  revalidatePath(`/${orgSlug}/organization`)
  return { success: true }
}
