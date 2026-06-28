'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { createCommitteeSchema } from '@/lib/validations/committee'

export async function createCommittee(orgSlug: string, orgId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const leadId = formData.get('leadId') as string
  const memberLimitStr = formData.get('memberLimit') as string | null
  const memberLimit = memberLimitStr ? parseInt(memberLimitStr, 10) : null
  
  // Zod validation
  const result = createCommitteeSchema.safeParse({ name, description, leadId, memberLimit })
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
    return { success: false, error: 'Unauthorized. Only admins can create committees.' }
  }

  // Check for duplicate name
  const { data: existingCommittee } = await supabase
    .from('committees')
    .select('id')
    .eq('org_id', orgId)
    .ilike('name', name)
    .single()
    
  if (existingCommittee) {
    return { success: false, error: 'A committee with this name already exists.' }
  }

  const committeeId = crypto.randomUUID()

  // Insert committee
  const { error: insertError } = await supabase
    .from('committees')
    .insert({
      id: committeeId,
      org_id: orgId,
      name,
      description,
      executive_id: user.id,
      lead_id: leadId,
      member_limit: memberLimit,
    })

  if (insertError) {
    console.error('Create committee error:', insertError)
    return { success: false, error: `Database error: ${insertError.message || 'Failed to create committee.'}` }
  }

  // Automatically add the creator (lead) as a member of the committee
  const { error: memberInsertError } = await supabase
    .from('committee_members')
    .insert({
      committee_id: committeeId,
      profile_id: leadId,
    })

  if (memberInsertError) {
    console.error('Failed to add lead as member:', memberInsertError)
    // We should return this error so the user knows
    return { success: false, error: `Created committee, but failed to assign head: ${memberInsertError.message}` }
  }

  revalidatePath(`/${orgSlug}/committees`)
  return { success: true, data: { id: committeeId } }
}
