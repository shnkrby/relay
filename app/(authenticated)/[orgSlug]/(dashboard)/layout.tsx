import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { getNotifications } from './_functions/get-notifications'

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
    .select('id, name, slug, is_setup_complete, logo_url')
    .eq('slug', orgSlug)
    .single()

  if (orgError || !org) {
    // RLS will block if they aren't a member, or it doesn't exist
    redirect('/organizations')
  }

  // Redirect to setup if not complete
  if (!org.is_setup_complete) {
    redirect(`/${orgSlug}/setup`)
  }

  // Fetch all user organizations for the switcher and the role for the current org
  let userOrgs: any[] = []
  let role = 'member'
  
  const { data: memberships } = await supabase
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

  if (memberships) {
    userOrgs = memberships.map((m: any) => m.organizations).filter(Boolean)
    const currentMembership = memberships.find((m: any) => m.organizations?.id === org.id)
    if (currentMembership) {
      role = currentMembership.role
    }
  }

  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1)
  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "User"
  const avatarUrl = profile?.avatar_url || null

  // Fetch notifications
  const { notifications, unreadCount } = await getNotifications(org.id, user.id)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" currentOrg={org} userOrgs={userOrgs} role={formattedRole} userName={userName} avatarUrl={avatarUrl} />
      <SidebarInset>
        <SiteHeader currentOrg={org} role={formattedRole} notifications={notifications} unreadCount={unreadCount} />
        <div className="flex flex-1 flex-col">
          <main id="main-content" className="relative flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
