'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2Icon, PencilIcon } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateCommittee } from '../_actions/update-committee'

interface EditCommitteeDialogProps {
  committeeId: string
  committeeName: string
  orgId: string
  orgSlug: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCommitteeDialog({ 
  committeeId, 
  committeeName, 
  orgId, 
  orgSlug, 
  open, 
  onOpenChange 
}: EditCommitteeDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    const result = await updateCommittee(committeeId, orgId, orgSlug, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Committee updated successfully!')
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilIcon className="size-5 text-amber-600" />
            Edit Committee
          </DialogTitle>
          <DialogDescription>
            Change the name of this committee. This will not affect existing tasks or members.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2 py-4">
            <Label htmlFor="name">Committee Name</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={committeeName} 
              placeholder="e.g., Marketing, Development" 
              required 
              disabled={isPending} 
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-amber-600 hover:bg-amber-700 text-white">
              {isPending ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
