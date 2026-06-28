'use client'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldIcon, MailIcon, CalendarIcon } from 'lucide-react'
import { ManageMemberMenu } from './manage-member-menu'

interface Member {
  id: string
  role: string
  joinedAt: string
  name: string
  email: string
  avatarUrl?: string
}

interface MemberListProps {
  members: Member[]
  org: {
    id: string
    slug: string
  }
  currentUserId: string
  isAdmin: boolean
}

export function MemberList({ members, org, currentUserId, isAdmin }: MemberListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <Card key={member.id} className="shadow-sm flex flex-col group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="size-full rounded-full object-cover" />
                ) : (
                  <span className="font-semibold text-slate-500 text-lg">
                    {member.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold leading-none flex items-center gap-2">
                  {member.name}
                  {member.id === currentUserId && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal">You</Badge>
                  )}
                </CardTitle>
                <Badge 
                  variant="secondary" 
                  className={`
                    mt-1
                    ${member.role === 'owner' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none' : ''}
                    ${member.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-none' : ''}
                    ${member.role === 'member' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-none' : ''}
                  `}
                >
                  {(member.role === 'owner' || member.role === 'admin') && (
                    <ShieldIcon className="mr-1 size-3" />
                  )}
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </Badge>
              </div>
            </div>
            
            {isAdmin && (
              <ManageMemberMenu member={member} org={org} currentUserId={currentUserId} />
            )}
          </CardHeader>
          <CardContent className="flex-1 pt-4">
            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MailIcon className="size-4" />
                <span className="truncate">{member.email}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t bg-slate-50/50 dark:bg-slate-900/20 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="size-3.5" />
              Joined {new Date(member.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
