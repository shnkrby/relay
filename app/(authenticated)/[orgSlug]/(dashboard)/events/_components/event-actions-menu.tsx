'use client'

import * as React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { 
  MoreVerticalIcon, 
  PlayIcon, 
  PauseIcon, 
  CheckCircleIcon, 
  PencilIcon, 
  XCircleIcon,
  Loader2Icon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { updateEventStatus } from '../_actions/update-event-status'
import { editEvent } from '../_actions/edit-event'
import { Event } from '@/types/database'

interface EventActionsMenuProps {
  event: Event
  orgId: string
  orgSlug: string
}

export function EventActionsMenu({ event, orgId, orgSlug }: EventActionsMenuProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const handleStatusChange = async (newStatus: 'active' | 'upcoming' | 'completed' | 'cancelled' | 'paused') => {
    setIsPending(true)
    const result = await updateEventStatus(orgId, orgSlug, event.id, newStatus)
    setIsPending(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(`Event marked as ${newStatus}`)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    const result = await editEvent(orgId, orgSlug, event.id, null, formData)
    setIsPending(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Event updated successfully')
      setEditOpen(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
              <MoreVerticalIcon className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <PencilIcon className="mr-2 size-4" />
            Edit Event
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          
          {(event.status === 'upcoming' || event.status === 'paused') && (
            <DropdownMenuItem onClick={() => handleStatusChange('active')}>
              <PlayIcon className="mr-2 size-4 text-emerald-500" />
              Start Event
            </DropdownMenuItem>
          )}
          
          {event.status === 'active' && (
            <DropdownMenuItem onClick={() => handleStatusChange('paused')}>
              <PauseIcon className="mr-2 size-4 text-indigo-500" />
              Pause Event
            </DropdownMenuItem>
          )}

          {(event.status === 'active' || event.status === 'paused') && (
            <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
              <CheckCircleIcon className="mr-2 size-4 text-slate-500" />
              Mark Completed
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleStatusChange('cancelled')} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
            <XCircleIcon className="mr-2 size-4" />
            Cancel Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update the details for this event.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  name="title" 
                  defaultValue={event.title}
                  placeholder="e.g. Annual Tech Conference" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input 
                    id="start_date" 
                    name="start_date" 
                    type="date" 
                    defaultValue={event.start_date ? new Date(event.start_date).toISOString().split('T')[0] : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input 
                    id="end_date" 
                    name="end_date" 
                    type="date" 
                    defaultValue={event.end_date ? new Date(event.end_date).toISOString().split('T')[0] : ''}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={event.description || ''}
                  placeholder="Provide context or high-level goals..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isPending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
