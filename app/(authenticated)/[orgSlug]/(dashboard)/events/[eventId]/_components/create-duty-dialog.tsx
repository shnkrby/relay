'use client'

import { useState } from 'react'
import { PlusIcon, Loader2Icon, NetworkIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createDuty } from '../_actions/create-duty'

interface CommitteeOption {
  id: string
  name: string
}

interface CreateDutyDialogProps {
  eventId: string
  orgSlug: string
  committees: CommitteeOption[]
}

export function CreateDutyDialog({ eventId, orgSlug, committees }: CreateDutyDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    const result = await createDuty(eventId, orgSlug, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Duty assigned successfully!')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <PlusIcon className="mr-2 size-4" />
            Assign Duty
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <NetworkIcon className="size-5 text-blue-600" />
            Assign Committee Duty
          </DialogTitle>
          <DialogDescription>
            Delegate a major responsibility (like "Stage Design" or "Catering") to a specific committee.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Duty Name</Label>
            <Input id="name" name="name" placeholder="e.g. Venue Logistics" required disabled={isPending} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="committee_id">Responsible Committee</Label>
            <select
              id="committee_id"
              name="committee_id"
              required
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a committee...</option>
              {committees.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {isPending ? <Loader2Icon className="size-4 animate-spin" /> : 'Assign Duty'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
