import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { orgSlug } = await params

  // Verify the user is a member of this organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', orgSlug)
    .single()

  if (orgError || !org) {
    // RLS will block if they aren't a member, or it doesn't exist
    redirect('/organizations')
  }

  // Fetch all user organizations for the switcher
  let userOrgs: any[] = []
  const { data: memberships } = await supabase
    .from('org_members')
    .select(`
      organizations (
        id,
        name,
        slug
      )
    `)
    .eq('profile_id', user.id)

  if (memberships) {
    userOrgs = memberships.map((m: any) => m.organizations).filter(Boolean)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" currentOrg={org} userOrgs={userOrgs} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
