'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserPlusIcon, Loader2Icon } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
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

interface Member {
  id: string
  name: string
}

interface AssignMemberSheetProps {
  orgId: string
  orgSlug: string
  committeeId: string
  members: Member[]
}

export function AssignMemberSheet({ orgId, orgSlug, committeeId, members }: AssignMemberSheetProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    // Manually append committeeId since it's not a form input
    formData.append('committeeId', committeeId)
    
    const result = await assignMember(orgSlug, orgId, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Member assigned successfully!')
    setOpen(false)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="h-8" />
        }
      >
        <UserPlusIcon className="mr-2 size-3.5" />
        Assign Member
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Assign Member to Committee</SheetTitle>
          <SheetDescription>
            Select a member from your organization to add to this committee.
          </SheetDescription>
        </SheetHeader>
        <form action={onSubmit} className="space-y-4 py-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="profileId">Select Member</Label>
            <Select name="profileId" disabled={isPending} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a member..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
              {isPending ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Member'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
