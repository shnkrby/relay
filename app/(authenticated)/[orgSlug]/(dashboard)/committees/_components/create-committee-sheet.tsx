'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PlusIcon, Loader2Icon } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCommittee } from '../_actions/create-committee'

interface CreateCommitteeSheetProps {
  orgId: string
  orgSlug: string
}

export function CreateCommitteeSheet({ orgId, orgSlug }: CreateCommitteeSheetProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    const result = await createCommittee(orgSlug, orgId, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Committee created successfully!')
    setOpen(false)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" />
        }
      >
        <PlusIcon className="mr-2 size-4" />
        Create Committee
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create a New Committee</SheetTitle>
          <SheetDescription>
            Committees act as teams inside your organization.
          </SheetDescription>
        </SheetHeader>
        <form action={onSubmit} className="space-y-4 py-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Committee Name</Label>
            <Input id="name" name="name" placeholder="e.g., Marketing, Development" required disabled={isPending} />
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
              {isPending ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Committee'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
