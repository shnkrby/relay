'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  const file = formData.get('avatar') as File
  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided.' }
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Only JPG, PNG, and WebP images are allowed.' }
  }

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    return { success: false, error: 'File size must be 2MB or less.' }
  }

  // Generate a unique file path
  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/avatar.${fileExt}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    console.error('Upload avatar error:', uploadError)
    return { success: false, error: `Upload failed: ${uploadError.message}` }
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  const avatarUrl = urlData.publicUrl

  // Update the profiles table with the avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (updateError) {
    console.error('Update avatar_url error:', updateError)
    return { success: false, error: 'Failed to save avatar URL.' }
  }

  revalidatePath('/profile')
  revalidatePath('/', 'layout')

  return { success: true, avatarUrl }
}
