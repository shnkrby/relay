import { OrgActionSelector } from './_components/org-action-selector'
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
        description,
        logo_url
      )
    `)
    .eq('profile_id', user.id)

  const hasOrgs = userOrgs && userOrgs.length > 0

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="flex w-full max-w-6xl flex-col items-center gap-12 z-10">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {hasOrgs ? 'Welcome to your Workspace' : 'Begin your Journey'}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">
            {hasOrgs 
              ? 'Select an organization to continue where you left off.' 
              : 'Join an existing organization with a code, or create a fresh workspace from scratch.'}
          </p>
        </div>

        <div className="w-full mt-4">
          <div className="grid w-full gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {hasOrgs && <OrgList organizations={userOrgs as any} />}
            <OrgActionSelector />
          </div>
        </div>
      </div>
    </div>
  )
}
