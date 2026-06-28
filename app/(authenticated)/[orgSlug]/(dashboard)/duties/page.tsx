import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckSquareIcon, ClipboardListIcon } from 'lucide-react'
import { DutyList } from '../events/[eventId]/_components/duty-list'

export default async function DutiesDashboardPage({
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
    .select('id')
    .eq('slug', orgSlug)
    .single()
    
  if (!org) {
    redirect('/organizations')
  }

  // Check role
  const { data: memberData } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('profile_id', user.id)
    .single()

  const isAdmin = memberData?.role === 'admin' || memberData?.role === 'owner'

  // Fetch Committees the user belongs to
  const { data: userCommittees } = await supabase
    .from('committee_members')
    .select('committee_id')
    .eq('profile_id', user.id)

  const committeeIds = userCommittees?.map(c => c.committee_id) || []

  // Build duty query
  let dutyQuery = supabase
    .from('event_duties')
    .select(`
      id,
      name,
      created_at,
      committee_id,
      events!inner(org_id),
      committees (
        id,
        name
      )
    `)
    .eq('events.org_id', org.id)
    .order('created_at', { ascending: false })

  // If not admin, strictly filter to their committees
  if (!isAdmin) {
    if (committeeIds.length === 0) {
      // Not an admin and no committees = no duties
      dutyQuery = dutyQuery.in('committee_id', ['00000000-0000-0000-0000-000000000000']) 
    } else {
      dutyQuery = dutyQuery.in('committee_id', committeeIds)
    }
  }

  const { data: dutiesData } = await dutyQuery

  const duties = dutiesData?.map((d: any) => ({
    id: d.id,
    name: d.name,
    committeeId: d.committee_id,
    committeeName: d.committees ? (Array.isArray(d.committees) ? d.committees[0].name : d.committees.name) : 'Unknown Committee'
  })) || []

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <CheckSquareIcon className="size-8 text-blue-600" />
          My Duties
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">
          {isAdmin 
            ? "Overview of all operational duties across the organization." 
            : "The overarching event duties assigned to your committees."}
        </p>
      </div>

      <div className="mt-4">
        {duties.length > 0 ? (
          <DutyList duties={duties} orgSlug={orgSlug} isAdmin={isAdmin} />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <ClipboardListIcon className="size-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No duties found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
              You haven't been assigned any event duties yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
