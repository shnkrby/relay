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
  const { data: userOrgs, error } = await supabase
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
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {hasOrgs ? 'Welcome back to Relay' : 'You\'re in. Now pick your path.'}
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 max-w-lg">
          {hasOrgs 
            ? 'Select an organization to enter your workspace.' 
            : 'Join an existing organization with a code, or create a fresh workspace from scratch.'}
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
