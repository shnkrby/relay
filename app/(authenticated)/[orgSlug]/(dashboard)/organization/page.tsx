import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Building2Icon } from 'lucide-react'
import { MemberList } from './_components/member-list'
import { ManageOrgDialog } from './_components/manage-org-dialog'

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

  // Fetch all members for the roster
  const { data: membersData } = await supabase
    .from('org_members')
    .select('profile_id, role, executive_title, joined_at, profiles(id, full_name, email, avatar_url)')
    .eq('org_id', org.id)
    .order('joined_at', { ascending: true })

  const members = membersData?.map((m: any) => {
    const profile = m.profiles ? (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles) : null;
    return {
      id: m.profile_id,
      role: m.role,
      executiveTitle: m.executive_title,
      joinedAt: m.joined_at,
      name: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown Member',
      email: profile?.email || '',
      avatarUrl: profile?.avatar_url,
    }
  }) || []

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

      {/* Main Content Area */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Organization Members</h2>
        <MemberList members={members} org={org} currentUserId={user.id} isAdmin={isAdmin} />
      </div>
    </div>
  )
}
