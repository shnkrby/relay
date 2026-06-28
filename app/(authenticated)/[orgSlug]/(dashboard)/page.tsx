import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CalendarIcon, ZapIcon, CheckCircleIcon, UsersIcon, ActivityIcon, BarChartIcon } from 'lucide-react'
import { getDashboardData } from './_functions/get-dashboard-data'
import { redirect } from 'next/navigation'

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

  // Get the org details
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', orgSlug)
    .single()
    
  if (!org) {
    redirect('/organizations')
  }

  const data = await getDashboardData(org.id, user.id)

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {/* Header Section */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Spring Gala season is active — org-wide view.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Active Events</CardTitle>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.activeEventsCount}</div>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Total active events</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">My Open Batons</CardTitle>
            <ZapIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.openBatonsCount}</div>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Tasks assigned to you</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Completed Batons</CardTitle>
            <CheckCircleIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.completedBatonsCount}</div>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Tasks you finished</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Team Members</CardTitle>
            <UsersIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.teamMembersCount}</div>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">In this organization</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area: Feed and Progress */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity Feed */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ActivityIcon className="size-5 text-blue-600" />
              <CardTitle className="text-lg">Org Activity Feed</CardTitle>
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
            <div className="space-y-6">
              {data.activityFeed.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
              ) : (
                data.activityFeed.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full font-medium ${item.color}`}>
                      {item.name[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {item.name} <span className="font-normal text-muted-foreground">{item.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Progress */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChartIcon className="size-5 text-purple-600" />
            <CardTitle className="text-lg">Event Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.eventProgress.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active events.</p>
              ) : (
                data.eventProgress.map((item: any, i: number) => (
                  <div key={i} className="grid gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`size-2 rounded-full ${item.bullet}`} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <span className="text-muted-foreground">{item.current}/{item.total}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full ${item.color}`} style={{ width: item.pct }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
