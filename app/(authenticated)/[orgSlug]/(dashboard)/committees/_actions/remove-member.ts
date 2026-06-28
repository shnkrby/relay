'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { removeMemberSchema } from '@/lib/validations/committee'

export async function removeMember(orgSlug: string, orgId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const profileId = formData.get('profileId') as string
  const committeeId = formData.get('committeeId') as string
  
  const result = removeMemberSchema.safeParse({ profileId, committeeId })
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
  const { data: committee } = await supabase
    .from('committees')
    .select('lead_id')
    .eq('id', committeeId)
    .single()

  const isLeader = committee?.lead_id === user.id
  const isSelf = profileId === user.id

  if (!isAdmin && !isLeader && !isSelf) {
    return { success: false, error: 'Unauthorized. Only admins, the committee leader, or the member themselves can perform this action.' }
  }

  // Cannot remove the leader (must transfer leadership first)
  if (profileId === committee?.lead_id) {
    return { success: false, error: 'Cannot remove the committee leader. Transfer leadership first.' }
  }

  // Delete committee member
  const { error: deleteError } = await supabase
    .from('committee_members')
    .delete()
    .eq('committee_id', committeeId)
    .eq('profile_id', profileId)

  if (deleteError) {
    console.error('Remove member error:', deleteError)
    return { success: false, error: `Database error: ${deleteError.message || 'Failed to remove member.'}` }
  }

  revalidatePath(`/${orgSlug}/committees`)
  return { success: true }
}
