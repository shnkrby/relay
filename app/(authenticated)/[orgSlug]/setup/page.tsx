import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldAlertIcon, ShieldCheckIcon } from 'lucide-react'
import { SetupWizard } from './_components/setup-wizard'

export default async function SetupPage({
  params
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const supabase = await createClient()
  const { orgSlug } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Verify the user is a member of this organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, slug, is_setup_complete')
    .eq('slug', orgSlug)
    .single()

  if (orgError || !org) {
    redirect('/organizations')
  }

  // If already setup, redirect to dashboard
  if (org.is_setup_complete) {
    redirect(`/${orgSlug}`)
  }

  // Fetch user role
  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('profile_id', user.id)
    .single()

  const isOwner = membership?.role === 'owner'

  if (!isOwner) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <ShieldAlertIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Leadership Setup Pending
          </h1>
          <p className="text-slate-500">
            The workspace for <strong>{org.name}</strong> is currently locked. We are waiting for the Organization Owner to complete the leadership board setup before members can enter.
          </p>
        </div>
      </div>
    )
  }

  // Fetch all members for the owner to assign
  const { data: members } = await supabase
    .from('org_members')
    .select(`
      profile_id,
      role,
      profiles (
        id,
        full_name,
        email
      )
    `)
    .eq('org_id', org.id)

  const formattedMembers = members?.map((m: any) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return {
      id: m.profile_id,
      name: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown',
      email: profile?.email || '',
      role: m.role
    }
  }) || []

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 mb-6 shadow-lg shadow-blue-600/20">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Define your Executive Board
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Welcome, Owner. Before you can access the <strong>{org.name}</strong> workspace, you must appoint your Executive Leaders. Executives hold ultimate power and can manage all members and tasks.
          </p>
        </div>

        <div className="bg-white px-8 py-10 shadow-sm ring-1 ring-slate-200 sm:rounded-xl">
          <SetupWizard 
            orgId={org.id} 
            orgSlug={orgSlug} 
            members={formattedMembers} 
            currentUserId={user.id} 
          />
        </div>
      </div>
    </div>
  )
}
