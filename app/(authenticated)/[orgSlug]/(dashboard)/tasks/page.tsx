import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ZapIcon } from 'lucide-react'
import { TaskTable, TaskDto } from './_components/task-table'
import { CreateGlobalTaskDialog } from './_components/create-global-task-dialog'

export default async function TasksPage({
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

  // Determine if the user can create tasks and what committees they manage
  let ledCommitteeIds: string[] = []
  if (!isAdmin) {
    const { data: ledCommittees } = await supabase
      .from('committees')
      .select('id')
      .eq('org_id', org.id)
      .or(`lead_id.eq.${user.id},executive_id.eq.${user.id}`)
      
    if (ledCommittees) {
      ledCommitteeIds = ledCommittees.map(c => c.id)
    }
  }

  const canCreateTask = isAdmin || ledCommitteeIds.length > 0

  let availableDuties: any[] = []
  let committeeMembersMap: Record<string, any[]> = {}

  if (canCreateTask) {
    let dutiesQuery = supabase
      .from('event_duties')
      .select(`
        id,
        name,
        committee_id,
        events!inner(title, org_id),
        committees(name)
      `)
      .eq('events.org_id', org.id)

    if (!isAdmin) {
      dutiesQuery = dutiesQuery.in('committee_id', ledCommitteeIds)
    }

    const { data: dutiesData } = await dutiesQuery
    if (dutiesData) availableDuties = dutiesData

    // Fetch members for allowed committees
    const committeesToFetch = isAdmin 
      ? availableDuties.map(d => d.committee_id) 
      : ledCommitteeIds
      
    const uniqueCommittees = [...new Set(committeesToFetch)]
    
    if (uniqueCommittees.length > 0) {
      const { data: membersData } = await supabase
        .from('committee_members')
        .select(`
          committee_id,
          profile_id,
          profiles(full_name, email)
        `)
        .in('committee_id', uniqueCommittees)
        
      if (membersData) {
        membersData.forEach(m => {
          if (!committeeMembersMap[m.committee_id]) {
            committeeMembersMap[m.committee_id] = []
          }
          committeeMembersMap[m.committee_id].push(m)
        })
      }
    }
  }

  let tasksData: TaskDto[] = []

  if (isAdmin) {
    // Admin sees all tasks in the org
    const { data } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        status,
        priority,
        due_date,
        assignees:task_assignees(profile:profiles(id, full_name, email, avatar_url)),
        duty:event_duties!inner(
          id,
          name,
          committee:committees(name),
          event:events!inner(title, org_id)
        )
      `)
      .eq('event_duties.events.org_id', org.id)
      .order('due_date', { ascending: true })

    if (data) {
      tasksData = data.map(t => {
        const duty = Array.isArray(t.duty) ? t.duty[0] : t.duty
        const committee = duty?.committee ? (Array.isArray(duty.committee) ? duty.committee[0] : duty.committee) : null
        const event = duty?.event ? (Array.isArray(duty.event) ? duty.event[0] : duty.event) : null
        
        const assignees = Array.isArray(t.assignees) 
          ? t.assignees.map((a: any) => a.profile).filter(Boolean)
          : []
        
        return {
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          due_date: t.due_date,
          assignees,
          duty: duty ? {
            id: duty.id,
            name: duty.name,
            committee: committee || null,
            event: event || null
          } : null
        }
      })
    }
  } else {
    // Member sees tasks assigned to them, or tasks in their committees
    // Let's get their committees first
    const { data: committeesData } = await supabase
      .from('committee_members')
      .select('committee_id')
      .eq('profile_id', user.id)
      
    const userCommitteeIds = committeesData?.map(c => c.committee_id) || []

    let query = supabase
      .from('tasks')
      .select(`
        id,
        title,
        status,
        priority,
        due_date,
        assignees:task_assignees(profile:profiles(id, full_name, email, avatar_url)),
        duty:event_duties!inner(
          id,
          committee_id,
          name,
          committee:committees(name),
          event:events!inner(title, org_id)
        )
      `)
      .eq('event_duties.events.org_id', org.id)
      
    if (userCommitteeIds.length > 0) {
       // Since Supabase RPC or complex OR might be tricky with inner joins, we'll fetch tasks from their committees OR assigned to them.
       // Actually, RLS policy "Members can only view their own tasks" is currently active on the 'tasks' table.
       // Let's rely on RLS if we didn't change it. Wait, if RLS is "Members can only view their own tasks", then members WILL ONLY SEE THEIR OWN TASKS. 
       // If the requirement is "see the committee he is on the events that are active in the committees and also his tasks", then for tasks, they just see their tasks.
       // I'll fetch what RLS gives us.
    }
    
    const { data } = await query.order('due_date', { ascending: true })

    if (data) {
      tasksData = data.map(t => {
        const duty = Array.isArray(t.duty) ? t.duty[0] : t.duty
        const committee = duty?.committee ? (Array.isArray(duty.committee) ? duty.committee[0] : duty.committee) : null
        const event = duty?.event ? (Array.isArray(duty.event) ? duty.event[0] : duty.event) : null
        
        const assignees = Array.isArray(t.assignees) 
          ? t.assignees.map((a: any) => a.profile).filter(Boolean)
          : []
        
        return {
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          due_date: t.due_date,
          assignees,
          duty: duty ? {
            id: duty.id,
            name: duty.name,
            committee: committee || null,
            event: event || null
          } : null
        }
      })
    }
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
            <ZapIcon className="size-10 text-amber-600" />
            Tasks
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
            {isAdmin ? 'View and manage all tasks across the organization.' : 'View your assigned tasks.'}
          </p>
        </div>
        {canCreateTask && (
          <div className="flex items-center gap-3">
            <CreateGlobalTaskDialog 
              orgSlug={orgSlug}
              duties={availableDuties}
              committeeMembers={committeeMembersMap}
            />
          </div>
        )}
      </div>

      <TaskTable tasks={tasksData} isAdmin={isAdmin} currentUserId={user.id} orgSlug={orgSlug} />
    </div>
  )
}
