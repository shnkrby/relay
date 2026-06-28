'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronsUpDown, Check, PlusCircle, LogOutIcon, Loader2Icon } from 'lucide-react'
import { logout } from "@/app/(public)/(auth)/_actions/auth"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

interface Org {
  id: string
  name: string
  slug: string
}

interface OrgSwitcherProps {
  currentOrg: Org
  userOrgs: Org[]
  role?: string
  userName?: string
}

export function OrgSwitcher({ currentOrg, userOrgs, role = "Member", userName = "User" }: OrgSwitcherProps) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const [switchingTo, setSwitchingTo] = React.useState<string | null>(null)

  React.useEffect(() => {
    setSwitchingTo(null)
  }, [currentOrg.id])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            {switchingTo ? (
              <div className="flex w-full items-center gap-2">
                <Loader2Icon className="size-4 animate-spin text-blue-600" />
                <span className="truncate font-semibold text-sm">Changing Organization...</span>
              </div>
            ) : (
              <>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userName}</span>
                  <span className="truncate text-xs text-muted-foreground">{currentOrg.name} · {role}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" 
            side={isMobile ? "bottom" : "right"} 
            align="end" 
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                My Organizations
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {userOrgs.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => {
                  if (org.id !== currentOrg.id) {
                    setSwitchingTo(org.id)
                    router.push(`/${org.slug}`)
                  }
                }}
                className="flex items-center gap-3 cursor-pointer p-2"
              >
                <div className="flex size-8 items-center justify-center rounded-md border bg-background font-medium">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div className="grid flex-1">
                  <span className="truncate font-medium">{org.name}</span>
                </div>
                {org.id === currentOrg.id && (
                  <Check className="ml-auto h-4 w-4 opacity-50" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/organizations')}
              className="cursor-pointer p-2 text-blue-600 focus:text-blue-700"
            >
              <PlusCircle className="mr-2 size-4" />
              <span className="font-medium">Create or join org</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logout} className="w-full">
              <button type="submit" className="w-full text-left">
                <DropdownMenuItem className="cursor-pointer p-2 text-red-600 focus:text-red-700">
                  <LogOutIcon className="mr-2 size-4" />
                  <span className="font-medium">Log out</span>
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
