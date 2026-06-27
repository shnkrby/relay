'use client'

import { useActionState, useEffect, useState } from 'react'
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
import { createOrg } from '../_actions/create-org'
import { PlusIcon, ArrowRightIcon } from 'lucide-react'

export function CreateOrgCard() {
  const [state, action, isPending] = useActionState(createOrg, null)
  const [isNoLimit, setIsNoLimit] = useState(true)
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
    <Card className="flex flex-col shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <PlusIcon className="size-4" />
          </div>
          Start New Organization
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <form action={action} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="orgName" className="font-medium text-slate-700 dark:text-slate-200">Organization Name</Label>
            <Input
              id="orgName"
              name="orgName"
              placeholder="Horizon Student Council"
              required
              className="bg-gray-50/50 dark:bg-slate-900"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="memberLimit" className="font-medium text-slate-700 dark:text-slate-200">Member Limit</Label>
            <div className="flex items-center gap-4">
              <Input
                id="memberLimit"
                name="memberLimit"
                type="number"
                min="8"
                defaultValue="8"
                disabled={isNoLimit || isPending}
                className="w-24 bg-gray-50/50 dark:bg-slate-900"
              />
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <input 
                  type="checkbox" 
                  checked={isNoLimit} 
                  onChange={(e) => setIsNoLimit(e.target.checked)}
                  disabled={isPending}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                No Limit
              </label>
            </div>
            {!isNoLimit && <p className="text-xs text-slate-500">Minimum 8 members including owner.</p>}
          </div>
          <Button type="submit" className="w-full mt-auto bg-purple-600 hover:bg-purple-700 text-white" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Workspace'}
            <ArrowRightIcon className="ml-2 size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
