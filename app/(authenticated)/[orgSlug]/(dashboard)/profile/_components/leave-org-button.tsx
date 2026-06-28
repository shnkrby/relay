'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { LogOutIcon, Loader2Icon } from 'lucide-react'
import { leaveOrganization } from "@/app/(authenticated)/[orgSlug]/(dashboard)/organization/_actions/leave-organization"
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface LeaveOrgButtonProps {
  orgId: string
  orgSlug: string
  orgName: string
}

export function LeaveOrgButton({ orgId, orgSlug, orgName }: LeaveOrgButtonProps) {
  const router = useRouter()
  const [isLeaving, startLeaving] = React.useTransition()

  async function handleLeaveOrg() {
    startLeaving(async () => {
      const result = await leaveOrganization(orgSlug, orgId)
      if (!result?.success) {
        toast.error(result?.error || 'Failed to leave organization')
        return
      }
      toast.success('You have left the organization.')
      router.push('/organizations')
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors shrink-0">
          <LogOutIcon className="size-4" />
        </Button>
      } />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Organization</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave <strong>{orgName}</strong>? You will lose access to all its events, committees, and tasks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            disabled={isLeaving} 
            onClick={(e) => {
              e.preventDefault()
              handleLeaveOrg()
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isLeaving ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
            {isLeaving ? "Leaving..." : "Leave Organization"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
