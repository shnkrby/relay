'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function joinOrg(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const joinCode = formData.get('joinCode') as string
  if (!joinCode || joinCode.trim() === '') {
    return { success: false, error: 'Join code is required.' }
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Find organization by join code
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, slug')
    .eq('join_code', joinCode)
    .single()

  if (orgError || !org) {
    return { success: false, error: 'Invalid join code. Please try again.' }
  }

  // Insert user into org_members
  const { error: memberError } = await supabase
    .from('org_members')
    .insert({
      org_id: org.id,
      profile_id: user.id,
      role: 'member',
    })

  if (memberError) {
    // If the user is already a member, it might throw a unique constraint error
    if (memberError.code === '23505') {
      redirect(`/${org.slug}`)
    }
    console.error('Join org error:', memberError)
    return { success: false, error: 'Failed to join organization. Please try again.' }
  }

  revalidatePath('/organizations')
  redirect(`/${org.slug}`)
}
