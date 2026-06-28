'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { joinOrg } from '../_actions/join-org'
import { HashIcon, ArrowRightIcon } from 'lucide-react'

export function JoinOrgDialog({ children }: { children: React.ReactNode }) {
  const [state, action, isPending] = useActionState(joinOrg, null)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (state?.success && state.data?.slug) {
      toast.success('Successfully joined organization!')
      setOpen(false)
      router.push(`/${state.data.slug}`)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-transparent text-slate-900 dark:text-white">
              <HashIcon className="size-5" />
            </div>
            Join an Organization
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 flex-col justify-between py-4">
          <form action={action} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="joinCode" className="font-medium text-slate-700 dark:text-slate-200">Join Code</Label>
              <Input
                id="joinCode"
                name="joinCode"
                placeholder="e.g. HSC-2025-XK"
                required
                className="bg-gray-50/50 dark:bg-slate-900"
              />
            </div>
            <Button type="submit" className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
              {isPending ? 'Joining...' : 'Enter Relay'}
              <ArrowRightIcon className="ml-2 size-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
