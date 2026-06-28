'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { transferExecutiveSchema } from '@/lib/validations/committee'

export async function transferExecutive(orgSlug: string, orgId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const newExecutiveId = formData.get('newExecutiveId') as string
  const committeeId = formData.get('committeeId') as string
  
  const result = transferExecutiveSchema.safeParse({ newExecutiveId, committeeId })
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Check if current user is admin/owner
  const { data: memberData } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('profile_id', user.id)
    .single()

  const isAdmin = memberData && (memberData.role === 'owner' || memberData.role === 'admin')

  // Get current committee
  const { data: committee, error: committeeError } = await supabase
    .from('committees')
    .select('executive_id')
    .eq('id', committeeId)
    .eq('org_id', orgId)
    .single()

  if (committeeError || !committee) {
    return { success: false, error: 'Committee not found.' }
  }

  const isCurrentExecutive = committee.executive_id === user.id

  if (!isAdmin && !isCurrentExecutive) {
    return { success: false, error: 'Unauthorized. Only admins or the current Executive-in-Charge can transfer executive status.' }
  }

  // Ensure the target is actually an admin or owner
  const { data: targetMemberData } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('profile_id', newExecutiveId)
    .single()

  if (!targetMemberData || (targetMemberData.role !== 'owner' && targetMemberData.role !== 'admin')) {
    return { success: false, error: 'The new Executive-in-Charge must be an Admin or Owner.' }
  }

  // Update the committee
  const { error: updateError } = await supabase
    .from('committees')
    .update({ executive_id: newExecutiveId })
    .eq('id', committeeId)

  if (updateError) {
    console.error('Transfer executive error:', updateError)
    return { success: false, error: `Database error: ${updateError.message || 'Failed to transfer executive.'}` }
  }

  revalidatePath(`/${orgSlug}/committees`)
  return { success: true }
}
