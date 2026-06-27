'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronsUpDown, Check, PlusCircle } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface Org {
  id: string
  name: string
  slug: string
}

interface OrgSwitcherProps {
  currentOrg: Org
  userOrgs: Org[]
}

export function OrgSwitcher({ currentOrg, userOrgs }: OrgSwitcherProps) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-10 w-[220px] items-center justify-between rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <span className="truncate">{currentOrg.name}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[220px]" align="start">
        <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">
          Organizations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userOrgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onSelect={() => router.push(`/${org.slug}`)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="truncate">{org.name}</span>
            {org.id === currentOrg.id && (
              <Check className="ml-2 h-4 w-4 opacity-50" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => router.push('/organizations')}
          className="text-muted-foreground cursor-pointer"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create or Join...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
