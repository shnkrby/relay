'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { BuildingIcon, Loader2Icon } from 'lucide-react'

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
import { transferExecutive } from '../_actions/transfer-executive'

interface Member {
  id: string
  name: string
  role?: string
}

interface TransferExecutiveDialogProps {
  orgId: string
  orgSlug: string
  committeeId: string
  members: Member[]
  currentExecutiveId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TransferExecutiveDialog({ orgId, orgSlug, committeeId, members, currentExecutiveId, open, onOpenChange }: TransferExecutiveDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined && onOpenChange !== undefined
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = isControlled ? onOpenChange! : setInternalOpen
  const [isPending, setIsPending] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    if (!selectedProfileId) {
      toast.error('Please select an admin to transfer executive status to.')
      return
    }

    setIsPending(true)
    
    formData.set('committeeId', committeeId)
    formData.set('newExecutiveId', selectedProfileId)
    
    const result = await transferExecutive(orgSlug, orgId, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(`Executive-in-Charge ${currentExecutiveId ? 'transferred' : 'assigned'} successfully!`)
    setDialogOpen(false)
    setSelectedProfileId('')
    router.refresh()
  }

  // Filter out the current executive, and only allow admins/owners to be the new executive
  const eligibleMembers = members.filter(m => m.id !== currentExecutiveId && (m.role === 'admin' || m.role === 'owner'))

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isControlled && (
        <DialogTrigger
          render={
            <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" />
          }
        >
          <BuildingIcon className="mr-2 size-3.5" />
          Transfer Executive
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-600">
            <BuildingIcon className="size-5" />
            {currentExecutiveId ? 'Transfer Executive' : 'Assign Executive'}
          </DialogTitle>
          <DialogDescription>
            {currentExecutiveId 
              ? 'Select an Admin or Owner to pass your Executive-in-Charge title to. You will lose your executive privileges over this committee.'
              : 'Select an Admin or Owner to assign as the Executive-in-Charge of this committee.'}
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2 py-4">
            <Label htmlFor="newExecutiveId">Select New Executive</Label>
            <Select 
              name="newExecutiveId" 
              disabled={isPending} 
              required
              value={selectedProfileId}
              onValueChange={(val: string | null) => setSelectedProfileId(val || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an admin...">
                  {selectedProfileId 
                    ? eligibleMembers.find(m => m.id === selectedProfileId)?.name || 'Admin'
                    : "Choose an admin..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.length === 0 ? (
                  <SelectItem value="none" disabled>No other admins available</SelectItem>
                ) : (
                  eligibleMembers.map((member) => (
                    <SelectItem 
                      key={member.id} 
                      value={member.id}
                    >
                      {member.name || 'Admin'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || eligibleMembers.length === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isPending ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  {currentExecutiveId ? 'Transferring...' : 'Assigning...'}
                </>
              ) : (
                currentExecutiveId ? 'Confirm Transfer' : 'Assign Executive'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
