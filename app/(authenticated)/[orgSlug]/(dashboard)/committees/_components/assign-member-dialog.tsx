'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserPlusIcon, Loader2Icon } from 'lucide-react'

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
import { assignMember } from '../_actions/assign-member'
import { getCommitteeMembers } from '../_actions/get-committee-members'

interface Member {
  id: string
  name: string
}

interface AssignMemberDialogProps {
  orgId: string
  orgSlug: string
  committeeId: string
  members: Member[]
}

export function AssignMemberDialog({ orgId, orgSlug, committeeId, members }: AssignMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [assignedMemberIds, setAssignedMemberIds] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    if (open) {
      getCommitteeMembers(committeeId).then((res: any) => {
        if (res.success && res.data) {
          setAssignedMemberIds(new Set(res.data.map((m: any) => m.id)))
        }
      })
    } else {
      setAssignedMemberIds(new Set())
      setSelectedProfileId('')
    }
  }, [open, committeeId])

  async function onSubmit(formData: FormData) {
    if (!selectedProfileId) {
      toast.error('Please select a member first.')
      return
    }

    setIsPending(true)
    
    // Manually append committeeId and profileId since Select might not serialize
    formData.set('committeeId', committeeId)
    formData.set('profileId', selectedProfileId)
    
    const result = await assignMember(orgSlug, orgId, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Member assigned successfully!')
    setOpen(false)
    setSelectedProfileId('')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-8" />
        }
      >
        <UserPlusIcon className="mr-2 size-3.5" />
        Assign Member
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <UserPlusIcon className="size-5" />
            Assign Member
          </DialogTitle>
          <DialogDescription>
            Select a member from your organization to add to this committee.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2 py-4">
            <Label htmlFor="profileId">Select Member</Label>
            <Select 
              name="profileId" 
              disabled={isPending} 
              required
              value={selectedProfileId}
              onValueChange={(val: string | null) => setSelectedProfileId(val || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a member...">
                  {selectedProfileId 
                    ? members.find(m => m.id === selectedProfileId)?.name || 'User'
                    : "Choose a member..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => {
                  const isAssigned = assignedMemberIds.has(member.id)
                  return (
                    <SelectItem 
                      key={member.id} 
                      value={member.id}
                      disabled={isAssigned}
                    >
                      {member.name || 'User'} {isAssigned && "(Already assigned)"}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isPending ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Member'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
