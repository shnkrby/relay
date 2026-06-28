'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ExecutiveInput {
  profileId: string
  title: string
}

export async function completeSetup(orgSlug: string, orgId: string, prevState: any, formData: FormData) {
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
    return { success: false, error: 'Unauthorized. Only the owner can complete setup.' }
  }

  // Transaction-like updates
  // 1. Demote everyone in the org to 'member' and clear titles first (just in case)
  await supabase
    .from('org_members')
    .update({ role: 'member', executive_title: null })
    .eq('org_id', orgId)
    .neq('profile_id', user.id) // keep owner safe

  // 2. Assign the new executives
  for (const exec of executives) {
    if (!exec.profileId || exec.profileId === 'empty') {
      continue // Skip vacant seats
    }

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

  // 3. Mark setup as complete and save vacant roles
  const vacantRoles = executives.filter(e => !e.profileId || e.profileId === 'empty').map(e => e.title)

  const { error: finalizeError } = await supabase
    .from('organizations')
    .update({ 
      is_setup_complete: true,
      vacant_roles: vacantRoles
    })
    .eq('id', orgId)

  if (finalizeError) {
    console.error('Finalize setup error:', finalizeError)
    return { success: false, error: 'Failed to finalize setup state.' }
  }

  revalidatePath(`/${orgSlug}`)
  return { success: true }
}
