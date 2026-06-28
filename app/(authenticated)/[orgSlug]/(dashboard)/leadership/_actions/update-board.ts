'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ExecutiveInput {
  profileId: string
  title: string
}

export async function updateBoard(orgSlug: string, orgId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const executivesJson = formData.get('executives') as string
  if (!executivesJson) return { success: false, error: 'Invalid payload' }

  let executives: ExecutiveInput[]
  try {
    executives = JSON.parse(executivesJson)
  } catch (e) {
    return { success: false, error: 'Failed to parse executives' }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Verify the current user is the owner
  const { data: memberData } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('profile_id', user.id)
    .single()

  if (!memberData || memberData.role !== 'owner') {
    return { success: false, error: 'Unauthorized. Only the owner can manage the board.' }
  }

  // 1. Demote everyone in the org to 'member' and clear titles first (except owner)
  const { error: demoteError } = await supabase
    .from('org_members')
    .update({ role: 'member', executive_title: null })
    .eq('org_id', orgId)
    .neq('profile_id', user.id)

  if (demoteError) {
    console.error('Failed to clear board:', demoteError)
    return { success: false, error: 'Failed to clear previous board members.' }
  }

  // 2. Assign the new executives
  for (const exec of executives) {
    if (!exec.profileId || exec.profileId === 'empty') continue

    // Owner is always owner, others become admins
    const roleToSet = exec.profileId === user.id ? 'owner' : 'admin'
    
    const { error: updateError } = await supabase
      .from('org_members')
      .update({ 
        role: roleToSet, 
        executive_title: exec.title 
      })
      .eq('org_id', orgId)
      .eq('profile_id', exec.profileId)

    if (updateError) {
      console.error('Failed to update executive:', updateError)
      return { success: false, error: 'Failed to assign executive titles.' }
    }
  }

  // 3. Update vacant roles in the organization table
  const vacantRoles = executives.filter(e => !e.profileId || e.profileId === 'empty').map(e => e.title)
  const { error: vacantError } = await supabase
    .from('organizations')
    .update({ vacant_roles: vacantRoles })
    .eq('id', orgId)

  if (vacantError) {
    console.error('Failed to update vacant roles:', vacantError)
    return { success: false, error: 'Failed to update vacant roles.' }
  }

  revalidatePath(`/${orgSlug}/leadership`)
  return { success: true }
}
