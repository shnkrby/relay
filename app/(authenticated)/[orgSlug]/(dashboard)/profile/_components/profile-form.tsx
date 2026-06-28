'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '../_actions/update-profile'
import { Loader2Icon, SaveIcon, CheckCircleIcon } from 'lucide-react'

interface ProfileFormProps {
  fullName: string
  email: string
  createdAt: string
}

export function ProfileForm({ fullName, email, createdAt }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, null)

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="full_name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Full Name
        </Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={fullName}
          placeholder="Enter your full name"
          className="max-w-md"
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Email Address
        </Label>
        <Input
          value={email}
          disabled
          className="max-w-md bg-slate-50 dark:bg-slate-900 text-slate-500"
        />
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Email is managed by your authentication provider and cannot be changed here.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Member Since
        </Label>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {new Date(createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {state?.error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-400">{state.error}</p>
        </div>
      )}

      {state?.success && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 flex items-center gap-2">
          <CheckCircleIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">Profile updated successfully!</p>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="gap-2">
        {isPending ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <SaveIcon className="size-4" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  )
}
