'use client'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UsersIcon, ClipboardListIcon, ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'

interface Duty {
  id: string
  name: string
  committeeId: string
  committeeName: string
}

interface DutyListProps {
  duties: Duty[]
  orgSlug: string
  isAdmin: boolean
}

export function DutyList({ duties, orgSlug, isAdmin }: DutyListProps) {
  if (duties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <ClipboardListIcon className="size-12 text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No duties assigned yet</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          Break this event down by delegating duties (e.g. "Stage Design") to specific committees.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {duties.map((duty) => (
        <Card key={duty.id} className="shadow-sm flex flex-col group hover:border-blue-500 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors flex items-center gap-2">
                <ClipboardListIcon className="size-5 text-blue-500" />
                {duty.name}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border border-slate-100 dark:border-slate-800">
              <UsersIcon className="size-4 text-slate-400" />
              <span>Assigned to: <span className="text-slate-900 dark:text-white font-semibold">{duty.committeeName}</span></span>
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t bg-slate-50/50 dark:bg-slate-900/20">
            <Link 
              href={`/${orgSlug}/duties/${duty.id}`} 
              className="flex w-full items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              View Task Board
              <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
