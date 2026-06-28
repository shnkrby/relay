'use client'

import { useState } from 'react'
import { EditIcon, Loader2Icon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { editTask } from '../_actions/edit-task'

interface EditTaskDialogProps {
  task: any
  dutyId: string
  orgSlug: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({ task, dutyId, orgSlug, open, onOpenChange }: EditTaskDialogProps) {
  const [isPending, setIsPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    const result = await editTask(task.id, dutyId, orgSlug, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Task updated successfully!')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <EditIcon className="size-5 text-blue-600" />
            Edit Task Details
          </DialogTitle>
          <DialogDescription>
            Modify the core details of this task.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" name="title" defaultValue={task.title} required disabled={isPending} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Task Description (Optional)</Label>
            <Textarea 
              id="description" 
              name="description" 
              defaultValue={task.description || ''}
              className="resize-none"
              rows={3}
              disabled={isPending} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                required
                disabled={isPending}
                defaultValue={task.priority}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="due_date">Deadline (Optional)</Label>
              <Input 
                type="date" 
                id="due_date" 
                name="due_date" 
                defaultValue={task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''}
                disabled={isPending} 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {isPending ? <Loader2Icon className="size-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
