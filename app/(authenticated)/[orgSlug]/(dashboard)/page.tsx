import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalendarIcon, ZapIcon, CheckCircleIcon, UsersIcon, ActivityIcon,
  AlertTriangleIcon, LayoutGridIcon
} from 'lucide-react'
import { getDashboardData } from './_functions/get-dashboard-data'
import { redirect } from 'next/navigation'
import { StatCard } from './_components/stat-card'
import { QuickActions } from './_components/quick-actions'
import { MyTasksPanel } from './_components/my-tasks-panel'
import { EventProgressCards } from './_components/event-progress-card'

export default async function WorkspaceDashboard({
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

  // Get the org details and role
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', orgSlug)
    .single()

  if (!org) {
    redirect('/organizations')
  }

  const { data: memberData } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('profile_id', user.id)
    .single()

  const role = memberData?.role || 'member'
  const isAdmin = role === 'admin' || role === 'owner'
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  const data = await getDashboardData(org.id, user.id)

  // Build role-aware subtitle
  let subtitle = ''
  if (data.overdueTasksCount > 0) {
    subtitle = `You have ${data.overdueTasksCount} overdue task${data.overdueTasksCount > 1 ? 's' : ''} that need attention.`
  } else if (data.openTasksCount > 0) {
    subtitle = `You have ${data.openTasksCount} open task${data.openTasksCount > 1 ? 's' : ''} across ${data.activeEventsCount} active event${data.activeEventsCount !== 1 ? 's' : ''}.`
  } else {
    subtitle = `All caught up! ${data.activeEventsCount > 0 ? `${data.activeEventsCount} event${data.activeEventsCount !== 1 ? 's' : ''} currently active.` : 'No active events right now.'}`
  }

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {greeting}, {userName}!
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xl">
            {subtitle}
          </p>
        </div>
        <QuickActions orgSlug={orgSlug} isAdmin={isAdmin} />
      </div>

      {/* Stats Grid — 6 cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Active Events"
          value={data.activeEventsCount}
          subtitle="Currently running"
          icon={<CalendarIcon className="size-4" />}
          accent="blue"
        />
        <StatCard
          title="My Open Tasks"
          value={data.openTasksCount}
          subtitle="Assigned to you"
          icon={<ZapIcon className="size-4" />}
          accent="amber"
        />
        <StatCard
          title="Completed"
          value={data.completedTasksCount}
          subtitle="Tasks finished"
          icon={<CheckCircleIcon className="size-4" />}
          accent="green"
        />
        <StatCard
          title="Overdue"
          value={data.overdueTasksCount}
          subtitle="Past due date"
          icon={<AlertTriangleIcon className="size-4" />}
          accent={data.overdueTasksCount > 0 ? 'red' : 'default'}
        />
        <StatCard
          title="Committees"
          value={data.committeesCount}
          subtitle="In this org"
          icon={<LayoutGridIcon className="size-4" />}
          accent="purple"
        />
        <StatCard
          title="Members"
          value={data.teamMembersCount}
          subtitle="Total team size"
          icon={<UsersIcon className="size-4" />}
        />
      </div>

      {/* Main Content: 3-column on large, 2 on medium */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Activity Feed — 2 cols wide */}
        <Card className="shadow-sm border-slate-200/80 dark:border-slate-800/80 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ActivityIcon className="size-5 text-blue-600" />
              <CardTitle className="text-lg">Activity Feed</CardTitle>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-medium text-blue-600">Live</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.activityFeed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ActivityIcon className="size-10 text-slate-200 dark:text-slate-700 mb-3" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No recent activity.</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Activity will appear here as your team works.</p>
                </div>
              ) : (
                data.activityFeed.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.color}`}>
                      {item.name[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>{' '}
                        <span className="text-slate-500 dark:text-slate-400">{item.action}</span>
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Progress — 3 cols wide */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <EventProgressCards events={data.eventProgress} orgSlug={orgSlug} />
          <MyTasksPanel tasks={data.myTasks} orgSlug={orgSlug} />
        </div>
      </div>
    </div>
  )
}
