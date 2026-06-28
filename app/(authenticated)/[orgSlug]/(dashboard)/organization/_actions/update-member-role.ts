'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateMemberRole(orgId: string, orgSlug: string, profileId: string, newRole: 'admin' | 'member') {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Verify user is an owner/admin of this org
  const { data: memberData, error: memberError } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('profile_id', user.id)
    .single()

  if (memberError || !memberData || (memberData.role !== 'owner' && memberData.role !== 'admin')) {
    return { success: false, error: 'Unauthorized. Only admins can update roles.' }
  }

  // Check target member's role to prevent admins from modifying owners
  const { data: targetMember } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('profile_id', profileId)
    .single()

  if (targetMember?.role === 'owner') {
     return { success: false, error: 'Cannot modify the role of the organization owner.' }
  }

  // Update the member role
  const { error: updateError } = await supabase
    .from('org_members')
    .update({ role: newRole })
    .eq('org_id', orgId)
    .eq('profile_id', profileId)

  if (updateError) {
    console.error('Update member role error:', updateError)
    return { success: false, error: `Database error: ${updateError.message}` }
  }

  revalidatePath(`/${orgSlug}/organization`)
  return { success: true }
}
