'use client'

import * as React from 'react'
import { useState } from 'react'
import { UsersIcon, SettingsIcon, MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Committee } from '@/types/database'
import { AssignMemberDialog } from './assign-member-dialog'
import { ViewMembersDialog } from './view-members-dialog'
import { TransferLeadershipDialog } from './transfer-leadership-dialog'
import { LeaveCommitteeButton } from './leave-committee-button'
import { Badge } from '@/components/ui/badge'
import { CommitteeActionsMenu } from './committee-actions-menu'
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
  const [search, setSearch] = useState('')

  const filteredCommittees = committees.filter(c => {
    const s = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(s) ||
      (c.description && c.description.toLowerCase().includes(s))
    )
  })

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm mb-4">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search committees..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {committees.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
          <UsersIcon className="size-10 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Committees Found</h3>
          <p className="text-sm text-slate-500 max-w-sm text-center mt-1">
            {isAdmin 
              ? "Get started by creating your first committee to organize your organization's tasks."
              : "You haven't been assigned to any committees yet."}
          </p>
        </div>
      ) : filteredCommittees.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
          <p className="text-sm text-slate-500">No committees match your search.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {filteredCommittees.map((committee) => (
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
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {committee.description || "No description provided for this committee."}
                  </p>
                  
                  <div className="space-y-2 pt-2 border-t text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Executive-in-Charge:</span>
                      <span className="font-medium text-foreground">
                        {committee.executive_id 
                          ? (orgMembers.find(m => m.id === committee.executive_id)?.name || 'Unknown Executive') 
                          : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Committee Lead:</span>
                      <span className="font-medium text-foreground">
                        {committee.lead_id 
                          ? (orgMembers.find(m => m.id === committee.lead_id)?.name || 'Unknown Lead') 
                          : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-slate-50/50 dark:bg-slate-900/20 flex justify-end">
                <CommitteeActionsMenu
                  committee={committee}
                  orgId={orgId}
                  orgSlug={orgSlug}
                  isAdmin={isAdmin}
                  userId={userId}
                  orgMembers={orgMembers}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

