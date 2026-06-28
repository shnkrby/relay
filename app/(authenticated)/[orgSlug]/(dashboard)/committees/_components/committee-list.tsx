'use client'

import * as React from 'react'
import { UsersIcon, SettingsIcon, MoreHorizontalIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Committee } from '@/types/database'
import { AssignMemberDialog } from './assign-member-dialog'
import { ViewMembersDialog } from './view-members-dialog'
import { ManageCommitteeMenu } from './manage-committee-menu'
import { TransferLeadershipDialog } from './transfer-leadership-dialog'
import { LeaveCommitteeButton } from './leave-committee-button'
import { Badge } from '@/components/ui/badge'

interface CommitteeListProps {
  committees: Committee[]
  orgId: string
  orgSlug: string
  role: string
  orgMembers: { id: string; name: string }[]
  userId: string
}

export function CommitteeList({ committees, orgId, orgSlug, role, orgMembers, userId }: CommitteeListProps) {
  const isAdmin = role === 'admin' || role === 'owner'

  if (committees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
        <UsersIcon className="size-10 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Committees Found</h3>
        <p className="text-sm text-slate-500 max-w-sm text-center mt-1">
          {isAdmin 
            ? "Get started by creating your first committee to organize your organization's tasks."
            : "You haven't been assigned to any committees yet."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {committees.map((committee) => (
        <Card key={committee.id} className="shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold leading-none">{committee.name}</CardTitle>
              <div className="text-sm text-muted-foreground flex items-center pt-1">
                <UsersIcon className="mr-1.5 size-3.5" />
                Team
              </div>
            </div>
            {isAdmin && (
              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none">
                <SettingsIcon className="mr-1 size-3" />
                Manage
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Organize events, assign tasks, and track progress within this committee.
            </p>
          </CardContent>
          <CardFooter className="pt-4 border-t bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ViewMembersDialog 
                committeeId={committee.id} 
                committeeName={committee.name} 
                orgId={orgId}
                orgSlug={orgSlug}
                isAdmin={isAdmin}
                currentUserId={userId}
                leadId={committee.lead_id}
              />
              {(isAdmin || committee.lead_id === userId) && (
                <AssignMemberDialog 
                  orgId={orgId} 
                  orgSlug={orgSlug} 
                  committeeId={committee.id} 
                  members={orgMembers} 
                />
              )}
              {committee.lead_id === userId && (
                <TransferLeadershipDialog
                  orgId={orgId}
                  orgSlug={orgSlug}
                  committeeId={committee.id}
                  members={orgMembers}
                  currentLeadId={userId}
                />
              )}
              {(!isAdmin && committee.lead_id !== userId) && (
                <LeaveCommitteeButton 
                  orgId={orgId}
                  orgSlug={orgSlug}
                  committeeId={committee.id}
                  profileId={userId}
                />
              )}
            </div>
            {isAdmin && (
              <ManageCommitteeMenu 
                committee={committee} 
                orgId={orgId} 
                orgSlug={orgSlug} 
              />
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
