'use client'

import { Badge } from '@/components/ui/badge'
import { Loader2Icon, ArrowRightIcon, CheckSquareIcon, CalendarIcon, FileTextIcon } from 'lucide-react'
import { TaskStatus, PriorityLevel } from '@/types/database'
import { useState } from 'react'
import { updateTaskStatus } from '../_actions/update-task-status'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ManageTaskMenu } from './manage-task-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface FormattedTask {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: PriorityLevel
  due_date: string | null
  overdue_reason: string | null
  completion_report: string | null
  assignees: {
    id: string
    full_name: string | null
    email: string | null
  }[]
}

interface MemberOption {
  id: string
  name: string
}

interface TaskBoardProps {
  tasks: FormattedTask[]
  dutyId: string
  orgSlug: string
  currentUserId: string
  canManageTasks: boolean
  members: MemberOption[]
}

export function TaskBoard({ tasks, dutyId, orgSlug, currentUserId, canManageTasks, members }: TaskBoardProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<FormattedTask | null>(null)

  // Confirmation state
  const [confirmTask, setConfirmTask] = useState<{ task: FormattedTask, action: 'start' | 'complete' | 'reopen' } | null>(null)
  const [overdueReason, setOverdueReason] = useState('')
  const [completionReport, setCompletionReport] = useState('')
  const [isOverdue, setIsOverdue] = useState(false)

  function openConfirmation(task: FormattedTask, action: 'start' | 'complete' | 'reopen') {
    if (action === 'complete' && task.due_date) {
      // Check if overdue
      const deadline = new Date(task.due_date)
      // Normalize today to start of day for comparison
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (today > deadline) {
        setIsOverdue(true)
      } else {
        setIsOverdue(false)
      }
    } else {
      setIsOverdue(false)
    }
    
    setOverdueReason('')
    setCompletionReport('')
    setConfirmTask({ task, action })
  }

  async function executeStatusChange() {
    if (!confirmTask) return

    const { task, action } = confirmTask
    const newStatus = action === 'start' || action === 'reopen' ? 'in_progress' : 'completed'

    if (isOverdue && !overdueReason.trim()) {
      toast.error('An explanation is required for overdue tasks.')
      return
    }

    if (action === 'complete' && !completionReport.trim()) {
      toast.error('Please provide a brief completion report.')
      return
    }

    setUpdatingId(task.id)
    setConfirmTask(null)

    const result = await updateTaskStatus(
      task.id, 
      dutyId, 
      orgSlug, 
      newStatus, 
      action === 'complete' ? completionReport : undefined,
      isOverdue ? overdueReason : undefined
    )
    setUpdatingId(null)

    if (!result.success) {
      toast.error(result.error)
    } else {
      toast.success(action === 'complete' ? 'Task completed!' : 'Task updated')
    }
  }

  function getStatusBadge(task: FormattedTask) {
    if (task.status !== 'completed' && task.due_date) {
      const deadline = new Date(task.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (today > deadline) {
        return <Badge variant="outline" className="bg-transparent text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50">Overdue</Badge>
      }
    }

    switch (task.status) {
      case 'pending':
        return <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-none">Pending</Badge>
      case 'in_progress':
        return <Badge variant="secondary" className="capitalize bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-none">In Progress</Badge>
      case 'completed':
        return <Badge variant="secondary" className="capitalize bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-none">Completed</Badge>
    }
  }

  function getPriorityBadge(priority: PriorityLevel) {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="capitalize border-red-200 text-red-600 dark:border-red-900 dark:text-red-400">High</Badge>
      case 'medium':
        return <Badge variant="outline" className="capitalize border-amber-200 text-amber-600 dark:border-amber-900 dark:text-amber-400">Medium</Badge>
      case 'low':
        return <Badge variant="outline" className="capitalize border-blue-200 text-blue-600 dark:border-blue-900 dark:text-blue-400">Low</Badge>
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <CheckSquareIcon className="size-12 text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No tasks created</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          Get started by delegating specific tasks to your committee members.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Task</TableHead>
              <TableHead>Assignees</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Task Progress</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const isAssignedToMe = task.assignees?.some(a => a.id === currentUserId)
              const isUnassigned = !task.assignees || task.assignees.length === 0
              const canUpdate = isAssignedToMe || (canManageTasks && isUnassigned)
              const isCompleted = task.status === 'completed'

              return (
                <TableRow key={task.id} className={isCompleted ? "opacity-60 bg-slate-50 dark:bg-slate-900/20" : ""}>
                  <TableCell>
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline text-left"
                    >
                      {task.title}
                    </button>
                  </TableCell>
                  <TableCell>
                    <span className={isAssignedToMe ? "font-medium text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"}>
                      {!isUnassigned 
                        ? task.assignees.map(a => a.full_name || a.email).join(', ') 
                        : "Unassigned"}
                    </span>
                  </TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>
                    {task.due_date ? (
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <CalendarIcon className="size-3.5" />
                        {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No deadline</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(task)}</TableCell>
                  <TableCell>
                    {canUpdate ? (
                      <div>
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                            onClick={() => openConfirmation(task, 'start')}
                            disabled={updatingId === task.id}
                          >
                            {updatingId === task.id ? <Loader2Icon className="size-3 animate-spin mr-1" /> : 'Start Work'}
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                            onClick={() => openConfirmation(task, 'complete')}
                            disabled={updatingId === task.id}
                          >
                            {updatingId === task.id ? <Loader2Icon className="size-3 animate-spin mr-1" /> : 'Complete'}
                            <CheckSquareIcon className="size-3 ml-1" />
                          </Button>
                        )}
                        {task.status === 'completed' && (
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                              onClick={() => setSelectedTask(task)}
                            >
                              View Info
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 text-xs text-slate-500 hover:text-slate-700"
                              onClick={() => openConfirmation(task, 'reopen')}
                              disabled={updatingId === task.id}
                            >
                              {updatingId === task.id ? <Loader2Icon className="size-3 animate-spin mr-1" /> : 'Reopen'}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    {canManageTasks && (
                      <ManageTaskMenu
                        task={task}
                        dutyId={dutyId}
                        orgSlug={orgSlug}
                        members={members}
                      />
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileTextIcon className="size-5 text-blue-600" />
              Task Details
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6 pt-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Title</h4>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-md border">
                  {selectedTask.title}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Description</h4>
                <div className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-md border min-h-[100px] whitespace-pre-wrap">
                  {selectedTask.description || <span className="italic text-slate-400">No description provided.</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md border">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assignees</h4>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedTask.assignees && selectedTask.assignees.length > 0 
                      ? selectedTask.assignees.map(a => a.full_name || a.email).join(', ') 
                      : "Unassigned"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md border">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Deadline</h4>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "No deadline"}
                  </p>
                </div>
              </div>

              {selectedTask.completion_report && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-md border border-emerald-100 dark:border-emerald-900/50">
                  <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Completion Report</h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 whitespace-pre-wrap">
                    {selectedTask.completion_report}
                  </p>
                </div>
              )}

              {selectedTask.overdue_reason && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-100 dark:border-red-900/50">
                  <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Overdue Explanation</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {selectedTask.overdue_reason}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmTask} onOpenChange={(open) => !open && setConfirmTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmTask?.action === 'start' && 'Start Work'}
              {confirmTask?.action === 'complete' && 'Complete Task'}
              {confirmTask?.action === 'reopen' && 'Reopen Task'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmTask?.action === 'start' && 'Are you ready to begin work on this task?'}
              {confirmTask?.action === 'complete' && 'Are you sure you want to mark this task as completed?'}
              {confirmTask?.action === 'reopen' && 'Are you sure you want to reopen this completed task?'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {confirmTask?.action === 'complete' && (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report" className="text-emerald-700 dark:text-emerald-500 font-medium">Completion Report *</Label>
                <p className="text-xs text-slate-500 mb-2">Briefly explain what you did to complete this task.</p>
                <Textarea
                  id="report"
                  placeholder="e.g. Drafted the document and emailed it to..."
                  value={completionReport}
                  onChange={(e) => setCompletionReport(e.target.value)}
                  className="resize-none"
                  required
                />
              </div>

              {isOverdue && (
                <div className="pt-2 border-t space-y-3">
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                      This task is past its deadline.
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                      You must provide a brief explanation for why this task was completed late.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-red-600 font-medium">Overdue Reason *</Label>
                    <Textarea
                      id="reason"
                      placeholder="e.g. Waiting on vendor approval..."
                      value={overdueReason}
                      onChange={(e) => setOverdueReason(e.target.value)}
                      className="resize-none"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={updatingId !== null}>Cancel</AlertDialogCancel>
            <Button
              onClick={executeStatusChange}
              disabled={updatingId !== null || (confirmTask?.action === 'complete' && !completionReport.trim()) || (isOverdue && !overdueReason.trim())}
              className={confirmTask?.action === 'complete' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
            >
              {updatingId !== null ? <Loader2Icon className="size-4 animate-spin mr-2" /> : null}
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
