"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ZapIcon, ArrowRightIcon, ClockIcon, PlayCircleIcon } from 'lucide-react'
import Link from 'next/link'

export interface UserTask {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dutyName: string
  eventTitle: string
  dueDate: string | null
  dutyId: string
}

interface MyTasksPanelProps {
  tasks: UserTask[]
  orgSlug: string
}

const priorityColors = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-none',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-none',
}

const statusIcons = {
  pending: <ClockIcon className="size-3.5" />,
  in_progress: <PlayCircleIcon className="size-3.5" />,
  completed: null,
}

const statusColors = {
  pending: 'text-amber-600 dark:text-amber-400',
  in_progress: 'text-blue-600 dark:text-blue-400',
  completed: 'text-emerald-600 dark:text-emerald-400',
}

export function MyTasksPanel({ tasks, orgSlug }: MyTasksPanelProps) {
  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const activeTasks = [...inProgressTasks, ...pendingTasks].slice(0, 5)

  return (
    <Card className="shadow-sm border-slate-200/80 dark:border-slate-800/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <ZapIcon className="size-5 text-amber-500" />
          <CardTitle className="text-lg">My Active Tasks</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
          render={<Link href={`/${orgSlug}/duties`} />}
          nativeButton={false}
        >
          View All
          <ArrowRightIcon className="size-3" />
        </Button>
      </CardHeader>
      <CardContent>
        {activeTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ZapIcon className="size-10 text-slate-200 dark:text-slate-700 mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No active tasks assigned to you.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Tasks will appear here once they are assigned.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <Link
                key={task.id}
                href={`/${orgSlug}/duties/${task.dutyId}`}
                className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
              >
                <div className={`mt-0.5 ${statusColors[task.status]}`}>
                  {statusIcons[task.status]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {task.eventTitle} → {task.dutyName}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </Badge>
                  {task.dueDate && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
