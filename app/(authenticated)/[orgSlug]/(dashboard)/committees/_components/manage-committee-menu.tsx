'use client'

import * as React from 'react'
import { useState } from 'react'
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditCommitteeDialog } from './edit-committee-dialog'
import { DeleteCommitteeDialog } from './delete-committee-dialog'
import { Committee } from '@/types/database'

interface ManageCommitteeMenuProps {
  committee: Committee
  orgId: string
  orgSlug: string
}

export function ManageCommitteeMenu({ committee, orgId, orgSlug }: ManageCommitteeMenuProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors">
              <MoreHorizontalIcon className="size-4" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <PencilIcon className="mr-2 size-4 text-amber-600" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2Icon className="mr-2 size-4 text-red-600" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCommitteeDialog
        committeeId={committee.id}
        committeeName={committee.name}
        committeeDescription={committee.description}
        orgId={orgId}
        orgSlug={orgSlug}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteCommitteeDialog
        committeeId={committee.id}
        committeeName={committee.name}
        orgId={orgId}
        orgSlug={orgSlug}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
