import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldCheckIcon, UserCircle2Icon, BriefcaseBusinessIcon } from 'lucide-react'

import { ManageBoardDialog } from './_components/manage-board-dialog'

export default async function LeadershipPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const supabase = await createClient()
  const { orgSlug } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, vacant_roles')
    .eq('slug', orgSlug)
    .single()

  if (orgError || !org) redirect('/organizations')

  // Fetch ALL members so we can pass them to the ManageBoardDialog
  const { data: allMembersData } = await supabase
    .from('org_members')
    .select(`
      profile_id,
      role,
      executive_title,
      joined_at,
      profiles (
        id,
        full_name,
        email
      )
    `)
    .eq('org_id', org.id)
    .order('role', { ascending: false }) // 'owner' comes before 'admin' and 'member'

  const allMembers = allMembersData?.map((m: any) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    return {
      id: m.profile_id,
      name: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown User',
      email: profile?.email || '',
      role: m.role,
      executive_title: m.executive_title
    }
  }) || []

  // Extract just the executives for display
  const executives = allMembers.filter(m => m.role === 'owner' || m.role === 'admin')

  // Identify if current user is owner
  const isOwner = allMembers.find(m => m.id === user.id)?.role === 'owner'
  
  const vacantRoles = (org.vacant_roles as string[]) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheckIcon className="size-8 text-primary" />
            Executive Board
          </h1>
          <p className="text-muted-foreground mt-1">
            The leadership team guiding {org.name}.
          </p>
        </div>
        {isOwner && (
          <ManageBoardDialog 
            orgId={org.id} 
            orgSlug={orgSlug} 
            members={allMembers} 
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
              <div className="bg-secondary p-4 rounded-full">
                <UserCircle2Icon className="size-12 text-muted-foreground" strokeWidth={1} />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-foreground line-clamp-1">{exec.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{exec.email}</p>
              </div>
              <div className="pt-4 border-t border-border w-full flex flex-col items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  <BriefcaseBusinessIcon className="size-3.5" />
                  {exec.executive_title || 'Executive'}
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
  )
}
