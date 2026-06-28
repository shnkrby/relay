'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { updateOrgProfileSchema } from '@/lib/validations/organization'

export async function updateOrgProfile(
  orgId: string, 
  orgSlug: string, 
  prevState: any, 
  formData: FormData
) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  
  // Zod validation
  const result = updateOrgProfileSchema.safeParse({ name, description })
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
    return { success: false, error: 'Unauthorized. Only admins can update organization settings.' }
  }

  // Update org
  const { error: updateError } = await supabase
    .from('organizations')
    .update({ name, description })
    .eq('id', orgId)

  if (updateError) {
    console.error('Update org error:', updateError)
    return { success: false, error: `Database error: ${updateError.message || 'Failed to update organization.'}` }
  }

  revalidatePath(`/${orgSlug}/organization`)
  // Also revalidate the layout if name changed
  revalidatePath(`/${orgSlug}`, 'layout')
  
  return { success: true }
}
