'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { createOrgSchema } from '@/lib/validations/org'

export async function createOrg(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const orgName = formData.get('orgName') as string
  const memberLimitStr = formData.get('memberLimit') as string | null
  const memberLimit = memberLimitStr ? parseInt(memberLimitStr, 10) : null
  
  // Zod validation
  const result = createOrgSchema.safeParse({ orgName, memberLimit })
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Generate ID, slug and join code
  const orgId = crypto.randomUUID()
  const baseSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const slug = `${baseSlug}-${crypto.randomBytes(2).toString('hex')}`
  const joinCode = `RELAY-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

  // Insert organization
  const { error: orgError } = await supabase
    .from('organizations')
    .insert({
      id: orgId,
      name: orgName,
      slug,
      join_code: joinCode,
      member_limit: memberLimit,
    })

  if (orgError) {
    console.error('Create org error:', orgError)
    return { success: false, error: `Database error: ${orgError.message || orgError.details || 'Failed to create organization.'}` }
  }

  // Insert owner into org_members
  const { error: memberError } = await supabase
    .from('org_members')
    .insert({
      org_id: orgId,
      profile_id: user.id,
      role: 'owner',
    })

  if (memberError) {
    console.error('Add member error:', memberError)
    return { success: false, error: `Member add error: ${memberError.message}` }
  }

  revalidatePath('/organizations')
  return { success: true, data: { slug } }
}
