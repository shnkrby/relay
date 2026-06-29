import { createClient } from '@/lib/supabase/server'

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export async function getDashboardData(orgId: string, userId: string, isAdmin: boolean) {
  const supabase = await createClient()

  // Auto-start upcoming events if their start date has arrived
  const todayStr = new Date().toISOString()
  await supabase
    .from('events')
    .update({ status: 'active' })
    .eq('org_id', orgId)
    .eq('status', 'upcoming')
    .lte('start_date', todayStr)

  // For members, we need to find their committees first to filter events and activities
  let userCommitteeIds: string[] = []
  let myCommittees: any[] = []
  if (!isAdmin) {
    const { data: committeesData } = await supabase
      .from('committee_members')
      .select('committee_id, committee:committees(id, name, logo_url)')
      .eq('profile_id', userId)
    
    if (committeesData) {
      userCommitteeIds = committeesData.map(c => c.committee_id)
      myCommittees = committeesData.map(c => Array.isArray(c.committee) ? c.committee[0] : c.committee).filter(Boolean)
    }
  }

  // Define base queries
  let eventsQuery = supabase
    .from('events')
    .select('id, event_duties!inner(committee_id)', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('status', 'active')

  let eventProgressQuery = supabase
    .from('events')
    .select(`
      id,
      title,
      status,
      start_date,
      end_date,
      event_duties!inner (
        committee_id,
        tasks (
          id,
          status
        )
      )
    `)
    .eq('org_id', orgId)
    .in('status', ['active', 'upcoming'])
    .limit(4)

  if (!isAdmin) {
    if (userCommitteeIds.length > 0) {
      eventsQuery = eventsQuery.in('event_duties.committee_id', userCommitteeIds)
      eventProgressQuery = eventProgressQuery.in('event_duties.committee_id', userCommitteeIds)
    } else {
      // If user is not in any committee, they shouldn't see any committee-specific events
      eventsQuery = eventsQuery.eq('id', '00000000-0000-0000-0000-000000000000') // impossible condition
      eventProgressQuery = eventProgressQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    }
  } else {
    // Admins don't need the inner join constraint to match committees, but we need to reset the select to avoid counting issues
    eventsQuery = supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'active') as any

    eventProgressQuery = supabase
      .from('events')
      .select(`
        id,
        title,
        status,
        start_date,
        end_date,
        event_duties (
          tasks (
            id,
            status
          )
        )
      `)
      .eq('org_id', orgId)
      .in('status', ['active', 'upcoming'])
      .limit(4) as any
  }

  const [
    activeEventsResult,
    openBatonsResult,
    completedBatonsResult,
    teamMembersResult,
    committeesResult,
    overdueTasksResult,
    recentTasksResult,
    eventsResult,
    myTasksResult
  ] = await Promise.all([
    activeEventsQuery(),
    // My Open Tasks
    supabase
      .from('tasks')
      .select('id, event_duties!inner(events!inner(org_id)), task_assignees!inner(profile_id)', { count: 'exact', head: true })
      .eq('event_duties.events.org_id', orgId)
      .eq('task_assignees.profile_id', userId)
      .in('status', ['pending', 'in_progress']),

    // Completed Tasks
    supabase
      .from('tasks')
      .select('id, event_duties!inner(events!inner(org_id)), task_assignees!inner(profile_id)', { count: 'exact', head: true })
      .eq('event_duties.events.org_id', orgId)
      .eq('task_assignees.profile_id', userId)
      .eq('status', 'completed'),

    // Team Members Count
    supabase
      .from('org_members')
      .select('profile_id', { count: 'exact', head: true })
      .eq('org_id', orgId),

    // Committees Count
    supabase
      .from('committees')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId),

    // Overdue Tasks Count
    supabase
      .from('tasks')
      .select('id, event_duties!inner(events!inner(org_id)), task_assignees!inner(profile_id)', { count: 'exact', head: true })
      .eq('event_duties.events.org_id', orgId)
      .in('status', ['pending', 'in_progress'])
      .lt('due_date', new Date().toISOString()),

    // Recent Activity (Tasks created or updated recently in this org)
    supabase
      .from('tasks')
      .select(`
        id, 
        title, 
        status, 
        created_at,
        updated_at,
        event_duties!inner(events!inner(org_id)),
        assignees:task_assignees(profile:profiles(full_name))
      `)
      .eq('event_duties.events.org_id', orgId)
      .order('updated_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(6),

    eventProgressQuery,

    // My Tasks
    supabase
      .from('tasks')
      .select(`
        id,
        title,
        status,
        priority,
        due_date,
        task_assignees!inner(profile_id),
        event_duties!inner (
          id,
          name,
          events!inner (
            org_id,
            title
          )
        )
      `)
      .eq('event_duties.events.org_id', orgId)
      .eq('task_assignees.profile_id', userId)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(8)
  ])

  if (recentTasksResult.error) {
    console.error('recentTasksResult error:', recentTasksResult.error)
  }

  function activeEventsQuery() {
    return eventsQuery
  }

  const colors = [
    { color: 'bg-blue-500', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', bullet: 'bg-blue-500' },
    { color: 'bg-purple-500', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', bullet: 'bg-purple-500' },
    { color: 'bg-emerald-500', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', bullet: 'bg-emerald-500' },
    { color: 'bg-orange-500', bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', bullet: 'bg-orange-500' },
  ]

  const activityFeed = (recentTasksResult.data || []).map((task: any, index: number) => {
    let action = 'assigned'
    if (task.status === 'completed') action = 'completed'
    else if (task.status === 'in_progress') action = 'started'

    const assigneesList = Array.isArray(task.assignees) 
      ? task.assignees.map((a: any) => a.profile?.full_name).filter(Boolean).join(', ')
      : null
    const assigneeName = assigneesList || 'Someone'
    
    const assignerName = task.assigner?.full_name || 'Someone'
    const colorTheme = colors[index % colors.length]

    let actionText = ''
    if (action === 'assigned') {
      actionText = `assigned a new task to ${assigneeName}: "${task.title}"`
    } else {
      actionText = `${action} "${task.title}"`
    }

    return {
      name: action === 'assigned' ? assignerName : assigneeName,
      action: actionText,
      time: timeAgo(task.updated_at || task.created_at),
      color: colorTheme.bg
    }
  })

  // Deduplicate events if they were joined on multiple duties
  const uniqueEvents = Array.from(new Map((eventsResult.data || []).map((e: any) => [e.id, e])).values()) as any[]

  const eventProgress = uniqueEvents.map((event: any) => {
    const tasks = event.event_duties?.flatMap((duty: any) => duty.tasks || []) || []
    const total = tasks.length
    const current = tasks.filter((t: any) => t.status === 'completed').length

    return {
      id: event.id,
      title: event.title,
      status: event.status,
      startDate: event.start_date,
      endDate: event.end_date,
      completedTasks: current,
      totalTasks: total,
    }
  })

  const myTasks = (myTasksResult.data || []).map((task: any) => {
    const duty = task.event_duties
    const dutyData = Array.isArray(duty) ? duty[0] : duty
    const event = dutyData?.events
    const eventData = Array.isArray(event) ? event[0] : event

    return {
      id: task.id,
      title: task.title,
      status: task.status as 'pending' | 'in_progress' | 'completed',
      priority: task.priority as 'low' | 'medium' | 'high',
      dutyName: dutyData?.name || 'Unknown Duty',
      eventTitle: eventData?.title || 'Unknown Event',
      dueDate: task.due_date,
      dutyId: dutyData?.id || '',
    }
  })

  return {
    activeEventsCount: activeEventsResult.count || 0,
    openTasksCount: openBatonsResult.count || 0,
    completedTasksCount: completedBatonsResult.count || 0,
    teamMembersCount: teamMembersResult.count || 0,
    committeesCount: committeesResult.count || 0,
    overdueTasksCount: overdueTasksResult.count || 0,
    activityFeed,
    eventProgress,
    myTasks,
    myCommittees,
  }
}
