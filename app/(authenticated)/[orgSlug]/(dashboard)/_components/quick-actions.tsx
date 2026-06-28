"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarPlusIcon, CheckSquareIcon, UsersIcon, PlusIcon } from 'lucide-react'

interface QuickActionsProps {
  orgSlug: string
  isAdmin: boolean
}

export function QuickActions({ orgSlug, isAdmin }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {isAdmin && (
        <Button
          variant="default"
          size="sm"
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          render={<Link href={`/${orgSlug}/events`} />}
          nativeButton={false}
        >
          <CalendarPlusIcon className="size-4" />
          Create Event
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        render={<Link href={`/${orgSlug}/duties`} />}
        nativeButton={false}
      >
        <CheckSquareIcon className="size-4" />
        View My Duties
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        render={<Link href={`/${orgSlug}/committees`} />}
        nativeButton={false}
      >
        <UsersIcon className="size-4" />
        Committees
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        render={<Link href={`/${orgSlug}/organization`} />}
        nativeButton={false}
      >
        <PlusIcon className="size-4" />
        Organization
      </Button>
    </div>
  )
}
