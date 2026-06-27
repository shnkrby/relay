'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { joinOrg } from '../_actions/join-org'
import { HashIcon, ArrowRightIcon } from 'lucide-react'

export function JoinOrgCard() {
  const [state, action, isPending] = useActionState(joinOrg, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success && state.data?.slug) {
      toast.success('Successfully joined organization!')
      router.push(`/${state.data.slug}`)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <Card className="flex flex-col shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <HashIcon className="size-4" />
          </div>
          Join an Organization
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <form action={action} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="joinCode" className="font-medium text-slate-700">Join Code</Label>
            <Input
              id="joinCode"
              name="joinCode"
              placeholder="e.g. HSC-2025-XK"
              required
              className="bg-gray-50/50"
            />
          </div>
          <Button type="submit" className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
            {isPending ? 'Joining...' : 'Enter Relay'}
            <ArrowRightIcon className="ml-2 size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
