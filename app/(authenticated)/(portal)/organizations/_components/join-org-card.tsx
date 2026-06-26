'use client'

import { useActionState } from 'react'
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
          {state?.error && (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          )}
          <Button type="submit" className="w-full mt-auto" disabled={isPending}>
            {isPending ? 'Joining...' : 'Join Organization'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
