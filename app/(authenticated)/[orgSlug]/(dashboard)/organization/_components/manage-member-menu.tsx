'use client'

import { useState } from 'react'
import { MoreHorizontalIcon, ShieldIcon, ShieldOffIcon, UserMinusIcon, Loader2Icon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { removeMember } from '../_actions/remove-member'
import { updateMemberRole } from '../_actions/update-member-role'

interface ManageMemberMenuProps {
  member: {
    id: string
    name: string
    role: string
  }
  org: {
    id: string
    slug: string
  }
  currentUserId: string
}

export function ManageMemberMenu({ member, org, currentUserId }: ManageMemberMenuProps) {
  const [isPending, setIsPending] = useState(false)

  // You can't manage yourself, and you can't manage the owner (unless you are the owner, but even then, usually you transfer ownership)
  if (member.id === currentUserId || member.role === 'owner') return null

  async function handleUpdateRole(newRole: 'admin' | 'member') {
    setIsPending(true)
    const result = await updateMemberRole(org.id, org.slug, member.id, newRole)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(`${member.name} is now an ${newRole === 'admin' ? 'Executive' : 'Standard Member'}.`)
  }

  async function handleRemove() {
    if (!confirm(`Are you sure you want to kick ${member.name} from the organization?`)) return

    setIsPending(true)
    const result = await removeMember(org.id, org.slug, member.id)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(`${member.name} has been removed.`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white" disabled={isPending}>
            {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <MoreHorizontalIcon className="size-4" />}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        {member.role === 'member' ? (
          <DropdownMenuItem onClick={() => handleUpdateRole('admin')} className="text-blue-600 focus:bg-blue-50 focus:text-blue-700">
            <ShieldIcon className="mr-2 size-4" />
            Promote to Executive
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => handleUpdateRole('member')} className="text-amber-600 focus:bg-amber-50 focus:text-amber-700">
            <ShieldOffIcon className="mr-2 size-4" />
            Demote to Member
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleRemove} className="text-red-600 focus:bg-red-50 focus:text-red-700">
          <UserMinusIcon className="mr-2 size-4" />
          Kick from Org
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
