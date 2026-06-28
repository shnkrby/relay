'use client'

import { useState } from 'react'
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

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    const result = await reassignTask(task.id, dutyId, orgSlug, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Task reassigned successfully!')
    onOpenChange(false)
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
            Pass this task to a different committee member.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="assignee_id">New Assignee</Label>
            <select
              id="assignee_id"
              name="assignee_id"
              disabled={isPending}
              defaultValue={task.assignee_id || ''}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
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
