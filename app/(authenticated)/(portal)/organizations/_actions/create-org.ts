'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import crypto from 'crypto'

export async function createOrg(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const orgName = formData.get('orgName') as string
  if (!orgName || orgName.trim() === '') {
    return { success: false, error: 'Organization name is required.' }
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Generate slug and join code
  const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const joinCode = `RELAY-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

  // Insert organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: orgName,
      slug,
      join_code: joinCode,
    })
    .select('id, slug')
    .single()

  if (orgError) {
    console.error('Create org error:', orgError)
    // Handle uniqueness constraints if slug already exists
    return { success: false, error: 'Failed to create organization. Please try a different name.' }
  }

  // Insert owner into org_members
  const { error: memberError } = await supabase
    .from('org_members')
    .insert({
      org_id: org.id,
      profile_id: user.id,
      role: 'owner',
    })

  if (memberError) {
    console.error('Add member error:', memberError)
    return { success: false, error: 'Organization created, but failed to add you as an owner.' }
  }

  // Redirect to the new workspace (e.g. /workspace/[slug])
  // We will assume the workspace URL structure is /workspace/[slug] or similar.
  // For now we revalidate portal and redirect.
  revalidatePath('/organizations')
  // We redirect to the new org dashboard, but since we don't have it yet, we just stay or redirect to a known path.
  // Let's assume the dashboard is /w/[slug] or /[slug]
  redirect(`/${org.slug}`)
}
