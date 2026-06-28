'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { joinOrgSchema } from '@/lib/validations/org'

export async function joinOrg(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const joinCode = formData.get('joinCode') as string
  
  // Zod validation
  const result = joinOrgSchema.safeParse({ joinCode })
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated.' }
  }

  // Call the secure RPC function to verify code and join
  const { data: orgSlug, error: rpcError } = await supabase
    .rpc('join_org_by_code', { p_join_code: joinCode })

  if (rpcError) {
    console.error('Join org RPC error:', rpcError)
    // If the error message from Postgres is our custom 'Invalid join code', return it
    if (rpcError.message.includes('Invalid join code')) {
      return { success: false, error: 'Invalid join code. Please try again.' }
    }
    return { success: false, error: `Database error: ${rpcError.message}` }
  }

  if (!orgSlug) {
    return { success: false, error: 'Failed to join organization.' }
  }

  revalidatePath('/organizations')
  return { success: true, data: { slug: orgSlug } }
}
