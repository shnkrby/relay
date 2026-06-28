'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function regenerateJoinCode(orgId: string, orgSlug: string) {
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
    return { success: false, error: 'Unauthorized. Only admins can regenerate join codes.' }
  }

  // Generate new join code (6 random uppercase letters/numbers)
  const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  // Update org
  const { error: updateError } = await supabase
    .from('organizations')
    .update({ join_code: newCode })
    .eq('id', orgId)

  if (updateError) {
    console.error('Regenerate join code error:', updateError)
    return { success: false, error: `Database error: ${updateError.message}` }
  }

  revalidatePath(`/${orgSlug}/organization`)
  return { success: true, newCode }
}
