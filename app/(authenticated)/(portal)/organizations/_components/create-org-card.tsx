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
import { createOrg } from '../_actions/create-org'

export function CreateOrgCard() {
  const [state, action, isPending] = useActionState(createOrg, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success && state.data?.slug) {
      toast.success('Organization created successfully!')
      router.push(`/${state.data.slug}`)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

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
          <Button type="submit" variant="secondary" className="w-full mt-auto" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Organization'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
