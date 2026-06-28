import * as React from 'react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MoreHorizontalIcon, UsersIcon, UserPlusIcon, ArrowRightFromLineIcon, PencilIcon, TrashIcon, LogOutIcon, Loader2Icon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import { ViewMembersDialog } from './view-members-dialog';
import { AssignMemberDialog } from './assign-member-dialog';
import { TransferLeadershipDialog } from './transfer-leadership-dialog';
import { EditCommitteeDialog } from './edit-committee-dialog';
import { DeleteCommitteeDialog } from './delete-committee-dialog';
import { removeMember } from '../_actions/remove-member';

import { Committee } from '@/types/database';

interface CommitteeActionsMenuProps {
  committee: Committee;
  orgId: string;
  orgSlug: string;
  isAdmin: boolean;
  userId: string;
  orgMembers: { id: string; name: string }[];
}

export function CommitteeActionsMenu({
  committee,
  orgId,
  orgSlug,
  isAdmin,
  userId,
  orgMembers,
}: CommitteeActionsMenuProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isLeaving, startLeaving] = useTransition();
  const router = useRouter();

  async function handleLeaveCommittee() {
    if (!confirm('Are you sure you want to leave this committee?')) return;
    startLeaving(async () => {
      const formData = new FormData();
      formData.set('committeeId', committee.id);
      formData.set('profileId', userId);
      const result = await removeMember(orgSlug, orgId, null, formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success('You have left the committee.');
      router.refresh();
    });
  }


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors">
            <MoreHorizontalIcon className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* View Members */}
          <DropdownMenuItem onClick={() => setViewOpen(true)}>
            <UsersIcon className="mr-2 size-4" />
            View Members
          </DropdownMenuItem>
          {/* Assign Member */}
          {isAdmin && (
            <DropdownMenuItem onClick={() => setAssignOpen(true)}>
              <UserPlusIcon className="mr-2 size-4" />
              Assign Member
            </DropdownMenuItem>
          )}
          {/* Transfer Leadership */}
          {isAdmin && (
            <DropdownMenuItem onClick={() => setTransferOpen(true)}>
              <ArrowRightFromLineIcon className="mr-2 size-4" />
              Transfer Leadership
            </DropdownMenuItem>
          )}
          {/* Leave Committee */}
          {committee.lead_id !== userId && (
            <DropdownMenuItem onClick={handleLeaveCommittee} disabled={isLeaving} className="text-orange-600 focus:text-orange-700">
              {isLeaving ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : <LogOutIcon className="mr-2 size-4" />}
              Leave Committee
            </DropdownMenuItem>
          )}
          {isAdmin && (
            <>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <PencilIcon className="mr-2 size-4" />
                Edit Committee
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteOpen(true)}
                className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/50"
              >
                <TrashIcon className="mr-2 size-4" />
                Delete Committee
              </DropdownMenuItem>
            </>
          )}

        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <ViewMembersDialog
        committeeId={committee.id}
        committeeName={committee.name}
        orgId={orgId}
        orgSlug={orgSlug}
        isAdmin={isAdmin}
        currentUserId={userId}
        leadId={committee.lead_id}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />
      <AssignMemberDialog
        orgId={orgId}
        orgSlug={orgSlug}
        committeeId={committee.id}
        members={orgMembers}
        open={assignOpen}
        onOpenChange={setAssignOpen}
      />
      <TransferLeadershipDialog
        orgId={orgId}
        orgSlug={orgSlug}
        committeeId={committee.id}
        members={orgMembers}
        currentLeadId={committee.lead_id || ''}
        open={transferOpen}
        onOpenChange={setTransferOpen}
      />
      {isAdmin && (
        <>
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
      )}
    </>
  );
}
