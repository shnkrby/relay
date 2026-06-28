'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { UsersIcon, Loader2Icon, UserMinusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getCommitteeMembers } from '../_actions/get-committee-members'

interface ViewMembersDialogProps {
  committeeId: string
  committeeName: string
  orgId?: string
  orgSlug?: string
  isAdmin?: boolean
  currentUserId?: string
  leadId?: string | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface MemberData {
  id: string
  name: string
  email: string
  isLead: boolean
}

export function ViewMembersDialog({ 
  committeeId, 
  committeeName, 
  orgId, 
  orgSlug, 
  isAdmin, 
  currentUserId, 
  leadId,
  open,
  onOpenChange
}: ViewMembersDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined && onOpenChange !== undefined
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = isControlled ? onOpenChange! : setInternalOpen
  const [members, setMembers] = useState<MemberData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const router = useRouter()

  const canManage = isAdmin || currentUserId === leadId

  useEffect(() => {
    if (open) {
      const fetchMembers = async () => {
        setIsLoading(true)
        setError(null)
        const result = await getCommitteeMembers(committeeId)
        
        if (result.success && result.data) {
          setMembers(result.data as MemberData[])
        } else {
          setError(result.error || 'Failed to load members')
        }
        setIsLoading(false)
      }
      fetchMembers()
    }
  }, [open, committeeId])

  async function handleKick(memberId: string) {
    if (!orgSlug || !orgId) return
    if (!confirm('Are you sure you want to remove this member?')) return

    setRemovingId(memberId)
    const formData = new FormData()
    formData.set('committeeId', committeeId)
    formData.set('profileId', memberId)
    
    // Import action dynamically to avoid top-level issues if needed, or we can just import at the top
    const { removeMember } = await import('../_actions/remove-member')
    const result = await removeMember(orgSlug, orgId, null, formData)
    
    setRemovingId(null)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Member removed successfully.')
    setMembers(members.filter(m => m.id !== memberId))
    router.refresh()
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isControlled && (
        <DialogTrigger>
          <Button variant="outline" size="sm" className="h-8">
            <UsersIcon className="mr-2 size-3.5" />
            View Members
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="size-5 text-blue-600" />
            Members of {committeeName}
          </DialogTitle>
          <DialogDescription>
            A complete roster of everyone assigned to this committee.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[200px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-500">
              <Loader2Icon className="size-8 animate-spin text-blue-600" />
              <p>Loading members...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <p>{error}</p>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
              <UsersIcon className="size-10 mb-2 opacity-20" />
              <p>No members have been assigned yet.</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[100px]">Role</TableHead>
                    {canManage && <TableHead className="w-[80px] text-right">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                        {member.name}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {member.email}
                      </TableCell>
                      <TableCell>
                        {member.isLead ? (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-900/70 border-none font-semibold px-2.5 py-0.5">
                            Committee Head
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 border-none px-2.5 py-0.5">
                            Member
                          </Badge>
                        )}
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          {!member.isLead && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleKick(member.id)}
                              disabled={removingId === member.id}
                              title="Remove member"
                            >
                              {removingId === member.id ? (
                                <Loader2Icon className="size-4 animate-spin" />
                              ) : (
                                <UserMinusIcon className="size-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
