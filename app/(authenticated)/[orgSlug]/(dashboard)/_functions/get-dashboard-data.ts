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

export async function getDashboardData(orgId: string, userId: string) {
  const supabase = await createClient()

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
    // Active Events Count
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'active'),

    // My Open Tasks
    supabase
      .from('tasks')
      .select('id, event_duties!inner(events!inner(org_id))', { count: 'exact', head: true })
      .eq('event_duties.events.org_id', orgId)
      .eq('assignee_id', userId)
      .in('status', ['pending', 'in_progress']),

    // Completed Tasks
    supabase
      .from('tasks')
      .select('id, event_duties!inner(events!inner(org_id))', { count: 'exact', head: true })
      .eq('event_duties.events.org_id', orgId)
      .eq('assignee_id', userId)
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

    // Overdue Tasks Count (tasks past due date that are not completed)
    supabase
      .from('tasks')
      .select('id, event_duties!inner(events!inner(org_id))', { count: 'exact', head: true })
      .eq('event_duties.events.org_id', orgId)
      .in('status', ['pending', 'in_progress'])
      .lt('due_date', new Date().toISOString()),

    // Recent Activity (Tasks created recently in this org)
    supabase
      .from('tasks')
      .select(`
        id, 
        title, 
        status, 
        created_at, 
        event_duties!inner(events!inner(org_id)),
        profiles(full_name)
      `)
      .eq('event_duties.events.org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(6),

    // Event Progress (Up to 4 active/upcoming events with their task counts)
    supabase
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
      .limit(4),

    // My Tasks (for the My Tasks Panel)
    supabase
      .from('tasks')
      .select(`
        id,
        title,
        status,
        priority,
        due_date,
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
      .eq('assignee_id', userId)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(8)
  ])

  const colors = [
    { color: 'bg-blue-500', bg: 'bg-blue-100 text-blue-700', bullet: 'bg-blue-500' },
    { color: 'bg-purple-500', bg: 'bg-purple-100 text-purple-700', bullet: 'bg-purple-500' },
    { color: 'bg-emerald-500', bg: 'bg-emerald-100 text-emerald-700', bullet: 'bg-emerald-500' },
    { color: 'bg-orange-500', bg: 'bg-orange-100 text-orange-700', bullet: 'bg-orange-500' },
  ]

  const activityFeed = (recentTasksResult.data || []).map((task: any, index: number) => {
    let action = 'created'
    if (task.status === 'completed') action = 'completed'
    else if (task.status === 'in_progress') action = 'started'

    const assigneeName = task.profiles?.full_name || 'Someone'
    const colorTheme = colors[index % colors.length]

    return {
      name: assigneeName,
      action: `${action} "${task.title}"`,
      time: timeAgo(task.created_at),
      color: colorTheme.bg
    }
  })

  const eventProgress = (eventsResult.data || []).map((event: any) => {
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
  }
}
