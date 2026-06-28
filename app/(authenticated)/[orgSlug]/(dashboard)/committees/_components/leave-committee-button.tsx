'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogOutIcon, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { removeMember } from '../_actions/remove-member'

interface LeaveCommitteeButtonProps {
  orgId: string
  orgSlug: string
  committeeId: string
  profileId: string
}

export function LeaveCommitteeButton({ orgId, orgSlug, committeeId, profileId }: LeaveCommitteeButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this committee?')) return

    setIsPending(true)
    const formData = new FormData()
    formData.set('committeeId', committeeId)
    formData.set('profileId', profileId)
    
    const result = await removeMember(orgSlug, orgId, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('You have left the committee.')
    router.refresh()
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
      onClick={handleLeave}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2Icon className="size-3.5 animate-spin mr-2" />
      ) : (
        <LogOutIcon className="size-3.5 mr-2" />
      )}
      Leave
    </Button>
  )
}
