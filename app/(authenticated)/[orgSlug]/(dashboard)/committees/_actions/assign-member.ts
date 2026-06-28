'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { assignMemberSchema } from '@/lib/validations/committee'

export async function assignMember(orgSlug: string, orgId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const profileId = formData.get('profileId') as string
  const committeeId = formData.get('committeeId') as string
  
  const result = assignMemberSchema.safeParse({ profileId, committeeId })
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Verify current user is admin/owner
  const { data: memberData, error: memberError } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('profile_id', user.id)
    .single()

  const isAdmin = memberData && (memberData.role === 'owner' || memberData.role === 'admin')

  // Check if current user is the committee leader
  const { data: committee } = await supabase
    .from('committees')
    .select('lead_id')
    .eq('id', committeeId)
    .single()

  const isLeader = committee?.lead_id === user.id

  if (!isAdmin && !isLeader) {
    return { success: false, error: 'Unauthorized. Only admins or the committee leader can assign members.' }
  }

  // Insert committee member
  const { error: insertError } = await supabase
    .from('committee_members')
    .insert({
      committee_id: committeeId,
      profile_id: profileId,
    })

  if (insertError) {
    // If it's a unique constraint violation, they're already in it
    if (insertError.code === '23505') {
      return { success: false, error: 'Member is already assigned to this committee.' }
    }
    console.error('Assign member error:', insertError)
    return { success: false, error: `Database error: ${insertError.message || 'Failed to assign member.'}` }
  }

  revalidatePath(`/${orgSlug}/committees`)
  return { success: true }
}
