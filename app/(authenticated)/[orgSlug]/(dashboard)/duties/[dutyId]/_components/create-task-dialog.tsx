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
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    formData.set('assignee_ids', selectedAssignees.join(','))
    const result = await createTask(dutyId, orgSlug, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Task created successfully!')
    setIsOpen(false)
    setSelectedAssignees([])
  }

  const toggleAssignee = (id: string) => {
    setSelectedAssignees(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
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
            Pass the baton by assigning a specific task to committee members.
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
              <Label>Priority</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="due_date">Deadline (Optional)</Label>
              <Input 
                type="date" 
                id="due_date" 
                name="due_date" 
                disabled={isPending} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assignees (Optional)</Label>
            <div className="border rounded-md p-2 h-[120px] overflow-y-auto space-y-1">
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
