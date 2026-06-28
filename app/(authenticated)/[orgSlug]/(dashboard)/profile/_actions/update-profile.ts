'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(
  prevState: any,
  formData: FormData
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  const fullName = formData.get('full_name') as string

  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: 'Name must be at least 2 characters.' }
  }

  if (fullName.trim().length > 100) {
    return { success: false, error: 'Name must be 100 characters or less.' }
  }

  // Update the profiles table
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ full_name: fullName.trim() })
    .eq('id', user.id)

  if (updateError) {
    console.error('Update profile error:', updateError)
    return { success: false, error: 'Failed to update profile.' }
  }

  // Also update auth metadata so it's available on the user object
  await supabase.auth.updateUser({
    data: { full_name: fullName.trim() }
  })

  revalidatePath('/profile')
  revalidatePath('/', 'layout') // Revalidate layouts that display the user's name

  return { success: true }
}
