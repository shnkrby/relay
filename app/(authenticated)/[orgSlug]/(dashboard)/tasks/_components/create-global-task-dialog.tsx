'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createGlobalTask } from '../_actions/create-global-task'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'

export function CreateGlobalTaskDialog({ 
  orgSlug, 
  duties, 
  committeeMembers 
}: { 
  orgSlug: string
  duties: any[]
  committeeMembers: Record<string, any[]> 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedDutyId, setSelectedDutyId] = useState<string>('')
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])

  const selectedDuty = duties.find(d => d.id === selectedDutyId)
  const availableMembers = selectedDuty ? committeeMembers[selectedDuty.committee_id] || [] : []

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedDutyId) {
      toast.error('Please select a duty context.')
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('duty_id', selectedDutyId)
    formData.append('assignee_ids', selectedAssignees.join(','))
    
    const result = await createGlobalTask(orgSlug, null, formData)
    
    if (result.success) {
      toast.success('Task created successfully')
      setOpen(false)
      setSelectedDutyId('')
      setSelectedAssignees([])
    } else {
      toast.error(result.error || 'Failed to create task')
    }
    setLoading(false)
  }

  function toggleAssignee(id: string) {
    setSelectedAssignees(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm" />}>
        <PlusIcon className="size-4" />
        Create Task
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Assign a new task to a specific duty.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="duty_id">Context (Event / Committee / Duty)</Label>
            <Select value={selectedDutyId} onValueChange={(val) => {
              setSelectedDutyId(val || '')
              setSelectedAssignees([]) // Reset assignees when duty changes
            }}>
              <SelectTrigger>
                {selectedDutyId ? (
                  <span className="line-clamp-1 flex-1 text-left text-sm">
                    {(() => {
                      const d = duties.find(duty => duty.id === selectedDutyId)
                      return d ? `${d.events?.title} - ${d.committees?.name}: ${d.name}` : ''
                    })()}
                  </span>
                ) : (
                  <SelectValue placeholder="Select a duty..." />
                )}
              </SelectTrigger>
              <SelectContent>
                {duties.map(duty => {
                  const dutyLabel = `${duty.events?.title} - ${duty.committees?.name}: ${duty.name}`
                  return (
                    <SelectItem key={duty.id} value={duty.id}>
                      {dutyLabel}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" name="title" required placeholder="What needs to be done?" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" name="description" placeholder="Add details..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date (Optional)</Label>
              <Input id="due_date" name="due_date" type="datetime-local" />
            </div>
          </div>

          {selectedDutyId && (
            <div className="space-y-2 border-t pt-4">
              <Label>Assignees (from {selectedDuty?.committees?.name})</Label>
              {availableMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No members in this committee.</p>
              ) : (
                <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2 bg-slate-50 dark:bg-slate-900/50">
                  {availableMembers.map(member => (
                    <div key={member.profile_id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`assignee-${member.profile_id}`} 
                        checked={selectedAssignees.includes(member.profile_id)}
                        onCheckedChange={() => toggleAssignee(member.profile_id)}
                      />
                      <label 
                        htmlFor={`assignee-${member.profile_id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {member.profiles?.full_name || member.profiles?.email}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
