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
import { createOrg } from '../_actions/create-org'

export function CreateOrgCard() {
  const [state, action, isPending] = useActionState(createOrg, null)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">Create a New Organization</CardTitle>
        <CardDescription>
          Start a new workspace for your team and manage events.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <form action={action} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              name="orgName"
              placeholder="Acme Corp"
              required
            />
          </div>
          {state?.error && (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          )}
          <Button type="submit" variant="secondary" className="w-full mt-auto" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Organization'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
