'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createCommitteeSchema } from '@/lib/validations/committee'

export async function updateCommittee(
  committeeId: string, 
  orgId: string, 
  orgSlug: string, 
  prevState: any, 
  formData: FormData
) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  
  // Zod validation
  const result = createCommitteeSchema.safeParse({ name })
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

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
    return { success: false, error: 'Unauthorized. Only admins can update committees.' }
  }

  // Check for duplicate name
  const { data: existingCommittee } = await supabase
    .from('committees')
    .select('id')
    .eq('org_id', orgId)
    .ilike('name', name)
    .neq('id', committeeId)
    .single()
    
  if (existingCommittee) {
    return { success: false, error: 'A committee with this name already exists.' }
  }

  // Update committee
  const { error: updateError } = await supabase
    .from('committees')
    .update({ name })
    .eq('id', committeeId)
    .eq('org_id', orgId) // extra safety check

  if (updateError) {
    console.error('Update committee error:', updateError)
    return { success: false, error: `Database error: ${updateError.message || 'Failed to update committee.'}` }
  }

  revalidatePath(`/${orgSlug}/committees`)
  return { success: true, data: { id: committeeId } }
}
