import { JoinOrgCard } from './_components/join-org-card'
import { CreateOrgCard } from './_components/create-org-card'
import { OrgList } from './_components/org-list'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OrganizationsGatewayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch organizations the user belongs to
  const { data: userOrgs } = await supabase
    .from('org_members')
    .select(`
      role,
      organizations (
        id,
        name,
        slug,
        logo_url
      )
    `)
    .eq('profile_id', user.id)

  const hasOrgs = userOrgs && userOrgs.length > 0

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-10 mt-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {hasOrgs ? 'Welcome back to Relay' : 'Where are you heading today?'}
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          {hasOrgs 
            ? 'Select an organization to enter your workspace.' 
            : 'Get started by joining an existing organization or creating a new one.'}
        </p>
      </div>

      {hasOrgs && <OrgList organizations={userOrgs as any} />}

      <div className="w-full flex flex-col gap-4">
        {hasOrgs && (
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-4">
            Or create / join another
          </h2>
        )}
        <div className="grid w-full gap-8 md:grid-cols-2">
          <JoinOrgCard />
          <CreateOrgCard />
        </div>
      </div>
    </div>
  )
}
