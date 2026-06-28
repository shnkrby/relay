'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2Icon, AlertTriangleIcon } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteCommittee } from '../_actions/delete-committee'

interface DeleteCommitteeDialogProps {
  committeeId: string
  committeeName: string
  orgId: string
  orgSlug: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteCommitteeDialog({ 
  committeeId, 
  committeeName, 
  orgId, 
  orgSlug, 
  open, 
  onOpenChange 
}: DeleteCommitteeDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function onDelete() {
    setIsPending(true)
    const result = await deleteCommittee(committeeId, orgId, orgSlug)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Committee deleted successfully!')
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangleIcon className="size-5" />
            Delete Committee
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the <strong className="text-slate-800 dark:text-slate-200">{committeeName}</strong> committee? 
            This action cannot be undone and will permanently remove all tasks and member assignments associated with it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={onDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white">
            {isPending ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Committee'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
