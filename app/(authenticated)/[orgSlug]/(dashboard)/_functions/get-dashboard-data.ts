import { createClient } from '@/lib/supabase/server'

export async function getDashboardData(orgId: string, userId: string) {
  const supabase = await createClient()

  const [
    activeEventsResult,
    openBatonsResult,
    completedBatonsResult,
    teamMembersResult,
    recentTasksResult,
    eventsResult
  ] = await Promise.all([
    // Active Events Count
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'active'),

    // My Open Batons
    supabase
      .from('tasks')
      .select('id, events!inner(org_id)', { count: 'exact', head: true })
      .eq('events.org_id', orgId)
      .eq('assignee_id', userId)
      .in('status', ['pending', 'in_progress']),

    // Completed Batons
    supabase
      .from('tasks')
      .select('id, events!inner(org_id)', { count: 'exact', head: true })
      .eq('events.org_id', orgId)
      .eq('assignee_id', userId)
      .eq('status', 'completed'),

    // Team Members Count
    supabase
      .from('org_members')
      .select('profile_id', { count: 'exact', head: true })
      .eq('org_id', orgId),

    // Recent Activity (Tasks created recently in this org)
    supabase
      .from('tasks')
      .select(`
        id, 
        title, 
        status, 
        created_at, 
        events!inner(org_id),
        profiles(full_name)
      `)
      .eq('events.org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5),

    // Event Progress (Up to 4 active events with their task counts)
    supabase
      .from('events')
      .select(`
        id,
        title,
        status,
        tasks (
          id,
          status
        )
      `)
      .eq('org_id', orgId)
      .eq('status', 'active')
      .limit(4)
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
      time: new Date(task.created_at).toLocaleDateString(),
      color: colorTheme.bg
    }
  })

  const eventProgress = (eventsResult.data || []).map((event: any, index: number) => {
    const tasks = event.tasks || []
    const total = tasks.length
    const current = tasks.filter((t: any) => t.status === 'completed').length
    const colorTheme = colors[index % colors.length]
    
    return {
      label: event.title,
      current,
      total,
      color: colorTheme.color,
      bullet: colorTheme.bullet,
      pct: total > 0 ? `${(current / total) * 100}%` : '0%'
    }
  })

  return {
    activeEventsCount: activeEventsResult.count || 0,
    openBatonsCount: openBatonsResult.count || 0,
    completedBatonsCount: completedBatonsResult.count || 0,
    teamMembersCount: teamMembersResult.count || 0,
    activityFeed,
    eventProgress
  }
}
