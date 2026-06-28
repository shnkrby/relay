'use client'

import { useState } from 'react'
import { CalendarIcon, PlusIcon, Loader2Icon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createEvent } from '../_actions/create-event'

interface CreateEventDialogProps {
  orgId: string
  orgSlug: string
}

export function CreateEventDialog({ orgId, orgSlug }: CreateEventDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    const result = await createEvent(orgId, orgSlug, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Event scheduled successfully!')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <PlusIcon className="mr-2 size-4" />
            Create Event
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarIcon className="size-5 text-blue-600" />
            Schedule New Event
          </DialogTitle>
          <DialogDescription>
            Create a master event to organize duties and track cross-committee operations.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" name="title" placeholder="e.g. Annual Tech Conference 2026" required disabled={isPending} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Event Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="What is the goal of this event?"
              className="resize-none"
              rows={3}
              disabled={isPending} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" name="start_date" type="date" disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" name="end_date" type="date" disabled={isPending} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {isPending ? <Loader2Icon className="size-4 animate-spin" /> : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
