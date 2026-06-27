'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { joinOrg } from '../_actions/join-org'

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
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">Join an Organization</CardTitle>
        <CardDescription>
          Have a join code from your team? Enter it below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <form action={action} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="joinCode">Join Code</Label>
            <Input
              id="joinCode"
              name="joinCode"
              placeholder="e.g. RELAY-1234"
              required
            />
          </div>
          <Button type="submit" className="w-full mt-auto" disabled={isPending}>
            {isPending ? 'Joining...' : 'Join Organization'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
