'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CrownIcon, Loader2Icon } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { transferLeadership } from '../_actions/transfer-leadership'

interface Member {
  id: string
  name: string
}

interface TransferLeadershipDialogProps {
  orgId: string
  orgSlug: string
  committeeId: string
  members: Member[]
  currentLeadId: string
}

export function TransferLeadershipDialog({ orgId, orgSlug, committeeId, members, currentLeadId }: TransferLeadershipDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    if (!selectedProfileId) {
      toast.error('Please select a member to transfer leadership to.')
      return
    }

    setIsPending(true)
    
    formData.set('committeeId', committeeId)
    formData.set('newLeadId', selectedProfileId)
    
    const result = await transferLeadership(orgSlug, orgId, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Leadership transferred successfully!')
    setOpen(false)
    setSelectedProfileId('')
    router.refresh()
  }

  // Filter out the current leader from the options
  const eligibleMembers = members.filter(m => m.id !== currentLeadId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700" />
        }
      >
        <CrownIcon className="mr-2 size-3.5" />
        Pass Title
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <CrownIcon className="size-5" />
            Transfer Leadership
          </DialogTitle>
          <DialogDescription>
            Select a member to pass your leadership title to. You will lose your leader privileges for this committee.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2 py-4">
            <Label htmlFor="newLeadId">Select New Leader</Label>
            <Select 
              name="newLeadId" 
              disabled={isPending} 
              required
              value={selectedProfileId}
              onValueChange={(val: string | null) => setSelectedProfileId(val || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a member...">
                  {selectedProfileId 
                    ? eligibleMembers.find(m => m.id === selectedProfileId)?.name || 'User'
                    : "Choose a member..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.length === 0 ? (
                  <SelectItem value="none" disabled>No other members available</SelectItem>
                ) : (
                  eligibleMembers.map((member) => (
                    <SelectItem 
                      key={member.id} 
                      value={member.id}
                    >
                      {member.name || 'User'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || eligibleMembers.length === 0} className="bg-amber-600 hover:bg-amber-700 text-white">
              {isPending ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Transferring...
                </>
              ) : (
                'Confirm Transfer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
