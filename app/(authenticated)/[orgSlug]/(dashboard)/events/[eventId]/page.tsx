import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarIcon, MapIcon, ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { CreateDutyDialog } from './_components/create-duty-dialog'
import { DutyList } from './_components/duty-list'

export default async function EventDetailsPage({
  params
}: {
  params: Promise<{ orgSlug: string; eventId: string }>
}) {
  const supabase = await createClient()
  const { orgSlug, eventId } = await params

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

  // Auto-start event if start date has arrived
  const todayStr = new Date().toISOString()
  await supabase
    .from('events')
    .update({ status: 'active' })
    .eq('id', eventId)
    .eq('org_id', org.id)
    .eq('status', 'upcoming')
    .lte('start_date', todayStr)

  // Get Event
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('org_id', org.id)
    .single()

  if (!event) {
    redirect(`/${orgSlug}/events`)
  }

  // Check role
  const { data: memberData } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('profile_id', user.id)
    .single()

  const isAdmin = memberData?.role === 'admin' || memberData?.role === 'owner'

  // Fetch Duties for this event, joined with committees
  const { data: dutiesData } = await supabase
    .from('event_duties')
    .select(`
      id,
      name,
      created_at,
      committee_id,
      committees (
        id,
        name
      )
    `)
    .eq('event_id', event.id)
    .order('created_at', { ascending: false })

  const duties = dutiesData?.map((d: any) => ({
    id: d.id,
    name: d.name,
    committeeId: d.committee_id,
    committeeName: d.committees ? (Array.isArray(d.committees) ? d.committees[0].name : d.committees.name) : 'Unknown Committee'
  })) || []

  // Fetch all committees for the Create Duty dropdown
  const { data: committees } = await supabase
    .from('committees')
    .select('id, name')
    .eq('org_id', org.id)
    .order('name')

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <Link href={`/${orgSlug}/events`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4">
          <ArrowLeftIcon className="size-4" />
          Back to Events
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <MapIcon className="size-8 text-blue-600" />
              {event.title}
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
              {event.description || "No description provided."}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Badge 
                variant="secondary" 
                className={`
                  capitalize text-sm px-3 py-1
                  ${event.status === 'upcoming' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none' : ''}
                  ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-none animate-pulse' : ''}
                  ${event.status === 'completed' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-none' : ''}
                  ${event.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-none' : ''}
                `}
              >
                {event.status}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <CalendarIcon className="size-4" />
                <span>
                  {event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                  {' - '}
                  {event.end_date ? new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                </span>
              </div>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex items-center gap-3">
              <CreateDutyDialog 
                eventId={event.id} 
                orgSlug={orgSlug} 
                committees={committees || []} 
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Event Duties & Assignments</h2>
        </div>
        <DutyList duties={duties} orgSlug={orgSlug} isAdmin={isAdmin} />
      </div>
    </div>
  )
}
