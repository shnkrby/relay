'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function leaveOrganization(orgSlug: string, orgId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Check role
  const { data: memberData } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('profile_id', user.id)
    .single()

  if (!memberData) {
    return { success: false, error: 'You are not a member of this organization.' }
  }

  // Owners cannot leave unless they transfer ownership first or there are other owners
  if (memberData.role === 'owner') {
    const { data: owners } = await supabase
      .from('org_members')
      .select('profile_id')
      .eq('org_id', orgId)
      .eq('role', 'owner')
    
    if (owners && owners.length <= 1) {
      return { success: false, error: 'You are the only owner. Transfer ownership or delete the organization instead.' }
    }
  }

  // Delete from org_members
  const { error: deleteError } = await supabase
    .from('org_members')
    .delete()
    .eq('org_id', orgId)
    .eq('profile_id', user.id)

  if (deleteError) {
    console.error('Leave organization error:', deleteError)
    return { success: false, error: `Database error: ${deleteError.message || 'Failed to leave organization.'}` }
  }

  revalidatePath('/organizations')
  return { success: true }
}
