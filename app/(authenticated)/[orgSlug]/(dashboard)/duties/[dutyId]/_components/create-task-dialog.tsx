'use client'

import { useState } from 'react'
import { PlusIcon, Loader2Icon, CheckSquareIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createTask } from '../_actions/create-task'

interface MemberOption {
  id: string
  name: string
}

interface CreateTaskDialogProps {
  dutyId: string
  orgSlug: string
  members: MemberOption[]
}

export function CreateTaskDialog({ dutyId, orgSlug, members }: CreateTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    const result = await createTask(dutyId, orgSlug, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Task created successfully!')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <PlusIcon className="mr-2 size-4" />
            Create Task
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckSquareIcon className="size-5 text-blue-600" />
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Pass the baton by assigning a specific task to a committee member.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" name="title" placeholder="e.g. Order 500 chairs" required disabled={isPending} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Task Description (Optional)</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Any details or links needed?"
              className="resize-none"
              rows={3}
              disabled={isPending} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee_id">Assign To (Optional)</Label>
              <select
                id="assignee_id"
                name="assignee_id"
                disabled={isPending}
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
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                required
                disabled={isPending}
                defaultValue="medium"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="due_date">Deadline (Optional)</Label>
              <Input 
                type="date" 
                id="due_date" 
                name="due_date" 
                disabled={isPending} 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {isPending ? <Loader2Icon className="size-4 animate-spin" /> : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
