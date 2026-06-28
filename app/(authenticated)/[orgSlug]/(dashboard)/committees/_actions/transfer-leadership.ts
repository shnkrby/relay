'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { transferLeadershipSchema } from '@/lib/validations/committee'

export async function transferLeadership(orgSlug: string, orgId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const newLeadId = formData.get('newLeadId') as string
  const committeeId = formData.get('committeeId') as string
  
  const result = transferLeadershipSchema.safeParse({ newLeadId, committeeId })
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
    .select('lead_id')
    .eq('id', committeeId)
    .eq('org_id', orgId)
    .single()

  if (committeeError || !committee) {
    return { success: false, error: 'Committee not found.' }
  }

  const isCurrentLead = committee.lead_id === user.id

  if (!isAdmin && !isCurrentLead) {
    return { success: false, error: 'Unauthorized. Only admins or the current leader can transfer leadership.' }
  }

  // Update the committee
  const { error: updateError } = await supabase
    .from('committees')
    .update({ lead_id: newLeadId })
    .eq('id', committeeId)

  if (updateError) {
    console.error('Transfer leadership error:', updateError)
    return { success: false, error: `Database error: ${updateError.message || 'Failed to transfer leadership.'}` }
  }

  // Ensure the new lead is also in the committee members table
  const { error: insertError } = await supabase
    .from('committee_members')
    .insert({
      committee_id: committeeId,
      profile_id: newLeadId,
    })

  // Ignore 23505 (unique violation), which means they are already a member
  if (insertError && insertError.code !== '23505') {
    console.error('Failed to add new leader as member:', insertError)
  }

  revalidatePath(`/${orgSlug}/committees`)
  return { success: true }
}
