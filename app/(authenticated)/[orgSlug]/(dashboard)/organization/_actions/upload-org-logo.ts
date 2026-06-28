'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadOrgLogo(orgId: string, orgSlug: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Verify admin role
  const { data: memberData } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('profile_id', user.id)
    .single()

  if (!memberData || (memberData.role !== 'owner' && memberData.role !== 'admin')) {
    return { success: false, error: 'Only admins can update the organization logo.' }
  }

  const file = formData.get('logo') as File
  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided.' }
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Only JPG, PNG, and WebP images are allowed.' }
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: 'File size must be 2MB or less.' }
  }

  const fileExt = file.name.split('.').pop()
  const filePath = `${orgId}/logo.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('org-logos')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    console.error('Upload org logo error:', uploadError)
    return { success: false, error: `Upload failed: ${uploadError.message}` }
  }

  const { data: urlData } = supabase.storage
    .from('org-logos')
    .getPublicUrl(filePath)

  const { error: updateError } = await supabase
    .from('organizations')
    .update({ logo_url: urlData.publicUrl })
    .eq('id', orgId)

  if (updateError) {
    console.error('Update logo_url error:', updateError)
    return { success: false, error: 'Failed to save logo URL.' }
  }

  revalidatePath(`/${orgSlug}/organization`)
  revalidatePath(`/${orgSlug}`, 'layout')

  return { success: true, logoUrl: urlData.publicUrl }
}
