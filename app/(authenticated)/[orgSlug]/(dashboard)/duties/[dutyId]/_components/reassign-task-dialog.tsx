'use client'

import { useState, useEffect } from 'react'
import { UserMinusIcon, Loader2Icon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { reassignTask } from '../_actions/reassign-task'

interface ReassignTaskDialogProps {
  task: any
  dutyId: string
  orgSlug: string
  members: any[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReassignTaskDialog({ task, dutyId, orgSlug, members, open, onOpenChange }: ReassignTaskDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])

  useEffect(() => {
    if (open && task) {
      const initialIds = Array.isArray(task.assignees) 
        ? task.assignees.map((a: any) => a.id)
        : []
      setSelectedAssignees(initialIds)
    }
  }, [open, task])

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    formData.set('assignee_ids', selectedAssignees.join(','))
    const result = await reassignTask(task.id, dutyId, orgSlug, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Task reassigned successfully!')
    onOpenChange(false)
  }

  const toggleAssignee = (id: string) => {
    setSelectedAssignees(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserMinusIcon className="size-5 text-blue-600" />
            Reassign Task
          </DialogTitle>
          <DialogDescription>
            Pass this task to different committee members.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Assignees</Label>
            <div className="border rounded-md p-2 h-[150px] overflow-y-auto space-y-1">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No committee members available</p>
              ) : (
                members.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      checked={selectedAssignees.includes(m.id)}
                      onChange={() => toggleAssignee(m.id)}
                      disabled={isPending}
                    />
                    <span className="text-sm">{m.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {isPending ? <Loader2Icon className="size-4 animate-spin" /> : 'Reassign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
