'use client'

import { useState } from 'react'
import { MoreHorizontalIcon, EditIcon, UserMinusIcon, TrashIcon, CheckSquareIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { deleteTask } from '../_actions/delete-task'
import { EditTaskDialog } from './edit-task-dialog'
import { ReassignTaskDialog } from './reassign-task-dialog'

interface ManageTaskMenuProps {
  task: any
  dutyId: string
  orgSlug: string
  members: any[]
}

export function ManageTaskMenu({ task, dutyId, orgSlug, members }: ManageTaskMenuProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const [showEdit, setShowEdit] = useState(false)
  const [showReassign, setShowReassign] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteTask(task.id, dutyId, orgSlug)
    setIsDeleting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Task deleted successfully')
    setShowDeleteAlert(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowEdit(true)} className="cursor-pointer">
            <EditIcon className="mr-2 size-4" />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowReassign(true)} className="cursor-pointer">
            <UserMinusIcon className="mr-2 size-4" />
            Reassign Task
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteAlert(true)} className="cursor-pointer text-red-600 focus:text-red-600">
            <TrashIcon className="mr-2 size-4" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTaskDialog
        task={task}
        dutyId={dutyId}
        orgSlug={orgSlug}
        open={showEdit}
        onOpenChange={setShowEdit}
      />

      <ReassignTaskDialog
        task={task}
        dutyId={dutyId}
        orgSlug={orgSlug}
        members={members}
        open={showReassign}
        onOpenChange={setShowReassign}
      />

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <TrashIcon className="size-5" />
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the task "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Task'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
