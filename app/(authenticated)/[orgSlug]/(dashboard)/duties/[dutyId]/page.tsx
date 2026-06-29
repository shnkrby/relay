import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckSquareIcon, ArrowLeftIcon, CalendarIcon, UsersIcon } from 'lucide-react'
import Link from 'next/link'
import { TaskBoard } from './_components/task-board'
import { CreateTaskDialog } from './_components/create-task-dialog'

export default async function DutyTaskBoardPage({
  params
}: {
  params: Promise<{ orgSlug: string; dutyId: string }>
}) {
  const supabase = await createClient()
  const { orgSlug, dutyId } = await params

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

  // Get Duty
  const { data: duty } = await supabase
    .from('event_duties')
    .select(`
      id,
      name,
      event_id,
      committee_id,
      events (
        title
      ),
      committees (
        name,
        lead_id,
        executive_id
      )
    `)
    .eq('id', dutyId)
    .single()

  if (!duty) {
    redirect(`/${orgSlug}/duties`)
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
  
  const committee = Array.isArray(duty.committees) ? duty.committees[0] : duty.committees
  const isCommitteeLead = committee?.lead_id === user.id
  const isExecutive = committee?.executive_id === user.id
  const canManageTasks = isAdmin || isCommitteeLead || isExecutive

  // Fetch all tasks for this duty
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      description,
      status,
      priority,
      due_date,
      overdue_reason,
      completion_report,
      assignees:task_assignees (
        profile:profiles (
          id,
          full_name,
          email
        )
      )
    `)
    .eq('duty_id', dutyId)
    .order('created_at', { ascending: false })

  // Fetch committee members to populate assignee dropdown
  const { data: committeeMembers } = await supabase
    .from('committee_members')
    .select('profile_id, profiles(full_name, email)')
    .eq('committee_id', duty.committee_id)

  const assignableMembers = committeeMembers?.map((m: any) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    return {
      id: m.profile_id,
      name: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown Member'
    }
  }) || []

  const formattedTasks = tasks?.map((t: any) => {
    const assigneesList = Array.isArray(t.assignees) 
      ? t.assignees.map((a: any) => a.profile).filter(Boolean)
      : []
    
    return {
      ...t,
      assignees: assigneesList
    }
  }) || []

  const dutyData: any = duty;
  const eventTitle = Array.isArray(dutyData.events) ? dutyData.events[0]?.title : dutyData.events?.title

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 h-full">
      <div>
        <Link href={`/${orgSlug}/duties`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4">
          <ArrowLeftIcon className="size-4" />
          Back to Duties
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <CheckSquareIcon className="size-8 text-blue-600" />
              {dutyData.name} Tasks
            </h1>
            <div className="flex flex-wrap items-center gap-6 mt-4">
              <div className="flex flex-col">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-sm">
                  <UsersIcon className="size-4" /> Committee
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">{dutyData.committees?.name || 'Committee'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-sm">
                  <CalendarIcon className="size-4" /> Event
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">{eventTitle || 'Unknown Event'}</span>
              </div>
            </div>
          </div>
          
          {canManageTasks && (
            <div className="flex items-center gap-3">
              <CreateTaskDialog 
                dutyId={dutyId} 
                orgSlug={orgSlug} 
                members={assignableMembers} 
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto min-h-[500px]">
        <TaskBoard 
          tasks={formattedTasks} 
          dutyId={dutyId} 
          orgSlug={orgSlug} 
          currentUserId={user.id} 
          canManageTasks={canManageTasks} 
          members={assignableMembers}
        />
      </div>
    </div>
  )
}
