import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UsersIcon } from 'lucide-react'
import { getCommittees } from './_functions/get-committees'
import { CommitteeList } from './_components/committee-list'
import { CreateCommitteeDialog } from './_components/create-committee-dialog'

export default async function CommitteesPage({
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
    .select('id, name')
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

  // Fetch committees
  const committees = await getCommittees(org.id, user.id, role)

  let orgMembers: { id: string; name: string }[] = []
  if (isAdmin) {
    const { data: members } = await supabase
      .from('org_members')
      .select('profile_id, profiles(id, full_name, email)')
      .eq('org_id', org.id)

    if (members) {
      orgMembers = members
        .map((m: any) => {
          const profile = m.profiles ? (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles) : null;
          return {
            id: m.profile_id,
            name: profile?.full_name || profile?.email?.split('@')[0] || (m.profile_id === user.id ? 'You (Owner)' : 'Unknown Member'),
          }
        })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <UsersIcon className="size-8 text-blue-600" />
            Committees
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {isAdmin 
              ? 'Manage your organization\'s committees and assign members.' 
              : 'View the committees you are a part of.'}
          </p>
        </div>
        {isAdmin && (
          <CreateCommitteeDialog orgId={org.id} orgSlug={orgSlug} orgMembers={orgMembers} />
        )}
      </div>

      {/* Main Content Area */}
      <div className="mt-2">
        <CommitteeList 
          committees={committees} 
          orgId={org.id} 
          orgSlug={orgSlug} 
          role={role} 
          orgMembers={orgMembers} 
        />
      </div>
    </div>
  )
}
