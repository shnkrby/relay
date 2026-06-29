import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Building2Icon, ShieldCheckIcon, UserCircle2Icon, BriefcaseBusinessIcon } from 'lucide-react'
import { MemberList } from './_components/member-list'
import { ManageOrgDialog } from './_components/manage-org-dialog'
import { ManageBoardDialog } from './_components/manage-board-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function OrganizationPage({
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

  // Get the org details
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', orgSlug)
    .single()
    
  if (!org) {
    redirect('/organizations')
  }

  // Get user role in this org
  const { data: memberData } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('profile_id', user.id)
    .single()

  const role = memberData?.role || 'member'
  const isAdmin = role === 'admin' || role === 'owner'

  // Fetch all members for the roster and leadership
  const { data: membersData } = await supabase
    .from('org_members')
    .select('profile_id, role, executive_title, joined_at, profiles(id, full_name, email, avatar_url)')
    .eq('org_id', org.id)
    .order('role', { ascending: false }) // 'owner' comes before 'admin' and 'member'

  const members = membersData?.map((m: any) => {
    const profile = m.profiles ? (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles) : null;
    return {
      id: m.profile_id,
      role: m.role,
      executiveTitle: m.executive_title,
      executive_title: m.executive_title, // For manage board dialog compatibility
      joinedAt: m.joined_at,
      name: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown Member',
      email: profile?.email || '',
      avatarUrl: profile?.avatar_url,
    }
  }) || []

  const executives = members.filter(m => m.role === 'owner' || m.role === 'admin')
  const isOwner = role === 'owner'
  const vacantRoles = (org.vacant_roles as string[]) || []

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
            {org.logo_url ? (
              <img src={org.logo_url} alt={org.name} className="size-12 rounded-lg object-cover border shadow-sm" />
            ) : (
              <Building2Icon className="size-10 text-blue-600" />
            )}
            {org.name}
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
            {org.description || "Manage your organization, team members, and workspace settings."}
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-3">
            <ManageOrgDialog org={org} />
          </div>
        )}
      </div>

      {/* Leadership / Executive Board Area */}
      <div className="mt-4 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheckIcon className="size-6 text-primary" />
              Executive Board
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              The leadership team guiding {org.name}.
            </p>
          </div>
          {isOwner && (
            <ManageBoardDialog 
              orgId={org.id} 
              orgSlug={orgSlug} 
              members={members} 
              currentUserId={user.id} 
              vacantRoles={vacantRoles}
            />
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {executives.map((exec) => (
            <div key={exec.id} className="flex flex-col bg-card rounded-xl shadow-sm ring-1 ring-border overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-2 w-full ${exec.role === 'owner' ? 'bg-amber-500' : 'bg-primary'}`} />
              <div className="p-6 flex flex-col items-center text-center space-y-4">
                <Avatar className="size-20">
                  <AvatarImage src={exec.avatarUrl || ''} alt={exec.name} />
                  <AvatarFallback className="text-2xl bg-secondary text-muted-foreground">
                    {exec.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-foreground line-clamp-1">{exec.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{exec.email}</p>
                </div>
                <div className="pt-4 border-t border-border w-full flex flex-col items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <BriefcaseBusinessIcon className="size-3.5" />
                    {exec.executiveTitle || 'Executive'}
                  </span>
                  {exec.role === 'owner' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                      Organization Owner
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {vacantRoles.map((title, idx) => (
            <div key={`vacant-${idx}`} className="flex flex-col bg-card rounded-xl shadow-sm ring-1 ring-border overflow-hidden hover:shadow-md transition-shadow opacity-75">
              <div className="h-2 w-full bg-muted" />
              <div className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="bg-secondary p-4 rounded-full border-2 border-dashed border-border">
                  <UserCircle2Icon className="size-12 text-muted-foreground" strokeWidth={1} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-muted-foreground italic line-clamp-1">Empty Position</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">Unassigned</p>
                </div>
                <div className="pt-4 border-t border-border w-full flex flex-col items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    <BriefcaseBusinessIcon className="size-3.5" />
                    {title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-8 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">All Members</h2>
        <MemberList members={members} org={org} currentUserId={user.id} isAdmin={isAdmin} />
      </div>
    </div>
  )
}
