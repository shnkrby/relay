import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarIcon } from 'lucide-react'
import { EventList } from './_components/event-list'
import { CreateEventDialog } from './_components/create-event-dialog'
import { Event } from '@/types/database'

export default async function EventsPage({
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

  // Check if user is admin
  const { data: memberData } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('profile_id', user.id)
    .single()

  const isAdmin = memberData?.role === 'admin' || memberData?.role === 'owner'

  // Fetch Events
  const { data: eventsData } = await supabase
    .from('events')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })

  const events = (eventsData || []) as Event[]

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <CalendarIcon className="size-8 text-blue-600" />
            Events
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">
            Track and manage all major initiatives, conferences, and activities across the organization.
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-3">
            <CreateEventDialog orgId={org.id} orgSlug={orgSlug} />
          </div>
        )}
      </div>

      <EventList events={events} orgSlug={orgSlug} isAdmin={isAdmin} />
    </div>
  )
}
